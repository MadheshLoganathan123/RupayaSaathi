import { Volume2, Square, Repeat, SkipForward } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { StoryData } from "./StoryGenerator";

interface VoiceNarrationProps {
  stories?: StoryData[];
  currentIndex?: number;
  language?: string;
  onIndexChange?: (index: number) => void;
  onAdvance?: (step?: number) => void;
}

const VoiceNarration = ({ stories = [], currentIndex = 0, language = 'english', onIndexChange, onAdvance }: VoiceNarrationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [eventLog, setEventLog] = useState<string[]>([]);

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

  // helper to log events for testing
  const logEvent = (msg: string) => {
    setEventLog(prev => [msg, ...prev].slice(0, 50));
    console.log('[VoiceNarration]', msg);
  };

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
  // Speak the currently selected story (unified handler)
  const speakCurrentStory = (index = currentIndex) => {
    if (!isSupported || !synthRef.current) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    const storyToRead = (stories && stories[index]) || (() => {
      try {
        const stored = localStorage.getItem('latestStories');
        if (stored) {
          const arr = JSON.parse(stored);
          return arr[Number(localStorage.getItem('latestStoryIndex') || '0')];
        }
      } catch (e) { /* ignore */ }
      return null;
    })();

    if (!storyToRead || !storyToRead.story) {
      alert('No story available to read. Please generate stories first.');
      return;
    }

    // Always cancel ongoing speech before starting to avoid overlaps
    try { synthRef.current?.cancel(); } catch (e) { console.warn('Failed to cancel existing speech', e); }

    const utterance = new SpeechSynthesisUtterance(storyToRead.story);
    utteranceRef.current = utterance;

    const voice = getVoiceForLanguage(language);
    if (voice) utterance.voice = voice;

    utterance.rate = 0.9; utterance.pitch = 1; utterance.volume = 1;

    utterance.onstart = () => { setIsPlaying(true); logEvent(`start:index=${index}`); };
    utterance.onend = () => { setIsPlaying(false); utteranceRef.current = null; logEvent(`end:index=${index}`); };
    utterance.onerror = (error) => { console.error('Speech synthesis error:', error); setIsPlaying(false); utteranceRef.current = null; logEvent('error:' + (error?.error || String(error))); };

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
    if (isPlaying) handleStop(); else speakCurrentStory(currentIndex);
  };

  // Replay: always restart narration from beginning
  const handleReplay = () => { try { synthRef.current?.cancel(); } catch (e) {} ; speakCurrentStory(currentIndex); };

  // Next story: stop current narration, advance index and auto-narrate next
  const handleNext = () => {
    try { synthRef.current?.cancel(); } catch (e) {}
    setIsPlaying(false);
    // If parent provided onAdvance or onIndexChange, update parent state
    if (onAdvance) {
      onAdvance(1);
      // rely on effect to detect index change and auto-play
    } else if (onIndexChange) {
      const next = Math.min((currentIndex || 0) + 1, (stories?.length || 1) - 1);
      onIndexChange(next);
      // speak new story after slight delay
      setTimeout(() => speakCurrentStory(next), 150);
    } else {
      // local fallback: try to advance within supplied stories
      const next = Math.min((currentIndex || 0) + 1, (stories?.length || 1) - 1);
      setTimeout(() => speakCurrentStory(next), 150);
    }
  };

  // Auto-play when currentIndex changes
  useEffect(() => {
    if (!stories || stories.length === 0) return;
    // Auto-play the newly selected story
    speakCurrentStory(currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, stories]);

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
        <div className="flex items-center gap-2">
          <Button
            variant={isPlaying ? "destructive" : "default"}
            size="lg"
            className="h-12 px-4 gap-2"
            onClick={handleToggle}
            disabled={!(stories && stories.length > 0)}
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

          <Button
            variant="outline"
            size="lg"
            className="h-12 px-4 gap-2"
            onClick={handleReplay}
            disabled={!(stories && stories.length > 0)}
          >
            <Repeat className="w-5 h-5" />
            <span>Replay</span>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            className="h-12 px-4 gap-2"
            onClick={handleNext}
            disabled={!(stories && stories.length > 0)}
          >
            <SkipForward className="w-5 h-5" />
            <span>Next Story</span>
          </Button>
        </div>
      </div>
      {/* Event log for testing */}
      <div className="mt-3 text-xs text-muted-foreground">
        <div className="font-medium">Speech Events (latest first):</div>
        <div style={{maxHeight:120, overflow:'auto'}}>
          {eventLog.map((e, i) => (
            <div key={i}>{e}</div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default VoiceNarration;
