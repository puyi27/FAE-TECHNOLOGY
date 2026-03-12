import { useState, useMemo, useEffect, useRef } from 'react';
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
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';
import AddIcon from '@mui/icons-material/Add'; 

dayjs.extend(isoWeek);

type SortConfig = { key: 'alias' | 'work'; direction: 'asc' | 'desc' };

interface CalendarProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
  currentUser?: User | null;
}

const getCategoryIcon = (iconStr?: string | null) => {
  switch (iconStr) {
    case '🏢': return <BusinessIcon fontSize="inherit" />;
    case '🏠': return <HomeWorkIcon fontSize="inherit" />;
    case '🏖️': return <BeachAccessIcon fontSize="inherit" />;
    case '🤒': return <SickIcon fontSize="inherit" />;
    case '💼': return <LuggageIcon fontSize="inherit" />;
    default: return iconStr || '📍';
  }
};

export const getDynamicCategoryName = (cat: any, currentLang: string, t: any) => {
  if (!cat) return '';
  if (currentLang === 'es' && cat.name_es) return cat.name_es;
  if (currentLang === 'en' && cat.name_en) return cat.name_en;
  return t(`categories_list.${cat.name}`, { defaultValue: cat.name });
};

export const Calendar = ({ users, onAddPresence, currentUser }: CalendarProps) => {
  const { t, i18n } = useTranslation(); 
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'alias', direction: 'asc' });
  const [selectedMobileDate, setSelectedMobileDate] = useState(dayjs().format('YYYY-MM-DD'));
  
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const startOfWeek = currentDate.startOf('isoWeek');
  const endOfWeek = currentDate.endOf('isoWeek');
  const weekDays = Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));

  const mobileDays = useMemo(() => {
    const start = currentDate.subtract(30, 'day');
    return Array.from({ length: 65 }, (_, i) => start.add(i, 'day'));
  }, [currentDate]);

  const scrollToDate = (dateStr: string) => {
    setTimeout(() => {
      if (mobileScrollRef.current) {
        const el = mobileScrollRef.current.querySelector(`[data-date="${dateStr}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      }
    }, 50);
  };

  useEffect(() => {
    const isSelectedInWeek = weekDays.some(d => d.format('YYYY-MM-DD') === selectedMobileDate);
    if (!isSelectedInWeek) {
      setSelectedMobileDate(weekDays[0].format('YYYY-MM-DD')); 
    }
  }, [currentDate]);

  useEffect(() => {
    scrollToDate(selectedMobileDate);
  }, [selectedMobileDate]);

  const handleSelectMobileDate = (dateStr: string) => {
    setSelectedMobileDate(dateStr);
    setCurrentDate(dayjs(dateStr));
  };

  const handleWeekMobile = (direction: number) => {
    const newDate = currentDate.add(direction, 'week');
    setCurrentDate(newDate);
    setSelectedMobileDate(newDate.format('YYYY-MM-DD'));
  };

  const sortedUsers = useMemo(() => {
    let items = [...users].filter(user => 
      user.alias.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (user.work && user.work.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    items.sort((a, b) => {
      if (currentUser && a.id_user === currentUser.id_user) return -1;
      if (currentUser && b.id_user === currentUser.id_user) return 1;

      const valA = (a[sortConfig.key] || '').toLowerCase();
      const valB = (b[sortConfig.key] || '').toLowerCase();
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return items;
  }, [users, searchTerm, sortConfig, currentUser]);

  const requestSort = (key: 'alias' | 'work') => {
    const isAscending = sortConfig.key === key && sortConfig.direction === 'asc';
    setSortConfig({ key, direction: isAscending ? 'desc' : 'asc' });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-10">
      <div className="flex flex-row justify-between items-center gap-3 px-2 md:px-4 lg:grid lg:grid-cols-3">
        <div className="w-full lg:w-auto flex-1 group relative">
          <input type="text" placeholder={t('calendar.search')} className="input input-sm md:input-md input-bordered w-full md:w-72 rounded-xl md:rounded-2xl bg-base-100 pl-10 focus:ring-4 focus:ring-primary/20 transition-all border-base-300 text-base-content placeholder:text-base-content/50 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/60 flex items-center group-focus-within:text-primary transition-colors"><SearchIcon fontSize="small"/></span>
        </div>

        <div className="hidden lg:flex justify-center w-full">
          <div className="flex items-center bg-base-100/80 backdrop-blur-md shadow-sm border border-base-300 rounded-2xl p-1 shrink-0 w-auto justify-between">
            <button onClick={() => setCurrentDate(c => c.subtract(1, 'week'))} className="btn btn-sm btn-ghost btn-circle hover:bg-primary/10 transition-all"><KeyboardArrowLeftIcon fontSize="small"/></button>
            <h3 className="text-sm font-black capitalize tracking-tight text-base-content whitespace-nowrap px-6 text-center">
              {startOfWeek.locale(i18n.language).format('DD MMM')} - {endOfWeek.locale(i18n.language).format('DD MMM YYYY')}
            </h3>
            <button onClick={() => setCurrentDate(c => c.add(1, 'week'))} className="btn btn-sm btn-ghost btn-circle hover:bg-primary/10 transition-all"><KeyboardArrowRightIcon fontSize="small"/></button>
          </div>
        </div>

        <div className="shrink-0 flex justify-end">
          <button 
            onClick={() => { 
              const todayStr = dayjs().format('YYYY-MM-DD');
              setCurrentDate(dayjs()); 
              setSelectedMobileDate(todayStr);
              scrollToDate(todayStr); 
            }} 
            className="btn btn-sm md:btn-md bg-base-100/80 backdrop-blur-md shadow-sm border border-base-300 rounded-xl md:rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
          >
            {t('calendar.today')}
          </button>
        </div>
      </div>

      <div className="block lg:hidden space-y-4 px-1">
        <div className="bg-base-100/60 backdrop-blur-xl border border-base-300 rounded-[2rem] p-3 shadow-sm mx-1">
          <div className="flex items-center justify-between px-2 mb-3">
            <button onClick={() => handleWeekMobile(-1)} className="btn btn-sm btn-circle bg-base-200/60 hover:bg-primary/20 hover:text-primary transition-colors border-none text-base-content/70">
              <KeyboardArrowLeftIcon fontSize="small"/>
            </button>

            <div 
              className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform" 
              onClick={() => {
                const todayStr = dayjs().format('YYYY-MM-DD');
                setCurrentDate(dayjs());
                setSelectedMobileDate(todayStr);
              }}
              title="Volver a hoy"
            >
              <span className="text-sm font-black capitalize tracking-widest text-base-content leading-tight">
                {currentDate.locale(i18n.language).format('MMMM YYYY')}
              </span>
              <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-0.5">
                Semana {currentDate.isoWeek()}
              </span>
            </div>

            <button onClick={() => handleWeekMobile(1)} className="btn btn-sm btn-circle bg-base-200/60 hover:bg-primary/20 hover:text-primary transition-colors border-none text-base-content/70">
              <KeyboardArrowRightIcon fontSize="small"/>
            </button>
          </div>

          <div ref={mobileScrollRef} className="flex gap-2 overflow-x-auto pb-2 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
            {mobileDays.map(day => {
              const dateStr = day.format('YYYY-MM-DD');
              const isSelected = dateStr === selectedMobileDate;
              const isToday = day.isSame(dayjs(), 'day');

              return (
                <button 
                  key={dateStr}
                  data-date={dateStr}
                  onClick={() => handleSelectMobileDate(dateStr)}
                  className={`shrink-0 snap-center flex flex-col items-center justify-center min-w-[65px] py-2.5 rounded-2xl border transition-all duration-300 ${
                    isSelected ? 'bg-primary border-primary text-primary-content shadow-lg shadow-primary/30 scale-105 z-10' : 
                    isToday ? 'bg-primary/5 border-primary/30 text-primary' : 
                    'bg-base-100/50 border-base-300 text-base-content/70 hover:bg-base-200'
                  }`}
                >
                  <span className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-80">{day.locale(i18n.language).format('ddd')}</span>
                  <span className="text-xl font-black leading-none">{day.format('DD')}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 px-1 pb-8">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 mb-3 pl-3">
            {dayjs(selectedMobileDate).locale(i18n.language).format('dddd, DD MMMM YYYY')}
          </h4>
          
          {sortedUsers.map((user) => {
            const isMyRow = currentUser?.id_user === user.id_user;
            const canEdit = isMyRow || currentUser?.role === 'admin' || currentUser?.role === 'ADMIN';
            const presence = user.presences.find(p => p.date === selectedMobileDate);

            return (
              <div key={user.id_user} className={`bg-base-100 rounded-3xl border p-4 flex items-center justify-between shadow-sm transition-all ${isMyRow ? 'border-primary/40 bg-primary/[0.03] ring-1 ring-primary/20' : 'border-base-300'}`}>
                
                <div className="flex items-center gap-3 cursor-pointer overflow-hidden flex-1" onClick={() => navigate(`/profile/${user.id_user}`)}>
                  <div className={`avatar shrink-0 ${isMyRow ? 'ring-2 ring-primary ring-offset-2 ring-offset-base-100 rounded-xl shadow-sm' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-base-300 border border-base-300 overflow-hidden">
                      <img src={user.avatar ?? undefined} alt={user.alias} className="object-cover" />
                    </div>
                  </div>
                  <div className="overflow-hidden pr-2">
                    <div className="font-black text-base truncate uppercase tracking-tight text-base-content">{user.alias}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 truncate">{user.work || 'TEAM MEMBER'}</span>
                      {isMyRow && <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">Tú</span>}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center justify-end min-w-[90px]">
                  {presence ? (
                    <div 
                      className={`flex flex-col items-center justify-center p-2 rounded-2xl border w-full min-h-[60px] transition-colors ${canEdit ? 'cursor-pointer hover:bg-base-200 border-base-300 bg-base-200/50' : 'border-base-300 bg-base-200/30'}`}
                      onClick={canEdit ? () => onAddPresence(user.id_user, selectedMobileDate) : undefined}
                    >
                      <span className="text-2xl drop-shadow-sm text-base-content/80 mb-1">{getCategoryIcon(presence.categories?.icon)}</span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-primary text-center leading-tight line-clamp-2">
                        {getDynamicCategoryName(presence.categories, i18n.language, t)}
                      </span>
                    </div>
                  ) : canEdit ? (
                    <button 
                      onClick={() => onAddPresence(user.id_user, selectedMobileDate)}
                      className="w-12 h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/50 bg-base-100 shadow-inner hover:bg-primary/10 hover:border-primary hover:text-primary hover:scale-105 transition-all"
                    >
                      <AddIcon fontSize="small" />
                    </button>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center opacity-20">
                      <span className="w-2 h-2 rounded-full bg-base-content"></span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden lg:block overflow-hidden rounded-[2.5rem] border-2 border-base-300 bg-base-100 shadow-xl">
        <table className="table table-fixed w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-base-200/50 select-none">
              <th className="p-0 border-r-2 border-base-300 w-[300px] sticky left-0 z-20 bg-base-200 shadow-md">
                <div className="flex flex-col h-full divide-y divide-base-300">
                   <div onClick={() => requestSort('alias')} className={`p-5 cursor-pointer hover:bg-primary/5 transition-all flex items-center justify-between group/sort ${sortConfig.key === 'alias' ? 'bg-primary/10' : ''}`}>
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
                <tr key={user.id_user} className={`group/row transition-all duration-300 ${isMyRow ? 'bg-primary/[0.08] hover:bg-primary/10 shadow-sm relative z-10' : `hover:bg-primary/5 ${index % 2 !== 0 ? 'bg-base-200/30' : 'bg-base-100'}`}`}>
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
                      <td 
                        key={dateStr} 
                        className={`p-0 border-r border-base-300 relative transition-all duration-300 ${isWeekend ? 'bg-base-200/50' : ''} ${day.isSame(dayjs(), 'day') ? 'bg-primary/5' : ''} ${canEdit ? 'hover:bg-base-200/80' : ''}`}
                      >
                        <div className="w-full h-full flex items-center justify-center min-h-[110px] transition-all">
                          <DayCell 
                            presence={presence} 
                            isEditable={canEdit} 
                            onAddPresence={onAddPresence} 
                            userId={user.id_user} 
                            dateStr={dateStr} 
                          />
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