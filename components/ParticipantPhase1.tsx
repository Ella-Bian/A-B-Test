import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from './Button';
import { TestConfig, Phase1Result, ImageAsset } from '../types';

interface ParticipantPhase1Props {
  config: TestConfig;
  onComplete: (results: Phase1Result[]) => void;
}

interface Trial {
  image: ImageAsset;
  keyword: string;
}

export const ParticipantPhase1: React.FC<ParticipantPhase1Props> = ({ config, onComplete }) => {
  const [trials, setTrials] = useState<Trial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<Phase1Result[]>([]);
  const [isReady, setIsReady] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Initialize Trials
  useEffect(() => {
    // Generate all combinations: (All Images A + All Images B) * All Keywords
    const allImages = [...config.imagesA, ...config.imagesB];
    let generatedTrials: Trial[] = [];

    // To prevent fatigue, we might limit trials if there are too many combinations.
    // For this MVP, we do full factorial but limit repetition if > 3 keywords.
    
    allImages.forEach(img => {
      config.keywords.forEach(kw => {
        generatedTrials.push({ image: img, keyword: kw });
      });
    });

    // Shuffle (Fisher-Yates)
    for (let i = generatedTrials.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [generatedTrials[i], generatedTrials[j]] = [generatedTrials[j], generatedTrials[i]];
    }

    setTrials(generatedTrials);
  }, [config]);

  const handleStart = () => {
    setIsReady(true);
    startTimeRef.current = performance.now();
  };

  const handleResponse = useCallback((isMatch: boolean) => {
    const endTime = performance.now();
    const reactionTime = endTime - startTimeRef.current;
    
    const currentTrial = trials[currentIndex];
    
    const result: Phase1Result = {
      imageId: currentTrial.image.id,
      group: currentTrial.image.group,
      keyword: currentTrial.keyword,
      isMatch,
      reactionTimeMs: reactionTime,
      timestamp: Date.now()
    };

    setResults(prev => {
      const newResults = [...prev, result];
      if (currentIndex + 1 >= trials.length) {
        // Defer completion slightly to allow state update
        setTimeout(() => onComplete(newResults), 0);
      }
      return newResults;
    });

    if (currentIndex + 1 < trials.length) {
      setCurrentIndex(prev => prev + 1);
      startTimeRef.current = performance.now();
    }
  }, [trials, currentIndex, onComplete]);

  // Keyboard support
  useEffect(() => {
    if (!isReady) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleResponse(false); // No
      if (e.key === 'ArrowRight') handleResponse(true); // Yes
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReady, handleResponse]);

  if (!isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto space-y-8 animate-fade-in">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Part 1: Quick Response</h2>
          <p className="text-slate-600">
            You will see an image and a word. 
            <br />
            Press <strong className="text-primary">NO (Left)</strong> or <strong className="text-primary">YES (Right)</strong> as quickly as possible based on your first impression.
          </p>
          <div className="bg-slate-100 p-4 rounded-lg text-sm text-slate-500">
            Total Trials: {trials.length}
          </div>
        </div>
        <Button size="lg" onClick={handleStart} className="w-full">Start Part 1</Button>
      </div>
    );
  }

  if (currentIndex >= trials.length) return <div className="text-center p-10">Processing...</div>;

  const currentTrial = trials[currentIndex];

  return (
    <div className="flex flex-col h-screen max-h-[800px] overflow-hidden">
      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100">
        <div 
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${((currentIndex) / trials.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-8">
        {/* Stimulus Image */}
        <div className="relative w-full max-w-md aspect-square bg-slate-50 rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-200">
          <img 
            src={currentTrial.image.url} 
            alt="Stimulus" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Stimulus Keyword */}
        <div className="text-center space-y-2">
          <span className="text-sm uppercase tracking-widest text-slate-400 font-semibold">Does this fit?</span>
          <h2 className="text-4xl font-bold text-slate-900">
            {currentTrial.keyword}
          </h2>
        </div>

        {/* Controls */}
        <div className="flex gap-4 w-full max-w-md pt-4">
          <button 
            onClick={() => handleResponse(false)}
            className="flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-slate-200 hover:border-red-400 hover:bg-red-50 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <X className="text-slate-600 group-hover:text-red-600" size={24} />
            </div>
            <span className="font-bold text-slate-600 group-hover:text-red-700">NO</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Press Left Arrow</span>
          </button>

          <button 
            onClick={() => handleResponse(true)}
            className="flex-1 flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all active:scale-95 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Check className="text-slate-600 group-hover:text-green-600" size={24} />
            </div>
            <span className="font-bold text-slate-600 group-hover:text-green-700">YES</span>
            <span className="text-xs text-slate-400 hidden sm:inline">Press Right Arrow</span>
          </button>
        </div>
      </div>
    </div>
  );
};