import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import QuotesPage from "./pages/QoutesPage";
import TopNav from "./layout/TopNav";
import CreateCalculatorPage from "./pages/CreateCalculatorPage";
import EmbedCalculatorPage from "./pages/EmbedCalculatorPage";
import CalculatorPage from "./pages/CalculatorPage";
import { Toaster } from "./components/ui/toaster";
import { LoginPage } from "./pages/LoginPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAppSelector } from "./store/hooks";

export default function App() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <TopNav />}
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
            }
          />
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <DashboardPage />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/quotes"
            element={
              <ProtectedRoute>
                <QuotesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-calculator"
            element={
              <ProtectedRoute>
                <CreateCalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/embed-calculator"
            element={
              <ProtectedRoute>
                <EmbedCalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/calculator/:id"
            element={
              <ProtectedRoute>
                <CalculatorPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}
