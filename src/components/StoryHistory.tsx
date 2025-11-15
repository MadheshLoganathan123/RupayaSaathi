import { History, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const StoryHistory = () => {
  const stories = [
    { id: 1, title: "The Smart Savings Story", completed: true },
    { id: 2, title: "Budget Planning Adventure", completed: true },
    { id: 3, title: "Investment Basics", completed: true },
    { id: 4, title: "Emergency Fund Journey", completed: false },
  ];

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <History className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Story History</h3>
      </div>

      <ScrollArea className="h-48">
        <div className="space-y-2">
          {stories.map((story) => (
            <button
              key={story.id}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <span
                className={`text-sm ${
                  story.completed ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {story.title}
              </span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};

export default StoryHistory;
