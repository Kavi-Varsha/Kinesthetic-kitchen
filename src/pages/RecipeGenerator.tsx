import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X } from "lucide-react";

const RecipeGenerator = () => {
  const navigate = useNavigate();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");

  const addIngredient = () => {
    if (currentIngredient.trim()) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
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
          <h1 className="text-3xl font-bold mb-2">🍳 arator</h1>
          <p className="text-muted-foreground">Enter your ingredients and get personalized recipes</p>
        </div>

        <Card className="shadow-elegant mb-6">
          <CardHeader>
            <CardTitle>Available Ingredients</CardTitle>
            <CardDescription>Add ingredients you have on hand</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="e.g., Tomatoes, Garlic, Olive Oil"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addIngredient()}
                />
              </div>
              <Button onClick={addIngredient}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {ingredients.length > 0 && (
              <div className="space-y-2">
                <Label>Your Ingredients:</Label>
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                      {ingredient}
                      <button
                        onClick={() => removeIngredient(index)}
                        className="ml-2 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft mb-6">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <Label>Allergies</Label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Nuts</Badge>
                <Badge variant="outline">Dairy</Badge>
                <Badge variant="outline">Gluten</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            Want to try with sample Italian & Mediterranean menu?
          </p>
          <Button 
            className="w-full" 
            size="lg"
            disabled={ingredients.length === 0}
          >
            Generate Recipes
          </Button>
          <Button variant="outline" className="w-full">
            Scan Menu
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-6">
          We'll analyze the menu items based on your health profile
        </p>
      </main>
    </div>
  );
};

export default RecipeGenerator;
