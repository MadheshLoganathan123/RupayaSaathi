import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Simple, client-side authentication for demonstration
  const handleLogin = (e: React.FormEvent) => {
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

    // Simulate an API call for authentication
    setTimeout(() => {
      setIsLoading(false);
      
      // In a real application, this would be a secure server-side check.
      // For this simple app, we'll just check if the username is not empty.
      if (username.trim().length > 0) {
        // Store user info (username) in local storage
        localStorage.setItem("user", JSON.stringify({ username: username.trim() }));
        toast({
          title: "Login Successful",
          description: `Welcome, ${username.trim()}!`,
        });
        navigate("/"); // Redirect to the main page
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    }, 1000);
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
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
