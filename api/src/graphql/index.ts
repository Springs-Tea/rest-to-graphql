import { createYoga } from 'graphql-yoga';
import { schema } from './schema.js';
import { createLoaders, type GraphQLContext } from './dataloaders.js';

export const yoga = createYoga<GraphQLContext>({
  schema,
  context: () => ({
    loaders: createLoaders(),
  }),
  graphqlEndpoint: '/graphql',
  landingPage: true,
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
});

export { schema };
