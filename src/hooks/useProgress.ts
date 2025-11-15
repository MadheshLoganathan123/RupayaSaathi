import { useCallback, useMemo, useState } from "react";

export interface ProgressStats {
  totalStoriesGenerated: number;
  storiesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
}

const STORAGE_KEY = "progressStats";

const DEFAULT_STATS: ProgressStats = {
  totalStoriesGenerated: 0,
  storiesCompleted: 0,
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  score: 0,
};

const safeParseProgress = (): ProgressStats => {
  if (typeof window === "undefined") return DEFAULT_STATS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_STATS;
    const data = JSON.parse(stored);
    if (typeof data !== "object" || data === null) return DEFAULT_STATS;
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
      setAndPersist(() => {
        const next = {
          ...DEFAULT_STATS,
          totalStoriesGenerated: Math.max(0, storyCount),
        };
        console.log("[Progress] reset for new batch", { storyCount: next.totalStoriesGenerated });
        return next;
      });
    },
    [setAndPersist]
  );

  const updateScore = useCallback(
    (isCorrect: boolean) => {
      setAndPersist((prev) => {
        const next = {
          ...prev,
          totalQuestionsAnswered: prev.totalQuestionsAnswered + 1,
          correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
          incorrectAnswers: prev.incorrectAnswers + (isCorrect ? 0 : 1),
          score: Math.max(0, prev.score + (isCorrect ? 10 : 0)),
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

  const markStoryCompleted = useCallback(() => {
    setAndPersist((prev) => {
      if (prev.totalStoriesGenerated === 0) return prev;
      const nextCompleted = Math.min(prev.totalStoriesGenerated, prev.storiesCompleted + 1);
      if (nextCompleted === prev.storiesCompleted) return prev;
      const progressPercent = Math.min(
        100,
        (nextCompleted / prev.totalStoriesGenerated) * 100
      );
      const next = {
        ...prev,
        storiesCompleted: nextCompleted,
      };
      console.log("[Progress] story completed", { nextCompleted, progressPercent });
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
  };
};

export default useProgress;
