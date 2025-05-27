import { Calculator } from "./Calculator";

export function WebsiteCalculator() {
  return (
    <Calculator
      serviceType="website"
      title="Website Development Calculator"
      description="Calculate the cost of your website development project"
      parameters={[
        {
          name: "type",
          type: "select",
          label: "Website Type",
          options: [
            "Landing Page",
            "Business Website",
            "E-commerce",
            "Web Application",
          ],
          required: true,
        },
        {
          name: "pages",
          type: "number",
          label: "Number of Pages",
          required: true,
        },
        {
          name: "features",
          type: "select",
          label: "Additional Features",
          options: [
            "Contact Form",
            "Blog",
            "Newsletter",
            "Social Media Integration",
            "Payment Gateway",
            "User Authentication",
            "Admin Dashboard",
          ],
          required: true,
        },
        {
          name: "design",
          type: "select",
          label: "Design Complexity",
          options: ["Basic", "Standard", "Premium", "Custom"],
          required: true,
        },
        {
          name: "timeline",
          type: "select",
          label: "Project Timeline",
          options: ["Standard (4-6 weeks)", "Express (2-3 weeks)", "Custom"],
          required: true,
        },
      ]}
      onQuoteGenerated={(quoteId) => {
        console.log("Quote generated:", quoteId);
      }}
      onInvoiceCreated={(invoiceId) => {
        console.log("Invoice created:", invoiceId);
      }}
    />
  );
}
