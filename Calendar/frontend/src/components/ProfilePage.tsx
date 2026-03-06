import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/it'; 
import { type User, type Presence } from '../types';

dayjs.extend(isoWeek);
dayjs.locale('it');

interface ProfilePageProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
}

export const ProfilePage = ({ users, onAddPresence }: ProfilePageProps) => {
  const { id_user } = useParams();
  const user = users.find(u => u.id_user === Number(id_user));
  
  // Usuario logueado (Simulado)
  const MY_USER_ID = 1; 
  const isMyProfile = user?.id_user === MY_USER_ID;

  const [currentDate, setCurrentDate] = useState(dayjs());

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* --- HEADER: Glassmorphism Card --- */}
      <div className="bg-base-100/40 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-2xl border border-base-300 flex flex-wrap items-center gap-8 mb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8">
            <Link to="/" className="btn btn-circle btn-ghost hover:rotate-90 transition-transform">✕</Link>
        </div>
        
        <div className="relative">
          <div className="avatar">
            <div className="w-28 h-28 rounded-[2rem] ring ring-primary ring-offset-base-100 ring-offset-4 shadow-2xl">
              <img src={user.avatar ?? undefined} alt={user.alias} />
            </div>
          </div>
          <div className="absolute -bottom-2 -right-2 bg-success w-8 h-8 rounded-full border-4 border-base-100 flex items-center justify-center shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
          </div>
        </div>

        <div className="flex-1 min-w-[200px]">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Profilo Personale</span>
          <h2 className="text-5xl font-black tracking-tighter text-base-content mb-2">{user.full_name || user.alias}</h2>
          <div className="flex gap-2">
            <span className="badge badge-primary badge-outline font-bold px-4 py-3 uppercase text-[10px] tracking-widest">{user.work || 'Team Member'}</span>
            {isMyProfile && <span className="badge badge-secondary font-bold px-4 py-3 uppercase text-[10px] tracking-widest text-white shadow-sm">Tu</span>}
          </div>
        </div>
      </div>

      {/* --- NAVIGATION: Minimalist --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-10 px-4 gap-6">
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

      {/* --- CALENDAR GRID: High-End Design --- */}
      <div className="bg-base-100/30 backdrop-blur-md rounded-[3rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] border border-base-300 overflow-hidden">
        {/* Day Labels */}
        <div className="grid grid-cols-7 bg-base-200/60 border-b border-base-300">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => (
            <div key={d} className="py-6 text-center text-[11px] font-black opacity-30 uppercase tracking-[0.2em]">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {/* Empty Slots */}
          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[140px] bg-base-200/10 border-b border-r border-base-300/20"></div>
          ))}
          
          {/* Actual Days */}
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
                {/* Day Number */}
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-black transition-all duration-300 ${
                    isToday ? 'bg-primary text-white w-9 h-9 flex items-center justify-center rounded-2xl shadow-lg shadow-primary/30 scale-110' 
                    : 'opacity-20 group-hover:opacity-100'
                  }`}>
                    {day.format('D')}
                  </span>
                  {isToday && <span className="text-[8px] font-black uppercase text-primary tracking-tighter mt-1">Oggi</span>}
                </div>

                {/* Content Area */}
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
    </div>
  );
};