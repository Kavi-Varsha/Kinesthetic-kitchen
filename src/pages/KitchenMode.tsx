import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ChefHat, Headphones, Lightbulb, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const KitchenMode = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Menu
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🍳 VR Kitchen</h1>
          <p className="text-muted-foreground">Ready to cook something amazing?</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card 
            className="shadow-soft hover-scale cursor-pointer"
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
                <Badge variant="secondary">AI-generated recipes</Badge>
                <Badge variant="secondary">Smart substitutions</Badge>
                <Badge variant="secondary">Health-conscious alternatives</Badge>
              </div>
              <Button className="w-full mt-4">Get Started</Button>
            </CardContent>
          </Card>

          <Card 
            className="shadow-soft hover-scale cursor-pointer"
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
                <Badge variant="secondary">Interactive VR lessons</Badge>
                <Badge variant="secondary">Skill tracking</Badge>
                <Badge variant="secondary">Real-time feedback</Badge>
              </div>
              <Button className="w-full mt-4">Get Started</Button>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                🍽️
              </div>
              <div>
                <CardTitle>Today's Recipe</CardTitle>
                <CardDescription>Mediterranean Quinoa Bowl</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <span>⏱️ 25 minutes</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20">Vegan</Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20">Heart Healthy</Badge>
            </div>
            <Button variant="outline" className="w-full">View Recipe</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3 mt-6">
          <Card className="shadow-soft hover-scale cursor-pointer" onClick={() => navigate("/skills")}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="font-semibold">Health Tip</p>
                  <p className="text-sm text-muted-foreground">Add herbs and spices instead of salt for flavor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover-scale cursor-pointer" onClick={() => navigate("/skills")}>
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

          <Card className="shadow-soft">
            <CardContent className="pt-6 text-center">
              <Button variant="outline" className="w-full" onClick={() => navigate("/skills")}>
                View Progress
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default KitchenMode;
