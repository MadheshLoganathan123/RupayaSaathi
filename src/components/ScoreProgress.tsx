import { Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const ScoreProgress = () => {
  const score = 450;
  const progress = 65;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-accent" />
          <span className="text-2xl font-bold text-foreground">{score}</span>
        </div>
        <span className="text-sm text-muted-foreground">Total Score</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Your learning progress</span>
          </div>
          <span className="text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-3" />
      </div>
    </Card>
  );
};

export default ScoreProgress;
