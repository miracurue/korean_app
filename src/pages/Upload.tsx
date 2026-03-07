import { UploadCloud, FileVideo, FileAudio, Link as LinkIcon, AlertCircle } from 'lucide-react';

export default function Upload() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-transparent dark:bg-brand-pink/10 rounded-full blur-3xl animate-blob pointer-events-none" />
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Загрузить свой контент</h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Добавьте видео или аудио с корейскими субтитрами, чтобы учить язык на своих любимых материалах.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-cyan rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all group shadow-sm hover:shadow-md">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-brand-cyan/20 transition-colors">
            <FileVideo className="w-10 h-10 text-slate-400 group-hover:text-brand-cyan transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Загрузить видео</h3>
          <p className="text-slate-500 text-sm mb-6">MP4, WebM или Ogg (до 2 ГБ)</p>
          <span className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium group-hover:bg-brand-cyan group-hover:text-white transition-colors">
            Выбрать файл
          </span>
        </button>

        <button className="bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand-gold rounded-3xl p-12 flex flex-col items-center justify-center text-center transition-all group shadow-sm hover:shadow-md">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-brand-gold/20 transition-colors">
            <FileAudio className="w-10 h-10 text-slate-400 group-hover:text-brand-gold transition-colors" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Загрузить аудио</h3>
          <p className="text-slate-500 text-sm mb-6">MP3, WAV или Ogg (до 500 МБ)</p>
          <span className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-medium group-hover:bg-brand-gold group-hover:text-white transition-colors">
            Выбрать файл
          </span>
        </button>
      </div>

      <div className="mt-12 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Импорт по ссылке</h3>
            <p className="text-slate-500 text-sm">Вставьте ссылку на YouTube или другой сервис</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <input 
            type="text" 
            placeholder="https://youtube.com/watch?v=..." 
            className="flex-1 px-4 py-3 bg-white/60 dark:bg-slate-900/50 backdrop-blur-xl border border-white/40 dark:border-slate-800/50 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:border-brand-cyan transition-colors shadow-sm"
          />
          <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            Импорт
          </button>
        </div>
      </div>

      <div className="bg-brand-cyan/5 dark:bg-brand-cyan/10 backdrop-blur-xl border border-brand-cyan/20 dark:border-brand-cyan/20 rounded-2xl p-6 flex items-start gap-4">
        <AlertCircle className="w-6 h-6 text-brand-cyan shrink-0 mt-0.5" />
        <div>
          <h4 className="text-brand-cyan font-bold mb-1">Требования к субтитрами</h4>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Для корректной работы интерактивного плеера, видео или аудио должно сопровождаться файлом субтитров в формате SRT или VTT на корейском языке. Если субтитров нет, наш ИИ попытается сгенерировать их автоматически, но это может занять некоторое время.
          </p>
        </div>
      </div>
    </div>
  );
}
