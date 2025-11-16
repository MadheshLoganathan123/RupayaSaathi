import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Target, CheckCircle, TrendingUp, Flame } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { loadProgress, ProgressData } from "@/hooks/useProgressStore";

const ProgressPage = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData | null>(null);

  useEffect(() => {
    setProgress(loadProgress());
  }, []);

  if (!progress) return null;

  const accuracy = progress.questionsAnswered > 0
    ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
    : 0;

  // Data for charts
  const difficultyData = [
    { name: "Easy", stories: progress.difficultyStats.easy.stories, correct: progress.difficultyStats.easy.correct },
    { name: "Medium", stories: progress.difficultyStats.medium.stories, correct: progress.difficultyStats.medium.correct },
    { name: "Hard", stories: progress.difficultyStats.hard.stories, correct: progress.difficultyStats.hard.correct },
  ];

  const weeklyData = [
    { day: "Mon", completed: 2 },
    { day: "Tue", completed: 3 },
    { day: "Wed", completed: 1 },
    { day: "Thu", completed: 4 },
    { day: "Fri", completed: 2 },
    { day: "Sat", completed: 5 },
    { day: "Sun", completed: 3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Your Progress</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Stories Completed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">{progress.storiesCompleted}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Questions Answered</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-3xl font-bold text-foreground">{progress.questionsAnswered}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Accuracy Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                <span className="text-3xl font-bold text-foreground">{accuracy}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Daily Streak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-warning" />
                <span className="text-3xl font-bold text-foreground">{progress.dailyStreak}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Performance</CardTitle>
              <CardDescription>Stories completed by difficulty level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={difficultyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Bar dataKey="stories" fill="hsl(var(--primary))" />
                  <Bar dataKey="correct" fill="hsl(var(--success))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Activity</CardTitle>
              <CardDescription>Stories completed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)"
                    }}
                  />
                  <Line type="monotone" dataKey="completed" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Difficulty Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Difficulty Breakdown</CardTitle>
            <CardDescription>Detailed performance by difficulty level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(progress.difficultyStats).map(([level, stats]) => {
                const levelAccuracy = stats.stories > 0 ? Math.round((stats.correct / stats.stories) * 100) : 0;
                return (
                  <div key={level} className="p-4 rounded-lg border border-border bg-card">
                    <h3 className="text-lg font-semibold text-foreground capitalize mb-2">{level}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        Stories: <span className="font-medium text-foreground">{stats.stories}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Correct: <span className="font-medium text-foreground">{stats.correct}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Accuracy: <span className="font-medium text-foreground">{levelAccuracy}%</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;
