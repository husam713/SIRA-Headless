import "server-only";

import { isSiteKey } from "@/config/sites";
import type { SiteKey } from "@/types/site";

interface WordPressEnvironmentKeys {
  readonly endpoint: string;
  readonly blogId: string;
}

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

export function getWordPressSiteConfig(
  siteKey: SiteKey,
  environment: NodeJS.ProcessEnv = process.env,
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
  environment: NodeJS.ProcessEnv = process.env,
): WordPressSiteConfig {
  if (!isSiteKey(value)) {
    throw new WordPressConfigurationError(
      `Unknown SIRA WordPress site key: ${value}.`,
    );
  }

  return getWordPressSiteConfig(value, environment);
}

export function getGraphQLTimeoutMs(
  environment: NodeJS.ProcessEnv = process.env,
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
  environment: NodeJS.ProcessEnv = process.env,
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
