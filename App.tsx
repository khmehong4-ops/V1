
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TestState, TestCategory, TypingStats } from './types';
import { DEFAULT_TIME_LIMITS, FALLBACK_TEXTS } from './constants';
import { generateTestText } from './services/geminiService';
import TypingArea from './components/TypingArea';
import StatsCard from './components/StatsCard';
import ResultsView from './components/ResultsView';

const App: React.FC = () => {
  // Config State
  const [category, setCategory] = useState<TestCategory>(TestCategory.GENERAL);
  const [timeLimit, setTimeLimit] = useState<number>(60); // Default to 60s for longer tests
  
  // Game State
  const [testState, setTestState] = useState<TestState>(TestState.IDLE);
  const [targetText, setTargetText] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState<number>(timeLimit);
  const [userInput, setUserInput] = useState<string>('');
  
  // Stats State
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    rawWpm: 0,
    cpm: 0,
    longestWord: '',
    errors: 0,
    timeSpent: 0,
    totalWords: 0,
    history: []
  });

  const timerRef = useRef<number | null>(null);

  // Load Initial Text
  const loadText = useCallback(async (cat: TestCategory) => {
    setTestState(TestState.LOADING);
    try {
      const text = await generateTestText(cat, 400);
      setTargetText(text);
      setTestState(TestState.IDLE);
    } catch (err) {
      setTargetText(FALLBACK_TEXTS[cat]);
      setTestState(TestState.IDLE);
    }
  }, []);

  useEffect(() => {
    loadText(category);
  }, [loadText, category]);

  // Restart Test
  const resetTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(timeLimit);
    setTestState(TestState.IDLE);
    setStats({
      wpm: 0,
      accuracy: 100,
      rawWpm: 0,
      cpm: 0,
      longestWord: '',
      errors: 0,
      timeSpent: 0,
      totalWords: 0,
      history: []
    });
    setUserInput('');
    loadText(category);
  }, [timeLimit, category, loadText]);

  // Calculate WPM & Stats
  const calculateStats = useCallback((input: string, timePassed: number) => {
    if (timePassed === 0) return;

    const charsTyped = input.length;
    let errors = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== targetText[i]) errors++;
    }

    // Advanced Metrics Calculation
    const timeInMinutes = timePassed / 60;
    const rawWpm = Math.round((charsTyped / 5) / timeInMinutes);
    const netWpm = Math.max(0, Math.round(((charsTyped - errors) / 5) / timeInMinutes));
    const accuracy = charsTyped > 0 ? Math.round(((charsTyped - errors) / charsTyped) * 100) : 100;
    const cpm = Math.round(charsTyped / timeInMinutes);
    const totalWords = input.trim() === '' ? 0 : input.trim().split(/\s+/).length;

    // Longest Correct Word Calculation
    const words = input.split(' ');
    const targetWords = targetText.split(' ');
    let longestWord = stats.longestWord;

    words.forEach((word, idx) => {
      if (word === targetWords[idx] && word.length > (longestWord?.length || 0)) {
        longestWord = word;
      }
    });

    setStats(prev => ({
      ...prev,
      wpm: netWpm,
      rawWpm,
      cpm,
      longestWord,
      accuracy,
      errors,
      timeSpent: timePassed,
      totalWords,
      history: [...prev.history, { time: timePassed, wpm: netWpm }]
    }));
  }, [targetText, stats.longestWord]);

  // Timer Logic
  useEffect(() => {
    if (testState === TestState.RUNNING) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000) as unknown as number;
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState]);

  const startTest = () => {
    setTestState(TestState.RUNNING);
  };

  const finishTest = useCallback((finalInput?: string) => {
    const input = finalInput || userInput;
    const timeSpent = timeLimit - timeLeft;
    calculateStats(input, timeSpent || 1);
    setTestState(TestState.FINISHED);
  }, [userInput, timeLeft, timeLimit, calculateStats]);

  const handleUpdate = (data: { charsTyped: number; errors: number; currentInput: string }) => {
    setUserInput(data.currentInput);
    const elapsed = timeLimit - timeLeft;
    calculateStats(data.currentInput, elapsed || 0.1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto w-full flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20">
            <i className="fa-solid fa-keyboard text-white"></i>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
              TypeMaster <span className="text-sky-500">AI</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Pro Typing System</p>
          </div>
        </div>

        {testState !== TestState.FINISHED && (
          <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto max-w-full">
            {Object.values(TestCategory).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                disabled={testState === TestState.RUNNING || testState === TestState.LOADING}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  category === cat 
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                } disabled:opacity-50`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full flex flex-col">
        {testState === TestState.FINISHED ? (
          <ResultsView stats={stats} onRetry={resetTest} />
        ) : (
          <div className="space-y-12 animate-in fade-in duration-1000">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="col-span-1 bg-slate-900/50 border border-slate-800 p-4 rounded-2xl flex flex-col justify-center items-center">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Time Remaining</p>
                <p className={`text-4xl font-black transition-colors ${timeLeft < 10 ? 'text-rose-500 animate-pulse' : 'text-sky-400'}`}>
                  {timeLeft}s
                </p>
              </div>
              <div className="col-span-1">
                 <StatsCard label="Current WPM" value={stats.wpm} icon="fa-bolt" color="bg-amber-500/20 text-amber-500" />
              </div>
              <div className="col-span-1">
                 <StatsCard label="Accuracy" value={`${stats.accuracy}%`} icon="fa-bullseye" color="bg-emerald-500/20 text-emerald-500" />
              </div>
              <div className="col-span-1 flex flex-col justify-center items-center bg-slate-900/50 border border-slate-800 p-2 rounded-2xl space-y-1">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Test Duration</p>
                <div className="flex space-x-1">
                  {DEFAULT_TIME_LIMITS.map(limit => (
                    <button
                      key={limit}
                      onClick={() => {
                        setTimeLimit(limit);
                        setTimeLeft(limit);
                      }}
                      disabled={testState === TestState.RUNNING}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg text-xs font-bold border transition-all ${
                        timeLimit === limit 
                          ? 'bg-sky-500 border-sky-400 text-white' 
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                      } disabled:opacity-50`}
                    >
                      {limit}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
               <TypingArea 
                 text={targetText} 
                 testState={testState}
                 onStart={startTest}
                 onFinish={finishTest}
                 onUpdate={handleUpdate}
               />
               <div className="absolute -top-4 -right-4 w-24 h-24 bg-sky-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
               <div className="flex items-center space-x-6 text-slate-500 text-xs font-medium">
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-sky-500 mr-2"></span> Correct</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span> Incorrect</span>
                  <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-slate-600 mr-2"></span> Untyped</span>
               </div>
               
               <button 
                onClick={resetTest}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-lg hover:bg-slate-800"
               >
                 <i className="fa-solid fa-rotate-right"></i>
                 <span className="text-sm font-bold uppercase tracking-wider">Restart Test</span>
               </button>
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto w-full pt-12 pb-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] font-bold uppercase tracking-widest border-t border-slate-900 mt-12">
        <p>© 2024 TypeMaster AI Pro . AI-Enhanced Typing Experience</p>
      </footer>
    </div>
  );
};

export default App;
