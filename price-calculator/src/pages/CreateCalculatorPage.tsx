import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import WindowCleaningSetupWizard from "../components/WindowCleaningSetupWizard";
import { saveCalculator } from "../features/calculator";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const calculators = [
  { label: "Window Cleaning Calculator", value: "window-cleaning" },
  { label: "Time-based Calculator", value: "time-based" },
  { label: "Area-based Calculator", value: "area-based" },
  { label: "Number of Windows Calculator", value: "number-of-windows" },
];

function TimeBasedCalculator() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Time-based Calculator</CardTitle>
        <CardDescription>
          (Coming soon) Calculate price based on estimated time spent.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500">
          This calculator will let you estimate price based on hours worked and
          hourly wage.
        </div>
      </CardContent>
    </Card>
  );
}

function AreaBasedCalculator() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Area-based Calculator</CardTitle>
        <CardDescription>
          (Coming soon) Calculate price based on area (m² or ft²).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500">
          This calculator will let you estimate price based on area and rate per
          m²/ft².
        </div>
      </CardContent>
    </Card>
  );
}

function NumberOfWindowsCalculator() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Number of Windows Calculator</CardTitle>
        <CardDescription>
          (Coming soon) Calculate price based only on the number of windows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-gray-500">
          This calculator will let you estimate price based on a fixed price per
          window.
        </div>
      </CardContent>
    </Card>
  );
}

const CreateCalculatorPage = () => {
  const navigate = useNavigate();
  const [hourlyWage, setHourlyWage] = useState(300);
  const [selectedCalc, setSelectedCalc] = useState(calculators[0].value);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCalculator = async () => {
    try {
      setIsCreating(true);

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

      const calculator = saveCalculator({
        type: selectedCalc,
        hourlyWage,
        settings,
      });

      toast.success("Calculator created successfully!");
      navigate(`/embed/${calculator.id}`);
    } catch (error) {
      console.error("Error creating calculator:", error);
      toast.error("Failed to create calculator. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Your Calculator</CardTitle>
            <CardDescription>
              Set up your price calculator and customize it for your business
              needs.
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

        {selectedCalc === "window-cleaning" && (
          <WindowCleaningSetupWizard hourlyWage={hourlyWage} />
        )}
        {selectedCalc === "time-based" && <TimeBasedCalculator />}
        {selectedCalc === "area-based" && <AreaBasedCalculator />}
        {selectedCalc === "number-of-windows" && <NumberOfWindowsCalculator />}

        <Card>
          <CardHeader>
            <CardTitle>Embed on Your Website</CardTitle>
            <CardDescription>
              Copy and paste the code below into your website to embed your
              calculator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded p-4 font-mono text-xs text-gray-700 select-all">
              {
                '<iframe src="https://yourdomain.com/embed/calculator-id" width="100%" height="600" frameBorder="0"></iframe>'
              }
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
};

export default CreateCalculatorPage;
