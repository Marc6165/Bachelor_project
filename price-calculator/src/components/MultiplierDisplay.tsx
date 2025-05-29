import React from "react";

interface MultiplierDisplayProps {
  label: string;
  multiplier: number;
  isActive?: boolean;
}

export function MultiplierDisplay({ label, multiplier, isActive = false }: MultiplierDisplayProps) {
  const percentage = Math.round((multiplier - 1) * 100);
  const displayText = percentage > 0 ? `+${percentage}%` : `${percentage}%`;

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm
      ${isActive 
        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
        : 'bg-gray-100 text-gray-500 border border-gray-200'
      }
    `}>
      <span>{label}</span>
      {isActive && (
        <>
          <span className="text-gray-400">•</span>
          <span className="font-semibold">{displayText}</span>
        </>
      )}
    </div>
  );
} 