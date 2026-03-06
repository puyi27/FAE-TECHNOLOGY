// src/components/Calendar.tsx
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import isoWeek from 'dayjs/plugin/isoWeek';
import { type User } from '../types';
import { DayCell } from './DayCell'; // 👈 Aquí conectamos el otro archivo

// Activamos el plugin y ponemos el idioma a italiano
dayjs.extend(isoWeek);
dayjs.locale('it');

interface CalendarProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
}

export const Calendar = ({ users, onAddPresence }: CalendarProps) => {
  // Generamos de Lunes (0) a Viernes (4)
  const startOfWeek = dayjs().startOf('isoWeek');
  const weekDays = [0, 1, 2, 3, 4, 5, 6].map(i => startOfWeek.add(i, 'day'));

  if (users.length === 0) {
    return (
      <div className="alert alert-warning shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        <span className="font-bold">Nessun utente caricato. Vai al pannello admin per aggiungerli.</span>
      </div>
    );
  }

  return (
    <div className="bg-base-100 rounded-2xl shadow-xl overflow-x-auto border border-base-300">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-base-200 border-b-2 border-base-300 text-base-content">
            <th className="p-4 text-left w-64 border-r border-base-300 uppercase text-sm font-black tracking-wider opacity-80">Team</th>
            {weekDays.map(day => {
              const isWeekend = day.day() === 0 || day.day() === 6; // 0 es Domingo, 6 es Sábado
              return (
                <th
                  key={day.format()}
                  className={`p-4 text-center border-r border-base-300 min-w-[120px] transition-colors ${isWeekend ? 'bg-base-300/40' : ''
                    }`}
                >
                  <span className={`block text-xs uppercase font-black tracking-widest ${isWeekend ? 'text-base-content/40' : 'text-base-content/50'
                    }`}>
                    {day.format('ddd')}
                  </span>
                  <span className={`text-2xl font-black ${isWeekend ? 'opacity-50' : ''}`}>
                    {day.format('DD')}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id_user}
              // ✅ Añadimos stagger-item
              className="stagger-item border-b border-base-200 h-24 hover:bg-base-200/60 transition-colors duration-300 ease-in-out group/row"
              // ✅ Retrasamos la animación 50 milisegundos por cada fila
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className="p-4 flex items-center gap-4 border-r border-base-300 bg-base-200/30">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full border-2 border-base-100 shadow-sm ring-1 ring-base-300">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.alias}&background=random`} alt={user.alias} />
                  </div>
                </div>
                <div className="overflow-hidden">
                  <div className="font-bold text-base-content text-lg truncate">{user.alias}</div>
                  <div className="text-[11px] text-base-content/60 font-semibold uppercase tracking-wide truncate">{user.work || 'Dipendente'}</div>
                </div>
              </td>

              {weekDays.map(day => {
                const dateStr = day.format('YYYY-MM-DD');
                const presence = user.presences.find(p => p.date === dateStr);
                const isWeekend = day.day() === 0 || day.day() === 6;

                return (
                  <td
                    key={dateStr}
                    className={`p-0 border-r border-base-200 relative transition-colors ${isWeekend ? 'bg-base-200/50' : 'bg-base-100'
                      }`}
                  >
                    <div className="w-full h-full flex items-center justify-center min-h-[96px]">
                      <DayCell
                        presence={presence}
                        onAdd={() => onAddPresence(user.id_user, dateStr)}
                      />
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