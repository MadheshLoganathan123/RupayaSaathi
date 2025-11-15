import { RotateCcw, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const StoryCard = () => {
  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-xl font-bold text-foreground mb-3">
          The Smart Savings Story
        </h3>
        <div className="text-foreground leading-relaxed space-y-2">
          <p>
            Rohan wanted to buy a new bicycle. His father told him, "Save a
            little every day, and soon you'll have enough."
          </p>
          <p>
            Rohan started saving ₹10 every day from his pocket money. After 30
            days, he had ₹300. He felt proud and learned that small savings can
            grow into big goals.
          </p>
        </div>
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
