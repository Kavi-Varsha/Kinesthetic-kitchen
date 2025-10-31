import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Clock, Target } from "lucide-react";

const VRTraining = () => {
  const navigate = useNavigate();

  const trainingModules = [
    {
      title: "Curry Making & Spicing",
      description: "Learn proper stir-frying, currying techniques, and Indian spices",
      duration: "45 min",
      level: "Intermediate",
      progress: 0,
      badge: "New Course"
    },
    {
      title: "Knife Handling & Chopping",
      description: "Master knife skills for efficiency and safety",
      duration: "30 min",
      level: "Beginner",
      progress: 75,
      badge: "In Progress"
    },
    {
      title: "Chopping & Dicing Mastery",
      description: "Advanced chopping techniques and speed training",
      duration: "35 min",
      level: "Advanced",
      progress: 100,
      badge: "Completed"
    }
  ];

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🎧 Training</h1>
          <p className="text-muted-foreground">Track your cooking skill and achievements</p>
        </div>

        <Card className="shadow-elegant mb-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-background shadow-soft mb-4">
                <Target className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">24</h2>
              <p className="text-sm text-muted-foreground mb-4">Skills Learned</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center mb-6">
              <div>
                <div className="text-2xl font-bold">+2.5h</div>
                <div className="text-xs text-muted-foreground">Total Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold">91%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">VR Connector</span>
                  <Badge variant="secondary" className="text-xs">Connected</Badge>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>✓ Enter your phone into VR headset</li>
                  <li>✓ Access trainer & immersive chef persona</li>
                  <li>✓ Cooking in virtual environment</li>
                  <li>✓ Safe your training process</li>
                </ul>
              </div>
              <Button className="w-full">Connect to VR</Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Training Modules</h2>
          <div className="space-y-4">
            {trainingModules.map((module, index) => (
              <Card key={index} className="shadow-soft hover-scale cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{module.title}</CardTitle>
                      <CardDescription>{module.description}</CardDescription>
                    </div>
                    <Badge 
                      variant={module.badge === "Completed" ? "default" : "secondary"}
                      className={
                        module.badge === "Completed" 
                          ? "bg-green-600 text-white" 
                          : module.badge === "In Progress"
                          ? "bg-yellow-600 text-white"
                          : ""
                      }
                    >
                      {module.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {module.duration}
                    </div>
                    <Badge variant="outline">{module.level}</Badge>
                  </div>
                  {module.progress > 0 && (
                    <div className="space-y-2">
                      <Progress value={module.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VRTraining;
