import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CalculatorConfig } from '../../features/calculator';

interface CalculatorState {
  calculators: CalculatorConfig[];
  currentCalculator: CalculatorConfig | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CalculatorState = {
  calculators: [],
  currentCalculator: null,
  isLoading: false,
  error: null,
};

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    setCalculators: (state, action: PayloadAction<CalculatorConfig[]>) => {
      state.calculators = action.payload;
    },
    setCurrentCalculator: (state, action: PayloadAction<CalculatorConfig | null>) => {
      state.currentCalculator = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addCalculator: (state, action: PayloadAction<CalculatorConfig>) => {
      state.calculators.push(action.payload);
    },
    updateCalculator: (state, action: PayloadAction<CalculatorConfig>) => {
      const index = state.calculators.findIndex(calc => calc.id === action.payload.id);
      if (index !== -1) {
        state.calculators[index] = action.payload;
      }
    },
    deleteCalculator: (state, action: PayloadAction<string>) => {
      state.calculators = state.calculators.filter(calc => calc.id !== action.payload);
    },
  },
});

export const {
  setCalculators,
  setCurrentCalculator,
  setLoading,
  setError,
  addCalculator,
  updateCalculator,
  deleteCalculator,
} = calculatorSlice.actions;

export default calculatorSlice.reducer; 