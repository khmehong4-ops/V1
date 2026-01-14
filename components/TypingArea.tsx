
import React, { useState, useEffect, useRef } from 'react';
import { TestState } from '../types';

interface TypingAreaProps {
  text: string;
  testState: TestState;
  onStart: () => void;
  onFinish: (userInput: string) => void;
  onUpdate: (stats: { charsTyped: number; errors: number; currentInput: string }) => void;
}

const TypingArea: React.FC<TypingAreaProps> = ({ text, testState, onStart, onFinish, onUpdate }) => {
  const [userInput, setUserInput] = useState('');
  const [errors, setErrors] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeCharRef = useRef<HTMLSpanElement>(null);
  
  // Focus input when clicking anywhere on the typing area
  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (testState === TestState.IDLE && value.length > 0) {
      onStart();
    }

    if (testState === TestState.RUNNING || testState === TestState.IDLE) {
      if (value.length <= text.length) {
        setUserInput(value);
        
        let currentErrors = 0;
        for (let i = 0; i < value.length; i++) {
          if (value[i] !== text[i]) {
            currentErrors++;
          }
        }
        setErrors(currentErrors);
        
        onUpdate({ 
          charsTyped: value.length, 
          errors: currentErrors,
          currentInput: value 
        });

        if (value.length === text.length) {
          onFinish(value);
        }
      }
    }
  };

  // Scroll logic to keep the active character visible within 2 lines
  useEffect(() => {
    if (activeCharRef.current && containerRef.current) {
      const activeElement = activeCharRef.current;
      const container = containerRef.current;
      
      // Calculate the vertical position relative to the container
      const offsetTop = activeElement.offsetTop;
      
      // We want to keep the active line at the top or middle of our 2-line view
      // Each line is roughly 40px with leading-relaxed
      // If we are past the first line, we scroll to hide the previous ones
      if (offsetTop > 40) {
        container.scrollTop = offsetTop - 40;
      } else {
        container.scrollTop = 0;
      }
    }
  }, [userInput]);

  useEffect(() => {
    if (testState === TestState.IDLE || testState === TestState.RUNNING) {
      inputRef.current?.focus();
    }
  }, [testState]);

  useEffect(() => {
    setUserInput('');
    setErrors(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [text]);

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto cursor-text p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-2xl"
      onClick={handleClick}
    >
      {/* Hidden Input */}
      <input
        ref={inputRef}
        type="text"
        className="opacity-0 absolute inset-0 -z-10"
        value={userInput}
        onChange={handleInputChange}
        autoFocus
      />

      {/* 
          Text Viewport: 
          - h-[84px] is roughly 2 lines for text-2xl with leading-relaxed
          - overflow-hidden hides the rest of the lines
          - scroll-smooth for a nice transition
      */}
      <div 
        ref={containerRef}
        className="mono text-2xl leading-relaxed text-slate-500 relative select-none h-[84px] overflow-hidden scroll-smooth transition-all duration-300"
      >
        <div className="flex flex-wrap">
          {text.split('').map((char, index) => {
            let className = "transition-colors duration-150 ";
            const isTyped = index < userInput.length;
            const isCurrent = index === userInput.length;
            const isCorrect = isTyped && userInput[index] === char;

            if (isTyped) {
              className += isCorrect ? "text-sky-400" : "text-rose-500 bg-rose-500/20";
            }
            
            return (
              <span 
                key={index} 
                ref={isCurrent ? activeCharRef : null}
                className={className}
              >
                {isCurrent && <span className="caret absolute">&nbsp;</span>}
                {char === ' ' ? '\u00A0' : char}
              </span>
            );
          })}
          {userInput.length === text.length && (
            <span ref={activeCharRef} className="caret absolute">&nbsp;</span>
          )}
        </div>
      </div>

      {testState === TestState.IDLE && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-2xl">
          <div className="bg-slate-800 px-6 py-3 rounded-full border border-slate-700 animate-pulse text-sky-400 font-medium">
            ចុចទីនេះដើម្បីចាប់ផ្ដើម...
          </div>
        </div>
      )}
      
      {testState === TestState.LOADING && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-[1px] rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-300 font-medium animate-pulse">កំពុងបង្កើតអត្ថបទ...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingArea;
