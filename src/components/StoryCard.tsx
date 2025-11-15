import { RotateCcw, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StoryData } from "./StoryGenerator";

interface StoryCardProps {
  story: StoryData;
}

const StoryCard = ({ story }: StoryCardProps) => {
  // Split story into paragraphs for better display
  const storyParagraphs = story.story.split(/\n\n|\n/).filter(p => p.trim());

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-3">
          {story.title}
        </h3>
        <ScrollArea className="h-48 w-full pr-4">
          <div className="text-foreground leading-relaxed space-y-2">
            {storyParagraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1 h-12 gap-2">
          <RotateCcw className="w-4 h-4" />
          <span>Replay Story</span>
        </Button>
        <Button className="flex-1 h-12 gap-2">
          <span>Next Story</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default StoryCard;
