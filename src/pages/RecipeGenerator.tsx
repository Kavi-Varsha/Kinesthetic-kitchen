import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ArrowLeft, Plus, X, Loader2, ChefHat, Clock, Users,
  Flame, RefreshCw, Utensils, BookOpen,
  Lightbulb, ArrowRightLeft, Check
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import AppLayout from "@/components/AppLayout";

// Common ingredients for the grid - Including Indian ingredients
const COMMON_INGREDIENTS = [
  // Proteins
  "Chicken", "Lamb", "Fish", "Prawns", "Paneer", "Tofu", "Eggs", "Lentils", "Chickpeas",
  // Grains & Carbs
  "Basmati Rice", "Roti/Chapati", "Rice", "Potatoes", "Quinoa", "Semolina",
  // Indian Vegetables
  "Onions", "Tomatoes", "Garlic", "Ginger", "Green Chillies", "Cauliflower", "Spinach",
  "Eggplant", "Okra", "Bottle Gourd", "Bitter Gourd", "Drumsticks", "Fenugreek Leaves",
  // Common Vegetables
  "Carrots", "Bell Peppers", "Mushrooms", "Peas", "Corn", "Cabbage",
  // Indian Spices & Herbs
  "Turmeric", "Cumin", "Coriander", "Garam Masala", "Red Chilli Powder", "Mustard Seeds",
  "Curry Leaves", "Cinnamon", "Cardamom", "Cloves", "Bay Leaves", "Asafoetida",
  // Dairy & Oils
  "Ghee", "Yogurt/Curd", "Coconut Milk", "Mustard Oil", "Coconut Oil",
  // Pulses & Legumes
  "Moong Dal", "Toor Dal", "Chana Dal", "Urad Dal", "Rajma", "Black Gram"
];

interface Ingredient {
  item: string;
  amount: string;
  unit: string;
  notes?: string;
}

interface RecipeStep {
  number: number;
  instruction: string;
  time: string;
  tip?: string;
}

interface Substitute {
  original: string;
  alternatives: string[];
}

interface Recipe {
  title: string;
  description: string;
  difficulty: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: string;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  nutrition: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
  };
  tips: string[];
  substitutes: Substitute[];
}

interface SubstituteOption {
  name: string;
  reason: string;
  ratio: string;
}

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  // State
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [skillLevel, setSkillLevel] = useState<string>("intermediate");
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ingredients");

  // Substitution state
  const [selectedForSubstitution, setSelectedForSubstitution] = useState<string | null>(null);
  const [substitutes, setSubstitutes] = useState<SubstituteOption[]>([]);
  const [isLoadingSubstitutes, setIsLoadingSubstitutes] = useState(false);

  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients(prev =>
      prev.includes(ingredient)
        ? prev.filter(i => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      setSelectedIngredients([...selectedIngredients, customIngredient.trim()]);
      setCustomIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const fetchSubstitutes = async (ingredient: string) => {
    setSelectedForSubstitution(ingredient);
    setIsLoadingSubstitutes(true);
    const token = getToken();

    try {
      const response = await fetch("http://localhost:5003/api/recipes/substitutes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredient }),
      });

      const data = await response.json();
      if (data.success) {
        setSubstitutes(data.data.substitutes || []);
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch substitutes",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSubstitutes(false);
    }
  };

  const replaceIngredient = (original: string, replacement: string) => {
    setSelectedIngredients(prev =>
      prev.map(i => i === original ? replacement : i)
    );
    setSelectedForSubstitution(null);
    setSubstitutes([]);
    toast({
      title: "Ingredient Replaced",
      description: `${original} has been replaced with ${replacement}`,
    });
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) return;

    setIsLoading(true);
    setRecipe(null);
    const token = getToken();

    try {
      const response = await fetch("http://localhost:5003/api/recipes/generate-advanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          skillLevel
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate recipe");
      }

      if (data.recipe) {
        setRecipe(data.recipe);
        setActiveTab("recipe");
      } else {
        toast({
          title: "No Recipe Generated",
          description: data.message || "Could not generate a recipe with these ingredients",
          variant: "destructive",
        });
      }

      if (data.blockedIngredients && data.blockedIngredients.length > 0) {
        toast({
          title: "Ingredients Blocked",
          description: `Some ingredients were blocked due to dietary restrictions: ${data.blockedIngredients.join(", ")}`,
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner": return "bg-green-100 text-green-800";
      case "intermediate": return "bg-yellow-100 text-yellow-800";
      case "advanced": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen gradient-subtle">
        <main className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold mb-2">Recipe Generator</h1>
            <p className="text-muted-foreground">Create personalized recipes with AI</p>
          </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="ingredients" className="gap-2">
              <Utensils className="w-4 h-4" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="recipe" className="gap-2" disabled={!recipe}>
              <BookOpen className="w-4 h-4" />
              Recipe
            </TabsTrigger>
          </TabsList>

          {/* INGREDIENTS TAB */}
          <TabsContent value="ingredients" className="space-y-6">
            {/* Skill Level Selector */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  Skill Level
                </CardTitle>
                <CardDescription>
                  Recipe complexity will adapt based on your cooking experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500" />
                        Beginner - Simple steps, basic techniques
                      </div>
                    </SelectItem>
                    <SelectItem value="intermediate">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-yellow-500" />
                        Intermediate - Moderate complexity
                      </div>
                    </SelectItem>
                    <SelectItem value="advanced">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500" />
                        Advanced - Professional techniques
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Selected Ingredients */}
            {selectedIngredients.length > 0 && (
              <Card className="shadow-elegant border-primary/20">
                <CardHeader>
                  <CardTitle>Selected Ingredients ({selectedIngredients.length})</CardTitle>
                  <CardDescription>Click an ingredient to see substitutes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedIngredients.map((ingredient) => (
                      <Dialog key={ingredient}>
                        <DialogTrigger asChild>
                          <div
                            className="inline-flex items-center rounded-full border px-3 py-2 text-sm font-semibold bg-secondary text-secondary-foreground cursor-pointer hover:bg-primary/10 transition-colors"
                            onClick={() => fetchSubstitutes(ingredient)}
                          >
                            {ingredient}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeIngredient(ingredient);
                              }}
                              className="ml-2 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <ArrowRightLeft className="w-5 h-5" />
                              Substitutes for {ingredient}
                            </DialogTitle>
                          </DialogHeader>
                          {isLoadingSubstitutes ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {substitutes.map((sub, idx) => (
                                <Card key={idx} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => replaceIngredient(ingredient, sub.name)}>
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-semibold">{sub.name}</p>
                                        <p className="text-sm text-muted-foreground">{sub.reason}</p>
                                        <Badge variant="outline" className="mt-1">{sub.ratio} ratio</Badge>
                                      </div>
                                      <Button size="sm" variant="ghost">
                                        <Check className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Custom Ingredient Input */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Add Custom Ingredient</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type any ingredient..."
                    value={customIngredient}
                    onChange={(e) => setCustomIngredient(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addCustomIngredient()}
                  />
                  <Button onClick={addCustomIngredient}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ingredient Grid */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle>Common Ingredients</CardTitle>
                <CardDescription>Click to select ingredients you have available</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {COMMON_INGREDIENTS.map((ingredient) => (
                    <Button
                      key={ingredient}
                      variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                      className="h-auto py-3 text-sm"
                      onClick={() => toggleIngredient(ingredient)}
                    >
                      {selectedIngredients.includes(ingredient) && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {ingredient}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Generate Button */}
            <div className="sticky bottom-4">
              <Button
                className="w-full shadow-lg"
                size="lg"
                disabled={selectedIngredients.length === 0 || isLoading}
                onClick={generateRecipe}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Recipe...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-5 w-5" />
                    Generate Recipe
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          {/* RECIPE TAB */}
          <TabsContent value="recipe" className="space-y-6">
            {recipe && (
              <>
                {/* Recipe Header */}
                <Card className="shadow-elegant overflow-hidden">
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
                        <p className="text-muted-foreground text-lg">{recipe.description}</p>
                      </div>
                      <Badge className={`${getDifficultyColor(recipe.difficulty)} px-3 py-1`}>
                        {recipe.difficulty}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Prep Time</p>
                          <p className="font-semibold">{recipe.prepTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flame className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Cook Time</p>
                          <p className="font-semibold">{recipe.cookTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Total Time</p>
                          <p className="font-semibold">{recipe.totalTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Servings</p>
                          <p className="font-semibold">{recipe.servings}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Nutrition Info */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Nutrition Information</CardTitle>
                    <CardDescription>Per serving</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">{recipe.nutrition.calories}</p>
                        <p className="text-sm text-muted-foreground">Calories</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">{recipe.nutrition.protein}</p>
                        <p className="text-sm text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">{recipe.nutrition.carbs}</p>
                        <p className="text-sm text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <p className="text-2xl font-bold text-primary">{recipe.nutrition.fat}</p>
                        <p className="text-sm text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Ingredients List */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle>Ingredients</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {recipe.ingredients.map((ing, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <div>
                              <span className="font-medium">{ing.amount} {ing.unit}</span>{" "}
                              <span>{ing.item}</span>
                              {ing.notes && (
                                <span className="text-sm text-muted-foreground ml-1">
                                  ({ing.notes})
                                </span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Substitutes */}
                  <Card className="shadow-elegant">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Ingredient Substitutes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recipe.substitutes.map((sub, idx) => (
                          <div key={idx}>
                            <p className="font-medium">{sub.original}</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {sub.alternatives.map((alt, altIdx) => (
                                <Badge key={altIdx} variant="outline">
                                  {alt}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Steps */}
                <Card className="shadow-elegant">
                  <CardHeader>
                    <CardTitle>Step-by-Step Instructions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {recipe.steps.map((step) => (
                        <div key={step.number} className="flex gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                            {step.number}
                          </div>
                          <div className="flex-1">
                            <p className="text-base leading-relaxed">{step.instruction}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                {step.time}
                              </Badge>
                              {step.tip && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                                  {step.tip}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                {recipe.tips && recipe.tips.length > 0 && (
                  <Card className="shadow-elegant border-yellow-200 bg-yellow-50/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-600" />
                        Pro Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {recipe.tips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-yellow-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Button
                  variant="outline"
                  onClick={() => setActiveTab("ingredients")}
                  className="w-full"
                >
                  Generate Another Recipe
                </Button>
              </>
            )}
          </TabsContent>
        </Tabs>
        </main>
      </div>
    </AppLayout>
  );
};

export default RecipeGenerator;
