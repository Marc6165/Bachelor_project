import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { authService } from "../services/auth.service";
import { useToast } from "../components/ui/use-toast";
import { useAppSelector } from "../store/hooks";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Quotes", to: "/quotes" },
  { label: "Create Calculator", to: "/create-calculator" },
];

export default function TopNav() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAppSelector((state) => state.auth);

  const handleSignOut = () => {
    authService.logout();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
    // Force a page reload to ensure all auth state is properly cleared
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Price Calculator</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? "border-indigo-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-4">
              {user?.email}
            </span>
            <Button
              variant="outline"
              onClick={handleSignOut}
              data-testid="logout-button"
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
