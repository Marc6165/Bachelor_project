import { Calculator } from "./Calculator";

interface FixedPackageCalculatorProps {
  hourlyWage: number;
  settings: Record<string, unknown>;
  onQuoteGenerated?: (quoteId: string) => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function FixedPackageCalculator({ 
  hourlyWage, 
  settings, 
  onQuoteGenerated, 
  onInvoiceCreated 
}: FixedPackageCalculatorProps) {
  // Base package prices
  const packagePrices: Record<string, number> = {
    "Basic": 5000,
    "Standard": 10000,
    "Premium": 20000,
    "Enterprise": 50000
  };

  // Contract duration multipliers (longer = cheaper per month)
  const durationMultipliers: Record<string, number> = {
    "1 Month": 1,
    "3 Months": 0.95,
    "6 Months": 0.9,
    "12 Months": 0.85,
    "24 Months": 0.8
  };

  // Payment terms multipliers
  const paymentTermsMultipliers: Record<string, number> = {
    "Monthly": 1,
    "Quarterly": 0.98,
    "Semi-Annual": 0.95,
    "Annual": 0.92
  };

  // Additional services prices
  const additionalServicesPrices: Record<string, number> = {
    "24/7 Support": 2000,
    "Priority Response": 1500,
    "Extended Warranty": 3000,
    "Training Sessions": 5000,
    "Custom Reports": 2500
  };

  const calculatePrice = (parameters: Record<string, string | number>) => {
    const packageType = parameters.packageType as string;
    const duration = parameters.duration as string;
    const paymentTerms = parameters.paymentTerms as string;
    const additionalServices = (parameters.additionalServices as string || "").split(",").filter(Boolean);

    // Calculate base price
    const basePrice = packagePrices[packageType];

    // Apply duration multiplier
    const withDuration = basePrice * durationMultipliers[duration];

    // Apply payment terms multiplier
    const withPaymentTerms = withDuration * paymentTermsMultipliers[paymentTerms];

    // Add additional services
    const additionalServicesTotal = additionalServices.reduce(
      (total, service) => total + (additionalServicesPrices[service] || 0),
      0
    );

    const finalPrice = withPaymentTerms + additionalServicesTotal;

    // Return price details
    return {
      total: Math.round(finalPrice),
      currency: "DKK",
      breakdown: {
        "Base Package Price": Math.round(basePrice),
        "Duration Discount": Math.round(withDuration - basePrice),
        "Payment Terms Discount": Math.round(withPaymentTerms - withDuration),
        "Additional Services": Math.round(additionalServicesTotal)
      }
    };
  };

  return (
    <Calculator
      serviceType="fixed-package"
      title="Fixed Package Calculator"
      description="Calculate price based on package type and options"
      parameters={[
        {
          name: "packageType",
          type: "select",
          label: "Package Type",
          options: Object.keys(packagePrices),
          required: true,
        },
        {
          name: "duration",
          type: "select",
          label: "Contract Duration",
          options: Object.keys(durationMultipliers),
          required: true,
        },
        {
          name: "paymentTerms",
          type: "select",
          label: "Payment Terms",
          options: Object.keys(paymentTermsMultipliers),
          required: true,
        },
        {
          name: "additionalServices",
          type: "select",
          label: "Additional Services",
          options: Object.keys(additionalServicesPrices),
          required: false,
        }
      ]}
      calculatePrice={calculatePrice}
      onQuoteGenerated={onQuoteGenerated}
      onInvoiceCreated={onInvoiceCreated}
    />
  );
} 