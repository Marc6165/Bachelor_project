import { Calculator } from "./Calculator";

interface HourlyCalculatorProps {
  hourlyWage: number;
  settings: Record<string, unknown>;
  onQuoteGenerated?: (quoteId: string) => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function HourlyCalculator({ 
  hourlyWage, 
  settings, 
  onQuoteGenerated, 
  onInvoiceCreated 
}: HourlyCalculatorProps) {
  // Base rates for different trades
  const baseRates: Record<string, number> = {
    "Carpenter": 450,
    "Painter": 400,
    "Window Cleaner": 350,
    "Plumber": 500,
    "Electrician": 550,
    "Gardener": 300,
    "Handyman": 350,
    "HVAC Technician": 600,
    "Mason": 450,
    "Roofer": 500
  };

  // Urgency multipliers
  const urgencyMultipliers: Record<string, number> = {
    "Standard": 1,
    "Priority (24h)": 1.5,
    "Emergency (4h)": 2,
    "Immediate": 2.5
  };

  // Time of day multipliers
  const timeOfDayMultipliers: Record<string, number> = {
    "Regular Hours (8-16)": 1,
    "Early Morning (6-8)": 1.25,
    "Evening (16-20)": 1.5,
    "Night (20-6)": 2,
    "Weekend": 1.75
  };

  const calculatePrice = (parameters: Record<string, string | number>) => {
    const hours = Number(parameters.hours);
    const trade = parameters.trade as string;
    const urgency = parameters.urgency as string;
    const timeOfDay = parameters.timeOfDay as string;

    // Calculate base price
    const basePrice = hours * baseRates[trade];

    // Apply multipliers
    const withUrgency = basePrice * urgencyMultipliers[urgency];
    const withTimeOfDay = withUrgency * timeOfDayMultipliers[timeOfDay];

    // Return price details
    return {
      total: Math.round(withTimeOfDay),
      currency: "DKK",
      breakdown: {
        "Base Price": Math.round(basePrice),
        "Urgency Adjustment": Math.round(withUrgency - basePrice),
        "Time of Day Adjustment": Math.round(withTimeOfDay - withUrgency)
      }
    };
  };

  return (
    <Calculator
      serviceType="hourly"
      title="Hourly Rate Calculator"
      description="Calculate price based on hours and trade type"
      parameters={[
        {
          name: "hours",
          type: "number",
          label: "Number of Hours",
          required: true,
        },
        {
          name: "trade",
          type: "select",
          label: "Trade/Profession",
          options: Object.keys(baseRates),
          required: true,
        },
        {
          name: "urgency",
          type: "select",
          label: "Urgency Level",
          options: Object.keys(urgencyMultipliers),
          required: true,
        },
        {
          name: "timeOfDay",
          type: "select",
          label: "Time of Day",
          options: Object.keys(timeOfDayMultipliers),
          required: true,
        },
        {
          name: "details",
          type: "text",
          label: "Additional Details",
          required: false,
        }
      ]}
      calculatePrice={calculatePrice}
      onQuoteGenerated={onQuoteGenerated}
      onInvoiceCreated={onInvoiceCreated}
    />
  );
} 