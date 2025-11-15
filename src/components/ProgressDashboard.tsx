import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { ProgressStats } from "@/hooks/useProgress";

interface ProgressDashboardProps {
  stats: ProgressStats;
  accuracy: number;
  progressPercent: number;
  dailyStoriesCompleted: number;
  storyDifficultyStats: Record<string, { completed: number; correctAnswers: number }>;
}

const ProgressDashboard = ({ stats, accuracy, progressPercent, dailyStoriesCompleted, storyDifficultyStats }: ProgressDashboardProps) => {
  const glowClass = stats.totalQuestionsAnswered
    ? accuracy >= 75
      ? "ring-2 ring-success/60 shadow-[0_0_20px_rgba(34,197,94,0.25)]"
      : "ring-2 ring-destructive/60 shadow-[0_0_20px_rgba(239,68,68,0.25)]"
    : "";

  return (
    <Card className={`p-4 space-y-4 transition-all duration-200 ${glowClass}`}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Score</p>
          <p className="text-4xl font-bold text-foreground">{stats.score}</p>
          <p className="text-sm text-muted-foreground">Points collected</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Daily Goal</p>
          <p className="text-3xl font-bold text-foreground">{dailyStoriesCompleted}</p>
          <p className="text-sm text-muted-foreground">Stories today</p>
        </div>
      </div>

      <div className="grid gap-3 text-center text-sm md:grid-cols-3">
        <div className="rounded-lg border border-border/80 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stories</p>
          <p className="text-2xl font-semibold text-foreground">{stats.storiesCompleted}</p>
          <p className="text-muted-foreground">/ {stats.totalStoriesGenerated || 1} completed</p>
        </div>
        <div className="rounded-lg border border-border/80 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Questions</p>
          <p className="text-2xl font-semibold text-foreground">{stats.totalQuestionsAnswered}</p>
          <p className="text-muted-foreground">answered</p>
        </div>
        <div className="rounded-lg border border-border/80 p-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Accuracy</p>
          <p className="text-2xl font-semibold text-foreground">{accuracy.toFixed(1)}%</p>
          <p className="text-muted-foreground">{stats.correctAnswers} correct</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">Difficulty Breakdown</p>
        <div className="grid gap-3 text-center text-sm md:grid-cols-3">
          {Object.entries(storyDifficultyStats).map(([difficulty, data]) => (
            <div key={difficulty} className="rounded-lg border border-border/80 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{difficulty}</p>
              <p className="text-xl font-semibold text-foreground">{data.completed}</p>
              <p className="text-muted-foreground">{data.correctAnswers} correct answers</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Story completion</span>
          <span>{progressPercent.toFixed(0)}%</span>
        </div>
        <Progress
          value={progressPercent}
          className="h-2 rounded-full transition-all duration-500"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Accuracy</span>
          <span>{accuracy.toFixed(0)}%</span>
        </div>
        <Progress
          value={accuracy}
          className="h-2 rounded-full transition-all duration-500"
        />
      </div>
    </Card>
  );
};

export default ProgressDashboard;

