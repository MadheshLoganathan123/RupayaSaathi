import { useState } from "react";
import Header from "@/components/Header";
import UserSettings from "@/components/UserSettings";
import StoryGenerator, { StoryData } from "@/components/StoryGenerator";
import StoryCard from "@/components/StoryCard";
import VoiceNarration from "@/components/VoiceNarration";
import InteractiveQuestion from "@/components/InteractiveQuestion";
import ScoreDisplay from "@/components/ScoreDisplay";
import ProgressTracker from "@/components/ProgressTracker";
import DailyBadge from "@/components/DailyBadge";
import StoryHistory from "@/components/StoryHistory";
import Footer from "@/components/Footer";

const Index = () => {
  // Load latest stories array and current index from localStorage on mount
  const [stories, setStories] = useState<StoryData[]>(() => {
    try {
      const stored = localStorage.getItem('latestStories');
      if (stored) return JSON.parse(stored);
    } catch (error) {
      console.warn('Failed to load stories from localStorage:', error);
    }
    return [];
  });

  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    try {
      const idx = localStorage.getItem('latestStoryIndex');
      if (idx) return Number(idx);
    } catch (e) {
      console.warn('Failed to load current index', e);
    }
    return 0;
  });
  const [language, setLanguage] = useState<string>("english");
  const [scoreStats, setScoreStats] = useState<{ attempts: number; correct: number }>(() => {
    try {
      const stored = localStorage.getItem('scoreStats');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Failed to load scoreStats from localStorage', e);
    }
    return { attempts: 0, correct: 0 };
  });

  // key to force remounting question component when story changes
  const [questionKey, setQuestionKey] = useState<number>(0);
  const [endMessage, setEndMessage] = useState<string | null>(null);

  const handleStoriesGenerated = (newStories: StoryData[]) => {
    setStories(newStories);
    setCurrentIndex(0);
    try { localStorage.setItem('latestStories', JSON.stringify(newStories)); localStorage.setItem('latestStoryIndex', '0'); } catch (e) { console.warn('Failed to persist stories', e); }
    // reset question UI
    setQuestionKey(k => k + 1);
    setEndMessage(null);
  };

  const handleAnswer = (correct: boolean) => {
    setScoreStats(prev => {
      const updated = { attempts: prev.attempts + 1, correct: prev.correct + (correct ? 1 : 0) };
      try { localStorage.setItem('scoreStats', JSON.stringify(updated)); } catch (e) { console.warn('Failed to save scoreStats', e); }
      return updated;
    });
  };

  // Advance to next story index (used by narration or UI)
  const handleAdvanceIndex = (advance = 1) => {
    setCurrentIndex(prev => {
      const next = prev + advance;
      if (next >= stories.length) {
        // show small message
        setEndMessage('No more stories — generate again');
        setTimeout(() => setEndMessage(null), 3000);
        return prev; // no change
      }
      try { localStorage.setItem('latestStoryIndex', String(next)); } catch (e) {}
      setQuestionKey(k => k + 1);
      return next;
    });
  };

  const handleSetIndex = (index: number) => {
    const clamped = Math.max(0, Math.min(index, stories.length - 1));
    setCurrentIndex(clamped);
    try { localStorage.setItem('latestStoryIndex', String(clamped)); } catch (e) {}
    setQuestionKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <UserSettings 
          onLanguageChange={setLanguage}
        />
        
        <StoryGenerator 
          onStoriesGenerated={handleStoriesGenerated}
          language={language}
          count={5}
        />

        {stories.length > 0 ? (
          <>
            <StoryCard story={stories[currentIndex]} />

            {endMessage && (
              <div className="mt-2 text-center text-sm text-muted-foreground">{endMessage}</div>
            )}

            <VoiceNarration
              stories={stories}
              currentIndex={currentIndex}
              language={language}
              onIndexChange={handleSetIndex}
              onAdvance={handleAdvanceIndex}
            />

            <InteractiveQuestion
              key={questionKey}
              question={stories[currentIndex].question}
              options={stories[currentIndex].options}
              correctAnswer={stories[currentIndex].correct}
              onAnswer={handleAnswer}
            />
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">Generate stories to begin.</div>
        )}

        <ScoreDisplay stats={scoreStats} />
        
        <ProgressTracker />
        
        <DailyBadge />
        
        <StoryHistory />
        
        <div className="bg-success/10 border border-success/20 rounded-lg p-3 text-center">
          <p className="text-sm text-success font-medium">
            ✓ User preferences saved successfully
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
