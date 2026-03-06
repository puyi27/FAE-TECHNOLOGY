import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { type User } from '../types';
import { DayCell } from './DayCell';

// Ponemos el idioma a español (en tu código ponía 'it', lo he ajustado a español)
dayjs.locale('es');

interface CalendarProps {
  users: User[];
  onAddPresence: (userId: string, date: string) => void;
}

export const Calendar = ({ users, onAddPresence }: CalendarProps) => {
  // Generamos de Lunes (1) a Viernes (5)
  const startOfWeek = dayjs().startOf('week').add(1, 'day');
  const weekDays = [0, 1, 2, 3, 4].map(i => startOfWeek.add(i, 'day'));

  if (users.length === 0) {
    return <div className="p-10 bg-yellow-100 text-yellow-800 border-2 border-yellow-400 rounded-xl font-bold">⚠️ No hay usuarios cargados.</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-2xl overflow-x-auto border border-gray-300">
      <table className="w-full min-w-[800px] border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-200">
            <th className="p-4 text-left text-gray-700 w-64 border-r">Equipo</th>
            {weekDays.map(day => (
              <th key={day.format()} className="p-4 text-center border-r border-gray-200 min-w-[120px]">
                <span className="block text-xs uppercase text-gray-400 font-black">{day.format('ddd')}</span>
                <span className="text-xl text-gray-800 font-bold">{day.format('DD')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b border-gray-200 h-24 hover:bg-gray-50">
              {/* Celda del Usuario */}
              <td className="p-4 flex items-center gap-4 border-r bg-gray-50/50">
                <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" alt={user.name} />
                <div className="overflow-hidden">
                  <div className="font-bold text-gray-900 truncate">{user.name}</div>
                  <div className="text-[10px] text-gray-500 truncate">{user.email}</div>
                </div>
              </td>

              {/* Celdas de los Días */}
              {weekDays.map(day => {
                const dateStr = day.format('YYYY-MM-DD');
                const presence = user.presences.find(p => p.date === dateStr);
                
                return (
                  <td key={dateStr} className="p-0 border-r border-gray-100 bg-white relative">
                    <div className="w-full h-full flex items-center justify-center min-h-[80px]">
                      <DayCell 
                        presence={presence} 
                        onAdd={() => onAddPresence(user.id, dateStr)} 
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