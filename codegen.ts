import { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  overwrite: true,
  schema: 'schema.graphql',
  documents: ['src/**/*.tsx', 'src/**/*.ts'],
  generates: {
    './src/api/schema/': {
      preset: 'client',
      plugins: []
    },
    './src/api/operations/ops.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query'
      ],
      config: {
        documentMode: 'typescript',
        fetcher: 'graphql-request',
        reactQueryVersion: 5
      }
    }
  },
  ignoreNoDocuments: true,
}

export default config
