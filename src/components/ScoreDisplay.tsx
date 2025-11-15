import { Card } from "@/components/ui/card";

interface ScoreDisplayProps {
  score?: number;
}

const ScoreDisplay = ({ score = 0 }: ScoreDisplayProps) => {
  return (
    <Card className="p-4">
      <div className="text-center">
        <span className="text-2xl font-bold text-foreground">
          Score: {score}
        </span>
      </div>
    </Card>
  );
};

export default ScoreDisplay;

