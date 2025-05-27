import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import type { CalculatorConfig } from "../features/calculator";

interface WindowCleaningCalculatorProps {
  hourlyWage: number;
  settings: CalculatorConfig["settings"];
}

const WindowCleaningCalculator: React.FC<WindowCleaningCalculatorProps> = ({
  hourlyWage,
  settings,
}) => {
  const [numWindows, setNumWindows] = useState(1);
  const [floor, setFloor] = useState(1);
  const [interiorCleaning, setInteriorCleaning] = useState(false);
  const [secondaryGlazing, setSecondaryGlazing] = useState(false);
  const [isOneTime, setIsOneTime] = useState(true);

  const calculatePrice = () => {
    let price = hourlyWage * 0.5; // Base price for 30 minutes

    // Apply floor multiplier
    const floorMultiplier = settings.floorMultipliers?.[floor - 1] || 1;
    price *= floorMultiplier;

    // Apply interior cleaning multiplier
    if (interiorCleaning && settings.interiorCleaning === "yes") {
      price *= settings.interiorMultiplier || 1.6;
    }

    // Apply secondary glazing multiplier
    if (secondaryGlazing) {
      price *= settings.secondaryGlazingMultiplier || 2;
    }

    // Apply one-time service multiplier
    if (isOneTime) {
      price *= settings.oneTimeMultiplier || 1.6;
    }

    // Apply minimum price
    const minPrice = interiorCleaning
      ? settings.minInteriorPrice || 199
      : settings.minPrice || 99;
    price = Math.max(price, minPrice);

    return Math.round(price);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Window Cleaning Price Calculator</CardTitle>
        <CardDescription>
          Calculate the price for your window cleaning service
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Windows
          </label>
          <Input
            type="number"
            min={1}
            value={numWindows}
            onChange={(e) => setNumWindows(Number(e.target.value))}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Floor</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={floor}
            onChange={(e) => setFloor(Number(e.target.value))}
          >
            <option value={1}>Ground Floor</option>
            {Array.from({ length: (settings.maxFloor || 3) - 1 }, (_, i) => (
              <option key={i + 2} value={i + 2}>
                {i + 1}. Floor
              </option>
            ))}
          </select>
        </div>

        {settings.interiorCleaning === "yes" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Interior Cleaning
            </label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={interiorCleaning ? "yes" : "no"}
              onChange={(e) => setInteriorCleaning(e.target.value === "yes")}
            >
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">
            Secondary Glazing
          </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={secondaryGlazing ? "yes" : "no"}
            onChange={(e) => setSecondaryGlazing(e.target.value === "yes")}
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={isOneTime ? "one-time" : "subscription"}
            onChange={(e) => setIsOneTime(e.target.value === "one-time")}
          >
            <option value="one-time">One-time Service</option>
            <option value="subscription">Subscription</option>
          </select>
        </div>

        <div className="pt-4">
          <div className="text-2xl font-bold text-gray-900">
            Estimated Price: DKK {calculatePrice()}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            This is an estimate based on your inputs
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindowCleaningCalculator;
