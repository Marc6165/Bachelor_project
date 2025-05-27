import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCalculator } from "../features/calculator";
import type { CalculatorConfig } from "../features/calculator";
import WindowCleaningWizard from "../components/WindowCleaningWizard";

const CalculatorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [calculator, setCalculator] = useState<CalculatorConfig | null>(null);

  useEffect(() => {
    if (id) {
      const calc = getCalculator(id);
      if (calc) {
        setCalculator(calc);
      }
    }
  }, [id]);

  if (!calculator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
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
