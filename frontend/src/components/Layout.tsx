import { Outlet, NavLink } from 'react-router-dom';
import { Home, Film, Music, Book, MessageSquareQuote, UploadCloud, User, Sun, Moon, Feather, BookOpen, MonitorPlay, Headphones, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from './ThemeProvider';

export default function Layout() {
  const { theme, setTheme } = useTheme();
  
  const catalogNav = [
    { to: '/', icon: Home, label: 'Главная' },
    { to: '/dramas', icon: Film, label: 'Дорамы' },
    { to: '/poems', icon: Feather, label: 'Стихи' },
    { to: '/quotes', icon: MessageSquareQuote, label: 'Цитатник' },
  ];

  const studyRoomsNav = [
    { to: '/rooms/video', icon: MonitorPlay, label: 'Видеоплеер' },
    { to: '/rooms/audio', icon: Headphones, label: 'Аудиоплеер' },
    { to: '/rooms/reader', icon: BookOpen, label: 'Ридер' },
    { to: '/dictionary', icon: Book, label: 'Словарь' },
  ];

  const adminNav = [
    { to: '/upload', icon: UploadCloud, label: 'Загрузить медиа' },
    { to: '/subtitle-editor', icon: Clock, label: 'Редактор субтитров' },
  ];

  const renderNavGroup = (items: typeof catalogNav, title?: string) => (
    <div className="mb-6">
      {title && <h3 className="px-4 text-[length:var(--font-size-sidebar-title)] font-[--font-weight-sidebar-title] text-text-muted dark:text-[color:var(--color-sidebar-title-dark)] uppercase tracking-[--letter-spacing-widest] mb-2">{title}</h3>}
      <div className="space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group',
                isActive
                  ? 'bg-white dark:bg-card-dark/80 text-brand-cyan dark:text-[color:var(--color-sidebar-item-active-dark)] shadow-sm border-[length:var(--border-width-main)] border-slate-200 dark:border-transparent'
                  : 'text-slate-500 dark:text-[color:var(--color-sidebar-item-text-dark)] hover:bg-slate-100 dark:hover:bg-card-dark/40 hover:text-slate-900 dark:hover:text-[color:var(--color-sidebar-item-hover-dark)]'
              )
            }
          >
            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-[--font-weight-sidebar-item] text-[length:var(--font-size-sidebar-item)] tracking-[--letter-spacing-sidebar-item]">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen font-body transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r-[length:var(--border-width-main)] border-white/80 dark:border-border-dark/50 bg-[color:var(--color-sidebar-bg)] dark:bg-[color:var(--color-sidebar-bg-dark)] backdrop-blur-md dark:backdrop-blur-2xl flex flex-col fixed h-full z-50 transition-colors duration-300 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] font-menu">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-pink flex items-center justify-center font-black text-[length:var(--font-size-subheading)] text-white shadow-sm border-2 border-white dark:border-border-dark">
              K
            </div>
            <span className="text-[length:var(--font-size-subheading)] font-black tracking-tight text-text-main dark:text-text-main-dark">
              <span className="text-brand-pink">K</span>-Lingua
            </span>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto mt-2 scrollbar-hide pb-6">
          {renderNavGroup(catalogNav, 'Каталог')}
          {renderNavGroup(studyRoomsNav, 'Учебные кабинеты')}
          {renderNavGroup(adminNav, 'Управление')}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <NavLink
            to="/profile/me"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors font-medium',
                isActive
                  ? 'bg-white dark:bg-card-dark/80 text-brand-cyan dark:text-[color:var(--color-sidebar-item-active-dark)] shadow-sm border-[length:var(--border-width-main)] border-slate-200 dark:border-transparent'
                  : 'text-slate-500 dark:text-[color:var(--color-sidebar-item-text-dark)] hover:bg-white/80 dark:hover:bg-card-dark/40 hover:text-slate-900 dark:hover:text-[color:var(--color-sidebar-item-hover-dark)]'
              )
            }
          >
            <User className="w-5 h-5" />
            <span className="font-semibold">Мой профиль</span>
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative min-h-screen">
        <div className="fixed inset-0 z-0 pointer-events-none bg-white dark:bg-background-dark transition-colors duration-700" />

        <div className="relative z-10 h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
