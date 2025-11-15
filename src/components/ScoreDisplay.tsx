import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Target, CheckCircle, TrendingUp } from "lucide-react";

interface ScoreStats {
  attempts: number;
  correct: number;
}

interface ScoreDisplayProps {
  stats?: ScoreStats;
}

const ScoreDisplay = ({ stats }: ScoreDisplayProps) => {
  const { attempts = 0, correct = 0 } = stats ?? {};
  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  const progressPercent = attempts > 0 ? Math.min(100, (attempts / 50) * 100) : 0;

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b">
        <Award className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Your Progress</h2>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Target className="w-4 h-4" />
            <span>Questions Answered</span>
          </div>
          <p className="text-3xl font-bold text-foreground">{attempts}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Correct Answers</span>
          </div>
          <p className="text-3xl font-bold text-success">{correct}</p>
        </div>

        <div className="space-y-2 col-span-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Accuracy Rate</span>
          </div>
          <p className="text-3xl font-bold text-primary">{accuracy}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Session Progress</span>
          <span className="font-medium text-foreground">{Math.round(progressPercent)}%</span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <p className="text-xs text-muted-foreground text-center">
          Keep learning! Answer 50 questions to complete your session.
        </p>
      </div>
    </Card>
  );
};

export default ScoreDisplay;

