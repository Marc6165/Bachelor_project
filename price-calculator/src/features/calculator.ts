import { v4 as uuidv4 } from 'uuid';

export interface CalculatorConfig {
  id: string;
  type: string;
  hourlyWage: number;
  settings: {
    maxFloor?: number;
    interiorCleaning?: string;
    minPrice?: number;
    interiorMultiplier?: number;
    minInteriorPrice?: number;
    secondaryGlazingMultiplier?: number;
    floorMultipliers?: number[];
    oneTimeMultiplier?: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Store calculators in localStorage for now
// In a real app, this would be stored in a database
export const saveCalculator = (config: Omit<CalculatorConfig, 'id' | 'createdAt' | 'updatedAt'>): CalculatorConfig => {
  const calculator: CalculatorConfig = {
    ...config,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const existingCalculators = getCalculators();
  existingCalculators.push(calculator);
  localStorage.setItem('calculators', JSON.stringify(existingCalculators));

  return calculator;
};

export const getCalculators = (): CalculatorConfig[] => {
  const calculators = localStorage.getItem('calculators');
  return calculators ? JSON.parse(calculators) : [];
};

export const getCalculator = (id: string): CalculatorConfig | undefined => {
  const calculators = getCalculators();
  return calculators.find(calc => calc.id === id);
};

export const updateCalculator = (id: string, config: Partial<CalculatorConfig>): CalculatorConfig | undefined => {
  const calculators = getCalculators();
  const index = calculators.findIndex(calc => calc.id === id);
  
  if (index === -1) return undefined;

  const updatedCalculator = {
    ...calculators[index],
    ...config,
    updatedAt: new Date().toISOString(),
  };

  calculators[index] = updatedCalculator;
  localStorage.setItem('calculators', JSON.stringify(calculators));

  return updatedCalculator;
};

export const deleteCalculator = (id: string): boolean => {
  const calculators = getCalculators();
  const filteredCalculators = calculators.filter(calc => calc.id !== id);
  
  if (filteredCalculators.length === calculators.length) {
    return false;
  }

  localStorage.setItem('calculators', JSON.stringify(filteredCalculators));
  return true;
};
