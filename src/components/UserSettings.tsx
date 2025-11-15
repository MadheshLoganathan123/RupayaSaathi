import { Settings, Moon, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface UserSettingsProps {
  onLanguageChange?: (language: string) => void;
  onTopicChange?: (topic: string) => void;
}

const UserSettings = ({ onLanguageChange, onTopicChange }: UserSettingsProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [language, setLanguage] = useState<string>("english");
  const [topic, setTopic] = useState<string>("saving money");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };

  const handleTopicChange = (value: string) => {
    setTopic(value);
    if (onTopicChange) {
      onTopicChange(value);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Settings className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Settings</h2>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-foreground mb-1 block">
            Language
          </Label>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="english">English</SelectItem>
              <SelectItem value="hindi">हिंदी (Hindi)</SelectItem>
              <SelectItem value="tamil">தமிழ் (Tamil)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-1 block">
            Story Topic
          </Label>
          <Input
            value={topic}
            onChange={(e) => handleTopicChange(e.target.value)}
            placeholder="e.g., saving money, budgeting, investing"
            className="w-full h-12"
            maxLength={100}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-1 block">
            Difficulty Level
          </Label>
          <Select defaultValue="beginner">
            <SelectTrigger className="w-full h-12">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-foreground mb-1 block">
            Theme
          </Label>
          <Button
            variant="outline"
            className="w-full h-12 justify-start gap-2"
            onClick={toggleTheme}
          >
            {theme === "light" ? (
              <>
                <Sun className="w-5 h-5" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5" />
                <span>Dark Mode</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default UserSettings;
