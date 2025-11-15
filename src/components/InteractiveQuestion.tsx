import { HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const InteractiveQuestion = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    setShowFeedback(true);
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-2">
        <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            What did Rohan learn from this story?
          </h3>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-auto py-4 px-4 text-left justify-start hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleOptionClick("A")}
            >
              <span className="font-semibold mr-2">A.</span>
              <span>Saving small amounts regularly can help reach big goals</span>
            </Button>

            <Button
              variant="outline"
              className="w-full h-auto py-4 px-4 text-left justify-start hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleOptionClick("B")}
            >
              <span className="font-semibold mr-2">B.</span>
              <span>It's better to spend money immediately</span>
            </Button>
          </div>

          {showFeedback && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                selectedOption === "A"
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {selectedOption === "A" ? (
                <>
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Correct! Great job!</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Try again!</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default InteractiveQuestion;
