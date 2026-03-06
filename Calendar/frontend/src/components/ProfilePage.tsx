import { useState, useMemo } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import dayjs from 'dayjs';
// Importamos los plugins necesarios para que no den error
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/it'; 
import { type User, type Presence } from '../types';

// ACTIVACIÓN DE PLUGINS
dayjs.extend(isoWeek);
dayjs.locale('en');

interface ProfilePageProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
}

export const ProfilePage = ({ users, onAddPresence }: ProfilePageProps) => {
  const { id_user } = useParams();
  
  // Buscamos al usuario. Usamos Number() porque el ID viene como string de la URL
  const user = users.find(u => u.id_user === Number(id_user));

  // Simulamos el ID del usuario logueado (cámbialo al ID con el que pruebes)
  const MY_USER_ID = 1; 
  const isMyProfile = user?.id_user === MY_USER_ID;

  const [currentDate, setCurrentDate] = useState(dayjs());

  // Mapeo de presencias para acceso rápido
  const presenceMap = useMemo(() => {
    const map: Record<string, Presence> = {};
    if (user?.presences) {
      user.presences.forEach(p => {
        map[p.date] = p;
      });
    }
    return map;
  }, [user]);

  // Si los usuarios aún no han cargado, mostramos un loader
  if (users.length === 0) return <div className="p-20 text-center text-xl font-bold">Caricando utenti...</div>;

  // Si el usuario no existe tras cargar la lista, redirigimos
  if (!user) return <Navigate to="/" />;

  // LÓGICA DE CALENDARIO
  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  
  // Calculamos los huecos (Lunes = 1, Domingo = 7)
  const dayOfWeek = startOfMonth.isoWeekday(); // 1 a 7
  const blanksCount = dayOfWeek - 1; 
  
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* CABECERA */}
      <div className="bg-base-100 rounded-3xl p-6 shadow-xl border border-base-300 flex items-center gap-6 mb-8">
        <div className="avatar">
          <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.alias}`} 
              alt={user.alias} 
            />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-3xl font-black">{user.full_name || user.alias}</h2>
          <p className="opacity-60 font-bold uppercase text-xs">{user.work || 'Dipendente'}</p>
        </div>
        <Link to="/" className="btn btn-circle btn-ghost">✕</Link>
      </div>

      {/* NAVEGACIÓN */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-black capitalize">{currentDate.format('MMMM YYYY')}</h3>
        <div className="join border border-base-300">
          <button onClick={() => setCurrentDate(c => c.subtract(1, 'month'))} className="btn btn-sm join-item">←</button>
          <button onClick={() => setCurrentDate(dayjs())} className="btn btn-sm join-item">Oggi</button>
          <button onClick={() => setCurrentDate(c => c.add(1, 'month'))} className="btn btn-sm join-item">→</button>
        </div>
      </div>

      {/* CUADRÍCULA */}
      <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
        <div className="grid grid-cols-7 bg-base-200 text-center text-[10px] font-black py-2 border-b border-base-300 opacity-50 uppercase">
          {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(d => <div key={d}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7">
          {/* Celdas vacías */}
          {blanks.map(b => (
            <div key={`blank-${b}`} className="min-h-[100px] bg-base-200/20 border-b border-r border-base-300/30"></div>
          ))}
          
          {/* Días reales */}
          {days.map(day => {
            const dateStr = day.format('YYYY-MM-DD');
            const presence = presenceMap[dateStr];
            const isWeekend = day.isoWeekday() >= 6;
            const isToday = day.isSame(dayjs(), 'day');

            return (
              <div 
                key={dateStr} 
                className={`min-h-[100px] border-b border-r border-base-300 p-2 relative group ${isWeekend ? 'bg-base-200/40' : 'bg-base-100'}`}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'opacity-40'}`}>
                  {day.format('D')}
                </span>

                <div className="absolute inset-0 flex items-center justify-center">
                  {presence ? (
                    <div 
                      className={`flex flex-col items-center cursor-pointer hover:scale-110 transition-transform`}
                      onClick={() => isMyProfile && onAddPresence(user.id_user, dateStr)}
                    >
                      <span className="text-3xl">{presence.categories?.icon}</span>
                      <span className="text-[9px] font-bold opacity-60 uppercase">{presence.categories?.name}</span>
                    </div>
                  ) : (
                    isMyProfile && !isWeekend && (
                      <button 
                        onClick={() => onAddPresence(user.id_user, dateStr)}
                        className="btn btn-primary btn-circle btn-xs opacity-0 group-hover:opacity-100"
                      >
                        +
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