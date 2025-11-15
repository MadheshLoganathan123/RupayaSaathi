import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";

const DailyBadge = () => {
  return (
    <Card className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
      <div className="flex items-center gap-3">
        <div className="bg-accent text-accent-foreground p-3 rounded-full">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Today's Story Unlocked</h3>
          <p className="text-sm text-muted-foreground">Keep up the great work! 🎉</p>
        </div>
      </div>
    </Card>
  );
};

export default DailyBadge;
