import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface StoryOptions {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  length: 'short' | 'medium' | 'long';
}

interface StoryOptionsFormProps {
  initialOptions: StoryOptions;
  onOptionsChange: (options: StoryOptions) => void;
}

const StoryOptionsForm = ({ initialOptions, onOptionsChange }: StoryOptionsFormProps) => {
  const [options, setOptions] = useState<StoryOptions>(initialOptions);

  const handleChange = (key: keyof StoryOptions, value: string) => {
    const newOptions = { ...options, [key]: value };
    setOptions(newOptions as StoryOptions);
    onOptionsChange(newOptions as StoryOptions);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Story Customization</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic (e.g., Investing, Budgeting, Debt)</Label>
          <Input
            id="topic"
            placeholder="Enter a specific financial topic"
            value={options.topic}
            onChange={(e) => handleChange('topic', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={options.difficulty}
              onValueChange={(value) => handleChange('difficulty', value)}
            >
              <SelectTrigger id="difficulty">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Select
              value={options.length}
              onValueChange={(value) => handleChange('length', value)}
            >
              <SelectTrigger id="length">
                <SelectValue placeholder="Select length" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (1-2 min read)</SelectItem>
                <SelectItem value="medium">Medium (3-4 min read)</SelectItem>
                <SelectItem value="long">Long (5+ min read)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryOptionsForm;
