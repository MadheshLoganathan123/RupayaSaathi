import { Volume2, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const VoiceNarration = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Voice Narration
        </span>
        <Button
          variant={isPlaying ? "destructive" : "secondary"}
          size="lg"
          className="h-12 px-6 gap-2"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? (
            <>
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span>Play Story</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};

export default VoiceNarration;
