import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useTranslation } from 'react-i18next'; 
import { DayCell } from './DayCell';
import { type User } from '../types';

import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

dayjs.extend(isoWeek);

type SortConfig = { key: 'alias' | 'work'; direction: 'asc' | 'desc' };

interface CalendarProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
  currentUser?: User | null;
}

export const Calendar = ({ users, onAddPresence, currentUser }: CalendarProps) => {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'alias', direction: 'asc' });

  // Optimización: useMemo para evitar recálculos en cada renderizado (ej: al escribir en la búsqueda)
  const { startOfWeek, endOfWeek, weekDays } = useMemo(() => {
    const start = currentDate.startOf('isoWeek');
    const end = currentDate.endOf('isoWeek');
    const days = Array.from({ length: 7 }, (_, i) => start.add(i, 'day'));
    return { startOfWeek: start, endOfWeek: end, weekDays: days };
  }, [currentDate]);

  const sortedUsers = useMemo(() => {
    let items = [...users].filter(user => 
      user.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.work && user.work.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    items.sort((a, b) => {
      const valA = (a[sortConfig.key] || '').toLowerCase();
      const valB = (b[sortConfig.key] || '').toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [users, searchTerm, sortConfig]);

  const requestSort = (key: 'alias' | 'work') => {
    const isAscending = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAscending ? 'desc' : 'asc' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-4 px-4">
        <div className="flex justify-start w-full order-2 lg:order-none">
          <div className="relative w-full lg:w-72 group">
            <input 
              type="text" 
              placeholder={t('calendar.search')} 
              className="input input-sm input-bordered w-full rounded-2xl bg-base-100 pl-10 focus:ring-4 focus:ring-primary/20 transition-all border-base-300 text-base-content placeholder:text-base-content/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/60 flex items-center">
              <SearchIcon fontSize="small"/>
            </span>
          </div>
        </div>

        <div className="flex justify-center w-full order-1 lg:order-none">
          <div className="flex items-center bg-base-100/50 shadow-sm border border-base-300 rounded-2xl p-1 shrink-0">
            <button onClick={() => setCurrentDate(c => c.subtract(1, 'week'))} className="btn btn-sm btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all">
              <KeyboardArrowLeftIcon fontSize="small"/>
            </button>
            <h3 className="text-sm font-black capitalize tracking-tight text-base-content whitespace-nowrap px-3 sm:px-6 min-w-[140px] text-center">
              {startOfWeek.locale(i18n.language).format('DD MMM')} - {endOfWeek.locale(i18n.language).format('DD MMM YYYY')}
            </h3>
            <button onClick={() => setCurrentDate(c => c.add(1, 'week'))} className="btn btn-sm btn-ghost btn-circle hover:bg-primary/10 hover:text-primary transition-all">
              <KeyboardArrowRightIcon fontSize="small"/>
            </button>
          </div>
        </div>

        <div className="flex justify-end w-full order-3 lg:order-none">
          <button onClick={() => setCurrentDate(dayjs())} 
            className="btn btn-sm bg-base-100/50 shadow-sm border border-base-300 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all w-full lg:w-auto">
            {t('calendar.today')}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[2.5rem] border-2 border-base-300 bg-base-100 shadow-2xl">
        <table className="table table-fixed w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-base-200 select-none">
              <th className="p-0 border-r-2 border-base-300 w-[300px] sticky left-0 z-20 bg-base-200 shadow-md">
                <div className="flex flex-col h-full divide-y divide-base-300">
                   <div onClick={() => requestSort('alias')} className={`p-5 cursor-pointer hover:bg-primary/5 transition-all flex items-center justify-between group/sort 
                      ${sortConfig.key === 'alias' ? 'bg-primary/10' : ''}`}>
                     <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-1">{t('calendar.employee')}</span>
                        <div className={`text-lg font-black tracking-tighter transition-colors ${sortConfig.key === 'alias' ? 'text-primary' : 'text-base-content'}`}>{t('calendar.personal_data')}</div>
                     </div>
                     <div className={`transition-all duration-500 transform ${sortConfig.key === 'alias' ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`}>
                       <span className="inline-block font-black text-xl text-primary transform transition-transform duration-500" style={{ transform: sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)' }}><ArrowUpwardIcon/></span>
                     </div>
                   </div>
                   <div onClick={() => requestSort('work')} className={`px-5 py-4 cursor-pointer hover:bg-primary/5 transition-all flex items-center justify-between group/sort ${sortConfig.key === 'work' ? 'bg-primary/10' : ''}`}>
                     <span className={`text-[11px] font-black uppercase tracking-widest transition-all ${sortConfig.key === 'work' ? 'text-primary' : 'text-base-content/70'}`}>{t('calendar.order_role')}</span>
                     <div className={`transition-all duration-500 transform ${sortConfig.key === 'work' ? 'opacity-100 scale-110' : 'opacity-0 scale-50'}`}>
                        <span className="inline-block font-black text-primary transform transition-transform duration-500" style={{ transform: sortConfig.direction === 'desc' ? 'rotate(180deg)' : 'rotate(0deg)' }}><ArrowUpwardIcon/></span>
                     </div>
                   </div>
                </div>
              </th>
              {weekDays.map(day => (
                <th key={day.toString()} className={`p-5 text-center border-r border-base-300 transition-colors ${day.isSame(dayjs(), 'day') ? 'bg-primary/10 border-b-4 border-b-primary' : ''}`}>
                  <div className="text-[11px] uppercase font-black text-base-content/60 tracking-[0.15em] mb-1">{day.locale(i18n.language).format('ddd')}</div>
                  <div className={`text-2xl font-black tracking-tighter ${day.isSame(dayjs(), 'day') ? 'text-primary' : 'text-base-content'}`}>{day.locale(i18n.language).format('DD')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-base-300">
            {sortedUsers.map((user, index) => {
              const isMyRow = currentUser?.id_user === user.id_user;
              const canEdit = isMyRow || currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';

              return (
                <tr key={user.id_user} className={`group/row transition-all duration-300 ${isMyRow ? 'bg-primary/10 hover:bg-primary/20 shadow-sm relative z-10' : `hover:bg-primary/5 
                  ${index % 2 !== 0 ? 'bg-base-200/40' : 'bg-base-100'}`}`}>
                                
                  <td className="p-6 flex items-center gap-5 border-r-2 border-base-300 bg-inherit cursor-pointer group/cell relative z-10" onClick={() => navigate(`/profile/${user.id_user}`)}>
                    <div className={`absolute left-0 top-0 w-1.5 bg-primary transition-all duration-500 ${isMyRow ? 'h-full shadow-[0_0_8px_var(--p)]' : 'h-0 group-hover/row:h-full'}`} />
                    <div className={`avatar shrink-0 transition-all duration-500 group-hover/row:scale-110 ${isMyRow ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 rounded-2xl' : ''}`}>
                      <div className="w-14 h-14 rounded-2xl border-2 border-base-300 shadow-md overflow-hidden">
                        <img src={user.avatar ?? undefined} alt={user.alias} className="object-cover" />
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <div className="font-black text-base-content text-lg truncate group-hover/row:text-primary transition-colors uppercase tracking-tight">{user.alias}</div>
                      <div className="flex gap-2 items-center mt-1">
                        <div className="text-[10px] text-base-content/80 font-black uppercase tracking-widest bg-base-300 px-2 py-1 rounded-md inline-block">{user.work || 'TEAM MEMBER'}</div>
                        {isMyRow && <div className="text-[10px] text-primary-content font-black uppercase tracking-widest bg-primary px-2 py-1 rounded-md inline-block shadow-md">{t('profile.you')}</div>}
                      </div>
                    </div>
                  </td>

                  {weekDays.map(day => {
                    const dateStr = day.format('YYYY-MM-DD');
                    const presence = user.presences.find(p => p.date === dateStr);
                    const isWeekend = day.isoWeekday() >= 6;
                    
                    return (
                      <td key={dateStr} className={`p-0 border-r border-base-300 relative transition-all duration-300 ${isWeekend ? 'bg-base-200/60' : ''} ${day.isSame(dayjs(), 'day') ? 'bg-primary/5' : ''} ${canEdit ? 'hover:bg-base-200' : ''}`}>
                        <div className="w-full h-full flex items-center justify-center min-h-[110px] transition-all">
                          <DayCell presence={presence} isEditable={canEdit} onAdd={() => onAddPresence(user.id_user, dateStr)} />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};