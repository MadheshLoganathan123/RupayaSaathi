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
  onStoriesGenerated?: (stories: StoryData[]) => void;
  language?: string;
  count?: number;
}

const StoryGenerator = ({ 
  onStoriesGenerated, 
  language = 'english',
  count = 5
}: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, numStories: count }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Debug: Log the response to help diagnose issues
      console.log('API Response:', data);
      console.log('Response type:', Array.isArray(data) ? 'array' : typeof data);
      
      // Handle both array and single object responses
      const stories: StoryData[] = Array.isArray(data) ? data : [data];

      // Validate that we have at least one story
      if (stories.length === 0) {
        console.error('No stories in response:', data);
        throw new Error('No stories received from server');
      }
      
      // Validate each story has required fields
      const invalidStories = stories.filter((story, index) => {
        const isValid = story && 
          story.title && 
          story.story && 
          story.question && 
          Array.isArray(story.options) && 
          story.options.length >= 2;
        
        if (!isValid) {
          console.error(`Story ${index} is invalid:`, story);
        }
        return !isValid;
      });
      
      if (invalidStories.length > 0) {
        console.error('Invalid stories found:', invalidStories);
        throw new Error(`Invalid story data: ${invalidStories.length} story/stories missing required fields`);
      }

      // Store in localStorage as latestStories and set index 0
      try {
        localStorage.setItem('latestStories', JSON.stringify(stories));
        localStorage.setItem('latestStoryIndex', '0');
      } catch (storageError) {
        console.warn('Failed to save stories to localStorage:', storageError);
      }

      if (onStoriesGenerated) onStoriesGenerated(stories);

      toast({ title: 'Stories Generated!', description: `Created ${stories.length} stories.` });
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
