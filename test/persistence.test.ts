import { persistQuote } from '../src/utils/persistence';
import fs from 'fs/promises';
import path from 'path';

// Mock fs promises module
jest.mock('fs/promises');
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid-1234')
}));

describe('Quote Persistence', () => {
  const mockFs = fs as jest.Mocked<typeof fs>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset env variable between tests
    process.env.PERSIST_QUOTES = undefined;
  });
  
  it('should not persist quotes when feature flag is not enabled', async () => {
    // Feature flag is off by default
    await persistQuote(
      'test-project',
      { 
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Cat',
        animal_breed: 'Ragdoll',
        animal_age: 3,
        animal_neutered: true
      },
      { result: 100, valid: true }
    );
    
    // Should not try to create directory or write file
    expect(mockFs.mkdir).not.toHaveBeenCalled();
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });
  
  it('should persist quotes when feature flag is enabled', async () => {
    // Set feature flag to true
    process.env.PERSIST_QUOTES = 'true';
    
    const quoteInput = { 
      proposer_name: 'Test User',
      proposer_email: 'test@example.com',
      proposer_postcode: 'SW1A1AA',
      animal_species: 'Cat',
      animal_breed: 'Ragdoll',
      animal_age: 3,
      animal_neutered: true
    };
    
    const quoteOutput = { result: 100, valid: true };
    
    await persistQuote('test-project', quoteInput, quoteOutput);
    
    // Should create directory
    expect(mockFs.mkdir).toHaveBeenCalledWith(
      expect.stringContaining(path.join('data', 'quotes')),
      { recursive: true }
    );
    
    // Should write file with UUID
    expect(mockFs.writeFile).toHaveBeenCalledWith(
      expect.any(String), // The full path will vary by platform
      expect.any(String), // The JSON content will have dynamic timestamps
      'utf-8'
    );
    
    // Verify file contents was called with JSON
    const fileContents = mockFs.writeFile.mock.calls[0][1] as string;
    const parsedContents = JSON.parse(fileContents);
    
    expect(parsedContents).toMatchObject({
      id: 'test-uuid-1234',
      projectId: 'test-project',
      input: quoteInput,
      result: quoteOutput.result,
      valid: quoteOutput.valid,
      timestamp: expect.any(String)
    });
  });
  
  it('should handle errors gracefully and not throw', async () => {
    // Set feature flag to true
    process.env.PERSIST_QUOTES = 'true';
    
    // Mock fs.mkdir to throw an error
    mockFs.mkdir.mockRejectedValue(new Error('Disk full'));
    
    // This should not throw even though the underlying operation fails
    await expect(persistQuote(
      'test-project',
      { 
        proposer_name: 'Test User',
        proposer_email: 'test@example.com',
        proposer_postcode: 'SW1A1AA',
        animal_species: 'Cat',
        animal_breed: 'Ragdoll',
        animal_age: 3,
        animal_neutered: true
      },
      { result: 100, valid: true }
    )).resolves.not.toThrow();
    
    // Should have tried to create directory
    expect(mockFs.mkdir).toHaveBeenCalled();
    // Should not try to write file since mkdir failed
    expect(mockFs.writeFile).not.toHaveBeenCalled();
  });
});