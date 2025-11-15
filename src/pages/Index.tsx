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
  // Load latest story from localStorage on mount
  const [currentStory, setCurrentStory] = useState<StoryData | null>(() => {
    try {
      const stored = localStorage.getItem('latestStory');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load story from localStorage:', error);
    }
    return null;
  });
  const [language, setLanguage] = useState<string>("english");

  const handleStoryGenerated = (story: StoryData) => {
    setCurrentStory(story);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <UserSettings 
          onLanguageChange={setLanguage}
        />
        
        <StoryGenerator 
          onStoryGenerated={handleStoryGenerated}
          language={language}
        />
        
        {currentStory && <StoryCard story={currentStory} />}
        
        <VoiceNarration story={currentStory} language={language} />
        
        {currentStory && (
          <InteractiveQuestion 
            question={currentStory.question}
            options={currentStory.options}
            correctAnswer={currentStory.correct}
          />
        )}
        
        <ScoreDisplay />
        
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
