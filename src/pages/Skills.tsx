import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Trophy, TrendingUp, Calendar } from "lucide-react";

const Skills = () => {
  const navigate = useNavigate();

  const achievements = [
    { name: "Knife Master", description: "Complete knife handling module", xp: 50, earned: true },
    { name: "Speed Chef", description: "Complete 10 recipes in under 30 minutes", xp: 75, earned: false },
    { name: "Healthy Cook", description: "Cook 20 heart-healthy recipes", xp: 100, earned: true },
    { name: "Technique Master", description: "Master basic cooking techniques", xp: 150, earned: false },
    { name: "Safety First", description: "Complete fire safety training module", xp: 50, earned: true }
  ];

  const recentSkills = [
    { name: "Knife Handling", level: 3, progress: 85, status: "Practiced" },
    { name: "Chopping Basics", level: 2, progress: 60, status: "New" }
  ];

  const skillProgress = [
    { category: "Knife Techniques", level: 3, progress: 85, color: "bg-orange-500" },
    { category: "Spice Blending", level: 2, progress: 60, color: "bg-purple-500" },
    { category: "Grilling & Mixing", level: 2, progress: 55, color: "bg-yellow-500" },
    { category: "Temperature Control", level: 1, progress: 30, color: "bg-blue-500" },
    { category: "Sautéing", level: 1, progress: 25, color: "bg-green-500" }
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
          <h1 className="text-3xl font-bold mb-2">📊 Skill Progress</h1>
          <p className="text-muted-foreground">Track your culinary journey and achievements</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Skills Standing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-primary mb-1">Level 3 ⭐⭐⭐</div>
                <p className="text-sm text-muted-foreground">91 XP until next level</p>
              </div>
              <Progress value={68} className="h-3 mb-2" />
              <p className="text-xs text-muted-foreground text-center">68% to Level 4</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Week</span>
                    <span className="font-semibold">5 sessions</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Month</span>
                    <span className="font-semibold">18 sessions</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border ${
                    achievement.earned 
                      ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" 
                      : "bg-muted/50 border-muted"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {achievement.earned && <Trophy className="w-4 h-4 text-amber-500" />}
                        <p className="font-semibold text-sm">{achievement.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                    </div>
                    <Badge variant={achievement.earned ? "default" : "secondary"} className="text-xs">
                      {achievement.xp} XP
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft mb-8">
          <CardHeader>
            <CardTitle>Recent Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSkills.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold">{skill.name}</p>
                      <p className="text-sm text-muted-foreground">Level {skill.level}</p>
                    </div>
                    <Badge 
                      variant={skill.status === "Practiced" ? "default" : "secondary"}
                    >
                      {skill.status}
                    </Badge>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>All Skills Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillProgress.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${skill.color}`} />
                      <div>
                        <p className="font-semibold text-sm">{skill.category}</p>
                        <p className="text-xs text-muted-foreground">Level {skill.level}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{skill.progress}%</span>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button className="w-full" size="lg" onClick={() => navigate("/vr-training")}>
            Continue Training
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Skills;
