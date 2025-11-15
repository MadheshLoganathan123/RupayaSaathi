import Header from "@/components/Header";
import UserSettings from "@/components/UserSettings";
import StoryGenerator from "@/components/StoryGenerator";
import StoryCard from "@/components/StoryCard";
import VoiceNarration from "@/components/VoiceNarration";
import InteractiveQuestion from "@/components/InteractiveQuestion";
import ScoreProgress from "@/components/ScoreProgress";
import DailyBadge from "@/components/DailyBadge";
import StoryHistory from "@/components/StoryHistory";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <UserSettings />
        
        <StoryGenerator />
        
        <StoryCard />
        
        <VoiceNarration />
        
        <InteractiveQuestion />
        
        <ScoreProgress />
        
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
