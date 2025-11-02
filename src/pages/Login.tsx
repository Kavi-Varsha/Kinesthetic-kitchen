// src/pages/Login.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // <-- IMPORT THE NEW HOOK

const API_URL = "http://localhost:5000/api/auth/login";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // <-- USE THE LOGIN FUNCTION FROM THE HOOK

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        login(data.token); // <-- SAVE THE TOKEN USING THE HOOK
        toast({ title: "Login successful!", description: "Welcome back." });

        // Dynamic redirection logic is correct
        if (data.data.isProfileComplete) {
          navigate("/dashboard");
        } else {
          navigate("/profile-setup");
        }
      } else {
        throw new Error(data.message || "Invalid credentials.");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-subtle">
      <Card className="w-full max-w-md shadow-medium">
        {/* --- Card JSX remains the same --- */}
        <CardHeader className="space-y-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-primary" />
            </div>
            <div>
                <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
                <CardDescription>Sign in to your HealthChef account</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">Forgot password?</Link>
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign in"}
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
                New to HealthChef?{" "}
                <Link to="/signup" className="text-primary hover:underline font-medium">Sign up here</Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;