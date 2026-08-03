import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "./schema/wpgraphql.graphql",
  documents: ["./src/queries/**/*.graphql"],
  ignoreNoDocuments: false,
  generates: {
    "./src/generated/graphql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        documentMode: "string",
        useTypeImports: true,
        immutableTypes: true,
        defaultScalarType: "unknown",
        avoidOptionals: false,
      },
    },
  },
};

export default config;
