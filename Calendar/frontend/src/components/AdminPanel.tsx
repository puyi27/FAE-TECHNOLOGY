import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LuggageIcon from '@mui/icons-material/Luggage';
import AddIcon from '@mui/icons-material/Add';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CategoryIcon from '@mui/icons-material/Category';

export default function AdminPanel() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para Modales y Formularios
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({ 
    id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' 
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({ 
    id_category: '', name: '', icon: '' 
  });

  const availableIcons = ['🏢', '🏠', '🏖️', '🤒', '💼'];

  // 🚀 TRADUCTOR DE ICONOS: De emoji de BD a Material UI
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, cRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/categories')
      ]);
      const uData = await uRes.json();
      const cData = await cRes.json();
      setUsers(uData);
      setCategories(cData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LÓGICA DE CATEGORÍAS ---
  const handleOpenCategoryModal = (category?: any) => {
    if (category) {
      setCategoryFormData({
        id_category: category.id_category,
        name: category.name,
        icon: category.icon
      });
    } else {
      setCategoryFormData({ id_category: '', name: '', icon: '🏢' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = categoryFormData.id_category ? 'PUT' : 'POST';
    const url = categoryFormData.id_category 
      ? `http://localhost:4000/api/categories/${categoryFormData.id_category}`
      : 'http://localhost:4000/api/categories';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData)
      });
      if (res.ok) {
        setIsCategoryModalOpen(false);
        fetchData();
      }
    } catch (error) {
      alert(t('admin.err_server'));
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm(t('admin.confirm_del_cat'))) return;
    try {
      await fetch(`http://localhost:4000/api/categories/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert(t('admin.err_server'));
    }
  };

  if (loading) return <div className="p-10 text-center"><span className="loading loading-dots loading-lg"></span></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      
      {/* SECCIÓN CATEGORÍAS */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
              <CategoryIcon className="text-secondary" fontSize="large" />
              {t('admin.categories')}
            </h2>
            <p className="text-base-content/50 font-medium ml-1">Gestiona los tipos de presencia</p>
          </div>
          <button onClick={() => handleOpenCategoryModal()} className="btn btn-secondary btn-md rounded-2xl font-bold shadow-lg shadow-secondary/20">
            <AddIcon /> {t('admin.add_category')}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id_category} className="bg-base-100 border border-base-300 rounded-3xl p-5 flex items-center justify-between hover:shadow-xl transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {getCategoryIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="font-black text-lg uppercase tracking-tight">

                    {t(`categories_list.${cat.name}`, { defaultValue: cat.name })}
                  </h3>
                  <span className="text-xs font-mono opacity-40">ID: #{cat.id_category}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleOpenCategoryModal(cat)} className="btn btn-circle btn-ghost btn-sm hover:bg-info/20 hover:text-info">
                  <EditIcon fontSize="small" />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id_category)} className="btn btn-circle btn-ghost btn-sm hover:bg-error/20 hover:text-error">
                  <DeleteIcon fontSize="small" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL CATEGORÍA */}
      {isCategoryModalOpen && (
        <div className="modal modal-open backdrop-blur-md">
          <div className="modal-box rounded-[32px] border border-base-300 shadow-2xl p-8">
            <h3 className="text-2xl font-black mb-6 flex items-center gap-2">
              {categoryFormData.id_category ? t('admin.edit_category') : t('admin.new_category')}
            </h3>
            <form onSubmit={handleSaveCategory} className="space-y-6">
              <div className="form-control">
                <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.category_name')}</span></label>
                <input 
                  type="text" 
                  className="input input-bordered w-full rounded-2xl bg-base-200/50"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                  placeholder="Ej: Smart Working"
                  required
                />
                <p className="text-[10px] mt-2 opacity-40 px-1">Nota: Use el nombre original para que la traducción funcione automáticamente.</p>
              </div>

              <div className="form-control">
                <label className="label"><span className="label-text font-bold uppercase tracking-widest opacity-60 text-[10px]">{t('admin.icon')}</span></label>
                <div className="flex gap-3 justify-center p-4 bg-base-200/30 rounded-3xl border border-dashed border-base-300">
                  {availableIcons.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCategoryFormData({ ...categoryFormData, icon: emoji })}
                      className={`btn btn-circle btn-lg text-2xl transition-all ${
                        categoryFormData.icon === emoji ? 'btn-primary scale-110' : 'btn-ghost'
                      }`}
                    >
                      {getCategoryIcon(emoji)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modal-action">
                <button type="button" onClick={() => setIsCategoryModalOpen(false)} className="btn btn-ghost rounded-2xl">{t('admin.cancel')}</button>
                <button type="submit" className="btn btn-secondary px-10 rounded-2xl font-black">{t('admin.save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN USUARIOS */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
            <PersonAddIcon className="text-primary" fontSize="large" />
            {t('admin.users')}
          </h2>
        </div>
        <div className="overflow-x-auto bg-base-100 rounded-[32px] border border-base-300 shadow-sm">
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
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-xl w-10">
                          <span className="text-xs">{user.alias?.substring(0, 2).toUpperCase()}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-bold">{user.full_name}</div>
                        <div className="text-xs opacity-50">{user.email || t('admin.no_email')}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge font-bold text-[10px] uppercase ${user.role === 'admin' ? 'badge-primary' : 'badge-ghost'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn btn-square btn-ghost btn-sm"><EditIcon fontSize="small" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}