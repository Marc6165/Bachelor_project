import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const initialPendingQuotes = [
  {
    id: 1,
    status: "Pending",
    email: "ken99@example.com",
    amount: 316,
    service: "Window Cleaning",
    address: "Kongensgade 36B, 1",
    city: "Odense C, 5000",
    customerType: "Private",
    name: "Marcus",
    zip: "5000",
    phone: "12341234",
    note: "-",
    floor: "Ground floor",
    cleaningType: "Exterior",
    stormWindows: "No",
    windows: "5 pcs.",
    servicePlan: "Subscription",
    frequency: "Every 4 weeks",
    estimatedPrice: 99,
  },
  {
    id: 2,
    status: "Pending",
    email: "abe45@example.com",
    amount: 242,
    service: "Window Cleaning",
    address: "Præstevænget 58",
    city: "Nyborg, 5800",
    customerType: "Private",
    name: "Anna",
    zip: "5800",
    phone: "23452345",
    note: "-",
    floor: "First floor",
    cleaningType: "Interior",
    stormWindows: "Yes",
    windows: "8 pcs.",
    servicePlan: "One-time",
    frequency: "-",
    estimatedPrice: 242,
  },
  {
    id: 3,
    status: "Pending",
    email: "larsen@example.com",
    amount: 410,
    service: "Facade Cleaning",
    address: "Bredgade 12",
    city: "Aalborg, 9000",
  },
  {
    id: 4,
    status: "Pending",
    email: "sara.jensen@example.com",
    amount: 199,
    service: "Window Cleaning",
    address: "Parkvej 7",
    city: "Esbjerg, 6700",
  },
  {
    id: 5,
    status: "Pending",
    email: "mads@example.com",
    amount: 555,
    service: "Facade Cleaning",
    address: "Hovedgaden 1",
    city: "Randers, 8900",
  },
];

const initialQuoteHistory = [
  {
    id: 6,
    status: "Accepted",
    email: "abe45@example.com",
    amount: 493,
    service: "Window Cleaning",
    address: "Strandvejen 52",
    city: "Nyborg, 5000",
  },
  {
    id: 7,
    status: "Accepted",
    email: "jensras12@example.com",
    amount: 337,
    service: "Window Cleaning",
    address: "Perlestikkergade 53",
    city: "Nakskov, 4900",
  },
  {
    id: 8,
    status: "Dismissed",
    email: "mettehe99@example.com",
    amount: 152,
    service: "Window Cleaning",
    address: "Vestergade 59, 3 Th",
    city: "Aarhus C, 7000",
  },
  {
    id: 9,
    status: "Accepted",
    email: "cf@example.com",
    amount: 912,
    service: "Window Cleaning",
    address: "Nørregade 102, St Th",
    city: "København NV, 2400",
  },
  {
    id: 10,
    status: "Accepted",
    email: "larsen@example.com",
    amount: 410,
    service: "Facade Cleaning",
    address: "Bredgade 12",
    city: "Aalborg, 9000",
  },
  {
    id: 11,
    status: "Dismissed",
    email: "sara.jensen@example.com",
    amount: 199,
    service: "Window Cleaning",
    address: "Parkvej 7",
    city: "Esbjerg, 6700",
  },
  {
    id: 12,
    status: "Accepted",
    email: "mads@example.com",
    amount: 555,
    service: "Facade Cleaning",
    address: "Hovedgaden 1",
    city: "Randers, 8900",
  },
];

const statusColor = (status: string) => {
  if (status === "Accepted") return "text-green-600";
  if (status === "Dismissed") return "text-red-500";
  if (status === "Waiting") return "text-yellow-500";
  return "text-gray-500";
};

type SortKey = "email" | "amount";
type SortOrder = "asc" | "desc";

type Quote = (typeof initialPendingQuotes)[number];

const QuotesPage = () => {
  // State for pending quotes
  const [pendingQuotes, setPendingQuotes] = useState(initialPendingQuotes);
  const [pendingFilter, setPendingFilter] = useState("");
  const [pendingSort, setPendingSort] = useState<{
    key: SortKey;
    order: SortOrder;
  }>({ key: "email", order: "asc" });
  const [pendingSelected, setPendingSelected] = useState<number[]>([]);

  // State for quote history
  const [quoteHistory, setQuoteHistory] = useState(initialQuoteHistory);
  const [historyFilter, setHistoryFilter] = useState("");
  const [historySort, setHistorySort] = useState<{
    key: SortKey;
    order: SortOrder;
  }>({ key: "email", order: "asc" });
  const [historySelected, setHistorySelected] = useState<number[]>([]);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewQuote, setReviewQuote] = useState<Quote | null>(null);
  const [adjustedPrice, setAdjustedPrice] = useState("");
  const [customerMsg, setCustomerMsg] = useState("");

  // Filtering
  const filteredPending = pendingQuotes.filter((q) =>
    q.email.toLowerCase().includes(pendingFilter.toLowerCase())
  );
  const filteredHistory = quoteHistory.filter((q) =>
    q.email.toLowerCase().includes(historyFilter.toLowerCase())
  );

  // Sorting
  const sortFn = (key: SortKey, order: SortOrder) => (a: Quote, b: Quote) => {
    if (key === "amount") {
      return order === "asc" ? a.amount - b.amount : b.amount - a.amount;
    }
    // email
    return order === "asc"
      ? a.email.localeCompare(b.email)
      : b.email.localeCompare(a.email);
  };
  const sortedPending = [...filteredPending].sort(
    sortFn(pendingSort.key, pendingSort.order)
  );
  const sortedHistory = [...filteredHistory].sort(
    sortFn(historySort.key, historySort.order)
  );

  // Selection
  const togglePendingSelect = (id: number) => {
    setPendingSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };
  const toggleHistorySelect = (id: number) => {
    setHistorySelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };
  const allPendingSelected =
    sortedPending.length > 0 &&
    sortedPending.every((q) => pendingSelected.includes(q.id));
  const allHistorySelected =
    sortedHistory.length > 0 &&
    sortedHistory.every((q) => historySelected.includes(q.id));
  const toggleAllPending = () => {
    setPendingSelected(
      allPendingSelected ? [] : sortedPending.map((q) => q.id)
    );
  };
  const toggleAllHistory = () => {
    setHistorySelected(
      allHistorySelected ? [] : sortedHistory.map((q) => q.id)
    );
  };

  // Actions
  const handleAccept = (id: number) => {
    setPendingQuotes((quotes) =>
      quotes.map((q) => (q.id === id ? { ...q, status: "Accepted" } : q))
    );
    setQuoteHistory((history) => [
      ...history,
      { ...pendingQuotes.find((q) => q.id === id)!, status: "Accepted" },
    ]);
  };
  const handleReview = (id: number) => {
    const q = pendingQuotes.find((q) => q.id === id);
    if (q) {
      setReviewQuote(q);
      setAdjustedPrice(q.amount.toString());
      setCustomerMsg("");
      setReviewOpen(true);
    }
  };
  const handleViewDetails = (id: number) => {
    const q = quoteHistory.find((q) => q.id === id);
    alert(`Viewing details for ${q?.email}`);
  };
  const handleSort = (table: "pending" | "history", key: SortKey) => {
    if (table === "pending") {
      setPendingSort((s) =>
        s.key === key
          ? { key, order: s.order === "asc" ? "desc" : "asc" }
          : { key, order: "asc" }
      );
    } else {
      setHistorySort((s) =>
        s.key === key
          ? { key, order: s.order === "asc" ? "desc" : "asc" }
          : { key, order: "asc" }
      );
    }
  };

  // Handle adjust quote
  const handleAdjustQuote = () => {
    if (!reviewQuote) return;
    setPendingQuotes((quotes) =>
      quotes.map((q) =>
        q.id === reviewQuote.id
          ? { ...q, status: "Waiting", amount: Number(adjustedPrice) }
          : q
      )
    );
    setReviewOpen(false);
    // Simulate sending message to customer
    setTimeout(() => {
      alert(
        `Message sent to ${reviewQuote.email}:\n\nYour quote has been adjusted to DKK ${adjustedPrice}.\n${customerMsg}`
      );
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Review Modal */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="max-w-md w-full p-0 bg-white/90 backdrop-blur-xl max-h-[80vh] overflow-y-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdjustQuote();
              }}
            >
              <DialogHeader className="px-6 pt-6">
                <DialogTitle>Review Quote</DialogTitle>
              </DialogHeader>
              <div className="px-6 pb-2 space-y-6">
                {/* Contact Information */}
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="contact">
                      👤
                    </span>{" "}
                    Contact Information
                  </div>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="font-medium text-left px-2 py-1 w-1/3">
                          Field
                        </th>
                        <th className="font-medium text-left px-2 py-1">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-2 py-1">Customer Type</td>
                        <td className="px-2 py-1">
                          {reviewQuote?.customerType}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Name</td>
                        <td className="px-2 py-1">{reviewQuote?.name}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Address</td>
                        <td className="px-2 py-1">{reviewQuote?.address}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">City</td>
                        <td className="px-2 py-1">{reviewQuote?.city}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Zip Code</td>
                        <td className="px-2 py-1">{reviewQuote?.zip}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Phone</td>
                        <td className="px-2 py-1">{reviewQuote?.phone}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Email</td>
                        <td className="px-2 py-1">
                          <a
                            href={`mailto:${reviewQuote?.email}`}
                            className="text-blue-600 underline"
                          >
                            {reviewQuote?.email}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Note</td>
                        <td className="px-2 py-1">{reviewQuote?.note}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Quote Details */}
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="quote">
                      📋
                    </span>{" "}
                    Quote Details
                  </div>
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="font-medium text-left px-2 py-1 w-1/3">
                          Aspect
                        </th>
                        <th className="font-medium text-left px-2 py-1">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-2 py-1">Floor(s)</td>
                        <td className="px-2 py-1">{reviewQuote?.floor}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Cleaning Type</td>
                        <td className="px-2 py-1">
                          {reviewQuote?.cleaningType}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Storm Windows</td>
                        <td className="px-2 py-1">
                          {reviewQuote?.stormWindows}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Windows</td>
                        <td className="px-2 py-1">{reviewQuote?.windows}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Service Plan</td>
                        <td className="px-2 py-1">
                          {reviewQuote?.servicePlan}
                        </td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Frequency</td>
                        <td className="px-2 py-1">{reviewQuote?.frequency}</td>
                      </tr>
                      <tr>
                        <td className="px-2 py-1">Estimated Price</td>
                        <td className="px-2 py-1">
                          {reviewQuote?.estimatedPrice} DKK
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      reviewQuote?.address || ""
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 border border-blue-600 rounded px-4 py-1 text-sm hover:bg-blue-50 transition"
                  >
                    View on Google Maps
                  </a>
                </div>
                {/* Adjust price and message */}
                <div className="bg-gray-100 rounded p-4 space-y-3">
                  <label className="block text-sm font-medium mb-1">
                    Adjust price (DKK):
                    <Input
                      type="number"
                      min={0}
                      value={adjustedPrice}
                      onChange={(e) => setAdjustedPrice(e.target.value)}
                      className="mt-1"
                    />
                  </label>
                  <label className="block text-sm font-medium mb-1">
                    Message to customer:
                    <textarea
                      className="w-full mt-1 rounded border border-gray-300 p-2 text-sm"
                      rows={3}
                      placeholder="Write a short note..."
                      value={customerMsg}
                      onChange={(e) => setCustomerMsg(e.target.value)}
                    />
                  </label>
                  <Button type="submit" className="w-full mt-2">
                    Adjust Quote
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => window.open(`tel:${reviewQuote?.phone}`)}
                >
                  Call Customer
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Pending Quotes */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Quotes</CardTitle>
            <CardDescription>Manage your qoutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2 space-x-2">
              <Input
                placeholder="Filter emails..."
                className="w-64"
                value={pendingFilter}
                onChange={(e) => setPendingFilter(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => alert("Column picker coming soon!")}
              >
                <span>Columns</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={allPendingSelected}
                      onChange={toggleAllPending}
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("pending", "email")}
                    >
                      Email
                      <span className="inline-block align-middle">
                        ⇅
                        {pendingSort.key === "email"
                          ? pendingSort.order === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("pending", "amount")}
                    >
                      Amount
                      <span className="inline-block align-middle">
                        ⇅
                        {pendingSort.key === "amount"
                          ? pendingSort.order === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPending.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={pendingSelected.includes(row.id)}
                        onChange={() => togglePendingSelect(row.id)}
                      />
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {row.status}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="font-semibold">
                      DKK {row.amount.toFixed(2)}{" "}
                      <span className="text-gray-400">•••</span>
                    </TableCell>
                    <TableCell>{row.service}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.city}</TableCell>
                    <TableCell className="space-x-2">
                      {row.status === "Pending" && (
                        <Button size="sm" onClick={() => handleAccept(row.id)}>
                          Accept
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReview(row.id)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedPending.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-400"
                    >
                      No quotes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between text-xs text-gray-500 bg-gray-50 rounded-b-lg">
            <span>
              {pendingSelected.length} of {sortedPending.length} row(s)
              selected.
            </span>
            <div>
              <Button variant="outline" size="sm" className="mr-2" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Quote History */}
        <Card>
          <CardHeader>
            <CardTitle>Quote History</CardTitle>
            <CardDescription>Keep track of previous qoutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-2 space-x-2">
              <Input
                placeholder="Filter emails..."
                className="w-64"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
                onClick={() => alert("Column picker coming soon!")}
              >
                <span>Columns</span>
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <input
                      type="checkbox"
                      checked={allHistorySelected}
                      onChange={toggleAllHistory}
                    />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("history", "email")}
                    >
                      Email
                      <span className="inline-block align-middle">
                        ⇅
                        {historySort.key === "email"
                          ? historySort.order === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>
                    <button
                      className="flex items-center gap-1"
                      onClick={() => handleSort("history", "amount")}
                    >
                      Amount
                      <span className="inline-block align-middle">
                        ⇅
                        {historySort.key === "amount"
                          ? historySort.order === "asc"
                            ? "▲"
                            : "▼"
                          : ""}
                      </span>
                    </button>
                  </TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedHistory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={historySelected.includes(row.id)}
                        onChange={() => toggleHistorySelect(row.id)}
                      />
                    </TableCell>
                    <TableCell className={statusColor(row.status)}>
                      {row.status}
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell className="font-semibold">
                      DKK {row.amount.toFixed(2)}{" "}
                      <span className="text-gray-400">•••</span>
                    </TableCell>
                    <TableCell>{row.service}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>{row.city}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(row.id)}
                      >
                        View details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedHistory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-400"
                    >
                      No quotes found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between text-xs text-gray-500 bg-gray-50 rounded-b-lg">
            <span>
              {historySelected.length} of {sortedHistory.length} row(s)
              selected.
            </span>
            <div>
              <Button variant="outline" size="sm" className="mr-2" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default QuotesPage;
