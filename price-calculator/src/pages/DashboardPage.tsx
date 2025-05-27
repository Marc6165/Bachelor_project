import React from "react";
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
import StatChart from "../components/ui/StatChart";

const revenueChart = [4, 5, 3, 6, 4, 5];
const quoteChart = [5, 7, 6, 4, 6, 5, 7, 6];

const jobsData = [
  { date: "Today", email: "ken99@example.com", amount: "DKK 316.00" },
  { date: "Today", email: "abe45@example.com", amount: "DKK 242.00" },
  { date: "Tomorrow", email: "Montserrat44@example.com", amount: "DKK 837.00" },
  { date: "04-06-2025", email: "carmella@example.com", amount: "DKK 721.00" },
];

const quotesData = [
  { status: "Pending", email: "ken99@example.com", amount: "DKK 316.00" },
  { status: "Pending", email: "abe45@example.com", amount: "DKK 242.00" },
  {
    status: "Pending",
    email: "Montserrat44@example.com",
    amount: "DKK 837.00",
  },
  { status: "Pending", email: "carmella@example.com", amount: "DKK 721.00" },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Revenue</CardTitle>
              <CardDescription>+20.1% from last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                DKK 15,231.89
              </div>
              <div className="mt-4 h-12 flex items-end">
                <StatChart heights={revenueChart} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quote Request</CardTitle>
              <CardDescription>+180.1% from last month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">+57</div>
              <div className="mt-4 h-12 flex items-end">
                <StatChart heights={quoteChart} />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming Jobs</CardTitle>
              <CardDescription>
                Keep track of your upcoming jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2 space-x-2">
                <Input placeholder="Filter emails..." className="w-64" />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
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
                      <input type="checkbox" />
                    </TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>
                      Email <span className="inline-block align-middle">⇅</span>
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobsData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell className="font-semibold">
                        {row.amount}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400"
                        >
                          •••
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between text-xs text-gray-500 bg-gray-50 rounded-b-lg">
              <span>0 of 4 row(s) selected.</span>
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>Manage your quotes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-2 space-x-2">
                <Input placeholder="Filter emails..." className="w-48" />
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-1"
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
                      <input type="checkbox" />
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      Email <span className="inline-block align-middle">⇅</span>
                    </TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotesData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <input type="checkbox" />
                      </TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell className="font-semibold">
                        {row.amount}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400"
                        >
                          •••
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="justify-between text-xs text-gray-500 bg-gray-50 rounded-b-lg">
              <span>0 of 4 row(s) selected.</span>
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
      </main>
    </div>
  );
};

export default DashboardPage;
