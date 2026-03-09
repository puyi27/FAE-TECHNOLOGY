import { Link, useLocation } from 'react-router-dom';
import { type User } from '../types';
import { useTranslation } from 'react-i18next';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LanguageIcon from '@mui/icons-material/Language';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import '../i18n/config';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export default function Navbar({ theme, toggleTheme, currentUser, onLogout }: NavbarProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('fae_language', lng);
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-200/60 bg-base-100/80 backdrop-blur-md transition-colors duration-300">
      <div className="navbar max-w-1600px mx-auto px-4 md:px-8 h-20">

        {/* LOGO */}
        <div className="flex-1">
          <Link to="/" className="group flex flex-col cursor-pointer w-max">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
              <span className="text-base-content">FAE</span>
              <span className="inline-flex animate-background-shine bg-[linear-gradient(110deg,rgba(var(--p),1),45%,#fff,55%,rgba(var(--p),1))] bg-[length:200%_100%] bg-clip-text text-transparent font-bold">
                TECHNOLOGY
              </span>
            </h1>
            <span className="text-[10px] md:text-xs text-base-content/50 font-semibold tracking-widest uppercase mt-0.5 group-hover:text-primary transition-colors">
              {t('navbar.title')}
            </span>
          </Link>
        </div>

        {/* MENU DERECHO */}
        <div className="flex-none flex items-center gap-1 sm:gap-2">

          <Link to="/" className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${location.pathname === '/' ? 'bg-base-200 text-base-content shadow-sm ring-1 ring-base-300' : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'}`}>
            <span className="text-lg opacity-80"><CalendarMonthIcon /></span> {t('navbar.calendar')}
          </Link>

          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm md:btn-md hover:bg-base-200/50 transition-colors text-xl"><LanguageIcon /></div>
            <ul tabIndex={0} className="dropdown-content z-1 menu p-2 shadow-2xl bg-base-100/95 backdrop-blur-xl rounded-2xl border border-base-300 w-36 mt-4">
              <li><button onClick={() => changeLanguage('it')} className={i18n.language === 'it' ? 'text-primary font-bold' : ''}>🇮🇹 Italiano</button></li>
              <li><button onClick={() => changeLanguage('en')} className={i18n.language === 'en' ? 'text-primary font-bold' : ''}>🇬🇧 English</button></li>
              <li><button onClick={() => changeLanguage('es')} className={i18n.language === 'es' ? 'text-primary font-bold' : ''}>🇪🇸 Español</button></li>
            </ul>
          </div>

          {isAdmin && (
            <Link to="/admin" className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${location.pathname === '/admin' ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'}`}>
              <span className="text-lg opacity-80"><AddModeratorIcon /></span> {t('navbar.admin')}
            </Link>
          )}

          <div className="w-2px h-8 bg-base-300/60 mx-1 sm:mx-2 hidden sm:block rounded-full"></div>

          <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm md:btn-md hover:bg-base-200/50 transition-colors">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
            <div className="swap-off text-xl md:text-2xl drop-shadow-sm"><LightModeIcon /></div>
            <div className="swap-on text-xl md:text-2xl drop-shadow-sm"><DarkModeIcon /></div>
          </label>

          {currentUser && (
            <div className="dropdown dropdown-end ml-1">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring-2 ring-transparent hover:ring-primary/30 focus:ring-primary transition-all ml-1">
                <div className="w-9 md:w-10 rounded-full border-2 border-base-100 shadow-sm bg-base-300"><img alt={currentUser.alias} src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} className="object-cover" /></div>
              </div>

              <ul tabIndex={0} className="mt-4 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100/95 backdrop-blur-xl rounded-[1.5rem] border border-base-300 w-64 origin-top-right">
                <div className="px-4 py-3 flex items-center gap-3 border-b border-base-200/50 mb-2">
                  <div className="avatar"><div className="w-10 h-10 rounded-full"><img alt={currentUser.alias} src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} /></div></div>
                  <div className="flex flex-col overflow-hidden"><span className="text-sm font-black text-base-content truncate leading-tight">{currentUser.alias}</span><span className="text-[10px] font-bold uppercase tracking-widest text-primary truncate mt-0.5">{currentUser.work || 'Team Member'}</span></div>
                </div>

                <li><Link to={`/profile/${currentUser.id_user}`} onClick={() => (document.activeElement as HTMLElement)?.blur()} className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors flex justify-between group"><div className="flex items-center gap-2"><span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity"><PersonIcon /></span>{t('navbar.profile')}</div></Link></li>

                <div className="md:hidden">
                  <li><Link to="/" onClick={() => (document.activeElement as HTMLElement)?.blur()} className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors"><span className="text-lg opacity-50 mr-2"><CalendarMonthIcon /></span> {t('navbar.calendar')}</Link></li>
                  {isAdmin && <li><Link to="/admin" onClick={() => (document.activeElement as HTMLElement)?.blur()} className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors text-primary"><span className="text-lg opacity-50 mr-2"><AddModeratorIcon /></span> {t('navbar.admin')}</Link></li>}
                </div>

                <div className="divider my-1 opacity-50"></div>

                <li><button onClick={onLogout} className="py-3 font-bold text-error hover:bg-error/10 hover:text-error rounded-xl transition-colors group flex justify-between"><div className="flex items-center gap-2"><span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity"><LogoutIcon /></span>{t('navbar.logout')}</div></button></li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}