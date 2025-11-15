import { HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InteractiveQuestionProps {
  question: string;
  options: string[];
  correctAnswer: number;
}

const InteractiveQuestion = ({ question, options, correctAnswer }: InteractiveQuestionProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleOptionClick = (index: number) => {
    setSelectedOption(index);
    setShowFeedback(true);
  };

  const isCorrect = selectedOption === correctAnswer;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-start gap-2">
        <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {question}
          </h3>

          <div className="space-y-3">
            {options.map((option, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full h-auto min-h-[56px] py-4 px-4 text-left justify-start hover:bg-primary hover:text-primary-foreground transition-colors touch-manipulation text-base"
                onClick={() => handleOptionClick(index)}
                disabled={showFeedback}
              >
                <span className="font-semibold mr-2 text-lg">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="flex-1">{option}</span>
              </Button>
            ))}
          </div>

          {showFeedback && (
            <div
              className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
                isCorrect
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Correct! 🎉</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">Try Again 😅</span>
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
