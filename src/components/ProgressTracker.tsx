import { Trophy, Flame, Calendar, Star, Award, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

interface Milestone {
  id: number;
  title: string;
  description: string;
  achieved: boolean;
  icon: string;
}

const ProgressTracker = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [animatedWeeklyProgress, setAnimatedWeeklyProgress] = useState(0);
  const [animatedMonthlyProgress, setAnimatedMonthlyProgress] = useState(0);
  
  // Mock data - would come from backend in real app
  const currentStreak = 7;
  const longestStreak = 12;
  const weeklyProgress = 85;
  const monthlyProgress = 65;
  const totalStoriesCompleted = 24;
  const totalScore = 450;

  const milestones: Milestone[] = [
    { id: 1, title: "First Steps", description: "Complete your first story", achieved: true, icon: "🎯" },
    { id: 2, title: "Quick Learner", description: "Complete 5 stories", achieved: true, icon: "⚡" },
    { id: 3, title: "Week Warrior", description: "Maintain a 7-day streak", achieved: true, icon: "🔥" },
    { id: 4, title: "Story Master", description: "Complete 25 stories", achieved: false, icon: "📚" },
    { id: 5, title: "Perfect Month", description: "Complete 30 stories in a month", achieved: false, icon: "🏆" },
    { id: 6, title: "Finance Guru", description: "Master all difficulty levels", achieved: false, icon: "👑" },
  ];

  const achievedCount = milestones.filter(m => m.achieved).length;

  useEffect(() => {
    // Trigger celebration animation when component mounts if user has achievements
    if (achievedCount > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 600);
    }
  }, [achievedCount]);

  // Animate progress bars from 0% to target values
  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const stepDuration = duration / steps;
    const weeklyStep = weeklyProgress / steps;
    const monthlyStep = monthlyProgress / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setAnimatedWeeklyProgress(Math.min(weeklyProgress, weeklyStep * currentStep));
        setAnimatedMonthlyProgress(Math.min(monthlyProgress, monthlyStep * currentStep));
      } else {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [weeklyProgress, monthlyProgress]);

  return (
    <Card className="p-6 space-y-6 animate-fade-in">
      {/* Header with Total Score */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className={`w-7 h-7 text-accent ${showCelebration ? 'animate-celebration' : ''}`} />
            Your Progress
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Keep up the amazing work!</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-accent animate-scale-in">{totalScore}</div>
          <div className="text-xs text-muted-foreground">Total Points</div>
        </div>
      </div>

      {/* Streak Section */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <div className="flex items-center gap-3">
            <div className={`bg-accent text-accent-foreground p-3 rounded-full ${currentStreak >= 7 ? 'animate-bounce-in' : ''}`}>
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
              <div className="text-xs text-muted-foreground">Day Streak 🔥</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="bg-primary text-primary-foreground p-3 rounded-full">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{longestStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Stories Completed */}
      <Card className="p-4 bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-secondary text-secondary-foreground p-3 rounded-full">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{totalStoriesCompleted}</div>
              <div className="text-xs text-muted-foreground">Stories Completed</div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            1 more to milestone! 🎯
          </Badge>
        </div>
      </Card>

      {/* Weekly/Monthly Progress Tabs */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly" className="gap-2">
            <Calendar className="w-4 h-4" />
            Weekly
          </TabsTrigger>
          <TabsTrigger value="monthly" className="gap-2">
            <Calendar className="w-4 h-4" />
            Monthly
          </TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">This Week's Progress</span>
            <span className="text-muted-foreground">{Math.round(animatedWeeklyProgress)}%</span>
          </div>
          <Progress value={animatedWeeklyProgress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            6 out of 7 stories completed this week! Great job! 🌟
          </p>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-3 mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">This Month's Progress</span>
            <span className="text-muted-foreground">{Math.round(animatedMonthlyProgress)}%</span>
          </div>
          <Progress value={animatedMonthlyProgress} className="h-3" />
          <p className="text-xs text-muted-foreground">
            24 out of 30 stories completed this month. Keep it up! 💪
          </p>
        </TabsContent>
      </Tabs>

      {/* Milestones Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Milestones
          </h3>
          <Badge variant="outline" className="text-xs">
            {achievedCount}/{milestones.length} Achieved
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {milestones.map((milestone, index) => (
            <Card
              key={milestone.id}
              className={`p-4 transition-all duration-300 ${
                milestone.achieved
                  ? 'bg-gradient-to-br from-success/10 to-success/5 border-success/30 animate-scale-in'
                  : 'bg-muted/30 border-border opacity-60'
              }`}
              style={{
                animationDelay: milestone.achieved ? `${index * 100}ms` : '0ms'
              }}
            >
              <div className="text-center space-y-2">
                <div
                  className={`text-3xl ${
                    milestone.achieved ? 'animate-bounce-in' : 'grayscale'
                  }`}
                  style={{
                    animationDelay: milestone.achieved ? `${index * 150}ms` : '0ms'
                  }}
                >
                  {milestone.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm text-foreground">
                    {milestone.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {milestone.description}
                  </div>
                </div>
                {milestone.achieved && (
                  <Badge variant="secondary" className="text-xs">
                    Unlocked! 🎉
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Encouragement Message */}
      <div className="text-center p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-lg border border-primary/20">
        <p className="text-sm font-medium text-foreground">
          You're doing amazing! Keep learning to unlock more milestones! 🚀
        </p>
      </div>
    </Card>
  );
};

export default ProgressTracker;
