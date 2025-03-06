export interface QuoteInput {
  base?: number;
  proposer_name: string;
  proposer_email: string;
  proposer_postcode: string;
  commission_rate?: number;
  tax_rate?: number;
  animal_species: string;
  animal_breed: string;
  animal_age: number;
  animal_neutered: boolean;
}

export interface QuoteOutput {
  result: number;
  valid: boolean;
}

export interface Project {
  [key: string]: any;
}

export interface QuoteResult {
  result: number;
  valid: boolean;
}

export interface PricingEngine {
  (params: { project: Project; quote: QuoteInput; debug?: boolean }): Promise<QuoteResult>;
}
