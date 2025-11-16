// Simple JSON-based local database using localStorage
export interface UserData {
  username: string;
  email: string;
  password: string; // In production, this should be hashed
  createdAt: string;
}

export interface UserProgress {
  username: string;
  totalStoriesGenerated: number;
  storiesCompleted: number;
  totalQuestionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  dailyStoriesCompleted: number;
  lastCompletionDate: string | null;
  storyDifficultyStats: Record<string, { completed: number; correctAnswers: number }>;
  history: Array<{
    date: string;
    storiesCompleted: number;
    score: number;
    accuracy: number;
  }>;
}

const USERS_KEY = 'rupayasaathi_users';
const PROGRESS_KEY = 'rupayasaathi_progress';

// User Management
export const getAllUsers = (): UserData[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
};

export const saveUser = (user: UserData): boolean => {
  try {
    const users = getAllUsers();
    const existingIndex = users.findIndex(u => u.username === user.username || u.email === user.email);
    
    if (existingIndex >= 0) {
      return false; // User already exists
    }
    
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

export const authenticateUser = (username: string, password: string): UserData | null => {
  try {
    const users = getAllUsers();
    const user = users.find(u => 
      (u.username === username || u.email === username) && u.password === password
    );
    return user || null;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
};

// Progress Management
export const getUserProgress = (username: string): UserProgress | null => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    const allProgress: Record<string, UserProgress> = data ? JSON.parse(data) : {};
    return allProgress[username] || null;
  } catch (error) {
    console.error('Error reading progress:', error);
    return null;
  }
};

export const saveUserProgress = (username: string, progress: Partial<UserProgress>): boolean => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    const allProgress: Record<string, UserProgress> = data ? JSON.parse(data) : {};
    
    const existingProgress = allProgress[username] || {
      username,
      totalStoriesGenerated: 0,
      storiesCompleted: 0,
      totalQuestionsAnswered: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      score: 0,
      dailyStoriesCompleted: 0,
      lastCompletionDate: null,
      storyDifficultyStats: {},
      history: []
    };
    
    allProgress[username] = { ...existingProgress, ...progress };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(allProgress));
    return true;
  } catch (error) {
    console.error('Error saving progress:', error);
    return false;
  }
};

export const addProgressHistory = (username: string, entry: { date: string; storiesCompleted: number; score: number; accuracy: number }): boolean => {
  try {
    const progress = getUserProgress(username);
    if (!progress) return false;
    
    const history = progress.history || [];
    const existingIndex = history.findIndex(h => h.date === entry.date);
    
    if (existingIndex >= 0) {
      history[existingIndex] = entry;
    } else {
      history.push(entry);
    }
    
    // Keep only last 30 days
    const sortedHistory = history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);
    
    return saveUserProgress(username, { history: sortedHistory });
  } catch (error) {
    console.error('Error adding progress history:', error);
    return false;
  }
};
