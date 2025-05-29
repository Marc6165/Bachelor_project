import React, { useEffect, useState } from "react";
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
import StatChart from "../components/ui/StatChart";
import { quoteRequestService, type QuoteRequest } from "../services/quote-request.service";
import { useToast } from "../components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";

const revenueChart = [4, 5, 3, 6, 4, 5];
const quoteChart = [5, 7, 6, 4, 6, 5, 7, 6];

const jobsData = [
  { date: "Today", email: "ken99@example.com", amount: "DKK 316.00" },
  { date: "Today", email: "abe45@example.com", amount: "DKK 242.00" },
  { date: "Tomorrow", email: "Montserrat44@example.com", amount: "DKK 837.00" },
  { date: "04-06-2025", email: "carmella@example.com", amount: "DKK 721.00" },
];

const DashboardPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emailFilter, setEmailFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalQuotes, setTotalQuotes] = useState(0);

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchQuoteRequests = async () => {
      try {
        const response = await quoteRequestService.getQuoteRequests(currentPage);
        console.log('Raw quote requests response:', response);
        console.log('Quote objects:', response.quotes);
        if (response.quotes.length > 0) {
          console.log('First quote example:', response.quotes[0]);
        }
        setQuoteRequests(response.quotes);
        setTotalPages(response.pagination.pages);
        setTotalQuotes(response.pagination.total);
      } catch (error) {
        console.error("Error fetching quote requests:", error);
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
          description: "Failed to load quote requests",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuoteRequests();
  }, [toast, currentPage, navigate]);

  const handleAcceptQuote = async (id: string) => {
    console.log('Attempting to accept quote with ID:', id);
    console.log('All quotes:', quoteRequests);
    const quote = quoteRequests.find(q => q.id === id || q._id === id);
    console.log('Found quote:', quote);
    
    if (!quote) {
      console.error('Quote not found with ID:', id);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Quote not found",
      });
      return;
    }

    try {
      await quoteRequestService.updateQuoteRequest(quote._id || quote.id!, { status: 'Accepted' });
      setQuoteRequests(requests => 
        requests.map(r => (r.id === id || r._id === id) ? { ...r, status: 'Accepted' } : r)
      );
      toast({
        title: "Quote accepted",
        description: "The quote has been accepted successfully.",
      });
    } catch (error) {
      console.error('Error accepting quote:', error);
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
        description: "Failed to accept quote",
      });
    }
  };

  const handleDismissQuote = async (id: string) => {
    console.log('Attempting to dismiss quote with ID:', id);
    console.log('All quotes:', quoteRequests);
    const quote = quoteRequests.find(q => q.id === id || q._id === id);
    console.log('Found quote:', quote);
    
    if (!quote) {
      console.error('Quote not found with ID:', id);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Quote not found",
      });
      return;
    }

    try {
      await quoteRequestService.updateQuoteRequest(quote._id || quote.id!, { status: 'Dismissed' });
      setQuoteRequests(requests => 
        requests.map(r => (r.id === id || r._id === id) ? { ...r, status: 'Dismissed' } : r)
      );
      toast({
        title: "Quote dismissed",
        description: "The quote has been dismissed successfully.",
      });
    } catch (error) {
      console.error('Error dismissing quote:', error);
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
        description: "Failed to dismiss quote",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const filteredQuotes = quoteRequests.filter(quote => 
    quote.email.toLowerCase().includes(emailFilter.toLowerCase())
  );

  const pendingQuotes = filteredQuotes.filter(q => q.status === 'Pending');
  const otherQuotes = filteredQuotes.filter(q => q.status !== 'Pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-2 sm:px-4">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <Card>
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-lg sm:text-xl">Total Revenue</CardTitle>
              <CardDescription>+20.1% from last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                DKK 15,231.89
              </div>
              <div className="mt-2 sm:mt-4 h-10 sm:h-12 flex items-end">
                <StatChart heights={revenueChart} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-lg sm:text-xl">Quote Requests</CardTitle>
              <CardDescription>Pending: {pendingQuotes.length}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {totalQuotes} Total
              </div>
              <div className="mt-2 sm:mt-4 h-10 sm:h-12 flex items-end">
                <StatChart heights={quoteChart} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="lg:col-span-2 overflow-hidden">
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-lg sm:text-xl">Pending Quote Requests</CardTitle>
              <CardDescription>
                Review and manage incoming quote requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2 space-x-2">
                <Input 
                  placeholder="Filter by email..." 
                  className="w-full sm:w-64"
                  value={emailFilter}
                  onChange={(e) => setEmailFilter(e.target.value)}
                />
              </div>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Date</TableHead>
                        <TableHead className="whitespace-nowrap">Name</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Service</TableHead>
                        <TableHead className="whitespace-nowrap">Amount</TableHead>
                        <TableHead className="whitespace-nowrap">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            Loading...
                          </TableCell>
                        </TableRow>
                      ) : pendingQuotes.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4">
                            No pending quote requests
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingQuotes.map((quote) => (
                          <TableRow key={quote._id || quote.id}>
                            <TableCell className="whitespace-nowrap">
                              {new Date(quote.createdAt || '').toLocaleDateString()}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">{quote.name}</TableCell>
                            <TableCell className="whitespace-nowrap">{quote.email}</TableCell>
                            <TableCell className="whitespace-nowrap">{quote.service}</TableCell>
                            <TableCell className="whitespace-nowrap font-semibold">
                              DKK {quote.estimatedPrice.toFixed(2)}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                <Button
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    console.log('Accept button clicked for quote:', quote);
                                    handleAcceptQuote(quote._id || quote.id!);
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => {
                                    console.log('Dismiss button clicked for quote:', quote);
                                    handleDismissQuote(quote._id || quote.id!);
                                  }}
                                >
                                  Dismiss
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
              {totalPages > 1 && (
                <div className="flex justify-end mt-4 space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="space-y-1 sm:space-y-2">
              <CardTitle className="text-lg sm:text-xl">Quote History</CardTitle>
              <CardDescription>Past quote requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="whitespace-nowrap">Status</TableHead>
                        <TableHead className="whitespace-nowrap">Email</TableHead>
                        <TableHead className="whitespace-nowrap">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {otherQuotes.map((quote) => (
                        <TableRow key={quote._id || quote.id}>
                          <TableCell className="whitespace-nowrap">
                            <span className={
                              quote.status === 'Accepted' ? 'text-green-600' :
                              quote.status === 'Dismissed' ? 'text-red-600' :
                              'text-gray-600'
                            }>
                              {quote.status}
                            </span>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">{quote.email}</TableCell>
                          <TableCell className="whitespace-nowrap font-semibold">
                            DKK {quote.estimatedPrice.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {otherQuotes.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            No quote history
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
