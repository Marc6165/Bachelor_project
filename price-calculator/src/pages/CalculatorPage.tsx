import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCalculator } from "../features/calculator";
import type { CalculatorConfig } from "../features/calculator";
import WindowCleaningWizard from "../components/WindowCleaningWizard";
import { AreaBasedCalculator } from "../components/AreaBasedCalculator";
import { HourlyCalculator } from "../components/HourlyCalculator";
import { FixedPackageCalculator } from "../components/FixedPackageCalculator";
import { toast } from "sonner";

const CalculatorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [calculator, setCalculator] = useState<CalculatorConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCalculator = async () => {
      if (id) {
        try {
          const calc = await getCalculator(id);
          if (calc) {
            setCalculator(calc);
          } else {
            toast.error("Calculator not found");
          }
        } catch (error) {
          console.error("Error fetching calculator:", error);
          toast.error("Failed to load calculator");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchCalculator();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (!calculator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-gray-500">Calculator not found</div>
        </div>
      </div>
    );
  }

  const renderCalculator = () => {
    const commonProps = {
      hourlyWage: calculator.hourlyWage,
      settings: calculator.settings,
      onQuoteGenerated: (quoteId: string) => {
        console.log("Quote generated:", quoteId);
        toast.success("Quote generated successfully!");
      },
      onInvoiceCreated: (invoiceId: string) => {
        console.log("Invoice created:", invoiceId);
        toast.success("Invoice created successfully!");
      }
    };

    switch (calculator.type) {
      case "window-cleaning":
        return (
          <div className="space-y-8">
            <div data-testid="calculator-input-area">
              <WindowCleaningWizard {...commonProps} />
            </div>
          </div>
        );
      case "area-based":
        return <AreaBasedCalculator {...commonProps} />;
      case "hourly":
        return <HourlyCalculator {...commonProps} />;
      case "fixed-package":
        return <FixedPackageCalculator {...commonProps} />;
      default:
        return <div className="text-center text-gray-500">Unknown calculator type</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {renderCalculator()}
      </div>
    </div>
  );
};

export default CalculatorPage;
