import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from 'dotenv';
import { PrismaClient } from '@narpavi-ats/db';
import { typeDefs } from './graphql/schema';
import { resolvers } from './resolvers';

config();

const app = express();
const httpServer = http.createServer(app);

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
}

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async () => ({ prisma }),
    })
  );

  const PORT = process.env.PORT || 4000;

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
