import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface StoryData {
  title: string;
  story: string;
  question: string;
  options: string[];
  correct: number;
}

interface StoryGeneratorProps {
  onStoryGenerated?: (story: StoryData) => void;
  language?: string;
}

const StoryGenerator = ({ 
  onStoryGenerated, 
  language = 'english'
}: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const storyData: StoryData = await response.json();

      // Validate response structure
      if (!storyData.title || !storyData.story || !storyData.question || !storyData.options) {
        throw new Error('Invalid story data received from server');
      }

      // Store in localStorage as latestStory
      try {
        localStorage.setItem('latestStory', JSON.stringify(storyData));
      } catch (storageError) {
        console.warn('Failed to save story to localStorage:', storageError);
      }

      // Call callback if provided
      if (onStoryGenerated) {
        onStoryGenerated(storyData);
      }

      toast({
        title: "Story Generated!",
        description: `"${storyData.title}" has been created successfully.`,
      });
    } catch (error) {
      console.error('Error generating story:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate story. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestAPI = async () => {
    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          test: true,
        }),
      });

      const result = await response.json();
      
      toast({
        title: result.message || "API Test",
        description: result.status === 'connected' 
          ? "DeepSeek API is reachable and working!" 
          : "Check your API key configuration.",
        variant: result.status === 'connected' ? 'default' : 'destructive',
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "Failed to test API connection.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="text-center space-y-4">
      <Button
        size="lg"
        className="w-full h-14 text-lg gap-2 touch-manipulation"
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Story...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Story</span>
          </>
        )}
      </Button>

      {isGenerating && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Creating your personalized financial story...
        </p>
      )}

      <Button
        variant="outline"
        size="sm"
        className="w-full h-10 text-sm touch-manipulation"
        onClick={handleTestAPI}
        disabled={isGenerating}
      >
        Test API Connection
      </Button>
    </div>
  );
};

export default StoryGenerator;
export type { StoryData };
