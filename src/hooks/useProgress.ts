import { useCallback, useMemo, useState } from "react";

export interface ProgressStats {
  totalStoriesGenerated: number;
  storiesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  // New fields for enhanced tracking
  dailyStoriesCompleted: number;
  lastCompletionDate: string | null;
  storyDifficultyStats: Record<string, { completed: number; correctAnswers: number }>;
}

const STORAGE_KEY = "progressStats";

const DEFAULT_STATS: ProgressStats = {
  totalStoriesGenerated: 0,
  storiesCompleted: 0,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  score: 0,
  dailyStoriesCompleted: 0,
  lastCompletionDate: null,
  storyDifficultyStats: {},
};

const safeParseProgress = (): ProgressStats => {
  const today = new Date().toISOString().split('T')[0];
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    const data = JSON.parse(stored);
    if (typeof data !== "object" || data === null) return DEFAULT_STATS;

    // Reset daily stats if the last completion was not today
    if (data.lastCompletionDate !== today) {
      data.dailyStoriesCompleted = 0;
    }

    return {
      ...DEFAULT_STATS,
      ...data,
    };
  } catch (error) {
    console.warn("Failed to read progress stats:", error);
    return DEFAULT_STATS;
  }
};

const persistProgress = (next: ProgressStats) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn("Failed to persist progress stats:", error);
  }
};

const useProgress = () => {
  const [stats, setStats] = useState<ProgressStats>(safeParseProgress);

  const setAndPersist = useCallback((updater: (prev: ProgressStats) => ProgressStats) => {
    setStats((prev) => {
      const next = updater(prev);
      persistProgress(next);
      return next;
    });
  }, []);

  const resetForNewBatch = useCallback(
    (storyCount: number) => {
      setAndPersist((prev) => {
        const next = {
          ...prev,
          totalStoriesGenerated: Math.max(0, storyCount),
          storiesCompleted: 0, // Reset completed count for the new batch
          totalQuestionsAnswered: 0, // Reset question stats for the new batch
          correctAnswers: 0,
          incorrectAnswers: 0,
        };
        console.log("[Progress] reset for new batch", { storyCount: next.totalStoriesGenerated });
        return next;
      });
    },
    [setAndPersist]
  );

  const updateScore = useCallback(
    (isCorrect: boolean, difficulty: string = "easy") => {
      setAndPersist((prev) => {
        const next = {
          ...prev,
          totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
          score: Math.max(0, prev.score + (isCorrect ? 10 : 0)),
          storyDifficultyStats: {
            ...prev.storyDifficultyStats,
            [difficulty]: {
              completed: prev.storyDifficultyStats[difficulty]?.completed || 0,
              correctAnswers: (prev.storyDifficultyStats[difficulty]?.correctAnswers || 0) + (isCorrect ? 1 : 0),
            },
          },
        };
        console.log("[Progress] question answered", {
          isCorrect,
          totalQuestionsAnswered: next.totalQuestionsAnswered,
        });
        return next;
      });
    },
    [setAndPersist]
  );

  const markStoryCompleted = useCallback((difficulty: string = "easy") => {
    const today = new Date().toISOString().split('T')[0];
    setAndPersist((prev) => {
      if (prev.totalStoriesGenerated === 0) return prev;
      const nextCompleted = Math.min(prev.totalStoriesGenerated, prev.storiesCompleted + 1);
      if (nextCompleted === prev.storiesCompleted) return prev;

      // Update daily stats
      const isToday = prev.lastCompletionDate === today;
      const nextDailyCompleted = isToday ? prev.dailyStoriesCompleted + 1 : 1;

      // Update difficulty stats (mark story as completed)
      const nextDifficultyStats = {
        ...prev.storyDifficultyStats,
        [difficulty]: {
          completed: (prev.storyDifficultyStats[difficulty]?.completed || 0) + 1,
          correctAnswers: prev.storyDifficultyStats[difficulty]?.correctAnswers || 0,
        },
      };

      const next = {
        ...prev,
        storiesCompleted: nextCompleted,
        dailyStoriesCompleted: nextDailyCompleted,
        lastCompletionDate: today,
        storyDifficultyStats: nextDifficultyStats,
      };
      console.log("[Progress] story completed", { nextCompleted, daily: nextDailyCompleted });
      return next;
    });
  }, [setAndPersist]);

  const progressPercent = useMemo(() => {
    if (stats.totalStoriesGenerated === 0) return 0;
    return Math.min(100, (stats.storiesCompleted / stats.totalStoriesGenerated) * 100);
  }, [stats.storiesCompleted, stats.totalStoriesGenerated]);

  const accuracy = useMemo(() => {
    if (stats.totalQuestionsAnswered === 0) return 0;
    return Math.min(100, (stats.correctAnswers / stats.totalQuestionsAnswered) * 100);
  }, [stats.correctAnswers, stats.totalQuestionsAnswered]);

  return {
    stats,
    progressPercent,
    accuracy,
    resetForNewBatch,
    updateScore,
    markStoryCompleted,
    // Expose new stats for components
    dailyStoriesCompleted: stats.dailyStoriesCompleted,
    storyDifficultyStats: stats.storyDifficultyStats,
  };
};

export default useProgress;
