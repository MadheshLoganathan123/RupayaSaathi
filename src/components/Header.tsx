import { BookOpen } from "lucide-react";
import { Button } from "./ui/button";

interface HeaderProps {
  username?: string;
}

const Header = ({ username }: HeaderProps) => {
  const handleLogout = () => {
    localStorage.removeItem("user");
    // Simple page reload to trigger AuthWrapper redirect
    window.location.reload(); 
  };

  return (
    <header className="bg-card border-b border-border py-4 px-4 shadow-sm">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">RupayaSaathi</h1>
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
