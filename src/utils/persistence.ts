import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { QuoteInput, QuoteOutput } from '../types';

export interface PersistedQuote extends QuoteOutput {
  id: string;
  projectId: string;
  input: QuoteInput;
  timestamp: string;
}

/**
 * Persist a quote to disk if the PERSIST_QUOTES environment variable is set to 'true'
 * 
 * @param projectId The project ID
 * @param quoteInput The quote input parameters
 * @param quoteOutput The quote output result
 * @returns Promise<void>
 */
export const persistQuote = async (
  projectId: string,
  quoteInput: QuoteInput,
  quoteOutput: QuoteOutput
): Promise<void> => {
  // Only persist if the feature flag is enabled
  if (process.env.PERSIST_QUOTES !== 'true') {
    return;
  }

  try {
    const quotesDir = path.join(process.cwd(), 'data', 'quotes');
    
    // Create quotes directory if it doesn't exist
    await fs.mkdir(quotesDir, { recursive: true });
    
    // Generate UUID for the quote
    const quoteId = uuidv4();
    
    const persistedQuote: PersistedQuote = {
      id: quoteId,
      projectId,
      input: quoteInput,
      ...quoteOutput,
      timestamp: new Date().toISOString()
    };
    
    // Write quote to disk
    await fs.writeFile(
      path.join(quotesDir, `${quoteId}.json`),
      JSON.stringify(persistedQuote, null, 2),
      'utf-8'
    );
  } catch (error) {
    console.error('Failed to persist quote:', error);
    // We don't throw here to avoid disrupting the main quote flow
  }
};