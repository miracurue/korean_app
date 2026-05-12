import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface PageHeaderProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  /** Optional controls rendered on the right side of the header */
  rightSlot?: React.ReactNode;
}

/**
 * Uniform transparent dark header used across all full-screen players and readers.
 * Provides a back button, title/subtitle, and an optional right-side slot for controls.
 */
export default function PageHeader({ onBack, title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <header className="h-16 flex flex-shrink-0 items-center px-6 md:px-8 bg-transparent justify-between">
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onBack}
          aria-label="Назад"
          className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5 flex-shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-bold text-white leading-tight truncate max-w-sm">{title}</h1>
          {subtitle && (
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{subtitle}</span>
          )}
        </div>
      </div>
      {rightSlot && <div className="flex items-center gap-2 flex-shrink-0">{rightSlot}</div>}
    </header>
  );
}
