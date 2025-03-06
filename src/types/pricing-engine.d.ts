declare module '@swa_llow/pricing_engine' {
  export interface PricingEngineParams {
    project: any;
    quote: any;
    debug?: boolean;
  }

  export interface PricingEngineResult {
    result: number;
    valid: boolean;
  }

  export const engine: (params: PricingEngineParams) => Promise<PricingEngineResult>;
}
