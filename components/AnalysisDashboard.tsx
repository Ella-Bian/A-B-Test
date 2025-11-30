import React, { useMemo, useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { TestConfig, Phase1Result, Phase2Result } from '../types';
import { RotateCcw, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { getAllSessionsData, AllSessionsData } from '../utils/api';

interface AnalysisDashboardProps {
  config: TestConfig;
  phase1Data: Phase1Result[];
  phase2Data: Phase2Result[];
  onReset: () => void;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ 
  config, 
  phase1Data, 
  phase2Data,
  onReset 
}) => {
  const [allData, setAllData] = useState<AllSessionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 从后端加载所有用户数据
  useEffect(() => {
    const loadAllData = async () => {
      try {
        setLoading(true);
        const data = await getAllSessionsData();
        setAllData(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load all sessions data:', err);
        setError('无法加载所有用户数据，将显示当前会话数据');
        // 如果加载失败，使用传入的当前会话数据
        setAllData({
          sessions: [],
          phase1Results: phase1Data,
          phase2Results: phase2Data,
          totalParticipants: 1
        });
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // 使用所有用户的数据进行分析
  const aggregatedPhase1Data = useMemo(() => {
    return allData?.phase1Results || phase1Data;
  }, [allData, phase1Data]);

  const aggregatedPhase2Data = useMemo(() => {
    return allData?.phase2Results || phase2Data;
  }, [allData, phase2Data]);
  // --- Data Processing for Semantic Fit (Phase 1) ---
  const semanticFitData = useMemo(() => {
    return config.keywords.map(kw => {
      const getRate = (group: 'A' | 'B') => {
        const trials = aggregatedPhase1Data.filter(r => r.group === group && r.keyword === kw);
        if (trials.length === 0) return 0;
        const matches = trials.filter(r => r.isMatch).length;
        return (matches / trials.length) * 100;
      };
      
      return {
        keyword: kw,
        GroupA: parseFloat(getRate('A').toFixed(1)),
        GroupB: parseFloat(getRate('B').toFixed(1)),
      };
    });
  }, [config.keywords, aggregatedPhase1Data]);

  // --- Data Processing for Cognitive Fluency (Phase 1) ---
  const fluencyData = useMemo(() => {
    return config.keywords.map(kw => {
      const getAvgTime = (group: 'A' | 'B') => {
        // Only count trials where the user said YES (Match)
        const matches = aggregatedPhase1Data.filter(r => r.group === group && r.keyword === kw && r.isMatch);
        if (matches.length === 0) return 0;
        const totalTime = matches.reduce((acc, curr) => acc + curr.reactionTimeMs, 0);
        return Math.round(totalTime / matches.length);
      };

      return {
        keyword: kw,
        GroupA: getAvgTime('A'),
        GroupB: getAvgTime('B'),
      };
    });
  }, [config.keywords, aggregatedPhase1Data]);

  // --- Data Processing for Global Association (Phase 2) ---
  const impressionData = useMemo(() => {
    // 聚合所有用户的Phase2数据
    return config.keywords.map(kw => {
      const getScore = (group: 'A' | 'B') => {
        // 统计选择该关键词的用户数量
        const results = aggregatedPhase2Data.filter(p => p.group === group);
        if (results.length === 0) return 0;
        const selectedCount = results.filter(p => p.selectedKeywords.includes(kw)).length;
        return (selectedCount / results.length) * 100;
      };

      return {
        keyword: kw,
        GroupA: parseFloat(getScore('A').toFixed(1)),
        GroupB: parseFloat(getScore('B').toFixed(1)),
        fullMark: 100,
      };
    });
  }, [config.keywords, aggregatedPhase2Data]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-12 animate-fade-in pb-20">
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="animate-spin text-primary" size={48} />
          <p className="text-slate-600">正在加载所有用户数据...</p>
        </div>
      </div>
    );
  }

  const totalParticipants = allData?.totalParticipants || 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-12 animate-fade-in pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analysis Report</h1>
          <p className="text-slate-500">
            Quantitative insights for {config.title}
            {totalParticipants > 1 && (
              <span className="ml-2 text-primary font-semibold">
                ({totalParticipants} participants)
              </span>
            )}
          </p>
          {error && (
            <p className="text-sm text-amber-600 mt-1">{error}</p>
          )}
        </div>
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw size={16} /> New Test
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Chart 1: Semantic Fit */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Semantic Fit (%)</h3>
            <p className="text-sm text-slate-500">
              How frequently users agreed the image matched the keyword. Higher is better.
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={semanticFitData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="keyword" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="GroupA" name="Group A" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GroupB" name="Group B" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cognitive Fluency */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Cognitive Fluency (ms)</h3>
            <p className="text-sm text-slate-500">
              Response time for positive matches. Lower time = more intuitive design.
            </p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluencyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="keyword" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Legend />
                <Bar dataKey="GroupA" name="Group A" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="GroupB" name="Group B" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Global Impression (Radar) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Holistic Impression</h3>
              <p className="text-sm text-slate-500">
                Overlap of keywords selected for the entire collection (Phase 2).
              </p>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={impressionData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="keyword" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <Radar name="Group A" dataKey="GroupA" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                <Radar name="Group B" dataKey="GroupB" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};