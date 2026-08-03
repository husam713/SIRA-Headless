import type { SiteKey } from "@/types/site";

export interface GraphQLErrorSummary {
  readonly message: string;
  readonly path: readonly (string | number)[] | null;
  readonly code: string | null;
}

interface GraphQLErrorContext {
  readonly siteKey: SiteKey;
  readonly operationName: string;
  readonly requestId: string;
}

export class SiraGraphQLError extends Error {
  public readonly siteKey: SiteKey;
  public readonly operationName: string;
  public readonly requestId: string;

  protected constructor(
    name: string,
    message: string,
    context: GraphQLErrorContext,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = name;
    this.siteKey = context.siteKey;
    this.operationName = context.operationName;
    this.requestId = context.requestId;
  }
}

export class GraphQLTimeoutError extends SiraGraphQLError {
  public constructor(context: GraphQLErrorContext, options?: ErrorOptions) {
    super(
      "GraphQLTimeoutError",
      "The WordPress GraphQL request timed out.",
      context,
      options,
    );
  }
}

export class GraphQLAbortError extends SiraGraphQLError {
  public constructor(context: GraphQLErrorContext, options?: ErrorOptions) {
    super(
      "GraphQLAbortError",
      "The WordPress GraphQL request was cancelled.",
      context,
      options,
    );
  }
}

export class GraphQLNetworkError extends SiraGraphQLError {
  public constructor(context: GraphQLErrorContext, options?: ErrorOptions) {
    super(
      "GraphQLNetworkError",
      "The WordPress GraphQL endpoint could not be reached.",
      context,
      options,
    );
  }
}

export class GraphQLHttpError extends SiraGraphQLError {
  public readonly status: number;

  public constructor(
    status: number,
    context: GraphQLErrorContext,
    options?: ErrorOptions,
  ) {
    super(
      "GraphQLHttpError",
      `The WordPress GraphQL endpoint returned HTTP ${status}.`,
      context,
      options,
    );
    this.status = status;
  }
}

export class GraphQLResponseError extends SiraGraphQLError {
  public readonly errors: readonly GraphQLErrorSummary[];

  public constructor(
    errors: readonly GraphQLErrorSummary[],
    context: GraphQLErrorContext,
  ) {
    super(
      "GraphQLResponseError",
      "The WordPress GraphQL operation returned errors.",
      context,
    );
    this.errors = Object.freeze([...errors]);
  }
}

export class GraphQLProtocolError extends SiraGraphQLError {
  public constructor(context: GraphQLErrorContext, options?: ErrorOptions) {
    super(
      "GraphQLProtocolError",
      "The WordPress GraphQL response was malformed.",
      context,
      options,
    );
  }
}
