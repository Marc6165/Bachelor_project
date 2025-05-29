import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCalculator } from "../features/calculator";
import type { CalculatorConfig } from "../features/calculator";
import WindowCleaningWizard from "../components/WindowCleaningWizard";
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {calculator.type === "window-cleaning" && <WindowCleaningWizard />}
        {/* Add other calculator types here */}
      </div>
    </div>
  );
};

export default CalculatorPage;
