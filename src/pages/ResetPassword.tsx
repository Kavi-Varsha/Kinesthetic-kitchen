import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  // useParams() is used to extract the 'token' from the URL: /resetpassword/:token
  const { token } = useParams(); 
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    if (!token) {
        toast({
            title: "Error",
            description: "No reset token found. Please use the link from your email.",
            variant: "destructive",
        });
        setIsLoading(false);
        return;
    }

    const API_URL = `http://localhost:5003/api/auth/resetpassword/${token}`;

    try {
      const response = await fetch(API_URL, {
        method: 'PUT', // We use PUT for updating the password
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newPassword: password }), // Backend expects newPassword
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Success!",
          description: "Your password has been reset.",
        });
        setIsSuccess(true);
      } else {
        // Failed reset (e.g., token expired/invalid, password too short)
        toast({
          title: "Reset Failed",
          description: data.message || "The link may be expired or invalid. Please request a new one.",
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

  const PasswordResetForm = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Resetting..." : "Reset Password"}
      </Button>
    </form>
  );

  const SuccessMessage = (
    <div className="space-y-4 text-center">
      <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
      <p className="text-lg font-semibold">Password Reset Complete!</p>
      <p className="text-sm text-muted-foreground">
        You can now log in with your new credentials.
      </p>
      <Link to="/login" className="block">
        <Button className="w-full">Go to Login</Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-subtle">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-semibold">
              {isSuccess ? "Success!" : "Set New Password"}
            </CardTitle>
            <CardDescription>
              {isSuccess ? "Your password is safe." : "Enter and confirm your new password."}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isSuccess ? SuccessMessage : PasswordResetForm}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
