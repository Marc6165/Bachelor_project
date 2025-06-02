import React, { useState, useCallback } from "react";
import { quoteRequestService } from "../services/quote-request.service";
import { useToast } from "./ui/use-toast";
import { ContactForm } from "./ContactForm";
import { PriceDisplay } from "./PriceDisplay";
import { MultiplierDisplay } from "./MultiplierDisplay";

interface WindowCleaningWizardProps {
  hourlyWage: number;
  settings: Record<string, unknown>;
  onQuoteGenerated?: (quoteId: string) => void;
  onInvoiceCreated?: (invoiceId: string) => void;
}

const steps = [
  { label: "Etager", icon: "🏢" },
  { label: "Type", icon: "🧼" },
  { label: "Vinduer", icon: "🪟" },
  { label: "Pris", icon: "💰" },
  { label: "Kontakt", icon: "📒" },
];

const windowTypes = Array.from({ length: 18 }, (_, i) => ({
  id: `${i + 1}`,
  name: `VINDUE ${i + 1}`,
  image: `https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/Vindue_${i + 1}.webp`,
}));

export default function WindowCleaningWizard({ hourlyWage, settings, onQuoteGenerated, onInvoiceCreated }: WindowCleaningWizardProps) {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [doubleGlazed, setDoubleGlazed] = useState("");
  const [cleaningType, setCleaningType] = useState("");
  const [dirtiness, setDirtiness] = useState("");
  const [selectedWindows, setSelectedWindows] = useState<Record<string, number>>({});
  const [plan, setPlan] = useState<"one-time" | "subscription">("subscription");
  const [interval, setInterval] = useState<4 | 8 | 12>(4);
  const [contact, setContact] = useState({
    type: "Privat person",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    note: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSubscriptionDiscount = (frequency: number) => {
    switch (frequency) {
      case 4:  // Every 4 weeks (most frequent)
        return 0.75; // 25% discount
      case 8:  // Every 8 weeks
        return 0.80; // 20% discount
      case 12: // Every 12 weeks (least frequent)
        return 0.85; // 15% discount
      default:
        return 0.80;
    }
  };

  const calculatePrice = (ignoreSubscription = false) => {
    // Don't calculate if no windows are selected
    const totalWindows = Object.values(selectedWindows).reduce((sum, count) => sum + count, 0);
    if (totalWindows === 0) {
      return 0;
    }

    let basePrice = 0;
    
    // Add price based on number of windows
    basePrice += totalWindows * 50; // Base price of 50 DKK per window

    // Add price based on floor levels (20% increase per floor)
    if (selectedFloors.length > 0) {
      const maxFloor = Math.max(...selectedFloors);
      basePrice *= 1 + ((maxFloor) * 0.2); // 20% increase per floor level
    }

    // Add price for storm windows (forsatsruder)
    if (doubleGlazed === "Ja") {
      basePrice *= 1.3; // 30% increase for storm windows
    }

    // Adjust price based on cleaning type
    if (cleaningType === "Ud- og Indvendig") {
      basePrice *= 2; // Double price for both interior and exterior
    }

    // Adjust price based on dirtiness level
    if (dirtiness === "Meget snavset") {
      basePrice *= 1.25; // 25% increase for very dirty windows
    } else if (dirtiness === "Rygervinduer") {
      basePrice *= 1.4; // 40% increase for smoker's windows
    }

    // Apply subscription discount if applicable and not ignored
    if (!ignoreSubscription && plan === "subscription") {
      basePrice *= getSubscriptionDiscount(interval);
    }

    // Round to nearest whole number
    return Math.round(basePrice);
  };

  // --- Step Indicator ---
  function StepIndicator() {
    return (
      <div className="flex justify-start sm:justify-center mb-6 overflow-x-auto px-2 -mx-2 sm:px-0 sm:mx-0">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center mx-2 px-3 sm:px-4 py-2 rounded-lg whitespace-nowrap ${
              i === step
                ? "bg-blue-500 text-white"
                : "bg-blue-200 text-blue-900"
            }`}
          >
            <span className="text-xl sm:text-2xl">{s.icon}</span>
            <span className="text-xs">{s.label}</span>
          </div>
        ))}
      </div>
    );
  }

  // --- Step 1: Floors ---
  function StepFloors() {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center px-2">
          Vælg dine vinduers etage(r)
        </h2>
        {selectedFloors.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 px-2">
            {selectedFloors.map((floor) => (
              <MultiplierDisplay
                key={floor}
                label={floor === 0 ? "Stue" : `${floor}. sal`}
                multiplier={1 + (floor * 0.2)}
                isActive={true}
              />
            ))}
          </div>
        )}
        <div className="flex flex-col items-center scale-90 sm:scale-100">
          <svg width="100%" height="250" viewBox="0 0 240 260">
            <g transform="translate(45, 25)">
              <rect x="10" y="5" width="130" height="5" fill="#7FFFD4" stroke="#333" strokeWidth="2" rx="5" ry="5" />
              <rect x="5" y="-15" width="140" height="20" fill="#778899" stroke="#333" strokeWidth="2" rx="5" ry="5" />
              <rect x="10" y="10" width="130" height="210" fill="#FFFFFF" stroke="#333" strokeWidth="2" rx="5" ry="5" />
              <rect x="3" y="224" width="143" height="5" fill="#F5F5DC" stroke="#333" strokeWidth="2" rx="5" ry="5" />
              {[3, 2, 1, 0].map((floor) => (
                <g
                  key={floor}
                  id={`floorGroup${floor}`}
                  className="clickable-floor"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedFloors((f) =>
                      f.includes(floor)
                        ? f.filter((x) => x !== floor)
                        : [...f, floor]
                    );
                  }}
                >
                  <rect
                    x="15"
                    y={20 + (3 - floor) * 50}
                    width="120"
                    height="40"
                    fill={selectedFloors.includes(floor) ? "#6A94FF" : "#F0F0F0"}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                  />
                  <rect
                    x="25"
                    y={30 + (3 - floor) * 50}
                    width="20"
                    height="20"
                    fill={selectedFloors.includes(floor) ? "#FFEECA" : "#BFDFFF"}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                  />
                  <rect
                    x="65"
                    y={30 + (3 - floor) * 50}
                    width="20"
                    height="20"
                    fill={selectedFloors.includes(floor) ? "#FFEECA" : "#BFDFFF"}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                  />
                  <rect
                    x="105"
                    y={30 + (3 - floor) * 50}
                    width="20"
                    height="20"
                    fill={selectedFloors.includes(floor) ? "#FFEECA" : "#BFDFFF"}
                    stroke="#333"
                    strokeWidth="2"
                    rx="5"
                    ry="5"
                  />
                </g>
              ))}
            </g>
            {[3, 2, 1, 0].map((floor) => (
              <text
                key={floor}
                x="200"
                y={70 + (3 - floor) * 50}
                fill={selectedFloors.includes(floor) ? "#6A94FF" : "#36454F"}
                fontSize="1.1rem"
                fontWeight={selectedFloors.includes(floor) ? "bold" : "normal"}
                alignmentBaseline="middle"
                style={{ cursor: "pointer" }}
              >
                {floor === 0 ? "Stue" : `${floor}. sal`}
              </text>
            ))}
          </svg>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full w-full sm:w-auto"
          disabled={selectedFloors.length === 0}
          onClick={() => setStep(1)}
        >
          Næste
        </button>
      </div>
    );
  }

  // --- Step 2: Type ---
  function StepType() {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center px-2">
          Fortæl os lidt mere...
        </h2>
        <div className="flex flex-col items-center gap-6 w-full px-2">
          {doubleGlazed === "Ja" && (
            <div className="flex flex-wrap justify-center gap-2">
              <MultiplierDisplay
                label="Forsatsruder"
                multiplier={1.3}
                isActive={true}
              />
            </div>
          )}

          {cleaningType && (
            <div className="flex flex-col items-center gap-2 w-full">
              <h3 className="font-semibold">Rengøringstype</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {cleaningType === "Udvendig" && (
                  <MultiplierDisplay
                    label="Udvendig"
                    multiplier={1.0}
                    isActive={true}
                  />
                )}
                {cleaningType === "Ud- og Indvendig" && (
                  <MultiplierDisplay
                    label="Ud- og indvendig"
                    multiplier={2.0}
                    isActive={true}
                  />
                )}
              </div>
            </div>
          )}

          {dirtiness && (
            <div className="flex flex-col items-center gap-2 w-full">
              <h3 className="font-semibold">Tilsmudsningsgrad</h3>
              <div className="flex flex-wrap justify-center gap-2">
                {dirtiness === "Normal" && (
                  <MultiplierDisplay
                    label="Normal"
                    multiplier={1.0}
                    isActive={true}
                  />
                )}
                {dirtiness === "Meget snavset" && (
                  <MultiplierDisplay
                    label="Meget snavset"
                    multiplier={1.25}
                    isActive={true}
                  />
                )}
                {dirtiness === "Rygervinduer" && (
                  <MultiplierDisplay
                    label="Rygervinduer"
                    multiplier={1.4}
                    isActive={true}
                  />
                )}
              </div>
            </div>
          )}

          <select
            className="w-full sm:w-auto mt-6 mb-4 px-4 py-2 rounded border"
            value={doubleGlazed}
            onChange={(e) => setDoubleGlazed(e.target.value)}
          >
            <option value="">Har du forsatsruder?*</option>
            <option value="Ja">Ja</option>
            <option value="Nej">Nej</option>
          </select>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4 w-full sm:w-auto">
            <div
              className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center flex-1 ${
                cleaningType === "Udvendig" ? "bg-blue-100 border-blue-500" : ""
              }`}
              onClick={() => setCleaningType("Udvendig")}
            >
              <img
                src="https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/Udenfor.webp"
                alt="Udvendig"
                className="mb-2 w-24 h-24 object-contain"
              />
              <span>Udvendig</span>
            </div>
            <div
              className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center flex-1 ${
                cleaningType === "Ud- og Indvendig"
                  ? "bg-blue-100 border-blue-500"
                  : ""
              }`}
              onClick={() => setCleaningType("Ud- og Indvendig")}
            >
              <img
                src="https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/Indenfor.webp"
                alt="Ud- og Indvendig"
                className="mb-2 w-24 h-24 object-contain"
              />
              <span>Ud- og Indvendig</span>
            </div>
          </div>

          {cleaningType && (
            <>
              <h3 className="mb-2 text-center">Hvor snavsede er dine vinduer?</h3>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-4 w-full sm:w-auto">
                {["Normal", "Meget snavset", "Rygervinduer"].map((opt) => (
                  <div
                    key={opt}
                    className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center flex-1 ${
                      dirtiness === opt ? "bg-blue-100 border-blue-500" : ""
                    }`}
                    onClick={() => setDirtiness(opt)}
                  >
                    <img
                      src={
                        opt === "Normal"
                          ? "https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/vinduer_normal.webp"
                          : opt === "Meget snavset"
                          ? "https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/vinduer_beskidte.webp"
                          : "https://prisforvinduespudsning.dk/wp-content/plugins/window-cleaning-price-calculator-premium/assets/images/vinduer_ryge.webp"
                      }
                      alt={opt}
                      className="mb-2 w-20 h-20 object-contain"
                    />
                    <span>{opt}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <button
            className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full w-full sm:w-auto"
            disabled={!doubleGlazed || !cleaningType || !dirtiness}
            onClick={() => setStep(2)}
          >
            Næste
          </button>
        </div>
      </div>
    );
  }

  // --- Step 3: Windows ---
  function StepWindows() {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center px-2">
          Tryk eller tast dine vinduer på{" "}
          {selectedFloors
            .map((f) => (f === 0 ? "Stue" : `${f}. sal`))
            .join(", ")}
        </h2>
        <PriceDisplay price={calculatePrice()} />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 mb-6 w-full px-2">
          {windowTypes.map((type) => (
            <div
              key={type.id}
              className="flex flex-col items-center border rounded-lg p-2 bg-white"
            >
              <img
                src={type.image}
                alt={type.name}
                className="mb-1 w-12 h-12 sm:w-16 sm:h-16 object-contain"
              />
              <span className="mb-1 text-xs text-center">{type.name}</span>
              <div className="flex items-center gap-1">
                <button
                  className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  onClick={() =>
                    setSelectedWindows((w) => ({
                      ...w,
                      [type.id]: (w[type.id] || 0) + 1,
                    }))
                  }
                  type="button"
                >
                  +
                </button>
                <input
                  type="number"
                  min={0}
                  value={selectedWindows[type.id] || ""}
                  onChange={(e) => {
                    const val = Math.max(0, Number(e.target.value));
                    setSelectedWindows((w) => ({ ...w, [type.id]: val }));
                  }}
                  className="w-12 px-1 py-0.5 border rounded text-xs"
                  placeholder="Antal"
                />
              </div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 rounded-lg p-2 sm:p-4 mb-4">
          <h3 className="font-semibold mb-2">Dine valgte vinduer</h3>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {Object.entries(selectedWindows)
              .filter(([_, count]) => count > 0)
              .map(([id, count]) => {
                const type = windowTypes.find((t) => t.id === id);
                return (
                  <div
                    key={id}
                    className="flex flex-col items-center border rounded-lg p-2 bg-white"
                  >
                    <img
                      src={type?.image}
                      alt={type?.name}
                      className="mb-1 w-10 h-10 sm:w-12 sm:h-12 object-contain"
                    />
                    <span className="mb-1 text-xs text-center">{type?.name}</span>
                    <input
                      type="number"
                      min={0}
                      value={count}
                      onChange={(e) => {
                        const val = Math.max(0, Number(e.target.value));
                        setSelectedWindows((w) => ({ ...w, [id]: val }));
                      }}
                      className="w-12 px-1 py-0.5 border rounded text-xs"
                    />
                  </div>
                );
              })}
            <div className="flex flex-col items-center border rounded-lg p-2 bg-gray-200 justify-center">
              <span className="text-2xl sm:text-3xl">+</span>
              <button
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded text-sm"
                onClick={() => {}}
                type="button"
              >
                TILFØJ
              </button>
            </div>
          </div>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full w-full sm:w-auto"
          disabled={Object.values(selectedWindows).every((v) => !v)}
          onClick={() => setStep(3)}
        >
          Næste
        </button>
      </div>
    );
  }

  // --- Step 4: Price ---
  function StepPrice() {
    const basePrice = calculatePrice(true);
    const subscriptionPrice = Math.round(basePrice * getSubscriptionDiscount(interval));
    
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center px-2">
          Vælg Den Bedste Plan for Dig
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 mb-6 w-full px-2">
          <div
            className={`border rounded-lg p-4 sm:p-6 flex flex-col items-center cursor-pointer flex-1 ${
              plan === "one-time" ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setPlan("one-time")}
          >
            <h3 className="font-bold mb-2">Enkeltbestilling</h3>
            <div className="text-2xl sm:text-3xl text-red-600 font-bold mb-2">
              {basePrice} DKK
            </div>
            <div className="text-xs text-blue-700 mb-2 text-center">
              FRA {Math.round(basePrice * 0.74)} DKK MED SERVICEFRADRAG
            </div>
            <button className="mt-2 px-6 py-2 border border-blue-500 rounded-full text-blue-500 w-full sm:w-auto">
              FÅ TILBUD
            </button>
          </div>
          <div
            className={`border rounded-lg p-4 sm:p-6 flex flex-col items-center cursor-pointer flex-1 ${
              plan === "subscription" ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setPlan("subscription")}
          >
            <div className="text-xs text-blue-700 mb-1">MEST POPULÆR</div>
            <h3 className="font-bold mb-2">Abonnement</h3>
            <div className="flex items-center gap-2 mb-2">
              <button
                className="px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setInterval((i) => (i === 4 ? 12 : i === 8 ? 4 : 8));
                }}
              >
                ◀
              </button>
              <span className="whitespace-nowrap">Hver {interval}. uge</span>
              <button
                className="px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setInterval((i) => (i === 12 ? 4 : i === 4 ? 8 : 12));
                }}
              >
                ▶
              </button>
            </div>
            <div className="text-2xl sm:text-3xl text-red-600 font-bold mb-2">
              {subscriptionPrice} DKK
            </div>
            <div className="text-xs text-blue-700 mb-2 text-center">
              FRA {Math.round(subscriptionPrice * 0.74)} DKK MED SERVICEFRADRAG
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {interval === 4 ? "25% rabat" : interval === 8 ? "20% rabat" : "15% rabat"}
            </div>
            <button className="mt-2 px-6 py-2 border border-blue-500 rounded-full text-blue-500 w-full sm:w-auto">
              FÅ TILBUD
            </button>
          </div>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full w-full sm:w-auto"
          onClick={() => setStep(4)}
        >
          Næste
        </button>
      </div>
    );
  }

  // --- Step 5: Contact ---
  function StepContact() {
    return (
      <>
        <PriceDisplay price={calculatePrice()} />
        <ContactForm
          onSubmitSuccess={() => setSubmitted(true)}
          calculatePrice={calculatePrice}
          formData={{
            selectedFloors,
            cleaningType,
            doubleGlazed,
            selectedWindows,
            plan,
            interval,
          }}
        />
      </>
    );
  }

  function StepSuccess() {
    return (
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Tak for din tid!</h1>
        <p className="mb-4">
          Vi kontakter dig snarest muligt, så vi kan få detajlerne på plads. God
          dag.
        </p>
        <button
          className="px-8 py-2 bg-blue-500 text-white rounded-full"
          onClick={() => {
            setStep(0);
            setSubmitted(false);
            setSelectedFloors([]);
            setDoubleGlazed("");
            setCleaningType("");
            setDirtiness("");
            setSelectedWindows({});
            setPlan("subscription");
            setInterval(4);
            setContact({
              type: "Privat person",
              name: "",
              phone: "",
              email: "",
              address: "",
              city: "",
              zip: "",
              note: "",
            });
          }}
        >
          Start forfra
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl max-w-4xl mx-auto shadow border border-gray-200">
      <StepIndicator />
      {submitted ? (
        <StepSuccess />
      ) : step === 0 ? (
        <StepFloors />
      ) : step === 1 ? (
        <StepType />
      ) : step === 2 ? (
        <StepWindows />
      ) : step === 3 ? (
        <StepPrice />
      ) : (
        <StepContact />
      )}
    </div>
  );
}
