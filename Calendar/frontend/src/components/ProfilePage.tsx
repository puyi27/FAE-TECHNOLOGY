import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/it';
import { type User, type Presence } from '../types';
import RetroGrid from './RetroGrid';

dayjs.extend(isoWeek);
dayjs.locale('it');

interface ProfilePageProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
  onUpdateUser?: (updatedUser: any) => void;
  currentUser: User; 
}

export const ProfilePage = ({ users, onAddPresence, onUpdateUser, currentUser }: ProfilePageProps) => {
  const { id_user } = useParams();
  const user = users.find(u => u.id_user === Number(id_user));

  const isMyProfile = user?.id_user === currentUser.id_user;

  const [currentDate, setCurrentDate] = useState(dayjs());

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    alias: user?.alias || '',
    avatar: user?.avatar || '',
    description: user?.description || '',
    status: user?.status || 'Disponibile'
  });

  const presenceMap = useMemo(() => {
    const map: Record<string, Presence> = {};
    user?.presences?.forEach(p => { map[p.date] = p; });
    return map;
  }, [user]);

  if (users.length === 0) return (
    <div className="flex h-96 items-center justify-center">
      <span className="loading loading-dots loading-lg text-primary"></span>
    </div>
  );

  if (!user) return <Navigate to="/" />;

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const blanksCount = startOfMonth.isoWeekday() - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);

  const handleSaveProfile = () => {
    const isEmpty = formData.avatar.trim() === '';
    const finalAvatar = isEmpty
      ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.alias)}&background=random`
      : formData.avatar;

    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        ...formData,
        avatar: finalAvatar
      });
    }

    setFormData(prev => ({ ...prev, avatar: finalAvatar }));
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">

      {/* --- HEADER: Glassmorphism Card --- */}
      {/* 🚀 Animación de entrada: animate-fade-in-up */}
      <div className="bg-base-100/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-base-300 flex flex-wrap items-center gap-8 mb-12 relative overflow-hidden animate-fade-in-up">
        
        {/* ✨ MAGIC UI: Fondo de cuadrícula animada */}
        <RetroGrid className="opacity-40 mix-blend-overlay" />

        {/* BOTONES SUPERIORES */}
        <div className="absolute top-0 right-0 p-8 flex items-center gap-3 z-20">
          {isMyProfile && (
            <button
              onClick={() => {
                setFormData({
                  alias: user?.alias || '',
                  avatar: user?.avatar || '',
                  description: user?.description || '',
                  status: user?.status || 'Disponibile'
                });
                setIsEditing(true);
              }}
              className="btn btn-primary btn-sm rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform"
            >
              ✏️ Modifica
            </button>
          )}
          <Link to="/" className="btn btn-circle btn-ghost hover:rotate-90 transition-transform">✕</Link>
        </div>

        {/* Avatar y Estado */}
        <div className="relative group z-10">
          <div className="avatar">
            <div className="w-28 h-28 rounded-[2rem] ring ring-primary ring-offset-base-100 ring-offset-4 shadow-2xl bg-base-300">
              <img src={user.avatar ?? `https://ui-avatars.com/api/?name=${user.alias}`} alt={user.alias} className="object-cover" />
            </div>
          </div>

          {user.status && (
            <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full border-4 border-base-100 flex items-center justify-center shadow-lg px-1.5 py-0.5 z-10">
              <span className="text-sm" title={user.status}>
                {user.status === 'Occupato' ? '🔴' : user.status === 'Smart Working' ? '🏠' : user.status === 'In Ferie' ? '🏖️' : '🟢'}
              </span>
            </div>
          )}
        </div>

        {/* Info del Usuario */}
        <div className="flex-1 min-w-[200px] z-10">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Profilo Personale</span>
          <h2 className="text-5xl font-black tracking-tighter text-base-content mb-2">{user.full_name || user.alias}</h2>

          {user.description && (
            <p className="text-sm font-medium text-base-content/70 italic mb-3 max-w-md">"{user.description}"</p>
          )}

          <div className="flex gap-2">
            {/* 🚀 TAILWIND ANIMATIONS: Gradiente animado (animate-bg-gradient) */}
            <span className="badge border-none bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-bg-gradient text-white font-bold px-4 py-3 uppercase text-[10px] tracking-widest shadow-lg">
              {user.work || 'Team Member'}
            </span>
            {isMyProfile && <span className="badge badge-secondary font-bold px-4 py-3 uppercase text-[10px] tracking-widest text-white shadow-sm">Tu</span>}
          </div>
        </div>
      </div>

      {/* --- NAVIGATION: Minimalist --- */}
      {/* 🚀 Animación de entrada escalonada (delay de 100ms) */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 px-4 gap-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div>
          <h3 className="text-4xl font-black capitalize tracking-tight text-base-content/90">
            {currentDate.format('MMMM')} <span className="text-primary tracking-tighter">{currentDate.format('YYYY')}</span>
          </h3>
        </div>

        <div className="join bg-base-100/50 backdrop-blur-md shadow-xl border border-base-300 p-1 rounded-2xl">
          <button onClick={() => setCurrentDate(c => c.subtract(1, 'month'))} className="btn btn-ghost join-item rounded-xl px-6 text-xl hover:bg-primary/10 hover:text-primary transition-all">←</button>
          <button onClick={() => setCurrentDate(dayjs())} className="btn btn-ghost join-item rounded-xl px-8 font-black uppercase text-xs tracking-widest">Oggi</button>
          <button onClick={() => setCurrentDate(c => c.add(1, 'month'))} className="btn btn-ghost join-item rounded-xl px-6 text-xl hover:bg-primary/10 hover:text-primary transition-all">→</button>
        </div>
      </div>

      {/* --- CALENDAR GRID --- */}
      {/* 🚀 Animación de entrada escalonada (delay de 200ms) */}
      <div className="bg-base-100/30 backdrop-blur-md rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-base-300 overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-7 bg-base-200/60 border-b border-base-300">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
            <div key={d} className="py-6 text-center text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[140px] bg-base-200/10 border-b border-r border-base-300/20"></div>
          ))}

          {days.map(day => {
            const dateStr = day.format('YYYY-MM-DD');
            const presence = presenceMap[dateStr];
            const isWeekend = day.isoWeekday() >= 6;
            const isToday = day.isSame(dayjs(), 'day');

            return (
              <div
                key={dateStr}
                className={`min-h-[140px] border-b border-r border-base-300/40 p-4 relative group transition-all duration-500 
                  ${isWeekend ? 'bg-base-200/30' : 'bg-base-100/40 hover:bg-base-100/80'}
                  ${isToday ? 'bg-primary/[0.03]' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black transition-all duration-300 ${isToday ? 'bg-primary text-white w-9 h-9 flex items-center justify-center rounded-2xl shadow-lg shadow-primary/30 scale-110'
                      : 'opacity-20 group-hover:opacity-100'
                    }`}>
                    {day.format('D')}
                  </span>
                  {isToday && <span className="text-[8px] font-black uppercase text-primary tracking-tighter mt-1">Oggi</span>}
                </div>

                <div className="absolute inset-0 flex flex-col items-center justify-center pt-6">
                  {presence ? (
                    <div
                      className={`flex flex-col items-center gap-2 group/icon transition-all duration-500 
                        ${isMyProfile ? 'cursor-pointer hover:scale-125' : 'opacity-80'}`}
                      onClick={() => isMyProfile && onAddPresence(user.id_user, dateStr)}
                    >
                      <div className="p-3 rounded-3xl bg-base-100 shadow-md border border-base-200 group-hover/icon:shadow-xl group-hover/icon:border-primary/30 transition-all">
                        <span className="text-4xl filter drop-shadow-sm">{presence.categories?.icon}</span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-base-content/40 group-hover/icon:text-primary transition-colors">
                        {presence.categories?.name}
                      </span>
                    </div>
                  ) : (
                    isMyProfile && !isWeekend && (
                      <button
                        onClick={() => onAddPresence(user.id_user, dateStr)}
                        className="btn btn-primary btn-circle btn-md opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 shadow-xl border-none"
                      >
                        <span className="text-xl">+</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL DE EDICIÓN FLOTANTE --- */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-base-300/80 backdrop-blur-md transition-opacity" onClick={() => setIsEditing(false)}></div>

          {/* 🚀 Animación del modal: animate-fade-in-up */}
          <div className="bg-base-100/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.25)] border-2 border-base-300 w-full max-w-lg relative z-10 animate-fade-in-up p-8 flex flex-col gap-6">

            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tight">Personalizza</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Il tuo biglietto da visita</span>
              </div>
              <button onClick={() => setIsEditing(false)} className="btn btn-circle btn-ghost btn-sm">✕</button>
            </div>

            <div className="space-y-5">
              <div className="flex gap-6 items-center bg-base-200/50 p-4 rounded-3xl border border-base-300">
                <div className="avatar flex-shrink-0">
                  <div className="w-20 h-20 rounded-[1.5rem] shadow-inner bg-base-300 ring-2 ring-primary/20">
                    <img src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.alias}`} alt="Preview" className="object-cover" />
                  </div>
                </div>
                <div className="form-control flex-1">
                  <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">URL Foto Profilo</span></label>
                  <input
                    type="text"
                    className="input input-sm input-bordered bg-base-100 rounded-xl focus:ring-2 focus:ring-primary/20 w-full"
                    value={formData.avatar}
                    onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">Nome / Alias</span></label>
                  <input
                    type="text"
                    className="input input-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                  />
                </div>

                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">Stato Attuale</span></label>
                  <select
                    className="select select-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Disponibile">🟢 Disponibile</option>
                    <option value="Occupato">🔴 Occupato</option>
                    <option value="Smart Working">🏠 Smart Working</option>
                    <option value="In Ferie">🏖️ In Ferie</option>
                  </select>
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">Breve Descrizione / Bio</span>
                  <span className="label-text-alt opacity-40">{formData.description.length}/100</span>
                </label>
                <textarea
                  className="textarea textarea-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary/20 resize-none h-24"
                  placeholder="Scrivi qualcosa su di te..."
                  maxLength={100}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-4 pt-4 border-t border-base-300/50">
              <button onClick={() => setIsEditing(false)} className="btn btn-ghost flex-1 rounded-2xl font-bold">Annulla</button>
              <button onClick={handleSaveProfile} className="btn btn-primary flex-1 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30">
                Salva Modifiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};