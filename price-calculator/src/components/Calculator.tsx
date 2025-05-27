import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useToast } from "./ui/use-toast";
import { pricingService } from "../services/pricing.service";
import { invoiceService } from "../services/invoice.service";
import type {
  CalculateQuoteRequest,
  QuoteResponse,
} from "../services/pricing.service";
import type { CustomerDetails } from "../services/invoice.service";

interface CalculatorProps {
  serviceType: string;
  title: string;
  description?: string;
  parameters: {
    name: string;
    type: "number" | "text" | "select";
    label: string;
    options?: string[];
    required?: boolean;
  }[];
  onQuoteGenerated?: (quoteId: string) => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

export function Calculator({
  serviceType,
  title,
  description,
  parameters,
  onQuoteGenerated,
  onInvoiceCreated,
}: CalculatorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const handleParameterChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCustomerDetailsChange = (
    field:
      | keyof CustomerDetails
      | `address.${keyof CustomerDetails["address"]}`,
    value: string
  ) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(
        "."
      )[1] as keyof CustomerDetails["address"];
      setCustomerDetails((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
    } else {
      setCustomerDetails((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const request: CalculateQuoteRequest = {
        serviceType,
        parameters: formData,
      };

      const response = await pricingService.calculateQuote(request);
      setQuote(response);
      onQuoteGenerated?.(response.quoteId);
      setShowCustomerForm(true);

      toast({
        title: "Quote Generated",
        description: "Your quote has been generated successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to generate quote",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async () => {
    if (!quote) return;

    setIsLoading(true);
    try {
      const invoice = await invoiceService.createInvoice({
        quoteId: quote.quoteId,
        customerDetails,
      });

      onInvoiceCreated?.(invoice.id);
      toast({
        title: "Invoice Created",
        description: "Your invoice has been created successfully!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create invoice",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {parameters.map((param) => (
            <div key={param.name} className="space-y-2">
              <label className="text-sm font-medium">{param.label}</label>
              {param.type === "select" ? (
                <select
                  className="w-full p-2 border rounded-md"
                  value={formData[param.name] || ""}
                  onChange={(e) =>
                    handleParameterChange(param.name, e.target.value)
                  }
                  required={param.required}
                >
                  <option value="">Select {param.label}</option>
                  {param.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={param.type}
                  className="w-full p-2 border rounded-md"
                  value={formData[param.name] || ""}
                  onChange={(e) =>
                    handleParameterChange(param.name, e.target.value)
                  }
                  required={param.required}
                />
              )}
            </div>
          ))}

          {quote && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium">Quote Summary</h3>
              <p className="text-lg font-bold">
                Total: {quote.priceDetails.currency} {quote.priceDetails.total}
              </p>
              <div className="mt-2">
                <h4 className="font-medium">Breakdown:</h4>
                {Object.entries(quote.priceDetails.breakdown).map(
                  ([key, value]) => (
                    <p key={key} className="text-sm">
                      {key}: {quote.priceDetails.currency} {value}
                    </p>
                  )
                )}
              </div>
            </div>
          )}

          {showCustomerForm && (
            <div className="mt-4 space-y-4">
              <h3 className="font-medium">Customer Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.name}
                    onChange={(e) =>
                      handleCustomerDetailsChange("name", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.email}
                    onChange={(e) =>
                      handleCustomerDetailsChange("email", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.address.street}
                    onChange={(e) =>
                      handleCustomerDetailsChange(
                        "address.street",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.address.city}
                    onChange={(e) =>
                      handleCustomerDetailsChange(
                        "address.city",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">State</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.address.state}
                    onChange={(e) =>
                      handleCustomerDetailsChange(
                        "address.state",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">ZIP Code</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.address.zipCode}
                    onChange={(e) =>
                      handleCustomerDetailsChange(
                        "address.zipCode",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.address.country}
                    onChange={(e) =>
                      handleCustomerDetailsChange(
                        "address.country",
                        e.target.value
                      )
                    }
                    required
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!showCustomerForm ? (
          <Button onClick={handleCalculate} disabled={isLoading}>
            {isLoading ? "Calculating..." : "Calculate Quote"}
          </Button>
        ) : (
          <Button onClick={handleCreateInvoice} disabled={isLoading}>
            {isLoading ? "Creating Invoice..." : "Create Invoice"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
