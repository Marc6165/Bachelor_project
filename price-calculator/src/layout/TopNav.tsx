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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center">
            <span className="text-lg sm:text-xl font-bold text-blue-700 whitespace-nowrap">
              Price Calculator
            </span>
            <div className="hidden sm:flex items-center ml-6 space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }: { isActive: boolean }) =>
                    `font-medium px-1 transition-colors whitespace-nowrap ${
                      isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                    }`
                  }
                  end={item.to === "/"}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="flex sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-700 hover:text-blue-600"
              onClick={() => {
                // Toggle mobile menu
                const mobileMenu = document.getElementById('mobile-menu');
                if (mobileMenu) {
                  mobileMenu.classList.toggle('hidden');
                }
              }}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </div>
          <div className="hidden sm:flex">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="text-gray-700 hover:text-blue-600"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden sm:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }: { isActive: boolean }) =>
                `block px-3 py-2 rounded-md text-base font-medium ${
                  isActive 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`
              }
              end={item.to === "/"}
            >
              {item.label}
            </NavLink>
          ))}
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </nav>
  );
}
