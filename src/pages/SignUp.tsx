// src/pages/SignUp.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth"; // <-- IMPORT THE NEW HOOK

const API_URL = "http://localhost:5003/api/auth/signup";

const SignUp = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth(); // <-- USE THE LOGIN FUNCTION FROM THE HOOK

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match.", variant: "destructive" });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        login(data.token); // <-- SAVE THE TOKEN USING THE HOOK
        toast({ title: "Account created!", description: "Welcome! Let's set up your profile." });
        
        // This logic is correct: a new user will always go to profile setup
        navigate("/profile-setup");
      } else {
        throw new Error(data.message || "An unknown error occurred.");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
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
                <CardTitle className="text-2xl font-semibold">Create your account</CardTitle>
                <CardDescription>Join HealthChef and start your personalized cooking journey</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" type="text" placeholder="John Doe" value={formData.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create account"}
                </Button>
            </form>
            <div className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
            </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUp;