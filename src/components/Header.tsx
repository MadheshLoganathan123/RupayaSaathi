import { BookOpen, Home, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";

interface HeaderProps {
  username?: string;
}

const Header = ({ username }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.reload(); 
  };

  return (
    <header className="bg-card border-b border-border py-4 px-4 shadow-sm">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">RupayaSaathi</h1>
          </div>
          
          {username && (
            <nav className="hidden md:flex items-center gap-2">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/")}
                className="gap-2"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button
                variant={location.pathname === "/dashboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Button>
              <Button
                variant={location.pathname === "/progress" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate("/progress")}
                className="gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Progress
              </Button>
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              Welcome, <span className="font-semibold text-foreground">{username}</span>
            </span>
          )}
          {username && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
