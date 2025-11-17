// src/pages/RecipeGenerator.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { toast } = useToast();

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [recipeResult, setRecipeResult] = useState<string>("");
  const [substitutes, setSubstitutes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipes = async () => {
    setIsLoading(true);
    setRecipeResult("");
    setSubstitutes("");
    const token = getToken();

    try {
      const response = await fetch("http://localhost:5000/api/recipes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate recipe");
      }

      const fullText = data.recipe || "";

      // Split the recipe from the substitutes section for separate display
      const splitIndex = fullText.indexOf("⭐ Ingredient Substitutes");
      if (splitIndex !== -1) {
        setRecipeResult(fullText.substring(0, splitIndex).trim());
        setSubstitutes(fullText.substring(splitIndex).trim());
      } else {
        setRecipeResult(fullText);
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

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/kitchen-mode")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Kitchen
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🍳 Recipe Generator</h1>
          <p className="text-muted-foreground">Enter your ingredients to get personalized recipes</p>
        </div>

        {/* INGREDIENT CARD */}
        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Available Ingredients</CardTitle>
            <CardDescription>Add ingredients you have on hand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Chicken, Bell Peppers, Onions"
                value={currentIngredient}
                onChange={(e) => setCurrentIngredient(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addIngredient()}
              />
              <Button onClick={addIngredient}><Plus className="w-4 h-4 mr-2" />Add</Button>
            </div>

            {ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4">
                {ingredients.map((ingredient, index) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    {ingredient}
                    <button onClick={() => removeIngredient(index)} className="ml-2 hover:text-destructive"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* GENERATE BUTTON */}
        <div className="text-center">
          <Button
            className="w-full"
            size="lg"
            disabled={ingredients.length === 0 || isLoading}
            onClick={generateRecipes}
          >
            {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Recipes"}
          </Button>
        </div>

        {/* RECIPE RESULT */}
        {recipeResult && (
          <Card className="shadow-soft mt-6 animate-in fade-in-50">
            <CardHeader><CardTitle>Your Personalized Recipe</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{recipeResult}</p>
            </CardContent>
          </Card>
        )}

        {/* SUBSTITUTES RESULT */}
        {substitutes && (
          <Card className="shadow-soft mt-4 border border-primary/20 animate-in fade-in-50">
            <CardHeader><CardTitle>Substitutions & Tips</CardTitle></CardHeader>
            <CardContent>
              <p className="whitespace-pre-line text-sm">{substitutes}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default RecipeGenerator;