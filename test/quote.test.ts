import Fastify from 'fastify';
import { getQuote } from '../src/controllers/quoteController';
import { engine } from '@swa_llow/pricing_engine';
import fs from 'fs/promises';

// Mock fs module
jest.mock('fs/promises');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Quote Controller', () => {
  const fastify = Fastify();
  
  // Register the route
  fastify.post('/quote/:project_id', {}, getQuote);
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock the readFile function to return a mock project
    mockFs.readFile.mockResolvedValue(JSON.stringify({
      id: 'pet-insurance',
      meta: {
        name: 'Pet Insurance',
        description: 'Pet Insurance'
      }
    }));
  });
  
  it('should return a valid quote for a cat', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/quote/pet-insurance',
      payload: {
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Cat',
        animal_breed: 'Ragdoll',
        animal_age: 3,
        animal_neutered: true
      }
    });
    
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('valid', true);
    expect(result).toHaveProperty('result');
    expect(engine).toHaveBeenCalledTimes(1);
  });
  
  it('should return an invalid quote for a Collie', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/quote/pet-insurance',
      payload: {
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Dog',
        animal_breed: 'Collie',
        animal_age: 10,
        animal_neutered: false
      }
    });
    
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('valid', false);
    expect(result).toHaveProperty('result');
    expect(engine).toHaveBeenCalledTimes(1);
  });
  
  it('should return 404 for non-existent project', async () => {
    // Mock fs to throw ENOENT error
    mockFs.readFile.mockRejectedValue({ code: 'ENOENT' });
    
    const response = await fastify.inject({
      method: 'POST',
      url: '/quote/non-existent-project',
      payload: {
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Dog',
        animal_breed: 'Collie',
        animal_age: 10,
        animal_neutered: false
      }
    });
    
    expect(response.statusCode).toBe(404);
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('error', 'Project not found');
  });
  
  it('should return 500 for unexpected errors', async () => {
    // Mock fs to throw a generic error
    mockFs.readFile.mockRejectedValue(new Error('Unexpected error'));
    
    const response = await fastify.inject({
      method: 'POST',
      url: '/quote/pet-insurance',
      payload: {
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Dog',
        animal_breed: 'Collie',
        animal_age: 10,
        animal_neutered: false
      }
    });
    
    expect(response.statusCode).toBe(500);
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('error', 'Internal Server Error');
  });
});