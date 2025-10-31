import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Utensils } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">Welcome back, !</h1>
          <p className="text-muted-foreground text-lg">What would you like to do today?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card 
            className="shadow-elegant hover-scale cursor-pointer transition-all"
            onClick={() => navigate("/kitchen-mode")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6">
                <ChefHat className="w-10 h-10 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-2xl mb-2">🍳 Kitchen Mode</CardTitle>
              <CardDescription className="text-base">
                Cook with what you have. Get recipe suggestions and VR training for your ingredients.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              • Ingredient scanner • Recipe generator • VR cooking training • Progress tracking
            </CardContent>
          </Card>

          <Card 
            className="shadow-elegant hover-scale cursor-pointer transition-all"
            onClick={() => navigate("/restaurant-mode")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
                <Utensils className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl mb-2">🍽️ Restaurant Mode</CardTitle>
              <CardDescription className="text-base">
                Scan restaurant menus and get health recommendations based on your dietary needs.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-sm text-muted-foreground">
              • Menu scanner • Health filtering • Dietary recommendations • Smart suggestions
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          VR Kitchen • Cook. Learn. Evolve.
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
