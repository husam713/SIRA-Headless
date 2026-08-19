import "server-only";

import { Buffer } from "node:buffer";
import { isSiteKey } from "@/config/sites";
import type { SiteKey } from "@/types/site";

interface WordPressEnvironmentKeys {
  readonly endpoint: string;
  readonly blogId: string;
}

interface WordPressPreviewEnvironmentKeys {
  readonly username: string;
  readonly applicationPassword: string;
}

export type WordPressEnvironment = Readonly<
  Record<string, string | undefined>
>;

export interface WordPressSiteConfig {
  readonly siteKey: SiteKey;
  readonly blogId: number;
  readonly graphqlEndpoint: URL;
}

const WORDPRESS_ENVIRONMENT_KEYS: Readonly<
  Record<SiteKey, WordPressEnvironmentKeys>
> = {
  group: {
    endpoint: "SIRA_WP_GROUP_GRAPHQL_URL",
    blogId: "SIRA_WP_GROUP_BLOG_ID",
  },
  consulting: {
    endpoint: "SIRA_WP_CONSULTING_GRAPHQL_URL",
    blogId: "SIRA_WP_CONSULTING_BLOG_ID",
  },
  healthcare: {
    endpoint: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
    blogId: "SIRA_WP_HEALTHCARE_BLOG_ID",
  },
  lifestyle: {
    endpoint: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
    blogId: "SIRA_WP_LIFESTYLE_BLOG_ID",
  },
  realestate: {
    endpoint: "SIRA_WP_REALESTATE_GRAPHQL_URL",
    blogId: "SIRA_WP_REALESTATE_BLOG_ID",
  },
};

const WORDPRESS_PREVIEW_ENVIRONMENT_KEYS: Readonly<
  Record<SiteKey, WordPressPreviewEnvironmentKeys>
> = {
  group: {
    username: "SIRA_WP_GROUP_PREVIEW_USERNAME",
    applicationPassword: "SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD",
  },
  consulting: {
    username: "SIRA_WP_CONSULTING_PREVIEW_USERNAME",
    applicationPassword: "SIRA_WP_CONSULTING_PREVIEW_APPLICATION_PASSWORD",
  },
  healthcare: {
    username: "SIRA_WP_HEALTHCARE_PREVIEW_USERNAME",
    applicationPassword: "SIRA_WP_HEALTHCARE_PREVIEW_APPLICATION_PASSWORD",
  },
  lifestyle: {
    username: "SIRA_WP_LIFESTYLE_PREVIEW_USERNAME",
    applicationPassword: "SIRA_WP_LIFESTYLE_PREVIEW_APPLICATION_PASSWORD",
  },
  realestate: {
    username: "SIRA_WP_REALESTATE_PREVIEW_USERNAME",
    applicationPassword: "SIRA_WP_REALESTATE_PREVIEW_APPLICATION_PASSWORD",
  },
};

export class WordPressConfigurationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "WordPressConfigurationError";
  }
}

function parsePositiveInteger(
  rawValue: string | undefined,
  environmentKey: string,
): number {
  if (rawValue === undefined || !/^[1-9]\d*$/.test(rawValue)) {
    throw new WordPressConfigurationError(
      `${environmentKey} must be a positive integer.`,
    );
  }

  const value = Number(rawValue);

  if (!Number.isSafeInteger(value)) {
    throw new WordPressConfigurationError(
      `${environmentKey} exceeds the safe integer range.`,
    );
  }

  return value;
}

function parseGraphQLEndpoint(
  rawValue: string | undefined,
  environmentKey: string,
): URL {
  if (rawValue === undefined || rawValue.trim() === "") {
    throw new WordPressConfigurationError(`${environmentKey} is required.`);
  }

  let endpoint: URL;

  try {
    endpoint = new URL(rawValue);
  } catch {
    throw new WordPressConfigurationError(
      `${environmentKey} must be an absolute URL.`,
    );
  }

  if (endpoint.username !== "" || endpoint.password !== "") {
    throw new WordPressConfigurationError(
      `${environmentKey} must not contain credentials.`,
    );
  }

  if (endpoint.search !== "" || endpoint.hash !== "") {
    throw new WordPressConfigurationError(
      `${environmentKey} must not contain a query string or fragment.`,
    );
  }

  const isLocal =
    endpoint.hostname === "localhost" ||
    endpoint.hostname === "127.0.0.1" ||
    endpoint.hostname.endsWith(".localhost");

  if (
    endpoint.protocol !== "https:" &&
    !(isLocal && endpoint.protocol === "http:")
  ) {
    throw new WordPressConfigurationError(
      `${environmentKey} must use HTTPS outside local development.`,
    );
  }

  return endpoint;
}

function parsePreviewUsername(
  rawValue: string | undefined,
  environmentKey: string,
): string {
  if (rawValue === undefined || rawValue === "") {
    throw new WordPressConfigurationError(`${environmentKey} is required.`);
  }

  if (
    rawValue !== rawValue.trim() ||
    rawValue.length > 128 ||
    rawValue.includes(":") ||
    /[\u0000-\u001f\u007f]/.test(rawValue)
  ) {
    throw new WordPressConfigurationError(
      `${environmentKey} is not a valid preview username.`,
    );
  }

  return rawValue;
}

function parseApplicationPassword(
  rawValue: string | undefined,
  environmentKey: string,
): string {
  if (rawValue === undefined || rawValue === "") {
    throw new WordPressConfigurationError(`${environmentKey} is required.`);
  }

  if (
    rawValue !== rawValue.trim() ||
    rawValue.length < 20 ||
    rawValue.length > 255 ||
    /[\u0000-\u001f\u007f]/.test(rawValue)
  ) {
    throw new WordPressConfigurationError(
      `${environmentKey} is not a valid Application Password value.`,
    );
  }

  return rawValue;
}

export function getWordPressSiteConfig(
  siteKey: SiteKey,
  environment: WordPressEnvironment = process.env,
): WordPressSiteConfig {
  const keys = WORDPRESS_ENVIRONMENT_KEYS[siteKey];

  return Object.freeze({
    siteKey,
    blogId: parsePositiveInteger(environment[keys.blogId], keys.blogId),
    graphqlEndpoint: parseGraphQLEndpoint(
      environment[keys.endpoint],
      keys.endpoint,
    ),
  });
}

export function getWordPressSiteConfigFromUnknown(
  value: string,
  environment: WordPressEnvironment = process.env,
): WordPressSiteConfig {
  if (!isSiteKey(value)) {
    throw new WordPressConfigurationError(
      `Unknown SIRA WordPress site key: ${value}.`,
    );
  }

  return getWordPressSiteConfig(value, environment);
}

export function getWordPressPreviewAuthorization(
  siteKey: SiteKey,
  environment: WordPressEnvironment = process.env,
): string {
  const keys = WORDPRESS_PREVIEW_ENVIRONMENT_KEYS[siteKey];
  const username = parsePreviewUsername(
    environment[keys.username],
    keys.username,
  );
  const applicationPassword = parseApplicationPassword(
    environment[keys.applicationPassword],
    keys.applicationPassword,
  );
  const encodedCredential = Buffer.from(
    `${username}:${applicationPassword}`,
    "utf8",
  ).toString("base64");

  return `Basic ${encodedCredential}`;
}

export function getGraphQLTimeoutMs(
  environment: WordPressEnvironment = process.env,
): number {
  const rawValue = environment["SIRA_GRAPHQL_TIMEOUT_MS"] ?? "8000";
  const timeout = Number(rawValue);

  if (
    !Number.isSafeInteger(timeout) ||
    timeout < 500 ||
    timeout > 30_000
  ) {
    throw new WordPressConfigurationError(
      "SIRA_GRAPHQL_TIMEOUT_MS must be an integer between 500 and 30000.",
    );
  }

  return timeout;
}

export function getGraphQLRevalidateSeconds(
  environment: WordPressEnvironment = process.env,
): number {
  const rawValue = environment["SIRA_GRAPHQL_REVALIDATE_SECONDS"] ?? "3600";
  const revalidate = Number(rawValue);

  if (
    !Number.isSafeInteger(revalidate) ||
    revalidate < 60 ||
    revalidate > 86_400
  ) {
    throw new WordPressConfigurationError(
      "SIRA_GRAPHQL_REVALIDATE_SECONDS must be between 60 and 86400.",
    );
  }

  return revalidate;
}
