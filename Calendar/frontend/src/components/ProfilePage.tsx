import { useState, useMemo, useRef } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import { useTranslation } from 'react-i18next'; 
import { type User, type Presence } from '../types';
import RetroGrid from './RetroGrid';
import { getDynamicCategoryName } from '../utils/categoryUtils';

import DoNotDisturbOnTotalSilenceIcon from '@mui/icons-material/DoNotDisturbOnTotalSilence';
import OnlinePredictionIcon from '@mui/icons-material/OnlinePrediction';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import EditIcon from '@mui/icons-material/Edit';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import AddIcon from '@mui/icons-material/Add';
import PasswordIcon from '@mui/icons-material/Password';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BusinessIcon from '@mui/icons-material/Business';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';

dayjs.extend(isoWeek);

interface ProfilePageProps {
  users: User[];
  onAddPresence: (userId: number, date: string) => void;
  onUpdateUser?: (updatedUser: any) => void;
  currentUser: User; 
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

export const ProfilePage = ({ users, onAddPresence, onUpdateUser, currentUser }: ProfilePageProps) => {
  const { t, i18n } = useTranslation(); 
  const { id_user } = useParams();
  const user = users.find(u => u.id_user === Number(id_user));
  const isMyProfile = user?.id_user === currentUser.id_user;
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 🚀 ESTADO PARA EL MODAL DE INFO (Pop-up en el perfil)
  const [infoModal, setInfoModal] = useState<{date: string, catName: string, icon: string} | null>(null);

  const [formData, setFormData] = useState({
    alias: user?.alias || '', 
    avatar: user?.avatar || '', 
    description: user?.description || '', 
    status: user?.status || 'Disponibile',
    password: ''
  });

  const presenceMap = useMemo(() => {
    const map: Record<string, Presence> = {};
    user?.presences?.forEach(p => { map[p.date] = p; });
    return map;
  }, [user]);

  if (users.length === 0) return <div className="flex h-96 items-center justify-center"><span className="loading loading-dots loading-lg text-primary"></span></div>;
  if (!user) return <Navigate to="/" />;

  const startOfMonth = currentDate.startOf('month');
  const daysInMonth = currentDate.daysInMonth();
  const blanksCount = startOfMonth.isoWeekday() - 1;
  const days = Array.from({ length: daysInMonth }, (_, i) => startOfMonth.add(i, 'day'));
  const blanks = Array.from({ length: blanksCount }, (_, i) => i);
  const dayLabels = t('profile.days', { returnObjects: true }) as string[];

const handleSaveProfile = () => {
    const isEmpty = formData.avatar.trim() === '';
    const finalAvatar = isEmpty ? `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.alias)}&background=random` : formData.avatar;
    

    const dataToSend: any = { ...user, ...formData, avatar: finalAvatar };
    if (!formData.password || formData.password.trim() === '') {
      delete dataToSend.password;
    }

    if (onUpdateUser) onUpdateUser(dataToSend);
    setFormData(prev => ({ ...prev, avatar: finalAvatar, password: '' }));
    setIsEditing(false);
  };

  const handleOpenEdit = () => {
    setFormData({ 
      alias: user?.alias || '', avatar: user?.avatar || '', description: user?.description || '', status: user?.status || 'Disponibile', password: '' 
    }); 
    setIsEditing(true);
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("La imagen es demasiado grande. El máximo es 2MB.");
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const getStatusIcon = (status: string, fontSize: 'small' | 'medium' | 'large' | 'inherit' = 'small') => {
    switch (status) {
      case 'Occupato': return <DoNotDisturbOnTotalSilenceIcon fontSize={fontSize} className="text-error" />;
      case 'Smart Working': return <HomeWorkIcon fontSize={fontSize} className="text-info" />;
      case 'In Ferie': return <BeachAccessIcon fontSize={fontSize} className="text-warning" />;
      case 'Disponibile': default: return <OnlinePredictionIcon fontSize={fontSize} className="text-success" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 relative">
      <div className="bg-base-100/40 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-8 shadow-2xl border border-base-300 flex flex-wrap items-center gap-6 md:gap-8 mb-8 md:mb-12 relative overflow-hidden animate-fade-in-up">
        <RetroGrid className="opacity-40 mix-blend-overlay" />
        <div className="absolute top-0 right-0 p-4 md:p-8 flex items-center gap-2 md:gap-3 z-20">
          {isMyProfile && (
            <button onClick={handleOpenEdit} className="btn btn-primary btn-sm rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform gap-1">
              <EditIcon fontSize="small"/> <span className="hidden md:inline">{t('profile.edit')}</span>
            </button>
          )}
        </div>
        <div className="relative group z-10 mx-auto md:mx-0 mt-4 md:mt-0">
          <div className="avatar">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2rem] ring ring-primary ring-offset-base-100 ring-offset-4 shadow-2xl bg-base-300">
              <img src={user.avatar ?? `https://ui-avatars.com/api/?name=${user.alias}`} alt={user.alias} className="object-cover" />
            </div>
          </div>
          {user.status && (
            <div className="absolute -bottom-2 -right-2 bg-base-100 rounded-full border-4 border-base-100 flex items-center justify-center shadow-lg px-2 py-1 z-10 text-primary">
              <span className="flex items-center justify-center" title={user.status}>{getStatusIcon(user.status)}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-[200px] z-10 text-center md:text-left">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">{t('profile.personal_profile')}</span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-base-content mb-2">{user.full_name || user.alias}</h2>
          {user.description && <p className="text-sm font-medium text-base-content/70 italic mb-3 max-w-md mx-auto md:mx-0">"{user.description}"</p>}
          <div className="flex gap-2 justify-center md:justify-start">
            <span className="badge border-none bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-bg-gradient text-white font-bold px-4 py-3 uppercase text-[10px] tracking-widest shadow-lg">
              {user.work || t('profile.team_member')}
            </span>
            {isMyProfile && <span className="badge badge-secondary font-bold px-4 py-3 uppercase text-[10px] tracking-widest text-white shadow-sm">{t('profile.you')}</span>}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-10 px-2 md:px-4 gap-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <button onClick={() => setCurrentDate(dayjs())} className="btn bg-base-100/50 backdrop-blur-md shadow-sm border border-base-300 rounded-2xl px-8 font-black uppercase text-xs tracking-widest hover:bg-primary/10 transition-all w-full sm:w-auto order-2 sm:order-1">
          {t('profile.today')}
        </button>
        <div className="flex items-center gap-2 bg-base-100/50 backdrop-blur-md shadow-xl border border-base-300 p-2 rounded-[2rem] w-full sm:w-auto justify-between order-1 sm:order-2">
          <button onClick={() => setCurrentDate(c => c.subtract(1, 'month'))} className="btn btn-circle btn-ghost text-xl hover:bg-primary/10 transition-all"><KeyboardArrowLeftIcon/></button>
          <h3 className="text-xl md:text-3xl font-black capitalize tracking-tight text-base-content/90 min-w-[160px] md:min-w-[180px] text-center px-2 md:px-4">
            {currentDate.locale(i18n.language).format('MMMM')} <span className="text-primary tracking-tighter">{currentDate.locale(i18n.language).format('YYYY')}</span>
          </h3>
          <button onClick={() => setCurrentDate(c => c.add(1, 'month'))} className="btn btn-circle btn-ghost text-xl hover:bg-primary/10 transition-all"><KeyboardArrowRightIcon/></button>
        </div>
        <div className="hidden sm:block w-[100px] order-3"></div>
      </div>

      <div className="bg-base-100/30 backdrop-blur-md rounded-[2rem] md:rounded-[3rem] shadow-xl border border-base-300 overflow-hidden animate-fade-in-up pb-10" style={{ animationDelay: '200ms' }}>
        <div className="grid grid-cols-7 bg-base-200/60 border-b border-base-300">
          {dayLabels.map(d => <div key={d} className="py-4 md:py-6 text-center text-[9px] md:text-[11px] font-black opacity-40 uppercase tracking-[0.1em] md:tracking-[0.2em]">{d}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {blanks.map(b => <div key={`blank-${b}`} className="min-h-[80px] md:min-h-[140px] bg-base-200/10 border-b border-r border-base-300/20"></div>)}
          {days.map(day => {
            const dateStr = day.format('YYYY-MM-DD');
            const presence = presenceMap[dateStr];
            const isWeekend = day.isoWeekday() >= 6;
            const isToday = day.isSame(dayjs(), 'day');
            
            return (
              <div key={dateStr} className={`min-h-[80px] md:min-h-[140px] border-b border-r border-base-300/40 p-1 md:p-4 relative group transition-all duration-500 ${isWeekend ? 'bg-base-200/30' : 'bg-base-100/40 hover:bg-base-100/80'} ${isToday ? 'bg-primary/[0.05]' : ''}`}>
                <div className="flex justify-center md:justify-between items-start mb-1 md:mb-2">
                  <span className={`text-xs md:text-sm font-black transition-all duration-300 ${isToday ? 'bg-primary text-white w-6 h-6 md:w-9 md:h-9 flex items-center justify-center rounded-full md:rounded-2xl shadow-lg shadow-primary/30 scale-110' : 'opacity-50 md:opacity-20 group-hover:opacity-100'}`}>{day.format('D')}</span>
                  {isToday && <span className="hidden md:inline text-[8px] font-black uppercase text-primary tracking-tighter mt-1">{t('profile.today')}</span>}
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-5 md:pt-6">
                  {presence ? (
                    <div 
                      className={`flex flex-col items-center gap-1 md:gap-2 group/icon transition-all duration-500 w-full px-1 ${isMyProfile ? 'cursor-pointer hover:scale-110' : 'cursor-pointer'}`} 

                      onClick={() => {
                        if (isMyProfile) {
                           onAddPresence(user.id_user, dateStr);
                        } else {
                           setInfoModal({
                              date: day.locale(i18n.language).format('DD MMM YYYY'),
                              catName: getDynamicCategoryName(presence.categories, i18n.language, t),
                              icon: presence.categories?.icon || '📍'
                           });
                        }
                      }}
                    >
                      <div className="p-1 md:p-3 rounded-xl md:rounded-3xl bg-transparent md:bg-base-100 md:shadow-md md:border md:border-base-200 group-hover/icon:shadow-xl transition-all text-2xl md:text-4xl text-base-content/80 flex items-center justify-center drop-shadow-sm" title={presence.categories?.name}>
                        {getCategoryIcon(presence.categories?.icon)}
                      </div>

                      <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-base-content/50 group-hover/icon:text-primary transition-colors text-center w-full truncate px-1">
                        {getDynamicCategoryName(presence.categories, i18n.language, t)}
                      </span>
                    </div>
                  ) : (
                    isMyProfile && !isWeekend && (
                      <div onClick={() => onAddPresence(user.id_user, dateStr)} className="opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                        <div className="w-8 h-8 md:w-12 md:h-12 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center text-primary/50 group-hover:border-primary group-hover:text-primary transition-all bg-base-100/50 shadow-inner scale-90 group-hover:scale-100">
                          <AddIcon fontSize="small" />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {infoModal && (
        <div className="modal modal-open modal-bottom sm:modal-middle z-[100]">
          <div className="modal-box bg-base-100/95 backdrop-blur-xl border border-base-300 shadow-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 text-center animate-fade-in-up">
            <button onClick={() => setInfoModal(null)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 hover:rotate-90 transition-transform">✕</button>
            
            <div className="w-24 h-24 bg-base-200 border-2 border-base-300 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner text-base-content/80">
              {getCategoryIcon(infoModal.icon)}
            </div>
            
            <h3 className="text-3xl font-black tracking-tight text-base-content mb-1">
              {infoModal.catName}
            </h3>
            
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl mt-3 font-bold text-xs uppercase tracking-widest">
              <span className="opacity-80">{user.alias}</span>
              <span className="w-1 h-1 bg-primary rounded-full"></span>
              <span className="opacity-80">{infoModal.date}</span>
            </div>

            <div className="modal-action w-full mt-8">
              <button onClick={() => setInfoModal(null)} className="btn btn-primary w-full rounded-2xl font-black shadow-lg shadow-primary/30 text-lg">
                OK
              </button>
            </div>
          </div>
          <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm cursor-pointer transition-opacity" onClick={() => setInfoModal(null)}></div>
        </div>
      )}

      {/* MODAL EDIT PROFILE  */}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-base-300/80 backdrop-blur-md transition-opacity" onClick={() => setIsEditing(false)}></div>
          <div className="bg-base-100/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.25)] border-2 border-base-300 w-full max-w-lg relative z-10 animate-fade-in-up p-8 flex flex-col gap-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black tracking-tight">{t('profile.customize')}</h3>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">{t('profile.business_card')}</span>
              </div>
              <button onClick={() => setIsEditing(false)} className="btn btn-circle btn-ghost btn-sm">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-6 items-center bg-base-200/50 p-4 rounded-3xl border border-base-300 relative group">
                <div className="avatar flex-shrink-0 relative">
                  <div className="w-20 h-20 rounded-[1.5rem] shadow-inner bg-base-300 ring-2 ring-primary/20 overflow-hidden group-hover:opacity-50 transition-opacity cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <img src={formData.avatar || `https://ui-avatars.com/api/?name=${formData.alias}`} alt="Preview" className="object-cover w-full h-full" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    <PhotoCameraIcon className="text-primary" />
                  </div>
                </div>
                <div className="form-control flex-1">
                  <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">{t('profile.avatar_url')}</span></label>
                  <input type="text" className="input input-sm input-bordered bg-base-100 rounded-xl focus:ring-2 focus:ring-primary/20 w-full" value={formData.avatar} onChange={(e) => setFormData({ ...formData, avatar: e.target.value })} placeholder="https://..." />
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">{t('profile.name_alias')}</span></label><input type="text" className="input input-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary/20 font-bold" value={formData.alias} onChange={(e) => setFormData({ ...formData, alias: e.target.value })} /></div>
                
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">{t('profile.status')}</span></label>
                  <div className="dropdown w-full">
                    <div tabIndex={0} role="button" className="btn btn-outline bg-base-200/50 border-base-300 rounded-2xl w-full justify-between font-bold hover:bg-base-200 text-base-content px-4">
                      <div className="flex items-center gap-2">{getStatusIcon(formData.status)} <span className="truncate">{t(`profile.status_${formData.status.toLowerCase().replace(' ', '_')}`) || formData.status}</span></div>
                      <span className="opacity-50">▼</span>
                    </div>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-2xl bg-base-100 rounded-box w-full mt-1 border border-base-300">
                      <li><a onClick={() => { setFormData({ ...formData, status: 'Disponibile' }); (document.activeElement as HTMLElement)?.blur(); }}><OnlinePredictionIcon fontSize="small" className="text-success" /> {t('profile.status_disponibile') || 'Disponibile'}</a></li>
                      <li><a onClick={() => { setFormData({ ...formData, status: 'Occupato' }); (document.activeElement as HTMLElement)?.blur(); }}><DoNotDisturbOnTotalSilenceIcon fontSize="small" className="text-error" /> {t('profile.status_occupato') || 'Occupato'}</a></li>
                      <li><a onClick={() => { setFormData({ ...formData, status: 'Smart Working' }); (document.activeElement as HTMLElement)?.blur(); }}><HomeWorkIcon fontSize="small" className="text-info" /> {t('profile.status_smart_working') || 'Smart Working'}</a></li>
                      <li><a onClick={() => { setFormData({ ...formData, status: 'In Ferie' }); (document.activeElement as HTMLElement)?.blur(); }}><BeachAccessIcon fontSize="small" className="text-warning" /> {t('profile.status_in_ferie') || 'In Ferie'}</a></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-bold text-[10px] uppercase tracking-widest text-error flex items-center gap-1"><PasswordIcon fontSize="small"/> {t('profile.change_password')}</span>
                </label>
                <input type="password" className="input input-bordered border-error/30 bg-base-200/50 rounded-2xl focus:border-error focus:ring-2 focus:ring-error/20" placeholder={t('profile.password_placeholder')} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </div>

              <div className="form-control"><label className="label py-1"><span className="label-text font-bold text-[10px] uppercase tracking-widest opacity-60">{t('profile.bio')}</span><span className="label-text-alt opacity-40">{formData.description.length}/100</span></label><textarea className="textarea textarea-bordered bg-base-200/50 rounded-2xl focus:ring-2 focus:ring-primary/20 resize-none h-20" placeholder={t('profile.bio_placeholder')} maxLength={100} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea></div>
            </div>
            
            <div className="flex gap-3 mt-4 pt-4 border-t border-base-300/50">
              <button onClick={() => setIsEditing(false)} className="btn btn-ghost flex-1 rounded-2xl font-bold">{t('profile.cancel')}</button>
              <button onClick={handleSaveProfile} className="btn btn-primary flex-1 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30">{t('profile.save')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};