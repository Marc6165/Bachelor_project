import React, { useState } from "react";
import { quoteRequestService } from "../services/quote-request.service";
import { useToast } from "./ui/use-toast";

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
  image: "https://img.icons8.com/windows/96/000000/window.png",
}));

export default function WindowCleaningWizard() {
  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [doubleGlazed, setDoubleGlazed] = useState("");
  const [cleaningType, setCleaningType] = useState("");
  const [dirtiness, setDirtiness] = useState("");
  const [selectedWindows, setSelectedWindows] = useState<
    Record<string, number>
  >({});
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

  const calculatePrice = () => {
    let basePrice = 0;
    
    // Add price based on number of windows
    const totalWindows = Object.values(selectedWindows).reduce((sum, count) => sum + count, 0);
    basePrice += totalWindows * 50; // 50 DKK per window

    // Add price based on floor
    const floorMultiplier = selectedFloors.length > 0 ? Math.max(...selectedFloors) : 1;
    basePrice *= 1 + ((floorMultiplier - 1) * 0.2); // 20% increase per floor

    // Add price for storm windows
    if (doubleGlazed === "Ja") {
      basePrice *= 1.3; // 30% increase for storm windows
    }

    // Adjust price based on cleaning type
    if (cleaningType === "Indvendig") {
      basePrice *= 1.2; // 20% increase for interior cleaning
    } else if (cleaningType === "Begge") {
      basePrice *= 2; // Double price for both interior and exterior
    }

    // Apply discount for subscription plans
    if (plan === "subscription") {
      basePrice *= 0.8; // 20% discount for subscription
    }

    return Math.round(basePrice);
  };

  // --- Stepper ---
  function StepIndicator() {
    return (
      <div className="flex justify-center mb-6">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`flex flex-col items-center mx-4 px-4 py-2 rounded-lg ${
              i === step
                ? "bg-blue-500 text-white"
                : "bg-blue-200 text-blue-900"
            }`}
          >
            <span className="text-2xl">{s.icon}</span>
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
        <h2 className="text-xl font-semibold mb-4">
          Vælg dine vinduers etage(r)
        </h2>
        <div className="flex flex-col items-center">
          <svg width={180} height={240}>
            {[3, 2, 1, 0].map((floor) => (
              <g
                key={floor}
                onClick={() => {
                  setSelectedFloors((f) =>
                    f.includes(floor)
                      ? f.filter((x) => x !== floor)
                      : [...f, floor]
                  );
                }}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={40}
                  y={20 + floor * 50}
                  width={80}
                  height={45}
                  rx={8}
                  fill={selectedFloors.includes(floor) ? "#6A94FF" : "#F0F0F0"}
                  stroke="#36454F"
                  strokeWidth={2}
                />
                {/* Windows on each floor */}
                {[0, 1, 2].map((j) => (
                  <rect
                    key={j}
                    x={50 + j * 25}
                    y={30 + floor * 50}
                    width={18}
                    height={18}
                    rx={3}
                    fill={
                      selectedFloors.includes(floor) ? "#FFEECA" : "#BFDFFF"
                    }
                  />
                ))}
                <text
                  x={130}
                  y={48 + floor * 50}
                  fontSize={16}
                  fill={selectedFloors.includes(floor) ? "#6A94FF" : "#36454F"}
                  style={{
                    fontWeight: selectedFloors.includes(floor) ? 700 : 400,
                    cursor: "pointer",
                  }}
                >
                  {floor === 0 ? "Stue" : `${floor}. sal`}
                </text>
              </g>
            ))}
          </svg>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full"
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
        <h2 className="text-xl font-semibold mb-4">Fortæl os lidt mere...</h2>
        <select
          className="mb-4 px-4 py-2 rounded border"
          value={doubleGlazed}
          onChange={(e) => setDoubleGlazed(e.target.value)}
        >
          <option value="">Har du forsatsruder?*</option>
          <option value="Ja">Ja</option>
          <option value="Nej">Nej</option>
        </select>
        <div className="flex gap-8 mb-4">
          <div
            className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center ${
              cleaningType === "Udvendig" ? "bg-blue-100 border-blue-500" : ""
            }`}
            onClick={() => setCleaningType("Udvendig")}
          >
            <img
              src="https://img.icons8.com/color/96/000000/house.png"
              alt="Udvendig"
              className="mb-2"
            />
            <span>Udvendig</span>
          </div>
          <div
            className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center ${
              cleaningType === "Ud- og Indvendig"
                ? "bg-blue-100 border-blue-500"
                : ""
            }`}
            onClick={() => setCleaningType("Ud- og Indvendig")}
          >
            <img
              src="https://img.icons8.com/color/96/000000/living-room.png"
              alt="Ud- og Indvendig"
              className="mb-2"
            />
            <span>Ud- og Indvendig</span>
          </div>
        </div>
        {cleaningType && (
          <>
            <h3 className="mb-2">Hvor snavsede er dine vinduer?</h3>
            <div className="flex gap-8 mb-4">
              {["Normal", "Meget snavset", "Rygervinduer"].map((opt) => (
                <div
                  key={opt}
                  className={`p-4 rounded-lg border cursor-pointer flex flex-col items-center ${
                    dirtiness === opt ? "bg-blue-100 border-blue-500" : ""
                  }`}
                  onClick={() => setDirtiness(opt)}
                >
                  <img
                    src={
                      opt === "Normal"
                        ? "https://img.icons8.com/color/96/000000/window.png"
                        : opt === "Meget snavset"
                        ? "https://img.icons8.com/color/96/000000/dirty.png"
                        : "https://img.icons8.com/color/96/000000/smoking-room.png"
                    }
                    alt={opt}
                    className="mb-2"
                  />
                  <span>{opt}</span>
                </div>
              ))}
            </div>
          </>
        )}
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full"
          disabled={!doubleGlazed || !cleaningType || !dirtiness}
          onClick={() => setStep(2)}
        >
          Næste
        </button>
      </div>
    );
  }

  // --- Step 3: Windows ---
  function StepWindows() {
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">
          Tryk eller tast dine vinduer på{" "}
          {selectedFloors
            .map((f) => (f === 0 ? "Stue" : `${f}. sal`))
            .join(", ")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {windowTypes.map((type) => (
            <div
              key={type.id}
              className="flex flex-col items-center border rounded-lg p-2 bg-white"
            >
              <img
                src={type.image}
                alt={type.name}
                className="mb-1"
                style={{ width: 64, height: 64 }}
              />
              <span className="mb-1 text-xs">{type.name}</span>
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
        <div className="w-full bg-gray-100 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-2">Dine valgte vinduer</h3>
          <div className="flex gap-4">
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
                      className="mb-1"
                      style={{ width: 48, height: 48 }}
                    />
                    <span className="mb-1 text-xs">{type?.name}</span>
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
              <span className="text-3xl">+</span>
              <button
                className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => {}}
                type="button"
              >
                TILFØJ
              </button>
            </div>
          </div>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full"
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
    // Dummy price logic for now
    const oneTime = 1042;
    const subscription = interval === 4 ? 651 : 846;
    const discounted = interval === 4 ? 482 : 626;
    return (
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">
          Vælg Den Bedste Plan for Dig
        </h2>
        <div className="flex gap-8 mb-6">
          <div
            className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer ${
              plan === "one-time" ? "border-blue-500 bg-blue-50" : ""
            }`}
            onClick={() => setPlan("one-time")}
          >
            <h3 className="font-bold mb-2">Enkeltbestilling</h3>
            <div className="text-3xl text-red-600 font-bold mb-2">
              {oneTime} DKK
            </div>
            <div className="text-xs text-blue-700 mb-2">
              FRA 771 DKK MED SERVICEFRADRAG
            </div>
            <button className="mt-2 px-6 py-2 border border-blue-500 rounded-full text-blue-500">
              FÅ TILBUD
            </button>
          </div>
          <div
            className={`border rounded-lg p-6 flex flex-col items-center cursor-pointer ${
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
              <span>Hver {interval}. uge</span>
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
            <div className="text-3xl text-red-600 font-bold mb-2">
              {subscription} DKK
            </div>
            <div className="text-xs text-blue-700 mb-2">
              FRA {discounted} DKK MED SERVICEFRADRAG
            </div>
            <button className="mt-2 px-6 py-2 border border-blue-500 rounded-full text-blue-500">
              FÅ TILBUD
            </button>
          </div>
        </div>
        <button
          className="mt-6 px-8 py-2 bg-blue-500 text-white rounded-full"
          onClick={() => setStep(4)}
        >
          Næste
        </button>
      </div>
    );
  }

  // --- Step 5: Contact ---
  function StepContact() {
    const handleSubmitQuoteRequest = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
        const quoteRequest = {
          customerType: contact.type,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
          city: contact.city || '',
          zip: contact.zip || '',
          service: 'WINDOW_CLEANING',
          estimatedPrice: calculatePrice(),
          parameters: {
            floor: selectedFloors.join(','),
            cleaningType: cleaningType,
            stormWindows: doubleGlazed,
            windows: Object.entries(selectedWindows)
              .filter(([_, count]) => count > 0)
              .map(([id, count]) => ({ id, count }))
              .map(({ id, count }) => ({
                id: id.padStart(2, '0'),
                count,
              }))
              .join(','),
            servicePlan: plan,
            frequency: interval,
          },
          note: contact.note || '',
        };

        const response = await quoteRequestService.submitQuoteRequest(quoteRequest);
        console.log('Quote request submitted:', response);
        
        toast({
          title: "Anmodning sendt!",
          description: "Vi har modtaget din anmodning og vender tilbage hurtigst muligt.",
        });
        
        setSubmitted(true);
      } catch (error) {
        console.error('Error submitting quote request:', error);
        toast({
          variant: "destructive",
          title: "Fejl",
          description: "Der opstod en fejl ved afsendelse af din anmodning. Prøv venligst igen.",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-4">
          Du er kun ét skridt væk fra at få dit personlige tilbud!
        </h2>
        <form
          className="w-full max-w-md flex flex-col gap-3"
          onSubmit={handleSubmitQuoteRequest}
        >
          <select
            value={contact.type}
            onChange={(e) =>
              setContact((c) => ({ ...c, type: e.target.value }))
            }
            className="border rounded px-2 py-1"
          >
            <option>Privat person</option>
            <option>Virksomhed</option>
          </select>
          <input
            required
            placeholder="Navn*"
            value={contact.name}
            onChange={(e) =>
              setContact((c) => ({ ...c, name: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <input
            required
            placeholder="Telefonnummer*"
            value={contact.phone}
            onChange={(e) =>
              setContact((c) => ({ ...c, phone: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <input
            required
            type="email"
            placeholder="Email*"
            value={contact.email}
            onChange={(e) =>
              setContact((c) => ({ ...c, email: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <input
            required
            placeholder="Adresse*"
            value={contact.address}
            onChange={(e) =>
              setContact((c) => ({ ...c, address: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <input
            placeholder="By"
            value={contact.city || ''}
            onChange={(e) =>
              setContact((c) => ({ ...c, city: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <input
            placeholder="Postnummer"
            value={contact.zip || ''}
            onChange={(e) =>
              setContact((c) => ({ ...c, zip: e.target.value }))
            }
            className="border rounded px-2 py-1"
          />
          <textarea
            placeholder="Bemærkninger (valgfrit)"
            value={contact.note || ''}
            onChange={(e) =>
              setContact((c) => ({ ...c, note: e.target.value }))
            }
            className="border rounded px-2 py-1 h-24 resize-none"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Sender..." : "Kontakt mig"}
          </button>
        </form>
      </div>
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
    <div className="bg-gray-50 p-4 rounded-xl max-w-4xl mx-auto shadow">
      <StepIndicator />
      <div className="bg-white rounded-xl p-6 shadow">
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
    </div>
  );
}
