import { Outlet, NavLink } from 'react-router-dom';
import { Home, Film, Music, Book, MessageSquareQuote, UploadCloud, User, Sun, Moon, Feather, BookOpen, MonitorPlay, Headphones } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

export default function Layout() {
  const { theme, setTheme } = useTheme();
  
  const catalogNav = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/dramas', icon: Film, label: 'Дорамы' },
    { to: '/music', icon: Music, label: 'Музыка' },
    { to: '/poems', icon: Feather, label: 'Стихи' },
    { to: '/quotes', icon: MessageSquareQuote, label: 'Цитатник' },
  ];

  const studyRoomsNav = [
    { to: '/player/video', icon: MonitorPlay, label: 'Видеоплеер' },
    { to: '/player/audio', icon: Headphones, label: 'Аудиоплеер' },
    { to: '/poem', icon: BookOpen, label: 'Ридер стихов' },
    { to: '/dictionary', icon: Book, label: 'Словарь' },
  ];

  const adminNav = [
    { to: '/upload', icon: UploadCloud, label: 'Загрузить медиа' },
  ];

  const renderNavGroup = (items: typeof catalogNav, title?: string) => (
    <div className="mb-6">
      {title && <h3 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</h3>}
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-white dark:bg-slate-800/80 text-brand-cyan dark:text-brand-cyan shadow-sm border border-slate-200 dark:border-transparent'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 flex font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/40 dark:border-slate-800/50 bg-white/60 dark:bg-slate-950/40 backdrop-blur-2xl flex flex-col fixed h-full z-50 transition-colors duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-pink to-brand-cream flex items-center justify-center font-bold text-xl text-white">
              K
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-brand-pink to-brand-cream">
              K-Lingua
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto mt-2 scrollbar-hide pb-6">
          {renderNavGroup(catalogNav, 'Каталог')}
          {renderNavGroup(studyRoomsNav, 'Учебные кабинеты')}
          {renderNavGroup(adminNav, 'Управление')}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
          <button className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <User className="w-5 h-5" />
            <span className="font-medium">Профиль</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-500">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
          
          {/* Animated Blobs */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-transparent dark:bg-brand-pink/20 blur-[120px] animate-blob" />
          <div className="absolute top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-transparent dark:bg-brand-cyan/20 blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-[-10%] left-[20%] w-[35%] h-[35%] rounded-full bg-transparent dark:bg-brand-gold/20 blur-[120px] animate-blob" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
