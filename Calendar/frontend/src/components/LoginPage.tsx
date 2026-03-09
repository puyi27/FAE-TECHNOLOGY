import { useState } from 'react';
import RetroGrid from './RetroGrid';
import { useTranslation } from 'react-i18next'; 
import LockIcon from '@mui/icons-material/Lock';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import PasswordIcon from '@mui/icons-material/Password';

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const { t } = useTranslation(); 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || t('login.invalid_creds'));
      }
    } catch (err) {
      setError(t('login.server_error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* --- FONDO ANIMADO --- */}
      <RetroGrid />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/30 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] animate-pulse pointer-events-none mix-blend-screen" style={{ animationDelay: '2s' }}></div>

      {/* --- TARJETA GLASSMORPHISM --- */}
      <div className="w-full max-w-md bg-base-100/60 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_0_50px_-15px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/5 p-8 md:p-10 relative z-10 animate-fade-in-up">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary/30 to-primary/5 rounded-3xl flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/50 shadow-[0_0_30px_rgba(var(--p),0.3)] backdrop-blur-md">
            <span className="text-primary drop-shadow-md"><LockIcon fontSize="large" /></span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-base-content mb-2">{t('login.welcome')}</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-base-content/50">{t('login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm font-bold p-4 rounded-2xl text-center animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all z-10 flex items-center">
                <AlternateEmailIcon fontSize="small" />
              </span>
              <input 
                type="email" 
                placeholder="mario.rossi@fae.technology" 
                className="input input-lg w-full bg-base-200/50 border border-base-300 rounded-2xl pl-14 focus:border-primary focus:ring-4 focus:ring-primary/20 text-base-content font-bold transition-all shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all z-10 flex items-center">
                <PasswordIcon fontSize="small" />
              </span>
              <input 
                type="password" 
                placeholder={t('login.password')} 
                className="input input-lg w-full bg-base-200/50 border border-base-300 rounded-2xl pl-14 focus:border-primary focus:ring-4 focus:ring-primary/20 text-base-content font-bold transition-all shadow-inner"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="group relative w-full overflow-hidden rounded-2xl bg-primary px-8 py-4 font-black uppercase tracking-widest text-primary-content shadow-[0_0_40px_-10px_rgba(var(--p),0.5)] hover:shadow-[0_0_60px_-15px_rgba(var(--p),0.8)] transition-all hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100">
            <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(150%)]">
              <div className="w-12 bg-white/30 blur-sm" />
            </div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? <span className="loading loading-spinner"></span> : t('login.btn_login')}
            </span>
          </button>
        </form>

        <div className="mt-8 text-center border-t border-base-300/50 pt-6">
          <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest leading-relaxed">
            {t('login.no_account')} <br/>
            <span className="text-base-content/60">{t('login.contact_admin')}</span>
          </p>
        </div>
      </div>
    </div>
  );
};