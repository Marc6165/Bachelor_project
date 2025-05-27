import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { getCalculator } from "../features/calculator";
import type { CalculatorConfig } from "../features/calculator";
import { toast } from "sonner";

const EmbedCalculatorPage = () => {
  const { id } = useParams<{ id: string }>();
  const [calculator, setCalculator] = useState<CalculatorConfig | null>(null);
  const [embedCode, setEmbedCode] = useState("");

  useEffect(() => {
    if (id) {
      const calc = getCalculator(id);
      if (calc) {
        setCalculator(calc);
        const code = `<iframe 
  src="${window.location.origin}/calculator/${id}" 
  width="100%" 
  height="600" 
  frameborder="0"
  style="border: 1px solid #e5e7eb; border-radius: 0.5rem;"
></iframe>`;
        setEmbedCode(code);
      } else {
        toast.error("Calculator not found");
      }
    }
  }, [id]);

  if (!calculator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-gray-500">Loading...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Embed Your Calculator</CardTitle>
            <CardDescription>
              Copy and paste the code below into your website to embed your
              calculator.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 rounded p-4 font-mono text-xs text-gray-700">
              <pre className="whitespace-pre-wrap">{embedCode}</pre>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p className="mb-2">
                <strong>Preview:</strong>
              </p>
              <div
                className="border rounded-lg overflow-hidden"
                style={{ height: "600px" }}
              >
                <iframe
                  src={`/calculator/${id}`}
                  width="100%"
                  height="100%"
                  style={{ border: "none" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmbedCalculatorPage;
