import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { useToast } from "./ui/use-toast";
import { quoteRequestService } from "../services/quote-request.service";
import type { QuoteRequest } from "../services/quote-request.service";

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
  calculatePrice?: (parameters: Record<string, string | number>) => {
    total: number;
    currency: string;
    breakdown: Record<string, number>;
  };
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

export function Calculator({
  serviceType,
  title,
  description,
  parameters,
  onQuoteGenerated,
  calculatePrice,
}: CalculatorProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<{
    total: number;
    currency: string;
    breakdown: Record<string, number>;
  } | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const handleParameterChange = (name: string, value: string) => {
    const newFormData = {
      ...formData,
      [name]: value,
    };
    setFormData(newFormData);

    // Update current price if all required parameters are filled
    if (calculatePrice && isServiceFormValid(newFormData)) {
      const price = calculatePrice(newFormData);
      setCurrentPrice(price);
    }
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

  const isServiceFormValid = (data: Record<string, string> = formData) => {
    return parameters
      .filter((param) => param.required)
      .every((param) => data[param.name]?.trim() !== "");
  };

  const isCustomerDetailsValid = () => {
    return (
      customerDetails.name.trim() !== "" &&
      customerDetails.email.trim() !== "" &&
      customerDetails.phone.trim() !== "" &&
      customerDetails.address.street.trim() !== "" &&
      customerDetails.address.city.trim() !== "" &&
      customerDetails.address.state.trim() !== "" &&
      customerDetails.address.zipCode.trim() !== "" &&
      customerDetails.address.country.trim() !== ""
    );
  };

  const handleShowCustomerForm = () => {
    if (!isServiceFormValid()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required service details first.",
      });
      return;
    }
    setShowCustomerForm(true);
  };

  const handleBack = () => {
    setShowCustomerForm(false);
  };

  const handleSubmitQuoteRequest = async () => {
    if (!isCustomerDetailsValid()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all customer details to submit your request.",
      });
      return;
    }

    if (!currentPrice) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please complete the service details first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const quoteRequest = await quoteRequestService.submitQuoteRequest({
        customerType: "individual",
        name: customerDetails.name,
        email: customerDetails.email,
        phone: customerDetails.phone,
        address: customerDetails.address.street,
        city: customerDetails.address.city,
        zip: customerDetails.address.zipCode,
        service: serviceType,
        estimatedPrice: currentPrice.total,
        parameters: formData,
      });

      onQuoteGenerated?.(quoteRequest.id || "");

      toast({
        title: "Request Submitted",
        description: "Your quote request has been submitted successfully! We'll review it and get back to you soon.",
      });

      // Reset the form
      setFormData({});
      setCurrentPrice(null);
      setShowCustomerForm(false);
      setCustomerDetails({
        name: "",
        email: "",
        phone: "",
        address: {
          street: "",
          city: "",
          state: "",
          zipCode: "",
          country: "",
        },
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit quote request",
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
        <div className="space-y-8">
          {!showCustomerForm ? (
            /* Service Parameters Section */
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Service Details</h3>
              {parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <label className="text-sm font-medium">
                    {param.label} {param.required && "*"}
                  </label>
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

              {/* Current Price */}
              {currentPrice && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Estimated Price</h4>
                  <p className="text-lg font-bold">
                    Total: {currentPrice.currency} {currentPrice.total}
                  </p>
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Breakdown:</h5>
                    {Object.entries(currentPrice.breakdown).map(([key, value]) => (
                      <p key={key} className="text-sm">
                        {key}: {currentPrice.currency} {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Customer Details Section */
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleBack}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  ← Back to Service Details
                </button>
                <h3 className="font-medium text-lg">Customer Details</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
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
                  <label className="text-sm font-medium">Email *</label>
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
                  <label className="text-sm font-medium">Phone *</label>
                  <input
                    type="tel"
                    className="w-full p-2 border rounded-md"
                    value={customerDetails.phone}
                    onChange={(e) =>
                      handleCustomerDetailsChange("phone", e.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Street Address *</label>
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
                  <label className="text-sm font-medium">City *</label>
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
                  <label className="text-sm font-medium">State *</label>
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
                  <label className="text-sm font-medium">ZIP Code *</label>
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
                  <label className="text-sm font-medium">Country *</label>
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

              {/* Show current price in customer details step too */}
              {currentPrice && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md">
                  <h4 className="font-medium mb-2">Estimated Price</h4>
                  <p className="text-lg font-bold">
                    Total: {currentPrice.currency} {currentPrice.total}
                  </p>
                  <div className="mt-2">
                    <h5 className="font-medium text-sm">Breakdown:</h5>
                    {Object.entries(currentPrice.breakdown).map(([key, value]) => (
                      <p key={key} className="text-sm">
                        {key}: {currentPrice.currency} {value}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!showCustomerForm && (
          <Button 
            onClick={handleShowCustomerForm} 
            disabled={!isServiceFormValid()}
          >
            Next: Enter Customer Details
          </Button>
        )}
        {showCustomerForm && (
          <Button 
            onClick={handleSubmitQuoteRequest} 
            disabled={isLoading || !isCustomerDetailsValid()}
          >
            {isLoading ? "Submitting..." : "Submit Quote Request"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
