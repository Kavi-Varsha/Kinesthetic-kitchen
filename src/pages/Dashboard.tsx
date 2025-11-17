import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Utensils, Settings, BookOpen } from "lucide-react";
import AppLayout from "@/components/AppLayout";

const API_URL = "http://localhost:5003/api/profile/me";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(API_URL, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setUserName(result.data.name || "Chef");
        } else {
          console.error("Failed to fetch user data:", result.message);
        }
      } catch (error) {
        console.error("Dashboard API Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-xl font-semibold text-primary">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen gradient-subtle">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-muted-foreground text-lg">What would you like to do today?</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card
              className="shadow-elegant hover-scale cursor-pointer transition-all border-2 hover:border-orange-500/50"
              onClick={() => navigate("/kitchen-mode")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6">
                  <ChefHat className="w-10 h-10 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-2xl mb-2">Kitchen Mode</CardTitle>
                <CardDescription className="text-base">
                  Cook with what you have. Get recipe suggestions and VR training for your
                  ingredients.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 bg-orange-50 rounded">Recipe generator</span>
                  <span className="px-2 py-1 bg-orange-50 rounded">VR training</span>
                  <span className="px-2 py-1 bg-orange-50 rounded">Progress tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card
              className="shadow-elegant hover-scale cursor-pointer transition-all border-2 hover:border-green-500/50"
              onClick={() => navigate("/restaurant-mode")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                  <Utensils className="w-10 h-10 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-2xl mb-2">Menu Scanner</CardTitle>
                <CardDescription className="text-base">
                  Scan restaurant menus and get health recommendations based on your dietary needs.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                <div className="flex flex-wrap justify-center gap-2">
                  <span className="px-2 py-1 bg-green-50 rounded">Menu analyzer</span>
                  <span className="px-2 py-1 bg-green-50 rounded">Health filtering</span>
                  <span className="px-2 py-1 bg-green-50 rounded">Smart suggestions</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              className="shadow-elegant hover-scale cursor-pointer transition-all border-2 hover:border-purple-500/50"
              onClick={() => navigate("/recipe-generator")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl mb-2">Quick Recipe Generator</CardTitle>
                <CardDescription>
                  Jump straight to AI-powered recipe generation with ingredient selection
                </CardDescription>
              </CardHeader>
            </Card>

            <Card
              className="shadow-elegant hover-scale cursor-pointer transition-all border-2 hover:border-blue-500/50"
              onClick={() => navigate("/settings")}
            >
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                  <Settings className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl mb-2">Profile Settings</CardTitle>
                <CardDescription>
                  Update your dietary restrictions, health conditions, and preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center mt-12 text-sm text-muted-foreground">
            HealthChef • Cook. Learn. Evolve.
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
