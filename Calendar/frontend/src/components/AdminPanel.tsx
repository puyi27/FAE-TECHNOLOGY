import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { type User } from '../types'; 
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CategoryIcon from '@mui/icons-material/Category';


import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { getDynamicCategoryName, getCategoryIcon } from '../utils/categoryUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface AdminPanelProps {
  refreshGlobalData?: () => void;
}

export default function AdminPanel({ refreshGlobalData }: AdminPanelProps) {
  const { t, i18n } = useTranslation();
  
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);


  const [toast, setToast] = useState<{show: boolean, msg: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, msg: string, onConfirm: () => void}>({show: false, msg: '', onConfirm: () => {}});


  const showToastMsg = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const showConfirm = (msg: string, onConfirm: () => void) => {
    setConfirmDialog({ show: true, msg, onConfirm });
  };

  const [userFormData, setUserFormData] = useState({ 
    id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user', password: '',
    avatar: '', description: '', status: 'Disponibile'
  });
  
  const [categoryFormData, setCategoryFormData] = useState({ 
    id_category: '', name: '', name_en: '', name_es: '', icon: '' 
  });

  const availableIcons = ['🏢', '🏠', '🏖️', '🤒', '💼'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        fetch(`${API_URL}/users`),
        fetch(`${API_URL}/categories`)
      ]);
      setUsers(await uRes.json());
      setCategories(await cRes.json());
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenUserModal = (user?: any) => {
    if (user) {
      setUserFormData({ 
        id_user: user.id_user, full_name: user.full_name, phoneNumber: user.phoneNumber || '', 
        alias: user.alias, work: user.work || '', email: user.email || '', role: user.role || 'user', password: '',
        avatar: user.avatar || '', description: user.description || '', status: user.status || 'Disponibile'
      });
    } else {
      setUserFormData({ 
        id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user', password: '',
        avatar: '', description: '', status: 'Disponibile'
      });
    }
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => setIsUserModalOpen(false);
  const handleCloseCategoryModal = () => setIsCategoryModalOpen(false);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdating = Boolean(userFormData.id_user);
    const dataToSend: any = { ...userFormData, alias: userFormData.alias || userFormData.full_name.split(' ')[0].substring(0, 10) };
    
    if (!isUpdating) {
      delete dataToSend.id_user;
      if (!dataToSend.password) return showToastMsg(t('admin.err_password_required'), 'error');
    } else {
      if (!dataToSend.password) delete dataToSend.password;
    }

    try {
      const response = await fetch(isUpdating ? `${API_URL}/users/${userFormData.id_user}` : `${API_URL}/users`, { 
        method: isUpdating ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) 
      });
      if (response.ok) { 
        fetchData(); 
        handleCloseUserModal(); 
        if (refreshGlobalData) refreshGlobalData(); 
        showToastMsg(isUpdating ? t('admin.user_updated') : t('admin.user_created'), 'success');
      } else showToastMsg(t('admin.err_server'), 'error');
    } catch (error) { showToastMsg(t('admin.err_network'), 'error'); }
  };

  const handleDeleteUser = (id_user: string | number, full_name: string) => {
    showConfirm(`${t('admin.confirm_del_user')} "${full_name}"?`, async () => {
      try { 
        const response = await fetch(`${API_URL}/users/${id_user}`, { method: 'DELETE' }); 
        if (response.ok) {
          fetchData();
          if (refreshGlobalData) refreshGlobalData();
          showToastMsg(t('admin.user_deleted'), 'success');
        } 
      } catch (error) { showToastMsg(t('admin.err_network'), 'error'); }
    });
  };

  const handleOpenCategoryModal = (category?: any) => {
    if (category) {
      setCategoryFormData({ 
        id_category: category.id_category, name: category.name, 
        name_en: category.name_en || '', name_es: category.name_es || '', icon: category.icon 
      });
    } else {
      setCategoryFormData({ id_category: '', name: '', name_en: '', name_es: '', icon: '🏢' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.icon) return showToastMsg(t('admin.err_select_icon'), 'warning');
    
    const method = categoryFormData.id_category ? 'PUT' : 'POST';
    const url = categoryFormData.id_category ? `${API_URL}/categories/${categoryFormData.id_category}` : `${API_URL}/categories`;
    try {
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(categoryFormData) });
      if (res.ok) { 
        handleCloseCategoryModal(); 
        fetchData(); 
        if (refreshGlobalData) refreshGlobalData(); 
        showToastMsg(t('admin.cat_saved'), 'success');
      } else {
        showToastMsg(t('admin.err_server'), 'error');
      }
    } catch (error) { showToastMsg(t('admin.err_server'), 'error'); }
  };

  const handleDeleteCategory = (id: number, name: string) => {
    showConfirm(`${t('admin.confirm_del_cat')} "${name}"?`, async () => {
      try { 
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' }); 
        fetchData(); 
        if (refreshGlobalData) refreshGlobalData();
        showToastMsg(t('admin.cat_deleted'), 'success');
      } catch (error) { showToastMsg(t('admin.err_server'), 'error'); }
    });
  };

  if (loading) return <div className="p-10 text-center"><span className="loading loading-dots loading-lg text-primary"></span></div>;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-28 md:pb-20 relative">
      

      {toast && toast.show && (
        <div className="toast toast-top toast-center z-[9999] animate-fade-in-down mt-16 md:mt-4">
          <div className={`alert text-white font-bold shadow-2xl rounded-[1.5rem] flex items-center gap-3 px-6 py-4 backdrop-blur-md ${
            toast.type === 'error' ? 'bg-error/90 border border-error shadow-error/30' : 
            toast.type === 'success' ? 'bg-success/90 border border-success shadow-success/30' : 
            'bg-warning/90 border border-warning shadow-warning/30'
          }`}>
            {toast.type === 'error' && <ErrorOutlineIcon />}
            {toast.type === 'success' && <CheckCircleOutlineIcon />}
            {toast.type === 'warning' && <WarningAmberIcon />}
            <span>{toast.msg}</span>
          </div>
        </div>
      )}


      {confirmDialog.show && (
        <div className="modal modal-open backdrop-blur-sm z-[9999] bg-base-300/60 px-4">
          <div className="modal-box rounded-[2.5rem] border border-base-300 shadow-2xl text-center max-w-md p-6 md:p-8 animate-fade-in-up">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full flex items-center justify-center mb-6 bg-error/10 text-error ring-2 ring-error/20 shadow-inner">
              <WarningAmberIcon fontSize="large" />
            </div>
            <h3 className="font-black text-2xl md:text-3xl text-base-content tracking-tight mb-3">{t('admin.confirm_title')}</h3>
            <p className="py-2 text-base-content/70 font-medium text-base md:text-lg leading-relaxed">{confirmDialog.msg}</p>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-error/70 mt-4">{t('admin.confirm_warning')}</p>
            <div className="modal-action flex gap-3 mt-8">
              <button className="btn btn-ghost flex-1 rounded-2xl font-bold border border-base-300 hover:bg-base-200" onClick={() => setConfirmDialog({ ...confirmDialog, show: false })}>{t('admin.cancel')}</button>
              <button className="btn btn-error flex-1 rounded-2xl font-black text-white shadow-lg shadow-error/30 hover:scale-105 transition-transform" onClick={() => { confirmDialog.onConfirm(); setConfirmDialog({ ...confirmDialog, show: false }); }}>{t('admin.btn_yes_delete')}</button>
            </div>
          </div>
        </div>
      )}

      {/* USER SECTION  */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2 md:gap-3">
            <PersonAddIcon className="text-primary" fontSize="large" /> {t('admin.users')}
          </h2>
          <button onClick={() => handleOpenUserModal()} className="btn btn-primary btn-sm md:btn-md rounded-xl md:rounded-2xl font-bold shadow-lg shadow-primary/20">
             {t('admin.add_user')}
          </button>
        </div>

        {/*  RESPONSIVE */}
        <div className="md:hidden space-y-4">
          {users.map((user) => (
            <div key={user.id_user} className="bg-base-100 rounded-3xl border border-base-300 p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="avatar shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-base-200 border border-base-300 overflow-hidden">
                    <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.alias || user.full_name || 'U')}`} alt={user.alias} className="object-cover w-full h-full" />
                  </div>
                </div>
                <div className="overflow-hidden pr-2">
                  <div className="font-black text-base truncate uppercase tracking-tight text-base-content leading-tight">{user.full_name}</div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-base-content/50 mt-1 truncate">
                    <span className={user.role === 'admin' || user.role === 'ADMIN' ? 'text-primary' : ''}>{user.role}</span> • {user.email || t('admin.no_email')}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => handleOpenUserModal(user)} className="btn btn-circle btn-sm bg-info/10 text-info border-none hover:bg-info/20"><EditIcon fontSize="small" /></button>
                <button onClick={() => handleDeleteUser(user.id_user, user.full_name)} className="btn btn-circle btn-sm bg-error/10 text-error border-none hover:bg-error/20"><DeleteIcon fontSize="small" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* USER TABLE */}
        <div className="hidden md:block overflow-x-auto bg-base-100 rounded-[32px] border border-base-300 shadow-sm">
          <table className="table table-lg">
            <thead>
              <tr className="bg-base-200/50">
                <th className="font-black uppercase tracking-widest text-[10px] opacity-50">{t('admin.name')}</th>
                <th className="font-black uppercase tracking-widest text-[10px] opacity-50">{t('admin.role')}</th>
                <th className="font-black uppercase tracking-widest text-[10px] opacity-50 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id_user} className="hover:bg-base-200/30 transition-colors">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-10 h-10 rounded-xl bg-base-200 border border-base-300 shadow-sm overflow-hidden">
                          <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.alias || user.full_name || 'U')}&background=random&color=fff`} alt={user.alias} className="object-cover w-full h-full" />
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.full_name}</div>
                        <div className="text-xs opacity-50">{user.email || t('admin.no_email')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge font-bold text-[10px] uppercase ${user.role === 'admin' || user.role === 'ADMIN' ? 'badge-primary' : 'badge-ghost'}`}>{user.role}</span>
                  </td>
                  <td className="text-right">
                    <button onClick={() => handleOpenUserModal(user)} className="btn btn-circle btn-ghost btn-sm hover:bg-info/20 hover:text-info"><EditIcon fontSize="small" /></button>
                    <button onClick={() => handleDeleteUser(user.id_user, user.full_name)} className="btn btn-circle btn-ghost btn-sm hover:bg-error/20 hover:text-error"><DeleteIcon fontSize="small" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter flex items-center gap-2 md:gap-3">
            <CategoryIcon className="text-secondary" fontSize="large" /> {t('admin.categories')}
          </h2>
          <button onClick={() => handleOpenCategoryModal()} className="btn btn-secondary btn-sm md:btn-md rounded-xl md:rounded-2xl font-bold shadow-lg shadow-secondary/20">
             {t('admin.add_category')}
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id_category} className="bg-base-100 border border-base-300 rounded-3xl p-5 flex items-center justify-between shadow-sm hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-base-200 flex items-center justify-center text-2xl md:text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="font-black text-base md:text-lg uppercase tracking-tight">
                    {getDynamicCategoryName(cat, i18n.language, t)}
                  </h3>
                  <span className="text-[10px] md:text-xs font-mono opacity-40">ID: #{cat.id_category}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                <button onClick={() => handleOpenCategoryModal(cat)} className="btn btn-circle btn-ghost btn-sm text-info hover:bg-info/20"><EditIcon fontSize="small" /></button>
                <button onClick={() => handleDeleteCategory(cat.id_category, cat.name)} className="btn btn-circle btn-ghost btn-sm text-error hover:bg-error/20"><DeleteIcon fontSize="small" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY MODAL */}
      {isCategoryModalOpen && (
        <div className="modal modal-open backdrop-blur-md px-4">
          <div className="modal-box rounded-[2.5rem] border border-base-300 shadow-2xl p-6 md:p-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">{categoryFormData.id_category ? t('admin.edit_category') : t('admin.new_category')}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.cat_name_base')}</span></label>
                <input type="text" placeholder={t('admin.cat_ph_base')} className="input input-bordered w-full rounded-2xl bg-base-200/50 font-bold" value={categoryFormData.name} onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.cat_name_en')}</span></label>
                  <input type="text" placeholder={t('admin.cat_ph_en')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={categoryFormData.name_en} onChange={(e) => setCategoryFormData({...categoryFormData, name_en: e.target.value})} />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.cat_name_es')}</span></label>
                  <input type="text" placeholder={t('admin.cat_ph_es')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={categoryFormData.name_es} onChange={(e) => setCategoryFormData({...categoryFormData, name_es: e.target.value})} />
                </div>
              </div>
              <div className="form-control mt-4">
                <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.icon')}</span></label>
                <div className="flex gap-2 justify-center p-3 bg-base-200/30 rounded-3xl border border-dashed border-base-300 overflow-x-auto">
                  {availableIcons.map(emoji => (
                    <button key={emoji} type="button" onClick={() => setCategoryFormData({ ...categoryFormData, icon: emoji })} className={`btn btn-circle btn-md md:btn-lg text-xl md:text-2xl transition-all shrink-0 ${categoryFormData.icon === emoji ? 'btn-primary scale-110 shadow-md ring-4 ring-primary/20' : 'btn-ghost hover:bg-base-300'}`}>{getCategoryIcon(emoji)}</button>
                  ))}
                </div>
              </div>
              <div className="modal-action">
                <button type="button" onClick={handleCloseCategoryModal} className="btn btn-ghost rounded-2xl">{t('admin.cancel')}</button>
                <button type="submit" className="btn btn-secondary px-6 md:px-10 rounded-2xl font-black">{t('admin.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USERS MODAL */}
      {isUserModalOpen && (
        <div className="modal modal-open backdrop-blur-md px-4">
          <div className="modal-box rounded-[2.5rem] border border-base-300 shadow-2xl p-6 md:p-8 max-w-md">
            <h3 className="font-bold text-2xl text-base-content mb-6 tracking-tight">{userFormData.id_user ? t('admin.edit_user') : t('admin.new_user')}</h3>
            <form onSubmit={handleUserSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.full_name')}</span></label>
                <input type="text" required placeholder={t('admin.user_ph_name')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.full_name} onChange={e => setUserFormData({ ...userFormData, full_name: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.email')}</span></label>
                <input type="email" required placeholder={t('admin.user_ph_email')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.password')}</span></label>
                <input type="password" placeholder={userFormData.id_user ? t('admin.password_ph_edit') : t('admin.password_ph_new')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.password} onChange={e => setUserFormData({ ...userFormData, password: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.alias')}</span></label>
                  <input type="text" maxLength={10} placeholder={t('admin.user_ph_alias')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.alias} onChange={e => setUserFormData({ ...userFormData, alias: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.phone')}</span></label>
                  <input type="tel" placeholder={t('admin.user_ph_phone')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.phoneNumber} onChange={e => setUserFormData({ ...userFormData, phoneNumber: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.profession')}</span></label>
                  <input type="text" placeholder={t('admin.user_ph_work')} className="input input-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.work} onChange={e => setUserFormData({ ...userFormData, work: e.target.value })} />
                </div>
                <div className="form-control">
                  <label className="label pb-1"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.permissions')}</span></label>
                  <select className="select select-bordered w-full rounded-2xl bg-base-200/50" value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}>
                    <option value="user">{t('admin.user_standard')}</option>
                    <option value="admin">{t('admin.user_admin')}</option>
                  </select>
                </div>
              </div>
              <div className="modal-action pt-4 mt-4">
                <button type="button" onClick={handleCloseUserModal} className="btn btn-ghost rounded-2xl">{t('admin.cancel')}</button>
                <button type="submit" className="btn btn-primary px-6 md:px-10 rounded-2xl font-black">{userFormData.id_user ? t('admin.save') : t('admin.create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 