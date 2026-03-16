import React from 'react';
import { BookOpen, Bot } from 'lucide-react';

interface BottomNavProps {
  currentView: 'feed' | 'assistant';
  onChangeView: (view: 'feed' | 'assistant') => void;
}

export default function BottomNav({ currentView, onChangeView }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-paper border-t-2 border-ink z-40 h-[60px]">
      <div className="max-w-md mx-auto flex h-full">
        <button
          onClick={() => onChangeView('feed')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'feed' ? 'text-stamp' : 'text-ink/50 hover:text-ink'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-serif font-bold tracking-widest">食录</span>
        </button>
        <button
          onClick={() => onChangeView('assistant')}
          className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
            currentView === 'assistant' ? 'text-stamp' : 'text-ink/50 hover:text-ink'
          }`}
        >
          <Bot className="w-5 h-5" />
          <span className="text-[10px] font-serif font-bold tracking-widest">司膳</span>
        </button>
      </div>
    </div>
  );
}
