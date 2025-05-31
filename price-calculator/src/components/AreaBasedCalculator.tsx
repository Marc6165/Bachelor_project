import { Calculator } from "./Calculator";

interface AreaBasedCalculatorProps {
  hourlyWage: number;
  settings: Record<string, unknown>;
  onQuoteGenerated?: (quoteId: string) => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function AreaBasedCalculator({ 
  hourlyWage, 
  settings, 
  onQuoteGenerated, 
  onInvoiceCreated 
}: AreaBasedCalculatorProps) {
  // Base rate per m² for different work categories
  const baseRates: Record<string, number> = {
    "Window Cleaning": 25,
    "Lawn Mowing": 15,
    "Floor Sanding": 150,
    "Painting": 80,
    "Tiling": 200,
    "Carpet Installation": 120,
    "Roofing": 300,
    "Insulation": 180,
    "Concrete Work": 250,
    "Wallpapering": 100
  };

  // Complexity multipliers
  const complexityMultipliers: Record<string, number> = {
    "Standard": 1,
    "Complex Layout": 1.3,
    "Custom Work Required": 1.5,
    "Heritage/Special Care": 1.8
  };

  // Accessibility multipliers
  const accessibilityMultipliers: Record<string, number> = {
    "Ground Level": 1,
    "Above Ground (1-2 Floors)": 1.3,
    "High Rise": 1.6,
    "Restricted Access": 1.4
  };

  // Frequency discounts
  const frequencyDiscounts: Record<string, number> = {
    "One-time Project": 1,
    "Weekly Service": 0.7,
    "Monthly Service": 0.8,
    "Quarterly Service": 0.85,
    "Annual Service": 0.9,
    "Multi-year Contract": 0.75
  };

  const calculatePrice = (parameters: Record<string, string | number>) => {
    const area = Number(parameters.area);
    const workCategory = parameters.workCategory as string;
    const complexity = parameters.complexity as string;
    const accessibility = parameters.accessibility as string;
    const frequency = parameters.frequency as string;

    // Calculate base price
    const basePrice = area * baseRates[workCategory];

    // Apply multipliers
    const withComplexity = basePrice * complexityMultipliers[complexity];
    const withAccessibility = withComplexity * accessibilityMultipliers[accessibility];
    
    // Apply frequency discount
    const finalPrice = withAccessibility * frequencyDiscounts[frequency];

    // Return price details
    return {
      total: Math.round(finalPrice),
      currency: "DKK",
      breakdown: {
        "Base Price": Math.round(basePrice),
        "Complexity Adjustment": Math.round(withComplexity - basePrice),
        "Accessibility Adjustment": Math.round(withAccessibility - withComplexity),
        "Frequency Discount": Math.round(finalPrice - withAccessibility)
      }
    };
  };

  return (
    <Calculator
      serviceType="area-based"
      title="Area-based Calculator"
      description="Calculate price based on area in square meters"
      parameters={[
        {
          name: "area",
          type: "number",
          label: "Area (m²)",
          required: true,
        },
        {
          name: "workCategory",
          type: "select",
          label: "Type of Service",
          options: Object.keys(baseRates),
          required: true,
        },
        {
          name: "complexity",
          type: "select",
          label: "Job Complexity",
          options: Object.keys(complexityMultipliers),
          required: true,
        },
        {
          name: "accessibility",
          type: "select",
          label: "Accessibility",
          options: Object.keys(accessibilityMultipliers),
          required: true,
        },
        {
          name: "frequency",
          type: "select",
          label: "Service Frequency",
          options: Object.keys(frequencyDiscounts),
          required: true,
        }
      ]}
      calculatePrice={calculatePrice}
      onQuoteGenerated={onQuoteGenerated}
      onInvoiceCreated={onInvoiceCreated}
    />
  );
} 