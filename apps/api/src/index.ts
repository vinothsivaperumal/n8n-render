import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from 'dotenv';
import { PrismaClient } from '@narpavi-ats/db';
import { typeDefs } from './graphql/schema';
import { resolvers } from './resolvers';
import { Context, AuthUser, UserRole } from './types/context';

config();

const app = express();
const httpServer = http.createServer(app);

const prisma = new PrismaClient();

// Mock authentication middleware (replace with real auth in production)
const getAuthUser = async (req: any): Promise<AuthUser | undefined> => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return undefined;
  }

  // In production, verify JWT token here
  // For now, extract from header for testing
  const token = authHeader.replace('Bearer ', '');
  
  // Mock user based on token for development
  if (token === 'admin-token') {
    return {
      id: '1',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
    };
  }
  
  if (token === 'recruiter-token') {
    return {
      id: '2',
      email: 'recruiter@example.com',
      role: UserRole.RECRUITER,
    };
  }

  return undefined;
};

const server = new ApolloServer<Context>({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    // Enable GraphQL Playground in development
    process.env.NODE_ENV !== 'production'
      ? ApolloServerPluginLandingPageLocalDefault({ footer: false })
      : undefined,
  ].filter(Boolean) as any,
  formatError: (formattedError) => {
    // Custom error formatting
    console.error('GraphQL Error:', formattedError);
    return formattedError;
  },
});

async function startServer() {
  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => {
        const user = await getAuthUser(req);
        return {
          prisma,
          user,
        };
      },
    })
  );

  const PORT = process.env.PORT || 4000;
  const NODE_ENV = process.env.NODE_ENV || 'development';

  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  
  if (NODE_ENV !== 'production') {
    console.log(`🎮 GraphQL Playground available at http://localhost:${PORT}/graphql`);
    console.log(`\n🔐 Test with authorization headers:`);
    console.log(`   Admin: {"Authorization": "Bearer admin-token"}`);
    console.log(`   Recruiter: {"Authorization": "Bearer recruiter-token"}\n`);
  }
}

startServer().catch((error) => {
  console.error('❌ Error starting server:', error);
  process.exit(1);
});
