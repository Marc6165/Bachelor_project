import { calculatorApi } from '../services/api';

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
export const saveCalculator = async (config: Omit<CalculatorConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<CalculatorConfig> => {
  const response = await calculatorApi.createCalculator(config);
  return response as CalculatorConfig;
};

export const getCalculators = async (): Promise<CalculatorConfig[]> => {
  const response = await calculatorApi.getUserCalculators();
  return response as CalculatorConfig[];
};

export const getCalculator = async (id: string): Promise<CalculatorConfig | undefined> => {
  try {
    const response = await calculatorApi.getCalculator(id);
    return response as CalculatorConfig;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
};

export const updateCalculator = async (id: string, config: Partial<CalculatorConfig>): Promise<CalculatorConfig | undefined> => {
  try {
    const response = await calculatorApi.updateCalculator(id, config);
    return response as CalculatorConfig;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return undefined;
    }
    throw error;
  }
};

export const deleteCalculator = async (id: string): Promise<boolean> => {
  try {
    await calculatorApi.deleteCalculator(id);
    return true;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return false;
    }
    throw error;
  }
};
