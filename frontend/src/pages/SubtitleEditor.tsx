import { useState, useRef, useCallback, useEffect } from 'react';
import {
  FileVideo,
  FileText,
  Clock,
  Save,
  Download,
  Play,
  SkipBack,
} from 'lucide-react';

// ============================================================
// Helpers
// ============================================================

/** Format seconds → HH:MM:SS,mmm */
function formatSrtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

/** Parse [HH:MM:SS,mmm] → seconds. Returns null if not found. */
function parseTimestamp(str: string): number | null {
  const match = str.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
  if (!match) return null;
  return (
    parseInt(match[1]) * 3600 +
    parseInt(match[2]) * 60 +
    parseInt(match[3]) +
    parseInt(match[4]) / 1000
  );
}

/** Find the index of the first line without a timestamp prefix */
function findNextUntimedLine(text: string): number {
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length === 0) continue;
    if (!line.startsWith('[')) return i;
    // Check if bracket content is a valid timestamp
    const closeBracket = line.indexOf(']');
    if (closeBracket === -1) return i;
    const inner = line.slice(1, closeBracket);
    if (!/\d{2}:\d{2}:\d{2},\d{3}/.test(inner)) return i;
  }
  return -1; // all lines have timestamps
}

/** Stamp a timestamp on the first untimed line */
function stampLine(text: string, time: number): string {
  const lines = text.split('\n');
  const idx = findNextUntimedLine(text);
  if (idx === -1) return text; // nothing to stamp

  const line = lines[idx].trim();
  lines[idx] = `[${formatSrtTime(time)}]${line}`;
  return lines.join('\n');
}

/** Generate SRT content from textarea format [HH:MM:SS,mmm]text */
function generateSrt(text: string): string {
  const lines = text.split('\n').filter(l => l.trim().length > 0);

  interface TimedLine {
    time: number;
    text: string;
  }

  const timed: TimedLine[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const match = trimmed.match(/^\[(\d{2}:\d{2}:\d{2},\d{3})\]\s*(.*)/);
    if (match) {
      const t = parseTimestamp(match[1]);
      if (t !== null) {
        timed.push({ time: t, text: match[2].trim() });
      }
    } else {
      // Line without timestamp — skip in SRT
      continue;
    }
  }

  const srtBlocks: string[] = [];
  for (let i = 0; i < timed.length; i++) {
    const start = timed[i].time;
    const end = i < timed.length - 1 ? timed[i + 1].time : start + 3;
    srtBlocks.push(
      `${i + 1}\n${formatSrtTime(start)} --> ${formatSrtTime(end)}\n${timed[i].text}\n`,
    );
  }

  return srtBlocks.join('\n');
}

/** Download a string as a file */
function downloadFile(filename: string, content: string, mime: string = 'text/plain') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Parse SRT content → internal [HH:MM:SS,mmm]text format */
function parseSrtToInternal(srtContent: string): string {
  const lines = srtContent.trim().split(/\r?\n/);
  const result: string[] = [];

  let i = 0;
  while (i < lines.length) {
    let line = lines[i].trim();

    // Skip empty lines and numeric cue IDs
    if (!line || /^\d+$/.test(line)) {
      i++;
      continue;
    }

    // Timestamp line: 00:00:01,000 --> 00:00:04,000
    if (line.includes('-->')) {
      const parts = line.split('-->');
      const startStr = parts[0]?.trim();
      // Extract start timestamp (keep commas as-is, already in SRT format)
      const timestampMatch = startStr?.match(/(\d{2}:\d{2}:\d{2}[,.]\d{3})/);
      const timestamp = timestampMatch ? timestampMatch[1].replace('.', ',') : '00:00:00,000';

      // Collect subtitle text lines until empty line
      i++;
      const textParts: string[] = [];
      while (i < lines.length && lines[i].trim() !== '') {
        textParts.push(lines[i].trim());
        i++;
      }

      if (textParts.length > 0) {
        result.push(`[${timestamp}]${textParts.join(' ')}`);
      }
    } else {
      i++;
    }
  }

  return result.join('\n');
}

/** Extract base name from video file name (without extension) */
function baseName(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(0, dot) : filename;
}

// ============================================================
// Component
// ============================================================
export default function SubtitleEditor() {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [text, setText] = useState('');
  const [videoName, setVideoName] = useState('untitled');

  const videoRef = useRef<HTMLVideoElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ============================================================
  // Video selection
  // ============================================================
  const handleVideoSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous URL
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setVideoName(baseName(file.name));
  }, [videoUrl]);

  // ============================================================
  // Text file loading
  // ============================================================
  const handleTextFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'srt') {
        setText(parseSrtToInternal(content));
      } else {
        setText(content);
      }
    } catch {
      console.error('Failed to read text file');
    }
  }, []);

  // ============================================================
  // Stamp timestamp
  // ============================================================
  const handleStamp = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    // First line auto-zero: if text is empty or has no timestamps yet
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const hasAnyTimestamp = lines.some(l => /^\[\d{2}:\d{2}:\d{2},\d{3}\]/.test(l.trim()));

    if (!hasAnyTimestamp && lines.length > 0) {
      // First stamp: set line 1 to 00:00:00,000 if no timestamp exists
      const currentText = text;
      const allLines = currentText.split('\n');
      const firstNonEmpty = allLines.findIndex(l => l.trim().length > 0);
      if (firstNonEmpty !== -1 && !allLines[firstNonEmpty].trim().startsWith('[')) {
        allLines[firstNonEmpty] = `[00:00:00,000]${allLines[firstNonEmpty].trim()}`;
        setText(allLines.join('\n'));
        return;
      }
    }

    // Get current time from video
    const currentTime = video.currentTime;
    const newText = stampLine(text, currentTime);
    setText(newText);

    // Scroll textarea to show the stamped line
    requestAnimationFrame(() => {
      const idx = findNextUntimedLine(newText);
      if (idx !== -1 && textareaRef.current) {
        const lineCount = newText.split('\n').length;
        // Approximate scroll position
        const lineHeight = 24;
        textareaRef.current.scrollTop = Math.min(
          idx * lineHeight,
          lineCount * lineHeight,
        );
      }
    });
  }, [text]);

  // ============================================================
  // Auto-stamp first line on initial text load
  // ============================================================
  const handleInitializeText = useCallback(() => {
    if (!text.trim()) return;
    const lines = text.split('\n');
    const hasAnyTimestamp = lines.some(l => /^\[\d{2}:\d{2}:\d{2},\d{3}\]/.test(l.trim()));

    if (!hasAnyTimestamp) {
      // Add [00:00:00,000] to the first non-empty line
      const newLines = [...lines];
      const firstNonEmpty = newLines.findIndex(l => l.trim().length > 0);
      if (firstNonEmpty !== -1) {
        newLines[firstNonEmpty] = `[00:00:00,000]${newLines[firstNonEmpty].trimStart()}`;
        setText(newLines.join('\n'));
      }
    }
  }, [text]);

  // ============================================================
  // Save SRT
  // ============================================================
  const handleSaveSrt = useCallback(() => {
    const srtContent = generateSrt(text);
    downloadFile(`${videoName}-sub.srt`, srtContent);
  }, [text, videoName]);

  // ============================================================
  // Save TXT
  // ============================================================
  const handleSaveTxt = useCallback(() => {
    downloadFile(`${videoName}-sub.txt`, text);
  }, [text, videoName]);

  // ============================================================
  // Keyboard shortcut: Ctrl+Enter to stamp
  // ============================================================
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only when not typing in textarea
      if (e.target === textareaRef.current) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleStamp();
      }
    },
    [handleStamp],
  );

  // Register global keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // ============================================================
  // Computed
  // ============================================================
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  const timedCount = lines.filter(l => /^\[\d{2}:\d{2}:\d{2},\d{3}\]/.test(l.trim())).length;
  const untimedCount = lines.length - timedCount;

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-brand-cyan/10 flex items-center justify-center">
          <Clock className="w-7 h-7 text-brand-cyan" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Редактор субтитров
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Загрузите видео и текст, проставьте тайминги, сохраните SRT
          </p>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => videoInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-cyan/10 text-brand-cyan rounded-xl font-medium hover:bg-brand-cyan/20 transition-colors"
        >
          <FileVideo className="w-5 h-5" />
          Выбрать видео
        </button>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={handleVideoSelect}
        />

        <button
          onClick={() => textInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-gold/10 text-brand-gold rounded-xl font-medium hover:bg-brand-gold/20 transition-colors"
        >
          <FileText className="w-5 h-5" />
          Загрузить .txt / .srt
        </button>
        <input
          ref={textInputRef}
          type="file"
          accept=".txt,.srt"
          className="hidden"
          onChange={handleTextFile}
        />

        {videoFile && (
          <span className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-600 dark:text-slate-300">
            <FileVideo className="w-4 h-4 text-brand-cyan" />
            {videoFile.name}
            <span className="text-xs text-slate-400">
              ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
            </span>
          </span>
        )}
      </div>

      {/* Main content: video + textarea side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video player */}
        <div className="space-y-3">
          <div className="bg-black rounded-2xl overflow-hidden aspect-video flex items-center justify-center">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <FileVideo className="w-16 h-16 opacity-30" />
                <p className="text-sm">Выберите видеофайл</p>
              </div>
            )}
          </div>

          {/* Quick controls under video */}
          {videoUrl && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const v = videoRef.current;
                  if (v) {
                    if (v.paused) v.play();
                    else v.pause();
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Play className="w-4 h-4" />
                Play/Pause
              </button>
              <button
                onClick={() => {
                  const v = videoRef.current;
                  if (v) v.currentTime = Math.max(0, v.currentTime - 3);
                }}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <SkipBack className="w-4 h-4" />
                -3 сек
              </button>
              <span className="text-xs text-slate-400 ml-auto">
                Пробел или Enter —stamp время
              </span>
            </div>
          )}
        </div>

        {/* Right: Text area */}
        <div className="space-y-3">
          {/* Stamp button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleStamp}
              disabled={!videoUrl || !text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand-cyan text-white font-bold rounded-xl hover:bg-brand-cyan/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Clock className="w-5 h-5" />
              Stamp время
            </button>

            <button
              onClick={handleInitializeText}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Первая строка = 00:00:00
            </button>

            {/* Stats */}
            <span className="ml-auto text-xs text-slate-400">
              {timedCount} / {lines.length} строк с таймингом
              {untimedCount > 0 && ` (${untimedCount} без)`}
            </span>
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Вставьте текст или загрузите .txt / .srt файл.\n\nКаждая строка — один субтитр.\nФормат после stamp: [HH:MM:SS,mmm]텍스트\n\nПример:\n너 버리고 도망간 그 새끼가 못됐지\n그건 또 그렇네\n근데 그 얘기 너무 슬프다\n슬플 것도 쌌다`}
            className="w-full h-[400px] lg:h-[500px] px-4 py-3 bg-white/60 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white font-mono text-sm leading-relaxed resize-y focus:outline-none focus:border-brand-cyan transition-colors"
            spellCheck={false}
          />

          {/* Save buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveSrt}
              disabled={timedCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Сохранить SRT
            </button>

            <button
              onClick={handleSaveTxt}
              disabled={!text.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-600 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              Сохранить TXT
            </button>

            <span className="flex items-center text-xs text-slate-400 ml-2">
              Файл: <code className="ml-1 text-slate-500">{videoName}-sub.srt</code>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}