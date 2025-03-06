import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { getQuote } from './controllers/quoteController';
import { QuoteInput } from './types';

const server: FastifyInstance = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
});

// Register plugins
server.register(cors, {
  origin: true,
});

// Register Swagger
server.register(swagger, {
  openapi: {
    info: {
      title: 'Swallow Pricing API',
      description: 'API for generating insurance quotes using the proprietary Swallow Pricing Engine',
      version: '1.0.0',
      contact: {
        name: 'Swallow API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'Proprietary',
        url: 'https://example.com/license'
      }
    },
    externalDocs: {
      description: 'Find more info here',
      url: 'https://example.com/docs'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        apiKey: {
          type: 'apiKey',
          name: 'apiKey',
          in: 'header'
        }
      },
      examples: {
        quoteRequest: {
          value: {
            proposer_name: 'John Smith',
            proposer_email: 'john@example.com',
            proposer_postcode: 'SW1A1AA',
            animal_species: 'Cat',
            animal_breed: 'Ragdoll',
            animal_age: 3,
            animal_neutered: true,
            base: 1000,
            commission_rate: 0.15,
            tax_rate: 0.125
          }
        },
        quoteResponse: {
          value: {
            result: 3500,
            valid: true
          }
        },
        errorResponse: {
          value: {
            error: 'Project not found',
            message: 'No project found with ID: pet_insurance'
          }
        }
      }
    },
    tags: [
      { name: 'quotes', description: 'Quote generation endpoints' },
      { name: 'health', description: 'Health check endpoints' }
    ]
  }
});

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true
  },
  staticCSP: true,
  transformSpecificationClone: false
});

// Define routes
server.post<{
  Params: { project_id: string };
  Body: QuoteInput;
}>(
  '/quote/:project_id',
  {
    schema: {
      tags: ['quotes'],
      description: 'Generate an insurance quote based on the provided parameters and pricing project',
      summary: 'Generate insurance quote',
      operationId: 'generateQuote',
      params: {
        type: 'object',
        required: ['project_id'],
        properties: {
          project_id: { 
            type: 'string',
            description: 'ID of the pricing project to use (corresponds to a JSON file in models/)'
          },
        },
      },
      body: {
        type: 'object',
        required: [
          'proposer_name',
          'proposer_email',
          'proposer_postcode',
          'animal_species',
          'animal_breed',
          'animal_age',
          'animal_neutered',
        ],
        properties: {
          base: { 
            type: 'number',
            description: 'Base premium amount'
          },
          proposer_name: { 
            type: 'string',
            description: 'Full name of the insurance proposer'
          },
          proposer_email: { 
            type: 'string', 
            format: 'email',
            description: 'Email address of the proposer'
          },
          proposer_postcode: { 
            type: 'string',
            description: 'Postal code of the proposer'
          },
          commission_rate: { 
            type: 'number',
            description: 'Commission rate as a decimal (e.g., 0.15 for 15%)',
            minimum: 0,
            maximum: 1
          },
          tax_rate: { 
            type: 'number',
            description: 'Tax rate as a decimal (e.g., 0.125 for 12.5%)',
            minimum: 0,
            maximum: 1
          },
          animal_species: { 
            type: 'string',
            description: 'Species of the animal to be insured',
            enum: ['Cat', 'Dog', 'Rabbit', 'Horse', 'Bird']
          },
          animal_breed: { 
            type: 'string',
            description: 'Breed of the animal'
          },
          animal_age: { 
            type: 'integer', 
            minimum: 0,
            description: 'Age of the animal in years'
          },
          animal_neutered: { 
            type: 'boolean',
            description: 'Whether the animal has been neutered'
          },
        },
      },
      response: {
        200: {
          description: 'Successful quote generation',
          type: 'object',
          properties: {
            result: { 
              type: 'number',
              description: 'The calculated premium amount'
            },
            valid: { 
              type: 'boolean',
              description: 'Whether the quote is valid according to business rules'
            },
          },
        },
        400: {
          description: 'Bad request - invalid input parameters',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        404: {
          description: 'Project not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
  getQuote
);

// Health check endpoint
server.get('/health', {
  schema: {
    tags: ['health'],
    description: 'Health check endpoint to verify API is running',
    summary: 'API health check',
    operationId: 'healthCheck',
    response: {
      200: {
        description: 'Successful response',
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['ok'] },
          version: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' }
        }
      }
    }
  }
}, async (_, reply) => {
  return reply.code(200).send({ 
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`Server listening on ${server.server.address()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
