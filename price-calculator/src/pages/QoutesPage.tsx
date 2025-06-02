import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/Card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/Table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useToast } from "../components/ui/use-toast";
import { quoteRequestService, type QuoteRequest } from "../services/quote-request.service";
import { authService } from "../services/auth.service";
import { invoiceService } from "../services/invoice.service";

type SortKey = "email" | "amount";
type SortOrder = "asc" | "desc";

const statusColor = (status: string) => {
  if (status === "Accepted") return "text-green-600";
  if (status === "Dismissed") return "text-red-500";
  if (status === "Waiting") return "text-yellow-500";
  return "text-gray-500";
};

const QuotesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  // State for quotes
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // State for filters and sorting
  const [pendingFilter, setPendingFilter] = useState("");
  const [historyFilter, setHistoryFilter] = useState("");
  const [pendingSort, setPendingSort] = useState<{
    key: SortKey;
    order: SortOrder;
  }>({ key: "email", order: "asc" });
  const [historySort, setHistorySort] = useState<{
    key: SortKey;
    order: SortOrder;
  }>({ key: "email", order: "asc" });

  // State for selection
  const [pendingSelected, setPendingSelected] = useState<string[]>([]);
  const [historySelected, setHistorySelected] = useState<string[]>([]);

  // Review modal state
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewQuote, setReviewQuote] = useState<QuoteRequest | null>(null);
  const [adjustedPrice, setAdjustedPrice] = useState("");
  const [customerMsg, setCustomerMsg] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedQuote, setEditedQuote] = useState<Partial<QuoteRequest>>({});

  // Fetch quotes
  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchQuotes = async () => {
      try {
        const response = await quoteRequestService.getQuoteRequests(currentPage);
        console.log('Raw quote requests response:', response);
        setQuotes(response.quotes);
        setTotalPages(response.pagination.pages);
      } catch (error) {
        console.error("Error fetching quotes:", error);
        // Check if the error is due to authentication
        if (error instanceof Error && error.message.includes('token')) {
          console.log('Authentication error, redirecting to login');
          authService.logout(); // Clear invalid token
          navigate('/login');
          return;
        }
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load quotes",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [toast, currentPage, navigate]);

  // Filter quotes
  const pendingQuotes = quotes.filter(q => 
    q.status === 'Pending' && 
    q.email.toLowerCase().includes(pendingFilter.toLowerCase())
  );

  const quoteHistory = quotes.filter(q => 
    q.status !== 'Pending' && 
    q.email.toLowerCase().includes(historyFilter.toLowerCase())
  );

  // Sorting
  const sortFn = (key: SortKey, order: SortOrder) => (a: QuoteRequest, b: QuoteRequest) => {
    if (key === "amount") {
      return order === "asc" ? a.estimatedPrice - b.estimatedPrice : b.estimatedPrice - a.estimatedPrice;
    }
    // email
    return order === "asc"
      ? a.email.localeCompare(b.email)
      : b.email.localeCompare(a.email);
  };

  const sortedPending = [...pendingQuotes].sort(
    sortFn(pendingSort.key, pendingSort.order)
  );
  const sortedHistory = [...quoteHistory].sort(
    sortFn(historySort.key, historySort.order)
  );

  // Selection
  const togglePendingSelect = (id: string) => {
    setPendingSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };
  const toggleHistorySelect = (id: string) => {
    setHistorySelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    );
  };
  const allPendingSelected =
    sortedPending.length > 0 &&
    sortedPending.every((q) => pendingSelected.includes(q._id || q.id!));
  const allHistorySelected =
    sortedHistory.length > 0 &&
    sortedHistory.every((q) => historySelected.includes(q._id || q.id!));
  const toggleAllPending = () => {
    setPendingSelected(
      allPendingSelected ? [] : sortedPending.map((q) => q._id || q.id!)
    );
  };
  const toggleAllHistory = () => {
    setHistorySelected(
      allHistorySelected ? [] : sortedHistory.map((q) => q._id || q.id!)
    );
  };

  // Actions
  const handleAccept = async (id: string) => {
    try {
      await quoteRequestService.updateQuoteRequest(id, { status: 'Accepted' });
      setQuotes(quotes => 
        quotes.map(q => {
          // Only update if either _id or id matches exactly
          const matchesId = (q._id && q._id === id) || (q.id && q.id === id);
          return matchesId ? { ...q, status: 'Accepted' } : q;
        })
      );
      toast({
        title: "Quote accepted",
        description: "The quote has been accepted successfully.",
      });
    } catch (error) {
      console.error('Error accepting quote:', error);
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication error, redirecting to login');
        authService.logout();
        navigate('/login');
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to accept quote",
      });
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await quoteRequestService.updateQuoteRequest(id, { status: 'Dismissed' });
      setQuotes(quotes => 
        quotes.map(q => {
          // Only update if either _id or id matches exactly
          const matchesId = (q._id && q._id === id) || (q.id && q.id === id);
          return matchesId ? { ...q, status: 'Dismissed' } : q;
        })
      );
      toast({
        title: "Quote dismissed",
        description: "The quote has been dismissed successfully.",
      });
    } catch (error) {
      console.error('Error dismissing quote:', error);
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication error, redirecting to login');
        authService.logout();
        navigate('/login');
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to dismiss quote",
      });
    }
  };

  const handleReview = (id: string) => {
    const quote = quotes.find(q => q._id === id || q.id === id);
    if (quote) {
      setReviewQuote(quote);
      setEditedQuote({});
      setIsEditing(false);
      setReviewOpen(true);
    }
  };

  const handleViewDetails = (id: string) => {
    const quote = quotes.find(q => q._id === id || q.id === id);
    if (quote) {
      setReviewQuote(quote);
      setEditedQuote({});
      setIsEditing(false);
      setReviewOpen(true);
    }
  };

  const handleEditQuote = (id: string) => {
    const quote = quotes.find(q => q._id === id || q.id === id);
    if (quote) {
      setReviewQuote(quote);
      setEditedQuote({
        customerType: quote.customerType,
        name: quote.name,
        email: quote.email,
        phone: quote.phone,
        address: quote.address,
        city: quote.city,
        zip: quote.zip,
        note: quote.note || '',
        service: quote.service,
        estimatedPrice: quote.estimatedPrice,
      });
      setIsEditing(true);
      setReviewOpen(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!reviewQuote) return;
    
    try {
      const quoteId = reviewQuote._id || reviewQuote.id!;
      await quoteRequestService.updateQuoteRequest(quoteId, editedQuote);
      
      setQuotes(quotes => 
        quotes.map(q => {
          // Only update if either _id or id matches exactly
          const matchesId = (q._id && q._id === quoteId) || (q.id && q.id === quoteId);
          return matchesId ? { ...q, ...editedQuote } : q;
        })
      );
      
      setReviewOpen(false);
      setIsEditing(false);
      toast({
        title: "Quote updated",
        description: "The quote has been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating quote:', error);
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication error, redirecting to login');
        authService.logout();
        navigate('/login');
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quote",
      });
    }
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
  const handleAdjustQuote = async () => {
    if (!reviewQuote) return;
    
    try {
      const quoteId = reviewQuote._id || reviewQuote.id!;
      await quoteRequestService.updateQuoteRequest(quoteId, {
        status: 'Waiting',
        estimatedPrice: Number(adjustedPrice)
      });
      
      setQuotes(quotes => 
        quotes.map(q => {
          // Only update if either _id or id matches exactly
          const matchesId = (q._id && q._id === quoteId) || (q.id && q.id === quoteId);
          return matchesId ? { ...q, status: 'Waiting', estimatedPrice: Number(adjustedPrice) } : q;
        })
      );
      
    setReviewOpen(false);
      toast({
        title: "Quote adjusted",
        description: `Quote for ${reviewQuote.email} has been adjusted to DKK ${adjustedPrice}.`,
      });
    } catch (error) {
      console.error('Error adjusting quote:', error);
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication error, redirecting to login');
        authService.logout();
        navigate('/login');
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to adjust quote",
      });
    }
  };

  const handleSendInvoice = async (quote: QuoteRequest) => {
    try {
      // Create customer details from quote data
      const customerDetails = {
        name: quote.name,
        email: quote.email,
        address: {
          street: quote.address,
          city: quote.city,
          state: "Denmark",
          zipCode: quote.zip,
          country: "Denmark"
        }
      };

      // Create the invoice
      const invoice = await invoiceService.createInvoice({
        quoteId: quote._id || quote.id!,
        customerDetails
      });

      toast({
        title: "Invoice Sent",
        description: `Invoice has been generated and sent to ${quote.email}`,
      });
    } catch (error) {
      console.error('Error sending invoice:', error);
      if (error instanceof Error && error.message.includes('token')) {
        console.log('Authentication error, redirecting to login');
        authService.logout();
        navigate('/login');
        return;
      }
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send invoice",
      });
    }
  };

  return (
    <div className="container mx-auto py-4 sm:py-8 px-2 sm:px-4 space-y-4 sm:space-y-8">
        {/* Pending Quotes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Pending Quotes</CardTitle>
            <CardDescription>Manage your quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="Filter emails..."
                className="w-full sm:w-64"
                value={pendingFilter}
                onChange={(e) => setPendingFilter(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={allPendingSelected}
                          onChange={toggleAllPending}
                        />
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">
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
                      <TableHead className="whitespace-nowrap">
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
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Service</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Address</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">City</TableHead>
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : sortedPending.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-400">
                        No quotes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedPending.map((quote) => (
                      <TableRow key={quote._id || quote.id}>
                        <TableCell className="w-[40px]">
                          <input
                            type="checkbox"
                            checked={pendingSelected.includes(quote._id || quote.id!)}
                            onChange={() => togglePendingSelect(quote._id || quote.id!)}
                          />
                        </TableCell>
                        <TableCell className="text-gray-500 whitespace-nowrap">
                          {quote.status}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{quote.email}</TableCell>
                        <TableCell className="font-semibold whitespace-nowrap">
                          DKK {quote.estimatedPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.service}</TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.address}</TableCell>
                        <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.city}</TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleAccept(quote._id || quote.id!)}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full sm:w-auto"
                              onClick={() => handleDismiss(quote._id || quote.id!)}
                            >
                              Dismiss
                            </Button>
                            <div className="hidden sm:flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReview(quote._id || quote.id!)}
                              >
                                Review
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditQuote(quote._id || quote.id!)}
                              >
                                Edit
                              </Button>
                              {quote.status === 'Accepted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSendInvoice(quote)}
                                >
                                  Send Invoice
                                </Button>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="sm:hidden w-full"
                              onClick={() => handleReview(quote._id || quote.id!)}
                            >
                              More Actions
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-b-lg p-2 sm:p-4">
            <span>
              {pendingSelected.length} of {sortedPending.length} row(s) selected.
            </span>
            {totalPages > 1 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Next
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>

        {/* Quote History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quote History</CardTitle>
            <CardDescription>Keep track of previous quotes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder="Filter emails..."
                className="w-full sm:w-64"
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <input
                          type="checkbox"
                          checked={allHistorySelected}
                          onChange={toggleAllHistory}
                        />
                      </TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">
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
                      <TableHead className="whitespace-nowrap">
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
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Service</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">Address</TableHead>
                      <TableHead className="hidden sm:table-cell whitespace-nowrap">City</TableHead>
                      <TableHead className="whitespace-nowrap">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : sortedHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-gray-400">
                          No quotes found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedHistory.map((quote) => (
                        <TableRow key={quote._id || quote.id}>
                          <TableCell className="w-[40px]">
                            <input
                              type="checkbox"
                              checked={historySelected.includes(quote._id || quote.id!)}
                              onChange={() => toggleHistorySelect(quote._id || quote.id!)}
                            />
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            <span className={statusColor(quote.status)}>
                              {quote.status}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{quote.email}</TableCell>
                          <TableCell className="font-semibold whitespace-nowrap">
                            DKK {quote.estimatedPrice.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.service}</TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.address}</TableCell>
                          <TableCell className="hidden sm:table-cell whitespace-nowrap">{quote.city}</TableCell>
                          <TableCell>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                                onClick={() => handleViewDetails(quote._id || quote.id!)}
                              >
                                View Details
                              </Button>
                              <div className="hidden sm:flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditQuote(quote._id || quote.id!)}
                                >
                                  Edit
                                </Button>
                                {quote.status === 'Accepted' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSendInvoice(quote)}
                                  >
                                    Send Invoice
                                  </Button>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="sm:hidden w-full"
                                onClick={() => handleEditQuote(quote._id || quote.id!)}
                              >
                                Edit
                              </Button>
                              {quote.status === 'Accepted' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="sm:hidden w-full"
                                  onClick={() => handleSendInvoice(quote)}
                                >
                                  Send Invoice
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review/Edit Modal */}
        <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
          <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl flex justify-between items-center">
                <span>{isEditing ? 'Edit Quote' : 'Review Quote'}</span>
                {!isEditing && reviewQuote?.status === 'Pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="hidden sm:block"
                  >
                    Edit Details
                  </Button>
                )}
              </DialogTitle>
            </DialogHeader>
            {reviewQuote && (
              <div className="space-y-4 sm:space-y-6">
                {/* Customer Information */}
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="user">👤</span>
                    Customer Information
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Customer Type</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.customerType || reviewQuote.customerType}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, customerType: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{reviewQuote.customerType}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Name</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.name || reviewQuote.name}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, name: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{reviewQuote.name}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      {isEditing ? (
                        <Input
                          value={editedQuote.address || reviewQuote.address}
                          onChange={(e) => setEditedQuote(prev => ({ ...prev, address: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1">{reviewQuote.address}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.city || reviewQuote.city}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, city: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{reviewQuote.city}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Zip Code</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.zip || reviewQuote.zip}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, zip: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{reviewQuote.zip}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.phone || reviewQuote.phone}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, phone: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1">{reviewQuote.phone}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Email</label>
                        {isEditing ? (
                          <Input
                            value={editedQuote.email || reviewQuote.email}
                            onChange={(e) => setEditedQuote(prev => ({ ...prev, email: e.target.value }))}
                            className="mt-1"
                          />
                        ) : (
                          <a
                            href={`mailto:${reviewQuote.email}`}
                            className="block mt-1 text-blue-600 underline"
                          >
                            {reviewQuote.email}
                          </a>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Note</label>
                      {isEditing ? (
                        <Input
                          value={editedQuote.note || reviewQuote.note || ''}
                          onChange={(e) => setEditedQuote(prev => ({ ...prev, note: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1">{reviewQuote.note || '-'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <span role="img" aria-label="service">🛠️</span>
                    Service Details
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Service Type</label>
                      <p className="mt-1">{reviewQuote.service}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className="mt-1">{reviewQuote.status}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Estimated Price</label>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editedQuote.estimatedPrice || reviewQuote.estimatedPrice}
                          onChange={(e) => setEditedQuote(prev => ({ ...prev, estimatedPrice: Number(e.target.value) }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1">DKK {reviewQuote.estimatedPrice.toFixed(2)}</p>
                      )}
                    </div>
                    {Object.entries(reviewQuote.parameters || {}).map(([key, value]) => (
                      <div key={key}>
                        <label className="text-sm font-medium text-gray-500">{key}</label>
                        <p className="mt-1">{String(value)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row justify-end gap-2">
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedQuote({});
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleSaveEdit}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : reviewQuote.status === 'Pending' && (
                  <div>
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <span role="img" aria-label="price">💰</span>
                      Price Adjustment
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Adjusted Price (DKK)
                        </label>
                        <Input
                          type="number"
                          value={adjustedPrice}
                          onChange={(e) => setAdjustedPrice(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Message to Customer
                        </label>
                        <Input
                          value={customerMsg}
                          onChange={(e) => setCustomerMsg(e.target.value)}
                          className="mt-1"
                          placeholder="Optional message explaining the adjustment..."
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row justify-end gap-2">
                        <Button
                          variant="outline"
                          className="w-full sm:w-auto"
                          onClick={() => setReviewOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="w-full sm:w-auto"
                          onClick={handleAdjustQuote}
                        >
                          Adjust Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default QuotesPage;
