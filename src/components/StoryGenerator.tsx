import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const StoryGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => setIsGenerating(false), 2000);
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
