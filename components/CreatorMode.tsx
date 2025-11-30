import React, { useState, useRef } from 'react';
import { Plus, X, Upload, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { Button } from './Button';
import { ImageAsset, TestConfig } from '../types';

interface CreatorModeProps {
  onStartTest: (config: TestConfig) => void;
  initialConfig?: TestConfig;
}

export const CreatorMode: React.FC<CreatorModeProps> = ({ onStartTest, initialConfig }) => {
  const [title, setTitle] = useState(initialConfig?.title || "Project Alpha vs Beta");
  const [keywords, setKeywords] = useState<string[]>(initialConfig?.keywords || []);
  const [newKeyword, setNewKeyword] = useState("");
  const [imagesA, setImagesA] = useState<ImageAsset[]>(initialConfig?.imagesA || []);
  const [imagesB, setImagesB] = useState<ImageAsset[]>(initialConfig?.imagesB || []);
  
  // Use simple random ID generation for local usage
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter(k => k !== kw));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, group: 'A' | 'B') => {
    if (e.target.files) {
      const newImages: ImageAsset[] = Array.from(e.target.files).map((file: File) => ({
        id: generateId(),
        url: URL.createObjectURL(file),
        group
      }));
      
      if (group === 'A') setImagesA([...imagesA, ...newImages]);
      else setImagesB([...imagesB, ...newImages]);
    }
  };

  const removeImage = (id: string, group: 'A' | 'B') => {
    if (group === 'A') setImagesA(imagesA.filter(i => i.id !== id));
    else setImagesB(imagesB.filter(i => i.id !== id));
  };

  const canStart = keywords.length >= 3 && imagesA.length > 0 && imagesB.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900">Create Perception Test</h1>
        <p className="text-slate-500">Configure your A/B test with assets and semantic benchmarks.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        {/* Project Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="e.g. Fintech App Redesign 2024"
          />
        </div>

        {/* Keywords */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Semantic Keywords (3-5 required)
          </label>
          <p className="text-xs text-slate-500 mb-2">Adjectives you want to test (e.g., Secure, Friendly, Modern).</p>
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type adjective and press Enter"
            />
            <Button onClick={handleAddKeyword} variant="secondary">Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map(k => (
              <span key={k} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                {k}
                <button onClick={() => removeKeyword(k)} className="hover:text-indigo-900"><X size={14} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Image Upload Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Group A */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-groupA flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-groupA"></span> Group A
            </h3>
            <span className="text-xs text-slate-400">{imagesA.length} images</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 min-h-[120px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4">
             {imagesA.map(img => (
               <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                 <img src={img.url} alt="A" className="w-full h-full object-cover" />
                 <button 
                   onClick={() => removeImage(img.id, 'A')}
                   className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <X size={12} />
                 </button>
               </div>
             ))}
             <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
               <Upload size={24} className="text-slate-400 mb-1" />
               <span className="text-xs text-slate-500">Upload</span>
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'A')} />
             </label>
          </div>
        </div>

        {/* Group B */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-groupB flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-groupB"></span> Group B
            </h3>
            <span className="text-xs text-slate-400">{imagesB.length} images</span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 min-h-[120px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4">
             {imagesB.map(img => (
               <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                 <img src={img.url} alt="B" className="w-full h-full object-cover" />
                 <button 
                   onClick={() => removeImage(img.id, 'B')}
                   className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                   <X size={12} />
                 </button>
               </div>
             ))}
             <label className="flex flex-col items-center justify-center aspect-square rounded-lg border border-slate-300 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
               <Upload size={24} className="text-slate-400 mb-1" />
               <span className="text-xs text-slate-500">Upload</span>
               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'B')} />
             </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-200">
        <Button 
          disabled={!canStart} 
          onClick={() => onStartTest({ title, keywords, imagesA, imagesB })}
          size="lg"
          className="gap-2"
        >
          Generate Test & Start <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};