import { Plus, Minus } from 'lucide-react';

interface FontSizeControlProps {
  fontSize: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (newSize: number) => void;
}

/**
 * A small pill containing [−] size [+] buttons.
 * Used identically in PoemReader and QuoteReader.
 */
export default function FontSizeControl({
  fontSize,
  min = 12,
  max = 64,
  step = 2,
  onChange,
}: FontSizeControlProps) {
  return (
    <div className="flex items-center gap-1 bg-zinc-900/50 border border-zinc-800 rounded-xl p-1 shrink-0">
      <button
        onClick={() => onChange(Math.max(min, fontSize - step))}
        aria-label="Уменьшить шрифт"
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Minus size={16} />
      </button>
      <div className="w-8 text-center text-[11px] font-bold text-zinc-500 tabular-nums select-none">
        {fontSize}
      </div>
      <button
        onClick={() => onChange(Math.min(max, fontSize + step))}
        aria-label="Увеличить шрифт"
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
