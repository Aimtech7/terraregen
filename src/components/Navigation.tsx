import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Menu, X, LogOut, User as UserIcon, Leaf, Map, FlaskConical, BarChart3, Settings as SettingsIcon, TrendingUp, Wheat, Cloud, DollarSign, Users, Info, Sprout, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Leaf },
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/soil-analyzer", label: "Soil Analyzer", icon: FlaskConical },
    { path: "/map", label: "Map", icon: Map },
    { path: "/carbon-tracker", label: "Carbon Tracker", icon: Leaf },
    { path: "/weather", label: "Weather", icon: Cloud },
    { path: "/kenya-insights", label: "Kenya Insights", icon: Sprout },
    { path: "/financial", label: "Financial", icon: DollarSign },
    { path: "/team", label: "Team", icon: Users },
    { path: "/about", label: "About TerraRegen", icon: Info },
    { path: "https://aimwell.vercel.app/", label: "Eduhealth", icon: ExternalLink, external: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full gradient-hero flex items-center justify-center transition-transform group-hover:scale-110">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">TerraRegen</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 flex-wrap justify-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (item.external) {
                return (
                  <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" className="gap-2">
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </a>
                );
              }
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserIcon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card z-50">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")} variant="default">
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border animate-fade-in max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="flex flex-col gap-2 pb-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                if (item.external) {
                  return (
                    <a key={item.path} href={item.path} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" className="w-full justify-start gap-2">
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    </a>
                  );
                }
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsOpen(false)}>
                    <Button
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile Auth */}
              <div className="pt-4 border-t border-border mt-2">
                {user ? (
                  <>
                    <Button
                      onClick={() => {
                        navigate("/settings");
                        setIsOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start mb-2"
                    >
                      <SettingsIcon className="w-5 h-5 mr-2" />
                      Settings
                    </Button>
                    <Button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      variant="ghost"
                      className="w-full justify-start text-destructive"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => {
                      navigate("/auth");
                      setIsOpen(false);
                    }}
                    className="w-full"
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
