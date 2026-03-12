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

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
  onChangeTheme: (theme: string) => void;
  onChangeLang: (lang: string) => void;
}

export default function Navbar({ currentUser, onLogout, onChangeTheme, onChangeLang }: NavbarProps) {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const isAdmin = currentUser.role?.toLowerCase() === 'admin';
  const currentTheme = currentUser.theme || 'light';

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-base-300/40 bg-base-100/70 backdrop-blur-2xl shadow-sm">
        <div className="navbar max-w-7xl mx-auto px-4 md:px-8 h-16 md:h-[5.5rem] flex justify-between">

          <Link to="/" className="group flex flex-col cursor-pointer w-max transition-transform hover:scale-105 active:scale-95">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-2">
              <span className="bg-gradient-to-br from-base-content to-base-content/70 bg-clip-text text-transparent drop-shadow-sm">
                FAE
              </span>
              <span className="relative inline-flex animate-background-shine bg-gradient-to-r from-primary via-white to-primary bg-[length:200%_100%] bg-clip-text text-transparent font-bold tracking-widest opacity-90">
                TECHNOLOGY
              </span>
            </h1>
          </Link>

          <div className="flex items-center gap-1.5 md:gap-3">

            <Link to="/" className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${location.pathname === '/' ? 'bg-primary text-primary-content shadow-lg shadow-primary/30 scale-105' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}`}>
              <span className="text-lg"><CalendarMonthIcon fontSize="inherit" /></span> {t('navbar.calendar')}
            </Link>

            {isAdmin && (
              <Link to="/admin" className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${location.pathname === '/admin' ? 'bg-secondary text-secondary-content shadow-lg shadow-secondary/30 scale-105' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'}`}>
                <span className="text-lg"><AddModeratorIcon fontSize="inherit" /></span> {t('navbar.admin')}
              </Link>
            )}

            <div className="w-px h-8 bg-base-300/60 mx-1 hidden md:block rounded-full"></div>

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle hover:bg-base-200 hover:scale-110 transition-transform text-lg md:text-xl">
                <LanguageIcon fontSize="inherit" />
              </div>
              <ul tabIndex={0} className="dropdown-content z-[100] menu p-2 shadow-[0_10px_40px_rgba(0,0,0,0.15)] bg-base-100/95 backdrop-blur-xl rounded-3xl border border-base-300 w-40 mt-4 gap-1">
                <li><button onClick={() => onChangeLang('it')} className={`rounded-xl ${i18n.language === 'it' ? 'bg-primary/10 text-primary font-black' : 'font-bold'}`}>🇮🇹 Italiano</button></li>
                <li><button onClick={() => onChangeLang('en')} className={`rounded-xl ${i18n.language === 'en' ? 'bg-primary/10 text-primary font-black' : 'font-bold'}`}>🇬🇧 English</button></li>
                <li><button onClick={() => onChangeLang('es')} className={`rounded-xl ${i18n.language === 'es' ? 'bg-primary/10 text-primary font-black' : 'font-bold'}`}>🇪🇸 Español</button></li>
              </ul>
            </div>

            <label className="swap swap-rotate btn btn-ghost btn-circle hover:bg-base-200 hover:scale-110 transition-transform">
              <input type="checkbox" onChange={() => onChangeTheme(currentTheme === 'light' ? 'dark' : 'light')} checked={currentTheme === 'dark'} />
              <div className="swap-off text-lg md:text-2xl flex items-center justify-center"><LightModeIcon fontSize="inherit" /></div>
              <div className="swap-on text-lg md:text-2xl flex items-center justify-center"><DarkModeIcon fontSize="inherit" /></div>
            </label>

            <div className="dropdown dropdown-end hidden md:block ml-1">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring-2 ring-transparent hover:ring-primary/40 hover:scale-110 focus:ring-primary transition-transform shadow-sm">
                <div className="w-10 md:w-11 rounded-full border-2 border-base-100 bg-base-300">
                  <img alt={currentUser.alias} src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} className="object-cover" />
                </div>
              </div>
              <ul tabIndex={0} className="mt-5 z-[1] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.2)] menu dropdown-content bg-base-100/95 backdrop-blur-2xl rounded-[2rem] border border-base-300 w-72">
                <div className="px-5 py-4 m-1 mb-2 rounded-2xl bg-gradient-to-br from-base-200 to-base-100 border border-base-300 shadow-inner flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-12 h-12 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
                      <img alt={currentUser.alias} src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} />
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-base font-black truncate text-base-content">{currentUser.alias}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate">{currentUser.work || 'Team Member'}</span>
                  </div>
                </div>

                <li>
                  <Link to={`/profile/${currentUser.id_user}`} className="py-3 px-4 font-bold flex items-center gap-3 rounded-xl hover:bg-base-200">
                    <span className="text-xl text-base-content/50"><PersonIcon fontSize="inherit" /></span>
                    {t('navbar.profile')}
                  </Link>
                </li>
                <div className="divider my-0.5 px-4 opacity-30"></div>
                <li>
                  <button onClick={onLogout} className="py-3 px-4 font-bold text-error flex items-center gap-3 rounded-xl hover:bg-error/10 hover:text-error">
                    <span className="text-xl opacity-80"><LogoutIcon fontSize="inherit" /></span>
                    {t('navbar.logout')}
                  </button>
                </li>
              </ul>
            </div>

            <button onClick={onLogout} className="md:hidden btn btn-ghost btn-circle btn-sm text-error/70 hover:text-error ml-1"><LogoutIcon fontSize="small" /></button>
          </div>
        </div>
      </header>

      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full z-[9000] bg-base-100 border-t border-base-300 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] pb-safe">
        <div className="flex justify-around items-center h-[4.5rem] px-2 relative">
          <Link to="/" className={`relative flex flex-col items-center justify-center w-full h-full gap-1 z-10 group transition-all duration-300 ${location.pathname === '/' ? 'text-primary' : 'text-base-content/40 hover:text-base-content/80'}`}>
            <div className={`p-1.5 rounded-2xl transition-all duration-300 ${location.pathname === '/' ? 'bg-primary/10 scale-110 shadow-inner' : 'group-hover:scale-110'}`}>
              <CalendarMonthIcon fontSize="medium" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase">{t('navbar.calendar')}</span>
            {location.pathname === '/' && <span className="absolute top-0 w-12 h-1 rounded-b-md bg-primary shadow-[0_0_8px_var(--p)]"></span>}
          </Link>

          <Link to={`/profile/${currentUser.id_user}`} className={`relative flex flex-col items-center justify-center w-full h-full gap-1 z-10 group transition-all duration-300 ${location.pathname.includes('/profile') ? 'text-primary' : 'text-base-content/40 hover:text-base-content/80'}`}>
            <div className={`avatar transition-all duration-300 ${location.pathname.includes('/profile') ? 'scale-110 ring-2 ring-primary ring-offset-2 ring-offset-base-100 rounded-full shadow-lg shadow-primary/20' : 'opacity-70 group-hover:scale-110 group-hover:opacity-100'}`}>
              <div className="w-8 h-8 rounded-full bg-base-300">
                <img alt={currentUser.alias} src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} className="object-cover" />
              </div>
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase mt-0.5">{t('navbar.profile')}</span>
            {location.pathname.includes('/profile') && <span className="absolute top-0 w-12 h-1 rounded-b-md bg-primary shadow-[0_0_8px_var(--p)]"></span>}
          </Link>

          {isAdmin && (
            <Link to="/admin" className={`relative flex flex-col items-center justify-center w-full h-full gap-1 z-10 group transition-all duration-300 ${location.pathname === '/admin' ? 'text-secondary' : 'text-base-content/40 hover:text-base-content/80'}`}>
              <div className={`p-1.5 rounded-2xl transition-all duration-300 ${location.pathname === '/admin' ? 'bg-secondary/10 scale-110 shadow-inner' : 'group-hover:scale-110'}`}>
                <AddModeratorIcon fontSize="medium" />
              </div>
              <span className="text-[9px] font-black tracking-widest uppercase">{t('navbar.admin')}</span>
              {location.pathname === '/admin' && <span className="absolute top-0 w-12 h-1 rounded-b-md bg-secondary shadow-[0_0_8px_var(--s)]"></span>}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}