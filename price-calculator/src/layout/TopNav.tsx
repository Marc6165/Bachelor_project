import { NavLink, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { authService } from "../services/auth.service";
import { useToast } from "../components/ui/use-toast";

const navItems = [
  { label: "Dashboard", to: "/" },
  { label: "Quotes", to: "/quotes" },
  { label: "Create Calculator", to: "/create-calculator" },
];

export default function TopNav() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-8">
        <span className="text-xl font-bold text-blue-700">
          Price Calculator
        </span>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }: { isActive: boolean }) =>
              `font-medium px-1 transition-colors ${
                isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`
            }
            end={item.to === "/"}
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="text-gray-700 hover:text-blue-600"
      >
        Sign Out
      </Button>
    </nav>
  );
}
