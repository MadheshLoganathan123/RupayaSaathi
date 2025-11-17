import { HelpCircle, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Question {
  question: string;
  options: string[];
  correct: number;
}

interface MultiQuestionProps {
  questions: Question[];
  onComplete?: (correctCount: number) => void;
  onAnswer?: (isCorrect: boolean) => void;
}

const MultiQuestion = ({ questions, onComplete, onAnswer }: MultiQuestionProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  const handleOptionClick = (index: number) => {
    if (showFeedback) return;
    const isCorrect = index === currentQuestion.correct;
    setSelectedOption(index);
    setShowFeedback(true);
    if (isCorrect) setCorrectCount(prev => prev + 1);
    onAnswer?.(isCorrect);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete?.(correctCount);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowFeedback(false);
    }
  };

  const isCorrect = selectedOption === currentQuestion.correct;
  const feedbackClass = showFeedback
    ? isCorrect
      ? "ring-2 ring-success/70 shadow-[0_0_25px_rgba(34,197,94,0.35)]"
      : "ring-2 ring-destructive/70 shadow-[0_0_25px_rgba(239,68,68,0.35)]"
    : "";

  return (
    <Card className={`p-6 space-y-4 transition-all duration-200 ${feedbackClass}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <span className="text-sm font-medium text-primary">
          Score: {correctCount}/{currentQuestionIndex + (showFeedback ? 1 : 0)}
        </span>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">
          {currentQuestion.question}
        </h3>

        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
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
          <>
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
                  <span className="font-medium">
                    Wrong! The correct answer is {String.fromCharCode(65 + currentQuestion.correct)}
                  </span>
                </>
              )}
            </div>
            <Button
              onClick={handleNext}
              className="w-full mt-4 gap-2"
            >
              <span>{isLastQuestion ? 'Complete Story' : 'Next Question'}</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};

export default MultiQuestion;
