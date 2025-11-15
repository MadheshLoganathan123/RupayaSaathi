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
  topic?: string;
}

const StoryGenerator = ({ 
  onStoryGenerated, 
  language = 'english', 
  topic = 'saving money' 
}: StoryGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generateStory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language,
          topic,
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

  return (
    <div className="text-center space-y-4">
      <Button
        size="lg"
        className="w-full h-14 text-lg gap-2"
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
    </div>
  );
};

export default StoryGenerator;
export type { StoryData };
