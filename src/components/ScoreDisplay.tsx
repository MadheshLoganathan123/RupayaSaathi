import { Card } from "@/components/ui/card";

interface ScoreStats {
  attempts: number;
  correct: number;
}

interface ScoreDisplayProps {
  stats?: ScoreStats;
}

const ScoreDisplay = ({ stats }: ScoreDisplayProps) => {
  const { attempts = 0, correct = 0 } = stats ?? {};
  const accuracy = attempts > 0 ? (correct / attempts) * 100 : 0;

  return (
    <Card className="p-4 space-y-2">
      <div className="flex flex-col items-center space-y-1">
        <span className="text-sm uppercase tracking-wider text-muted-foreground">
          Progress Tracker
        </span>
        <span className="text-3xl font-bold text-foreground">{correct}</span>
        <span className="text-xs text-muted-foreground">Correct Answers</span>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <p className="text-foreground font-semibold">{attempts}</p>
          <p className="text-muted-foreground">Attempts</p>
        </div>
        <div>
          <p className="text-foreground font-semibold">{correct}</p>
          <p className="text-muted-foreground">Correct</p>
        </div>
        <div>
          <p className="text-foreground font-semibold">
            {accuracy.toFixed(1)}%
          </p>
          <p className="text-muted-foreground">Accuracy</p>
        </div>
      </div>
    </Card>
  );
};

export default ScoreDisplay;

