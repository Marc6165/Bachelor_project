import React, { useState } from "react";
import { quoteRequestService } from "../services/quote-request.service";
import { useToast } from "./ui/use-toast";

interface ContactFormProps {
  onSubmitSuccess: () => void;
  calculatePrice: () => number;
  formData: {
    selectedFloors: number[];
    cleaningType: string;
    doubleGlazed: string;
    selectedWindows: Record<string, number>;
    plan: "one-time" | "subscription";
    interval: 4 | 8 | 12;
  };
}

export function ContactForm({ onSubmitSuccess, calculatePrice, formData }: ContactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState({
    type: "Privat person",
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const quoteRequest = {
        customerType: formState.type,
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        address: formState.address,
        city: formState.city || '',
        zip: formState.zip || '',
        service: 'WINDOW_CLEANING',
        estimatedPrice: calculatePrice(),
        parameters: {
          floor: formData.selectedFloors.join(','),
          cleaningType: formData.cleaningType,
          stormWindows: formData.doubleGlazed,
          windows: Object.entries(formData.selectedWindows)
            .filter(([_, count]) => count > 0)
            .map(([id, count]) => ({ id, count }))
            .map(({ id, count }) => ({
              id: id.padStart(2, '0'),
              count,
            }))
            .join(','),
          servicePlan: formData.plan,
          frequency: formData.interval,
        },
        note: formState.note || '',
      };

      const response = await quoteRequestService.submitQuoteRequest(quoteRequest);
      console.log('Quote request submitted:', response);
      
      toast({
        title: "Anmodning sendt!",
        description: "Vi har modtaget din anmodning og vender tilbage hurtigst muligt.",
      });
      
      onSubmitSuccess();
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-semibold mb-4">
        Du er kun ét skridt væk fra at få dit personlige tilbud!
      </h2>
      <form className="w-full max-w-md flex flex-col gap-3" onSubmit={handleSubmit}>
        <select
          name="type"
          value={formState.type}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        >
          <option>Privat person</option>
          <option>Virksomhed</option>
        </select>
        <input
          required
          name="name"
          placeholder="Navn*"
          value={formState.name}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <input
          required
          name="phone"
          placeholder="Telefonnummer*"
          value={formState.phone}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <input
          required
          name="email"
          type="email"
          placeholder="Email*"
          value={formState.email}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <input
          required
          name="address"
          placeholder="Adresse*"
          value={formState.address}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <input
          name="city"
          placeholder="By"
          value={formState.city}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <input
          name="zip"
          placeholder="Postnummer"
          value={formState.zip}
          onChange={handleChange}
          className="border rounded px-2 py-1"
        />
        <textarea
          name="note"
          placeholder="Bemærkninger (valgfrit)"
          value={formState.note}
          onChange={handleChange}
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