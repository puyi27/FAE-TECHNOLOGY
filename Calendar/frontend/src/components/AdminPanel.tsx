import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryIcon } from './DayCell'; // Importamos la misma lógica para consistencia

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function AdminPanel() {
  const { t } = useTranslation();
  
  // Estados de datos
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de modales
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  // Estados de formularios
  const [userFormData, setUserFormData] = useState({ id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' });
  const [categoryFormData, setCategoryFormData] = useState({ id_category: '', name: '', icon: '' });

  const fetchData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([fetch('http://localhost:4000/api/users'), fetch('http://localhost:4000/api/categories')]);
      setUsers(await usersRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) { console.error("Error loading data:", err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  // -- HANDLERS USUARIOS --
  const handleOpenUserDialog = (user?: any) => {
    if (user) setUserFormData({ id_user: user.id_user, full_name: user.full_name, phoneNumber: user.phoneNumber || '', alias: user.alias, work: user.work || '', email: user.email || '', role: user.role || 'user' });
    else setUserFormData({ id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' });
    setIsUserModalOpen(true);
  };
  
  const handleCloseUserDialog = () => { setIsUserModalOpen(false); setUserFormData({ id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' }); };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdating = Boolean(userFormData.id_user);
    const dataToSend: any = { ...userFormData, alias: userFormData.alias || userFormData.full_name.split(' ')[0].substring(0, 10) };
    if (!isUpdating) delete dataToSend.id_user;
    try {
      const response = await fetch(isUpdating ? `http://localhost:4000/api/users/${userFormData.id_user}` : 'http://localhost:4000/api/users', { method: isUpdating ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
      if (response.ok) { fetchData(); handleCloseUserDialog(); } else alert(t('admin.err_server'));
    } catch (error) { alert(t('admin.err_network')); }
  };

  const handleUserDelete = async (id_user: string, full_name: string) => {
    if (!window.confirm(`${t('admin.confirm_del_user')} "${full_name}"?`)) return;
    try { const response = await fetch(`http://localhost:4000/api/users/${id_user}`, { method: 'DELETE' }); if (response.ok) fetchData(); } catch (error) { alert(t('admin.err_network')); }
  };

  // -- HANDLERS CATEGORÍAS --
  const handleOpenCategoryDialog = (category?: any) => {
    if (category) setCategoryFormData({ id_category: category.id_category, name: category.name, icon: category.icon });
    else setCategoryFormData({ id_category: '', name: '', icon: '' });
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryDialog = () => { setIsCategoryModalOpen(false); setCategoryFormData({ id_category: '', name: '', icon: '' }); };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.icon) return alert("Seleziona un'icona"); 
    
    const isUpdating = Boolean(categoryFormData.id_category);
    const dataToSend: any = { ...categoryFormData };
    if (!isUpdating) delete dataToSend.id_category;
    try {
      const response = await fetch(isUpdating ? `http://localhost:4000/api/categories/${categoryFormData.id_category}` : 'http://localhost:4000/api/categories', { method: isUpdating ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataToSend) });
      if (response.ok) { fetchData(); handleCloseCategoryDialog(); } else alert(t('admin.err_server'));
    } catch (error) { alert(t('admin.err_network')); }
  };

  const handleCategoryDelete = async (id_category: string, name: string) => {
    if (!window.confirm(`${t('admin.confirm_del_cat')} "${name}"?`)) return;
    try { const response = await fetch(`http://localhost:4000/api/categories/${id_category}`, { method: 'DELETE' }); if (response.ok) fetchData(); } catch (error) { alert(t('admin.err_network')); }
  };

  if (loading) return <div className="flex justify-center mt-20"><span className="loading loading-ring loading-lg text-primary"></span></div>;

  const availableIcons = ['🏢', '🏠', '🏖️', '🤒', '💼'];

  return (
    <div className="animate-fade-in pb-20">
      
      {/* SECCIÓN USUARIOS */}
      <div className="flex justify-between items-end mb-6 border-b border-base-300 pb-4">
        <h2 className="text-3xl font-black tracking-tight text-base-content">{t('admin.users')}</h2>
        <button onClick={() => handleOpenUserDialog()} className="group relative overflow-hidden rounded-xl bg-primary px-6 py-2 md:py-3 text-primary-content font-bold shadow-lg transition-all hover:scale-105 hover:shadow-primary/40">
          <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]"><div className="w-12 bg-white/30 blur-sm" /></div>
          <span className="relative z-10">{t('admin.add_user')}</span>  
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-sm overflow-x-auto border border-base-200 mb-16">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs">
            <tr><th className="w-16">{t('admin.photo')}</th><th>{t('admin.name')}</th><th>{t('admin.phone')}</th><th>{t('admin.role')}</th><th className="text-right">{t('admin.actions')}</th></tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id_user} className="stagger-item hover:bg-base-200/50 transition-colors duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <td><div className="avatar"><div className="w-10 h-10 rounded-full border border-base-300 bg-base-300 shadow-sm"><img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.alias || user.full_name)}&background=random`} alt={user.alias} className="object-cover" /></div></div></td>
                <td><div className="font-bold text-sm">{user.alias}</div><div className="text-xs opacity-70">{user.full_name}</div><div className="text-[10px] text-primary mt-0.5">{user.email || t('admin.no_email')}</div></td>
                <td className="font-mono tracking-wide text-xs">{user.phoneNumber || '-'}</td>
                <td><div className="flex flex-col gap-1 items-start"><span className="text-xs opacity-80">{user.work || t('admin.employee')}</span><span className={`badge badge-xs font-bold ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-outline opacity-50'}`}>{user.role === 'ADMIN' ? t('admin.user_admin') : t('admin.user_standard')}</span></div></td>
                <td className="text-right"><button onClick={() => handleOpenUserDialog(user)} className="btn btn-sm btn-ghost btn-circle text-info"><EditIcon /></button><button onClick={() => handleUserDelete(user.id_user, user.full_name)} className="btn btn-sm btn-ghost btn-circle text-error"><DeleteIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SECCIÓN CATEGORÍAS */}
      <div className="flex justify-between items-end mb-6 border-b border-base-300 pb-4 mt-8">
        <h2 className="text-3xl font-black tracking-tight text-base-content">{t('admin.categories')}</h2>
        <button onClick={() => handleOpenCategoryDialog()} className="group relative overflow-hidden rounded-xl bg-secondary px-6 py-2 md:py-3 text-secondary-content font-bold shadow-lg transition-all hover:scale-105 hover:shadow-secondary/40">
          <div className="absolute inset-0 flex h-full w-full justify-center transform-[skew(-12deg)_translateX(-150%)] group-hover:duration-1000 group-hover:transform-[skew(-12deg)_translateX(150%)]"><div className="w-12 bg-white/30 blur-sm" /></div>
          <span className="relative z-10">{t('admin.add_category')}</span>
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-sm overflow-x-auto border border-base-200">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs">
            <tr><th className="w-16">ID</th><th>{t('admin.name')}</th><th className="text-center w-24">{t('admin.icon')}</th><th className="text-right w-32">{t('admin.actions')}</th></tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id_category} className="stagger-item hover:bg-base-200/50 transition-colors duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="font-mono text-base-content/50 text-xs">{cat.id_category}</td>
                <td><div className="font-bold text-sm">{cat.name}</div></td>
                <td className="text-center text-3xl flex items-center justify-center text-base-content/80 drop-shadow-sm">{getCategoryIcon(cat.icon)}</td>
                <td className="text-right"><button onClick={() => handleOpenCategoryDialog(cat)} className="btn btn-sm btn-ghost btn-circle text-info"><EditIcon /></button><button onClick={() => handleCategoryDelete(cat.id_category, cat.name)} className="btn btn-sm btn-ghost btn-circle text-error"><DeleteIcon /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL USUARIO */}
      <dialog className={`modal ${isUserModalOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle z-50`}>
        <div className="modal-box bg-base-100 rounded-2xl p-6 md:p-8 max-w-md modal-smooth shadow-xl border border-base-200/50">
          <h3 className="font-bold text-2xl text-base-content mb-6 tracking-tight">{userFormData.id_user ? t('admin.edit_user') : t('admin.new_user')}</h3>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.full_name')}</span></label><input type="text" required placeholder="Mario Rossi" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={userFormData.full_name} onChange={e => setUserFormData({ ...userFormData, full_name: e.target.value })} /></div>
            <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.email')}</span></label><input type="email" placeholder="mario@email.com" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.alias')}</span></label><input type="text" placeholder="Mario" maxLength={10} className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={userFormData.alias} onChange={e => setUserFormData({ ...userFormData, alias: e.target.value })} /></div>
              <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.phone')}</span></label><input type="tel" placeholder="+39 333..." className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={userFormData.phoneNumber} onChange={e => setUserFormData({ ...userFormData, phoneNumber: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.profession')}</span></label><input type="text" placeholder="Es: Sviluppatore" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={userFormData.work} onChange={e => setUserFormData({ ...userFormData, work: e.target.value })} /></div>
              <div className="form-control"><label className="label pb-1"><span className="label-text text-base-content/70 font-medium">{t('admin.permissions')}</span></label><select className="select select-bordered w-full bg-base-200 text-base-content border-base-300 focus:border-primary" value={userFormData.role} onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}><option value="user">{t('admin.user_standard')}</option><option value="admin">{t('admin.user_admin')}</option></select></div>
            </div>
            <div className="modal-action pt-2 mt-6"><button type="button" onClick={handleCloseUserDialog} className="btn btn-ghost font-normal">{t('admin.cancel')}</button><button type="submit" className="btn btn-primary px-8 font-medium">{userFormData.id_user ? t('admin.save') : t('admin.create')}</button></div>
          </form>
        </div><div className="modal-backdrop bg-base-300/50 backdrop-blur-sm transition-opacity" onClick={handleCloseUserDialog}></div>
      </dialog>

      {/* MODAL CATEGORÍA */}
      <dialog className={`modal ${isCategoryModalOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle z-50`}>
        <div className="modal-box bg-base-100 rounded-2xl p-6 md:p-8 max-w-md modal-smooth shadow-xl border border-base-200/50">
          <h3 className="font-bold text-2xl text-base-content mb-6 tracking-tight">{categoryFormData.id_category ? t('admin.edit_category') : t('admin.new_category')}</h3>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-base-content/70">{t('admin.category_name')}</span></label>
              <input type="text" required placeholder="Es: Ferie" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
            </div>
            
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-base-content/70 font-medium">{t('admin.icon')}</span></label>
              <div className="flex gap-2 justify-center mt-2 bg-base-200/50 p-3 rounded-2xl border border-base-300">
                {availableIcons.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setCategoryFormData({ ...categoryFormData, icon: emoji })}
                    className={`btn btn-circle btn-lg text-2xl flex items-center justify-center transition-all ${
                      categoryFormData.icon === emoji 
                        ? 'btn-primary shadow-lg scale-110 ring-4 ring-primary/20 text-primary-content' 
                        : 'btn-ghost bg-base-100 hover:bg-base-300 text-base-content/80'
                    }`}
                  >
                    {getCategoryIcon(emoji)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-action pt-4 mt-6">
              <button type="button" onClick={handleCloseCategoryDialog} className="btn btn-ghost font-normal">{t('admin.cancel')}</button>
              <button type="submit" className="btn btn-secondary px-8 font-medium">{categoryFormData.id_category ? t('admin.save') : t('admin.create')}</button>
            </div>
          </form>
        </div><div className="modal-backdrop bg-base-300/50 backdrop-blur-sm transition-opacity" onClick={handleCloseCategoryDialog}></div>
      </dialog>
    </div>
  );
}