import { Volume2, Square } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { StoryData } from "./StoryGenerator";

interface VoiceNarrationProps {
  story?: StoryData | null;
  language?: string;
}

const VoiceNarration = ({ story, language = 'english' }: VoiceNarrationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('speechSynthesis' in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;
      
      // Load voices (some browsers need this)
      if (synthRef.current.getVoices().length === 0) {
        synthRef.current.onvoiceschanged = () => {
          // Voices loaded
        };
      }
    }

    // Cleanup on unmount
    return () => {
      if (synthRef.current && synthRef.current.speaking) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Get voice based on language
  const getVoiceForLanguage = (lang: string): SpeechSynthesisVoice | null => {
    if (!synthRef.current) return null;

    // Get voices - may need to call multiple times
    let voices = synthRef.current.getVoices();
    if (voices.length === 0) {
      // Try again if voices not loaded yet
      voices = synthRef.current.getVoices();
    }
    const langMap: Record<string, string[]> = {
      english: ['en-IN', 'en-US', 'en-GB'],
      hindi: ['hi-IN', 'hi'],
      tamil: ['ta-IN', 'ta']
    };

    const langCodes = langMap[lang] || langMap.english;

    // Try to find exact match first
    for (const code of langCodes) {
      const voice = voices.find(v => v.lang.startsWith(code));
      if (voice) return voice;
    }

    // Fallback to first available voice
    return voices[0] || null;
  };

  const handlePlay = () => {
    if (!isSupported || !synthRef.current) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    // Get story from props or localStorage
    let storyToRead: StoryData | null = story || null;
    
    if (!storyToRead) {
      try {
        const stored = localStorage.getItem('latestStory');
        if (stored) {
          storyToRead = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('Failed to load story from localStorage:', error);
      }
    }

    if (!storyToRead || !storyToRead.story) {
      alert('No story available to read. Please generate a story first.');
      return;
    }

    // Stop any currently playing speech
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }

    // Create new utterance
    const utterance = new SpeechSynthesisUtterance(storyToRead.story);
    utteranceRef.current = utterance;

    // Set voice based on language
    const voice = getVoiceForLanguage(language);
    if (voice) {
      utterance.voice = voice;
    }

    // Set speech properties
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      setIsPlaying(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsPlaying(false);
      utteranceRef.current = null;
    };

    // Start speaking
    synthRef.current.speak(utterance);
  };

  const handleStop = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsPlaying(false);
      utteranceRef.current = null;
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  if (!isSupported) {
    return (
      <Card className="p-4">
        <div className="text-center text-sm text-muted-foreground">
          Voice narration is not supported in your browser.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-foreground">
          Voice Narration
        </span>
        <Button
          variant={isPlaying ? "destructive" : "default"}
          size="lg"
          className="h-12 px-6 gap-2 min-w-[140px]"
          onClick={handleToggle}
          disabled={!story && !localStorage.getItem('latestStory')}
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
