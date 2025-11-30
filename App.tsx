import React, { useState } from 'react';
import { ViewState, TestConfig, Phase1Result, Phase2Result, DEMO_KEYWORDS } from './types';
import { PRELOADED_IMAGES_A, PRELOADED_IMAGES_B } from './constants';
import { CreatorMode } from './components/CreatorMode';
import { ParticipantPhase1 } from './components/ParticipantPhase1';
import { ParticipantPhase2 } from './components/ParticipantPhase2';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { Link, Beaker } from 'lucide-react';

const App = () => {
  const [view, setView] = useState<ViewState>('creator');
  
  // App State
  const [testConfig, setTestConfig] = useState<TestConfig>({
    title: "Demo Project: Corporate vs Playful",
    keywords: DEMO_KEYWORDS,
    imagesA: PRELOADED_IMAGES_A,
    imagesB: PRELOADED_IMAGES_B
  });

  const [phase1Results, setPhase1Results] = useState<Phase1Result[]>([]);
  const [phase2Results, setPhase2Results] = useState<Phase2Result[]>([]);

  const handleStartTest = (config: TestConfig) => {
    setTestConfig(config);
    setView('landing'); // Move to "Share Link" view
  };

  const handlePhase1Complete = (results: Phase1Result[]) => {
    setPhase1Results(results);
    setView('phase2');
  };

  const handlePhase2Complete = (results: Phase2Result[]) => {
    setPhase2Results(results);
    setView('analysis');
  };

  const resetApp = () => {
    setPhase1Results([]);
    setPhase2Results([]);
    setView('creator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-indigo-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('creator')}>
            <div className="bg-primary text-white p-1.5 rounded-lg">
              <Beaker size={20} />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">VisuaLab<span className="text-primary">.AB</span></span>
          </div>
          
          <div className="flex gap-4 items-center text-sm">
             <span className={`px-2 py-1 rounded ${view === 'creator' ? 'bg-indigo-50 text-primary font-medium' : 'text-slate-400'}`}>Create</span>
             <span className="text-slate-300">/</span>
             <span className={`px-2 py-1 rounded ${['landing', 'phase1', 'phase2'].includes(view) ? 'bg-indigo-50 text-primary font-medium' : 'text-slate-400'}`}>Test</span>
             <span className="text-slate-300">/</span>
             <span className={`px-2 py-1 rounded ${view === 'analysis' ? 'bg-indigo-50 text-primary font-medium' : 'text-slate-400'}`}>Analyze</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {view === 'creator' && (
          <CreatorMode 
            onStartTest={handleStartTest} 
            initialConfig={testConfig}
          />
        )}

        {view === 'landing' && (
          <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 mt-10 text-center space-y-6 animate-fade-in">
             <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
               <Link size={32} />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-900">Test Ready</h2>
               <p className="text-slate-500 mt-2">
                 The unique link for <strong>"{testConfig.title}"</strong> has been generated.
               </p>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 break-all text-xs font-mono text-slate-500">
               https://visualab.app/t/{btoa(testConfig.title).substring(0, 12)}...
             </div>

             <div className="pt-4">
               <button 
                onClick={() => setView('phase1')}
                className="w-full bg-primary text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-600 transition-colors shadow-md shadow-indigo-200"
               >
                 Simulate Participant View
               </button>
               <p className="text-xs text-slate-400 mt-2">
                 (In a real app, you would send the link above to 20 users)
               </p>
             </div>
          </div>
        )}

        {view === 'phase1' && (
          <ParticipantPhase1 
            config={testConfig} 
            onComplete={handlePhase1Complete} 
          />
        )}

        {view === 'phase2' && (
          <ParticipantPhase2 
            config={testConfig} 
            onComplete={handlePhase2Complete} 
          />
        )}

        {view === 'analysis' && (
          <AnalysisDashboard 
            config={testConfig}
            phase1Data={phase1Results}
            phase2Data={phase2Results}
            onReset={resetApp}
          />
        )}
      </main>
    </div>
  );
};

export default App;