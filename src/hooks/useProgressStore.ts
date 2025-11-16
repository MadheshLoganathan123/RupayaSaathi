const PROGRESS_KEY = "rs_progress_data";

export interface ProgressData {
  storiesCompleted: number;
  questionsAnswered: number;
  correctAnswers: number;
  difficultyStats: {
    easy: { stories: number; correct: number };
    medium: { stories: number; correct: number };
    hard: { stories: number; correct: number };
  };
  dailyStreak: number;
  lastActiveDate: string;
}

const getDefaultProgress = (): ProgressData => ({
  storiesCompleted: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  difficultyStats: {
    easy: { stories: 0, correct: 0 },
    medium: { stories: 0, correct: 0 },
    hard: { stories: 0, correct: 0 },
  },
  dailyStreak: 0,
  lastActiveDate: "",
});

export const loadProgress = (): ProgressData => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    if (!data) return getDefaultProgress();
    return { ...getDefaultProgress(), ...JSON.parse(data) };
  } catch {
    return getDefaultProgress();
  }
};

const saveProgress = (data: ProgressData) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn("Failed to save progress:", e);
  }
};

export const recordStory = (difficulty: "easy" | "medium" | "hard" = "easy") => {
  const progress = loadProgress();
  progress.storiesCompleted++;
  progress.difficultyStats[difficulty].stories++;
  saveProgress(progress);
};

export const recordAnswer = (isCorrect: boolean, difficulty: "easy" | "medium" | "hard" = "easy") => {
  const progress = loadProgress();
  progress.questionsAnswered++;
  if (isCorrect) {
    progress.correctAnswers++;
    progress.difficultyStats[difficulty].correct++;
  }
  saveProgress(progress);
};

export const updateStreak = () => {
  const progress = loadProgress();
  const today = new Date().toISOString().split("T")[0];
  
  if (progress.lastActiveDate === today) return; // Already updated today
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  
  if (progress.lastActiveDate === yesterdayStr) {
    progress.dailyStreak++;
  } else if (progress.lastActiveDate !== today) {
    progress.dailyStreak = 1;
  }
  
  progress.lastActiveDate = today;
  saveProgress(progress);
};
