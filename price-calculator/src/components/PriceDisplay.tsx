import React from "react";

interface PriceDisplayProps {
  price: number;
  showServiceDeduction?: boolean;
}

export function PriceDisplay({ price, showServiceDeduction = true }: PriceDisplayProps) {
  const serviceDeductionPrice = Math.round(price * 0.74); // 26% service deduction

  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100 w-full max-w-md mx-auto mb-6">
      <div className="text-center">
        <div className="text-2xl font-bold text-blue-900 mb-2">
          {price} DKK
        </div>
        {showServiceDeduction && (
          <div className="text-sm text-blue-600">
            {serviceDeductionPrice} DKK med servicefradrag
          </div>
        )}
      </div>
    </div>
  );
} 