import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Headphones, Lightbulb, Trophy, Loader2, RefreshCw, Settings, Clock, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

interface TodaysRecipe {
  title: string;
  description: string;
  time: string;
  badges: string[];
  ingredients?: string[];
  steps?: string[];
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  tips?: string[];
}

const KitchenMode = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [todaysRecipe, setTodaysRecipe] = useState<TodaysRecipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(true);

  // Helper to get today's date string
  const getTodayDateString = () => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  };

  // Check if cached recipe is still valid (from today)
  const getCachedRecipe = (): TodaysRecipe | null => {
    try {
      const cached = localStorage.getItem("todaysRecipe");
      if (!cached) return null;

      const { date, recipe } = JSON.parse(cached);
      if (date === getTodayDateString()) {
        return recipe;
      }
      // Clear outdated cache
      localStorage.removeItem("todaysRecipe");
      return null;
    } catch {
      return null;
    }
  };

  // Save recipe to cache with today's date
  const cacheRecipe = (recipe: TodaysRecipe) => {
    try {
      localStorage.setItem(
        "todaysRecipe",
        JSON.stringify({
          date: getTodayDateString(),
          recipe,
        })
      );
    } catch (err) {
      console.error("Failed to cache recipe:", err);
    }
  };

  const fetchTodaysRecipe = async (forceRefresh: boolean = false) => {
    // Check cache first (unless forcing refresh)
    if (!forceRefresh) {
      const cachedRecipe = getCachedRecipe();
      if (cachedRecipe) {
        setTodaysRecipe(cachedRecipe);
        setIsLoadingRecipe(false);
        return;
      }
    }

    setIsLoadingRecipe(true);
    const token = getToken();

    try {
      const response = await fetch("http://localhost:5003/api/recipes/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.recipe) {
        setTodaysRecipe(data.recipe);
        cacheRecipe(data.recipe);
        if (forceRefresh) {
          toast({
            title: "New Recipe Generated",
            description: "Your recipe suggestion has been refreshed!",
          });
        }
      } else if (data.recipe) {
        // API returned a fallback recipe
        setTodaysRecipe(data.recipe);
        cacheRecipe(data.recipe);
      }
    } catch (err) {
      console.error("Failed to fetch today's recipe:", err);
      // Set fallback recipe
      const fallbackRecipe = {
        title: "Classic Dal Tadka",
        description: "A comforting Indian lentil dish with aromatic spices",
        time: "30 minutes",
        badges: ["Vegetarian", "High Protein"],
        ingredients: ["1 cup toor dal", "2 tbsp ghee", "1 tsp cumin seeds", "4 cloves garlic", "2 dry red chillies", "1/2 tsp turmeric", "Salt to taste", "Fresh coriander"],
        steps: [
          "Wash and soak dal for 30 minutes",
          "Pressure cook dal with turmeric and salt until soft",
          "Heat ghee in a pan, add cumin seeds",
          "Add garlic and red chillies, sauté until golden",
          "Pour the tadka over cooked dal",
          "Garnish with fresh coriander and serve hot"
        ],
        nutrition: {
          calories: "250 kcal",
          protein: "12g",
          carbs: "35g",
          fat: "8g"
        },
        tips: ["Use fresh garlic for better flavor", "Adjust spice level to your preference", "Serve with rice or roti"]
      };
      setTodaysRecipe(fallbackRecipe);
      cacheRecipe(fallbackRecipe);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  useEffect(() => {
    fetchTodaysRecipe();
  }, []);

  return (
    <AppLayout>
      <div className="min-h-screen gradient-subtle">
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Kitchen Mode</h1>
            <p className="text-muted-foreground">Ready to cook something amazing?</p>
          </div>

          {/* Today's Recipe - Full Display */}
          <Card className="shadow-elegant mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                  <div>
                    <CardTitle className="text-2xl">Today's Recipe</CardTitle>
                    <CardDescription>Personalized for your dietary preferences</CardDescription>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchTodaysRecipe(true)}
                  disabled={isLoadingRecipe}
                  className="gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingRecipe ? "animate-spin" : ""}`} />
                  New Recipe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingRecipe ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="ml-3 text-lg text-muted-foreground">Generating your recipe...</span>
                </div>
              ) : todaysRecipe ? (
                <div className="space-y-6">
                  {/* Recipe Header */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{todaysRecipe.title}</h2>
                    <p className="text-muted-foreground text-lg mb-4">{todaysRecipe.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-700 dark:text-blue-300">{todaysRecipe.time}</span>
                      </div>
                      {todaysRecipe.badges.map((badge, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Nutrition Info */}
                  {todaysRecipe.nutrition && (
                    <Card className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/10 dark:to-yellow-900/10 border-orange-200 dark:border-orange-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Flame className="w-5 h-5 text-orange-500" />
                          Nutrition per Serving
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-orange-600">{todaysRecipe.nutrition.calories}</p>
                            <p className="text-xs text-muted-foreground font-medium">Calories</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">{todaysRecipe.nutrition.protein}</p>
                            <p className="text-xs text-muted-foreground font-medium">Protein</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-yellow-600">{todaysRecipe.nutrition.carbs}</p>
                            <p className="text-xs text-muted-foreground font-medium">Carbs</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-red-600">{todaysRecipe.nutrition.fat}</p>
                            <p className="text-xs text-muted-foreground font-medium">Fat</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Ingredients */}
                  {todaysRecipe.ingredients && todaysRecipe.ingredients.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">🥘 Ingredients</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {todaysRecipe.ingredients.map((ing, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                              <span>{ing}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Steps */}
                  {todaysRecipe.steps && todaysRecipe.steps.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">📝 Instructions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-4">
                          {todaysRecipe.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-4">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-sm">
                                {idx + 1}
                              </div>
                              <p className="pt-1 flex-1">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tips */}
                  {todaysRecipe.tips && todaysRecipe.tips.length > 0 && (
                    <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Lightbulb className="w-5 h-5 text-yellow-600" />
                          Chef's Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {todaysRecipe.tips.map((tip, idx) => (
                            <li key={idx} className="text-sm text-yellow-800 dark:text-yellow-200">
                              💡 {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">Unable to load recipe suggestion</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card
              className="shadow-elegant hover-scale cursor-pointer border-2 hover:border-primary/50 transition-all"
              onClick={() => navigate("/recipe-generator")}
            >
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                  <ChefHat className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Generate Recipe with AI</CardTitle>
                <CardDescription>
                  Create personalized recipes with smart ingredient substitutions based on your health profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">AI-powered</Badge>
                  <Badge variant="secondary">Smart substitutions</Badge>
                  <Badge variant="secondary">Health-conscious</Badge>
                </div>
                <Button className="w-full mt-4">Start Cooking</Button>
              </CardContent>
            </Card>

            <Card
              className="shadow-elegant hover-scale cursor-pointer border-2 hover:border-primary/50 transition-all"
              onClick={() => navigate("/vr-training")}
            >
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mb-4">
                  <Headphones className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">VR Training</CardTitle>
                <CardDescription>
                  Immersive virtual reality cooking skills training and practice sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">Interactive VR</Badge>
                  <Badge variant="secondary">Skill tracking</Badge>
                  <Badge variant="secondary">Real-time feedback</Badge>
                </div>
                <Button className="w-full mt-4">Start Training</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="shadow-elegant hover-scale cursor-pointer"
              onClick={() => navigate("/skills")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="font-semibold">Health Tip</p>
                    <p className="text-sm text-muted-foreground">
                      Use herbs and spices instead of salt for flavor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="shadow-elegant hover-scale cursor-pointer"
              onClick={() => navigate("/skills")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-amber-500" />
                  <div>
                    <p className="font-semibold">Recent Skills</p>
                    <p className="text-sm text-muted-foreground">Knife Handling • Chopping Basics</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className="shadow-elegant hover-scale cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-semibold">Profile Settings</p>
                    <p className="text-sm text-muted-foreground">Update your dietary preferences</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default KitchenMode;
