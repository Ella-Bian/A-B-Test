import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { TestConfig, Phase2Result } from '../types';

interface ParticipantPhase2Props {
  config: TestConfig;
  onComplete: (results: Phase2Result[]) => void;
}

export const ParticipantPhase2: React.FC<ParticipantPhase2Props> = ({ config, onComplete }) => {
  const [currentGroup, setCurrentGroup] = useState<'A' | 'B'>('A');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [results, setResults] = useState<Phase2Result[]>([]);

  // Randomize group order slightly or keep fixed? Fixed A then B for simplicity in MVP flow.
  // Actually, randomizing order of A/B block would be better scientifically, but let's stick to simple flow A -> B.
  
  const currentImages = currentGroup === 'A' ? config.imagesA : config.imagesB;
  const groupColor = currentGroup === 'A' ? 'text-groupA' : 'text-groupB';
  const groupBg = currentGroup === 'A' ? 'bg-groupA' : 'bg-groupB';

  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== kw));
    } else {
      setSelectedKeywords([...selectedKeywords, kw]);
    }
  };

  const handleNext = () => {
    const result: Phase2Result = {
      group: currentGroup,
      selectedKeywords: [...selectedKeywords]
    };
    
    if (currentGroup === 'A') {
      setResults([result]);
      setCurrentGroup('B');
      setSelectedKeywords([]);
      window.scrollTo(0, 0);
    } else {
      // Done
      onComplete([...results, result]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 animate-fade-in space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Part 2: Overall Impression</h2>
        <p className="text-slate-600">
          Look at this collection of images. Select ALL words that fit this set.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className={`h-1 w-full ${groupBg} opacity-20`}></div>
        <div className="p-6">
          {/* Gallery */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {currentImages.map(img => (
              <div key={img.id} className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                <img src={img.url} alt="Set Item" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>

          <hr className="border-slate-100 my-6" />

          {/* Keyword Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700">Which words describe this set?</h3>
            <div className="flex flex-wrap gap-3">
              {config.keywords.map(kw => {
                const isSelected = selectedKeywords.includes(kw);
                return (
                  <button
                    key={kw}
                    onClick={() => toggleKeyword(kw)}
                    className={`
                      px-4 py-2 rounded-full border text-sm font-medium transition-all
                      ${isSelected 
                        ? `${groupBg} text-white border-transparent shadow-md transform scale-105` 
                        : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400'
                      }
                    `}
                  >
                    {kw}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} size="lg" className="gap-2">
          {currentGroup === 'A' ? 'Next Collection' : 'Submit All'} <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};