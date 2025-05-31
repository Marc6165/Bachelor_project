import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import WindowCleaningWizard from "../components/WindowCleaningWizard";
import WindowCleaningSetupWizard from "../components/WindowCleaningSetupWizard";
import { AreaBasedCalculator } from "../components/AreaBasedCalculator";
import { HourlyCalculator } from "../components/HourlyCalculator";
import { FixedPackageCalculator } from "../components/FixedPackageCalculator";
import { saveCalculator } from "../features/calculator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { CalculatorConfig } from "../features/calculator";

// Only include the fields needed for creating a new calculator
interface CreateCalculatorConfig {
  type: string;
  hourlyWage: number;
  settings: Record<string, unknown>;
}

const calculators = [
  { label: "Window Cleaning Calculator", value: "window-cleaning" },
  { label: "Area-based Calculator", value: "area-based" },
  { label: "Hourly Calculator", value: "hourly" },
  { label: "Fixed Package Calculator", value: "fixed-package" },
];

export default function CreateCalculatorPage() {
  const [selectedCalc, setSelectedCalc] = useState(calculators[0].value);
  const [hourlyWage, setHourlyWage] = useState(150);
  const [isCreating, setIsCreating] = useState(false);
  const [createdCalculator, setCreatedCalculator] = useState<CalculatorConfig | null>(null);

  const handleCreateCalculator = async () => {
    setIsCreating(true);
    try {
      // Get settings from WindowCleaningSetupWizard if it's selected
      let settings = {};
      if (selectedCalc === "window-cleaning") {
        const wizardElement = document.querySelector("[data-wizard-settings]");
        if (wizardElement) {
          settings = JSON.parse(
            wizardElement.getAttribute("data-wizard-settings") || "{}"
          );
        }
      }

      const calculator = await saveCalculator({
        type: selectedCalc,
        hourlyWage,
        settings,
      });

      if (!calculator || !calculator.id) {
        throw new Error('Invalid calculator response from server');
      }

      setCreatedCalculator(calculator);
      toast.success("Calculator created successfully!");
    } catch (error) {
      console.error("Error creating calculator:", error);
      toast.error("Failed to create calculator. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const renderCalculator = () => {
    switch (selectedCalc) {
      case "window-cleaning":
        return (
          <>
            <WindowCleaningWizard />
            <WindowCleaningSetupWizard hourlyWage={hourlyWage} disabled={isCreating} />
          </>
        );
      case "area-based":
        return <AreaBasedCalculator />;
      case "hourly":
        return <HourlyCalculator />;
      case "fixed-package":
        return <FixedPackageCalculator />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Calculator</CardTitle>
            <CardDescription>
              Set up your price calculator and customize it for your business needs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Hourly Wage (DKK)
              </label>
              <Input
                type="number"
                min={0}
                value={hourlyWage}
                onChange={(e) => setHourlyWage(Number(e.target.value))}
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Choose Calculator
              </label>
              <select
                className="w-full border rounded px-3 py-2 text-sm"
                value={selectedCalc}
                onChange={(e) => setSelectedCalc(e.target.value)}
                disabled={isCreating}
              >
                {calculators.map((calc) => (
                  <option key={calc.value} value={calc.value}>
                    {calc.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleCreateCalculator}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? "Creating..." : "Create Calculator"}
            </Button>
          </CardFooter>
        </Card>

        {/* Calculator Preview */}
        {renderCalculator()}

        {/* Embed Section */}
        <Card>
          <CardHeader>
            <CardTitle>Embed on Your Website</CardTitle>
            <CardDescription>
              Copy and paste the code below into your website to embed your calculator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded p-4 font-mono text-xs text-gray-700 select-all">
              {createdCalculator ? (
                `<iframe src="${window.location.origin}/calculator/${createdCalculator.id}" width="100%" height="600" frameBorder="0"></iframe>`
              ) : (
                '<iframe src="https://yourdomain.com/embed/calculator-id" width="100%" height="600" frameBorder="0"></iframe>'
              )}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Need help? See our{" "}
              <a href="#" className="text-blue-600 underline">
                integration guide
              </a>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
