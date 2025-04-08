import Fastify from 'fastify';
import { getQuote } from '../src/controllers/quoteController';
import fs from 'fs/promises';
import { persistQuote } from '../src/utils/persistence';

// Mock modules
jest.mock('fs/promises');
jest.mock('../src/utils/persistence');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234')
}));

describe('Quote Controller with Persistence', () => {
  const fastify = Fastify();
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockPersistQuote = persistQuote as jest.MockedFunction<typeof persistQuote>;
  
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
  
  it('should call persistQuote when generating a quote', async () => {
    const quoteInput = {
      proposer_name: 'Test User',
      proposer_email: 'test@example.com',
      proposer_postcode: 'SW1A1AA',
      animal_species: 'Cat',
      animal_breed: 'Ragdoll',
      animal_age: 3,
      animal_neutered: true
    };
    
    const response = await fastify.inject({
      method: 'POST',
      url: '/quote/pet-insurance',
      payload: quoteInput
    });
    
    expect(response.statusCode).toBe(200);
    
    // Verify persistQuote was called with the correct arguments
    expect(mockPersistQuote).toHaveBeenCalledWith(
      'pet-insurance',
      quoteInput,
      expect.objectContaining({
        result: expect.any(Number),
        valid: expect.any(Boolean)
      })
    );
  });
  
  it('should still return quote result even if persistence fails', async () => {
    // Make persistQuote throw an error
    mockPersistQuote.mockRejectedValue(new Error('Persistence error'));
    
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
    
    // Should still return successful response
    expect(response.statusCode).toBe(200);
    const result = JSON.parse(response.payload);
    expect(result).toHaveProperty('valid', true);
    expect(result).toHaveProperty('result');
  });
});