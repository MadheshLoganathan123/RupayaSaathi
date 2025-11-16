import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import bcrypt from "bcryptjs";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Client-side authentication with bcrypt validation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validation
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Login Failed",
        description: "Please enter both username and password.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Get stored accounts
      const accountsData = localStorage.getItem("rs_user_accounts");
      const accounts = accountsData ? JSON.parse(accountsData) : [];

      // Find user account
      const account = accounts.find((acc: any) => acc.username === username.trim());

      if (!account) {
        toast({
          title: "Login Failed",
          description: "User not found. Please sign up first.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Validate password with bcrypt
      const isValid = await bcrypt.compare(password, account.password);

      if (isValid) {
        localStorage.setItem("user", JSON.stringify({ username: username.trim() }));
        toast({
          title: "Login Successful",
          description: `Welcome back, ${username.trim()}!`,
        });
        setTimeout(() => navigate("/"), 500);
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Welcome to RupayaSaathi</CardTitle>
          <CardDescription className="text-center">
            Enter your username (in any language) and password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username (Any Language)</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your name or nickname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                // The 'lang' attribute is not strictly necessary for input, 
                // but we can add it as a hint for screen readers/browsers.
                lang="auto" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
