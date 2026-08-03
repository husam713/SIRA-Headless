export type GraphQLVariables = object;

export interface GraphQLOperation<
  TResult,
  TVariables extends GraphQLVariables,
> {
  readonly operationName: string;
  readonly source: string;
  /**
   * Phantom type markers used only for TypeScript inference.
   */
  readonly __resultType?: TResult;
  readonly __variablesType?: TVariables;
}

export function defineGraphQLOperation<
  TResult,
  TVariables extends GraphQLVariables,
>(
  operationName: string,
  source: string,
): GraphQLOperation<TResult, TVariables> {
  if (!/^[_A-Za-z][_0-9A-Za-z]*$/.test(operationName)) {
    throw new TypeError(`Invalid GraphQL operation name: ${operationName}.`);
  }

  if (!source.includes(`query ${operationName}`)) {
    throw new TypeError(
      `GraphQL source does not define query ${operationName}.`,
    );
  }

  return Object.freeze({
    operationName,
    source: source.trim(),
  });
}
