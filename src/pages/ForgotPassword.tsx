import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// FIX: Using relative import path to resolve bundler error
import useAuthToken from "../hooks/use-auth-token"; 

const API_URL = "http://localhost:5003/api/auth/forgotpassword"; // Backend Forgot Password Endpoint

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Reset link requested!",
          description: "Check your email for password reset instructions (see server console for mock link).",
        });
        setIsSubmitted(true);
      } else {
        toast({
          title: "Request Failed",
          description: data.message || "An error occurred while trying to send the reset link.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Network Error:', error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check if the backend is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-subtle">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">
              {isSubmitted ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription>
              {isSubmitted
                ? "We've sent a password reset link to the email provided."
                : "Enter your email to receive a reset link"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {!isSubmitted ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                If an account exists for **{email}**, you will receive a password reset email shortly. **Find the reset URL (containing the token) in your backend server console.**
              </p>
              <Link to="/login" className="block">
                <Button className="w-full">Return to login</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
