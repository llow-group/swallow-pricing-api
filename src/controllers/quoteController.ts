import { FastifyRequest, FastifyReply } from 'fastify';
import { engine } from '@swa_llow/pricing_engine';  // This is file is protected. Access can be granted on request.
import fs from 'fs/promises';
import path from 'path';
import { QuoteInput } from '../types';

// Get a quote using the pricing engine
export const getQuote = async (
  request: FastifyRequest<{
    Params: { project_id: string };
    Body: QuoteInput;
  }>,
  reply: FastifyReply
) => {
  try {
    const { project_id } = request.params;
    const quoteInput = request.body;

    // Load project from the JSON file
    const projectPath = path.join(process.cwd(), 'src', 'models', `${project_id}.json`);
    const projectData = await fs.readFile(projectPath, 'utf-8');
    const project = JSON.parse(projectData);

    // Call the pricing engine
    const result = await engine({
      project,
      quote: quoteInput,
      debug: true,
    });

    return reply.code(200).send({
      result: result.result,
      valid: result.valid,
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return reply.code(404).send({
        error: 'Project not found',
        message: `No project found with ID: ${request.params.project_id}`,
      });
    }

    console.error('Error generating quote:', error);
    return reply.code(500).send({
      error: 'Internal Server Error',
      message: 'Failed to generate quote',
    });
  }
};
