// Mock implementation of the pricing engine
export const engine = jest.fn().mockImplementation(async (params: any) => {
  const { quote } = params;
  
  // Simple logic to determine validity based on species and breed
  const valid = quote.animal_species === 'Cat' || 
    (quote.animal_species === 'Dog' && quote.animal_breed !== 'Collie');
  
  // Simple calculation for the result
  const baseAmount = quote.base || 1000;
  const multiplier = quote.animal_species === 'Cat' ? 3.5 : 1.2;
  const result = parseFloat((baseAmount * multiplier).toFixed(2));
  
  return {
    result,
    valid
  };
});