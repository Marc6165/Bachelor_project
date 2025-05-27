import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const defaultFloorMultipliers = [1, 1.5, 1.8, 2.2, 3, 4, 4, 4, 4, 4, 4];

interface WindowCleaningSetupWizardProps {
  hourlyWage: number;
}

const WindowCleaningSetupWizard: React.FC<WindowCleaningSetupWizardProps> = ({
  hourlyWage,
}) => {
  const [maxFloor, setMaxFloor] = useState(3);
  const [interiorCleaning, setInteriorCleaning] = useState("yes");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minPrice, setMinPrice] = useState(99);
  const [interiorMultiplier, setInteriorMultiplier] = useState(1.6);
  const [minInteriorPrice, setMinInteriorPrice] = useState(199);
  const [secondaryGlazingMultiplier, setSecondaryGlazingMultiplier] =
    useState(2);
  const [floorMultipliers, setFloorMultipliers] = useState<number[]>([
    ...defaultFloorMultipliers,
  ]);
  const [oneTimeMultiplier, setOneTimeMultiplier] = useState(1.6);

  // Update settings in data attribute whenever they change
  useEffect(() => {
    const settings = {
      maxFloor,
      interiorCleaning,
      minPrice,
      interiorMultiplier,
      minInteriorPrice,
      secondaryGlazingMultiplier,
      floorMultipliers: floorMultipliers.slice(0, maxFloor),
      oneTimeMultiplier,
    };

    const element = document.querySelector("[data-wizard-settings]");
    if (element) {
      element.setAttribute("data-wizard-settings", JSON.stringify(settings));
    }
  }, [
    maxFloor,
    interiorCleaning,
    minPrice,
    interiorMultiplier,
    minInteriorPrice,
    secondaryGlazingMultiplier,
    floorMultipliers,
    oneTimeMultiplier,
  ]);

  // Handlers
  const handleFloorMultiplierChange = (idx: number, value: number) => {
    setFloorMultipliers((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  // Floor options: 1 (ground) to 11 (10th floor)
  const floorOptions = [
    { value: 1, label: "Stueetage" },
    ...Array.from({ length: 10 }, (_, i) => ({
      value: i + 2,
      label: `${i + 1}. sal`,
    })),
  ];

  return (
    <Card className="mt-6" data-wizard-settings="{}">
      <CardHeader>
        <CardTitle>Opsætningsguide</CardTitle>
        <CardDescription>
          Velkommen til opsætningsguiden. Udfyld venligst nedenstående formular
          for at konfigurere plugin'et.
          <br />
          Brug 5-10 minutter og minimer tiden, du bruger på priser!
          <br />
          Prisberegner shortcode:{" "}
          <span className="font-mono bg-gray-100 px-1 rounded">
            wc-calculator
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Op til hvor mange etager tilbyder I vinduespudsning?
          </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={maxFloor}
            onChange={(e) => setMaxFloor(Number(e.target.value))}
          >
            {floorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Tilbyder du indvendig vinduespudsning?
          </label>
          <select
            className="w-full border rounded px-3 py-2 text-sm"
            value={interiorCleaning}
            onChange={(e) => setInteriorCleaning(e.target.value)}
          >
            <option value="yes">Ja</option>
            <option value="no">Nej</option>
          </select>
        </div>
        <div>
          <Button
            type="button"
            variant="outline"
            className="mt-2"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            Avancerede Indstillinger
          </Button>
        </div>
        {showAdvanced && (
          <div className="mt-4 border rounded bg-gray-50 p-4">
            <div className="mb-2 text-red-600 text-sm">
              Bemærk: Ændringer i disse indstillinger kan væsentligt ændre
              prissætningen.
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimumspris for vinduespudsning:
                </label>
                <Input
                  type="number"
                  min={1}
                  value={minPrice}
                  onChange={(e) => setMinPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prismultiplikator for indvendig vinduespudsning:
                </label>
                <Input
                  type="number"
                  min={1}
                  step={0.1}
                  value={interiorMultiplier}
                  onChange={(e) =>
                    setInteriorMultiplier(Number(e.target.value))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Minimumspris for indvendig vinduespudsning:
                </label>
                <Input
                  type="number"
                  min={1}
                  value={minInteriorPrice}
                  onChange={(e) => setMinInteriorPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prismultiplikator for forsatsvinduer:
                </label>
                <Input
                  type="number"
                  min={1}
                  step={0.1}
                  value={secondaryGlazingMultiplier}
                  onChange={(e) =>
                    setSecondaryGlazingMultiplier(Number(e.target.value))
                  }
                />
              </div>
              <div>
                <div className="block text-sm font-medium mb-1">
                  Prismultiplikator for etage(r)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {floorMultipliers.slice(0, maxFloor).map((mult, idx) => (
                    <div key={idx}>
                      <label className="text-xs">
                        {idx === 0 ? "Stueetagen" : `${idx}. sal`}:
                      </label>
                      <Input
                        type="number"
                        min={1}
                        step={0.1}
                        value={mult}
                        onChange={(e) =>
                          handleFloorMultiplierChange(
                            idx,
                            Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Prismultiplikator for engangsservice:
                </label>
                <Input
                  type="number"
                  min={1}
                  step={0.1}
                  value={oneTimeMultiplier}
                  onChange={(e) => setOneTimeMultiplier(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        )}
        <div className="flex justify-end mt-6">
          <Button type="button" className="w-full md:w-auto">
            Gem indstillinger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WindowCleaningSetupWizard;
