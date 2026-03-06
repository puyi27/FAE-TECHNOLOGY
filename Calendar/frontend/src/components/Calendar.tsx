import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/it';
import { DayCell } from './DayCell';
import { type User } from '../types';

// Configuración para que la semana empiece en Lunes (IT)
dayjs.extend(isoWeek);
dayjs.locale('it');

interface CalendarProps {
  users: User[];
}

export const Calendar = ({ users }: CalendarProps) => {
  const navigate = useNavigate();
  
  // Forzamos el inicio en Lunes usando isoWeek
  const startOfWeek = dayjs().startOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  return (
    <div className="overflow-x-auto rounded-3xl border border-base-300 shadow-xl bg-base-100">
      {/* 1. Añadimos table-fixed para que respete los anchos de columna */}
      <table className="table table-fixed w-full border-collapse">
        <thead>
          <tr className="bg-base-200/50 text-base-content/70">
            {/* 2. Definimos un ancho fijo para la columna de Miembros (ej: 280px) */}
            <th className="p-6 text-left text-sm font-black uppercase tracking-widest border-r border-base-300 w-[280px]">
              Membri
            </th>
            
            {/* 3. Las columnas de los días NO tienen ancho definido, así se reparten el 100% restante por igual */}
            {weekDays.map(day => (
              <th key={day.toString()} className="p-4 text-center border-r border-base-200">
                <div className="text-[10px] opacity-50 uppercase font-black">{day.format('ddd')}</div>
                <div className="text-xl font-black">{day.format('DD')}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id_user}
              className="stagger-item border-b border-base-200 h-24 hover:bg-base-200/60 transition-colors group/row"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td 
                className="p-4 flex items-center gap-4 border-r border-base-300 bg-base-200/30 cursor-pointer hover:bg-base-300/80 transition-colors group"
                onClick={() => navigate(`/profile/${user.id_user}`)}
              >
                <div className="avatar transition-transform group-hover:scale-105 flex-shrink-0">
                  <div className="w-12 h-12 rounded-full border-2 border-base-100 shadow-sm ring-1 ring-base-300">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.alias}`} alt={user.alias} />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-base-content text-lg truncate group-hover:text-primary transition-colors">
                    {user.alias}
                  </div>
                  <div className="text-[10px] text-base-content/60 font-semibold uppercase tracking-tighter truncate">
                    {user.work || 'Dipendente'}
                  </div>
                </div>
              </td>

              {weekDays.map(day => {
                const dateStr = day.format('YYYY-MM-DD');
                const presence = user.presences.find(p => p.date === dateStr);
                const isWeekend = day.isoWeekday() >= 6;

                return (
                  <td key={dateStr} className={`p-0 border-r border-base-200 relative ${isWeekend ? 'bg-base-200/50' : 'bg-base-100'}`}>
                    <div className="w-full h-full flex items-center justify-center min-h-[96px] pointer-events-none">
                      <DayCell presence={presence} onAdd={() => {}} />
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};