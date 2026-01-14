
import React, { useEffect, useState } from 'react';
import { TypingStats, AIFeedback } from '../types';
import { getAIFeedback } from '../services/geminiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ResultsViewProps {
  stats: TypingStats;
  onRetry: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ stats, onRetry }) => {
  const [aiFeedback, setAiFeedback] = useState<AIFeedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(true);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoadingFeedback(true);
      const feedback = await getAIFeedback(stats);
      setAiFeedback(feedback);
      setLoadingFeedback(false);
    };
    fetchFeedback();
  }, [stats]);

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="text-center">
        <h2 className="text-4xl font-black text-white mb-2 italic">TEST COMPLETE!</h2>
        <p className="text-slate-400 uppercase text-xs font-bold tracking-[0.2em]">Session Performance Analytics</p>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        <div className="bg-slate-800/40 border-b-4 border-b-sky-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Words Per Min</p>
          <p className="text-4xl font-black text-white">{stats.wpm}</p>
        </div>
        <div className="bg-slate-800/40 border-b-4 border-b-emerald-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Accuracy Score</p>
          <p className="text-4xl font-black text-white">{stats.accuracy}%</p>
        </div>
        <div className="bg-slate-800/40 border-b-4 border-b-rose-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Errors</p>
          <p className="text-4xl font-black text-white">{stats.errors}</p>
        </div>
        <div className="bg-slate-800/40 border-b-4 border-b-amber-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Elapsed Time</p>
          <p className="text-4xl font-black text-white">{stats.timeSpent}s</p>
        </div>
        <div className="bg-slate-800/40 border-b-4 border-b-violet-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Word Count</p>
          <p className="text-4xl font-black text-white">{stats.totalWords}</p>
        </div>
        <div className="bg-slate-800/40 border-b-4 border-b-indigo-500 border border-slate-700 p-6 rounded-2xl text-center group hover:bg-slate-800/60 transition-all">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Longest Word</p>
          <p className={`font-black text-white leading-tight ${stats.longestWord?.length > 10 ? 'text-xl' : 'text-3xl'}`}>
            {stats.longestWord || 'N/A'}
          </p>
        </div>
      </div>

      {/* Advanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
              <i className="fa-solid fa-keyboard text-xl"></i>
            </div>
            <div>
              <p className="text-indigo-400/60 text-[10px] font-black uppercase tracking-widest">Characters Per Min</p>
              <p className="text-2xl font-black text-indigo-100">{stats.cpm} <span className="text-sm font-normal text-indigo-400/50">CPM</span></p>
            </div>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs text-indigo-400/40 font-mono italic">Raw typing speed</div>
          </div>
        </div>
        
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-800/60 rounded-xl flex items-center justify-center text-slate-400">
              <i className="fa-solid fa-gauge-high text-xl"></i>
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Raw Words Per Min</p>
              <p className="text-2xl font-black text-slate-200">{stats.rawWpm} <span className="text-sm font-normal text-slate-500">RAW</span></p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gross Speed</div>
        </div>
      </div>

      {/* Chart and AI Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-xl">
          <h3 className="text-sm font-black text-slate-400 mb-8 uppercase tracking-[0.3em] flex items-center">
            <i className="fa-solid fa-chart-line mr-3 text-sky-400"></i>
            Velocity Over Time
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#475569" 
                  tick={{fontSize: 10, fontWeight: 700}} 
                  label={{ value: 'SECONDS', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 10, fontWeight: 800 }}
                />
                <YAxis 
                  stroke="#475569" 
                  tick={{fontSize: 10, fontWeight: 700}} 
                  label={{ value: 'WPM', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10, fontWeight: 800 }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                  itemStyle={{ color: '#38bdf8', fontWeight: 800 }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wpm" 
                  stroke="#38bdf8" 
                  strokeWidth={4} 
                  dot={{ r: 0 }}
                  activeDot={{ r: 6, fill: '#38bdf8', stroke: '#0f172a', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-3xl flex flex-col shadow-xl">
          <h3 className="text-sm font-black text-indigo-400 mb-8 uppercase tracking-[0.3em] flex items-center">
            <i className="fa-solid fa-microchip mr-3"></i>
            AI PERFORMANCE REVIEW
          </h3>
          
          {loadingFeedback ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                </div>
              </div>
              <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest animate-pulse">Deep Learning Analysis...</p>
            </div>
          ) : (
            <div className="flex-1 space-y-8">
              <div className="bg-indigo-500/10 p-5 rounded-2xl border-l-4 border-indigo-500 italic text-indigo-100 text-sm leading-relaxed">
                "{aiFeedback?.encouragement}"
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-indigo-400 tracking-[0.2em]">Actionable Improvements:</p>
                {aiFeedback?.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start space-x-3 group">
                    <div className="mt-1 flex-shrink-0 w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center text-[10px] font-black border border-indigo-500/30 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 text-xs font-medium leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onRetry}
          className="group relative px-10 py-5 bg-sky-500 hover:bg-sky-400 text-white font-black rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-2xl shadow-sky-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <span className="flex items-center uppercase tracking-widest text-sm relative z-10">
            <i className="fa-solid fa-rotate-right mr-3 group-hover:rotate-180 transition-transform duration-700"></i>
            Initialize New Test
          </span>
        </button>
      </div>
    </div>
  );
};

export default ResultsView;
