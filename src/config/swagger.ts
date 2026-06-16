import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env, isProduction } from './env.js';

export async function setupSwagger(fastify: FastifyInstance) {
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Clothi E-Commerce API',
        description: 'Complete API documentation for Clothi e-commerce platform',
        version: '1.0.0',
      },
      host: isProduction ? 'clothi.co.in' : `localhost:${env.PORT}`,
      schemes: isProduction ? ['https'] : ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
        },
      },
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/api-docs',
  } as any);
}
