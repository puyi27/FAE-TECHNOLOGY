import { useState, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react'; // 👈 1. Importamos el selector

export default function AdminPanel() {
  // ==========================================
  // ESTADOS: USUARIOS
  // ==========================================
  const [users, setUsers] = useState<any[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [userFormData, setUserFormData] = useState({
    id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user'
  });

  // ==========================================
  // ESTADOS: CATEGORÍAS
  // ==========================================
  const [categories, setCategories] = useState<any[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryFormData, setCategoryFormData] = useState({
    id_category: '', name: '', icon: ''
  });

  const [loading, setLoading] = useState(true);


  // ==========================================
  // CARGA DE DATOS (FETCH)
  // ==========================================
  const fetchData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/categories')
      ]);
      const usersData = await usersRes.json();
      const categoriesData = await categoriesRes.json();

      setUsers(usersData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Errore caricamento:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // HANDLERS: USUARIOS
  // ==========================================
  const handleOpenUserDialog = (user?: any) => {
    if (user) {
      setUserFormData({
        id_user: user.id_user, full_name: user.full_name, phoneNumber: user.phoneNumber || '',
        alias: user.alias, work: user.work || '', email: user.email || '', role: user.role || 'user'
      });
    } else {
      setUserFormData({ id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' });
    }
    setIsUserModalOpen(true);
  };

  const handleCloseUserDialog = () => {
    setIsUserModalOpen(false);
    setUserFormData({ id_user: '', full_name: '', phoneNumber: '', alias: '', work: '', email: '', role: 'user' });
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdating = Boolean(userFormData.id_user);
    const dataToSend: any = { ...userFormData, alias: userFormData.alias || userFormData.full_name.split(' ')[0].substring(0, 10) };
    if (!isUpdating) delete dataToSend.id_user;

    const url = isUpdating ? `http://localhost:4000/api/users/${userFormData.id_user}` : 'http://localhost:4000/api/users';

    try {
      const response = await fetch(url, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        fetchData();
        handleCloseUserDialog();
      } else alert("❌ Errore del server.");
    } catch (error) {
      alert("❌ Errore di rete.");
    }
  };

  const handleUserDelete = async (id_user: string, full_name: string) => {
    if (!window.confirm(`⚠️ Sicuro di eliminare l'utente "${full_name}"?`)) return;
    try {
      const response = await fetch(`http://localhost:4000/api/users/${id_user}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { alert("❌ Errore di connessione."); }
  };

  // ==========================================
  // HANDLERS: CATEGORÍAS
  // ==========================================
  const handleOpenCategoryDialog = (category?: any) => {
    if (category) {
      setCategoryFormData({ id_category: category.id_category, name: category.name, icon: category.icon });
    } else {
      setCategoryFormData({ id_category: '', name: '', icon: ''});
    }
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryDialog = () => {
    setIsCategoryModalOpen(false);
    setCategoryFormData({ id_category: '', name: '', icon: ''});
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isUpdating = Boolean(categoryFormData.id_category);
    const dataToSend: any = { ...categoryFormData };
    if (!isUpdating) delete dataToSend.id_category;

    const url = isUpdating ? `http://localhost:4000/api/categories/${categoryFormData.id_category}` : 'http://localhost:4000/api/categories';

    try {
      const response = await fetch(url, {
        method: isUpdating ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });
      if (response.ok) {
        fetchData();
        handleCloseCategoryDialog();
      } else alert("❌ Errore del server.");
    } catch (error) {
      alert("❌ Errore di rete.");
    }
  };

  const handleCategoryDelete = async (id_category: string, name: string) => {
    if (!window.confirm(`⚠️ Sicuro di eliminare la categoria "${name}"?`)) return;
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${id_category}`, { method: 'DELETE' });
      if (response.ok) fetchData();
    } catch (error) { alert("❌ Errore di connessione."); }
  };


  if (loading) return <div className="flex justify-center mt-20"><span className="loading loading-ring loading-lg text-primary"></span></div>;

  return (
    <div className="animate-fade-in pb-20">
      {/* ========================================== */}
      {/* SECCIÓN 1: USUARIOS (Basado en tu dibujo)  */}
      {/* ========================================== */}
      <div className="flex justify-between items-end mb-6 border-b border-base-300 pb-4">
        <h2 className="text-3xl font-black tracking-tight text-base-content">USERS</h2>
        <button onClick={() => handleOpenUserDialog()} className="btn btn-primary btn-sm md:btn-md shadow-sm hover:shadow-md transition-all">
          + USER
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-sm overflow-x-auto border border-base-200 mb-16">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs">
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Telefono</th>
              <th>Ruolo</th>
              <th className="text-right">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id_user} className="stagger-item hover:bg-base-200/50 transition-colors duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="font-mono text-base-content/50 text-xs">{user.id_user}</td>
                <td>
                  <div className="font-bold text-sm">{user.alias}</div>
                  <div className="text-xs opacity-70">{user.full_name}</div>
                  <div className="text-[10px] text-primary mt-0.5">{user.email || 'Nessuna email'}</div>
                </td>
                <td className="font-mono tracking-wide text-xs">{user.phoneNumber || '-'}</td>
                <td>
                  <div className="flex flex-col gap-1 items-start">
                    <span className="text-xs opacity-80">{user.work || 'Dipendente'}</span>
                    <span className={`badge badge-xs font-bold ${user.role === 'ADMIN' ? 'badge-primary' : 'badge-outline opacity-50'}`}>
                      {user.role === 'ADMIN' ? 'Admin' : 'User'}
                    </span>
                  </div>
                </td>
                <td className="text-right">
                  <button onClick={() => handleOpenUserDialog(user)} className="btn btn-sm btn-ghost btn-circle text-info" title="Modifica">✏️</button>
                  <button onClick={() => handleUserDelete(user.id_user, user.full_name)} className="btn btn-sm btn-ghost btn-circle text-error" title="Elimina">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ============================================== */}
      {/* SECCIÓN 2: CATEGORÍAS (Basado en tu dibujo)    */}
      {/* ============================================== */}
      <div className="flex justify-between items-end mb-6 border-b border-base-300 pb-4 mt-8">
        <h2 className="text-3xl font-black tracking-tight text-base-content">CATEGORIES</h2>
        <button onClick={() => handleOpenCategoryDialog()} className="btn btn-secondary btn-sm md:btn-md shadow-sm hover:shadow-md transition-all">
          + CATEGORY
        </button>
      </div>

      <div className="bg-base-100 rounded-2xl shadow-sm overflow-x-auto border border-base-200">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/50 text-base-content/70 uppercase text-xs">
            <tr>
              <th className="w-16">ID</th>
              <th>Name</th>
              <th className="text-center w-24">Icon</th>
              <th className="text-right w-32">Azioni</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, index) => (
              <tr key={cat.id_category} className="stagger-item hover:bg-base-200/50 transition-colors duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="font-mono text-base-content/50 text-xs">{cat.id_category}</td>
                <td>
                  <div className="font-bold text-sm">{cat.name}</div>
                </td>
                <td className="text-center text-2xl">{cat.icon}</td>
                <td className="text-right">
                  <button onClick={() => handleOpenCategoryDialog(cat)} className="btn btn-sm btn-ghost btn-circle text-info" title="Modifica">✏️</button>
                  <button onClick={() => handleCategoryDelete(cat.id_category, cat.name)} className="btn btn-sm btn-ghost btn-circle text-error" title="Elimina">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* ========================================== */}
      {/* MODAL: USUARIOS (Minimalista)                */}
      {/* ========================================== */}
      <dialog className={`modal ${isUserModalOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle z-50`}>
        <div className="modal-box bg-base-100 rounded-2xl p-6 md:p-8 max-w-md modal-smooth shadow-xl border border-base-200/50">
          <h3 className="font-bold text-2xl text-base-content mb-6 tracking-tight">
            {userFormData.id_user ? 'Modifica collaboratore' : 'Nuovo collaboratore'}
          </h3>
          <form onSubmit={handleUserSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-base-content/70">Nome Completo</span></label>
              <input type="text" required placeholder="Mario Rossi" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={userFormData.full_name} onChange={e => setUserFormData({ ...userFormData, full_name: e.target.value })} />
            </div>
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-base-content/70">Email</span></label>
              <input type="email" placeholder="mario@email.com" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={userFormData.email} onChange={e => setUserFormData({ ...userFormData, email: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-base-content/70">Alias</span></label>
                <input type="text" placeholder="Mario" maxLength={10} className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={userFormData.alias} onChange={e => setUserFormData({ ...userFormData, alias: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-base-content/70">Telefono</span></label>
                <input type="tel" placeholder="+39 333..." className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={userFormData.phoneNumber} onChange={e => setUserFormData({ ...userFormData, phoneNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label pb-1"><span className="label-text text-base-content/70">Professione</span></label>
                <input type="text" placeholder="Es: Sviluppatore" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={userFormData.work} onChange={e => setUserFormData({ ...userFormData, work: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label pb-1">
                  <span className="label-text text-base-content/70 font-medium">Permessi</span>
                </label>
                <select
                  className="select select-bordered w-full bg-base-200 text-base-content border-base-300 focus:border-primary focus:bg-base-100 transition-all duration-200 font-medium cursor-pointer"
                  value={userFormData.role}
                  onChange={e => setUserFormData({ ...userFormData, role: e.target.value })}
                >
                  <option value="user" className="bg-base-100">Utente Standard</option>
                  <option value="admin" className="bg-base-100">Amministratore</option>
                </select>
              </div>
            </div>
            <div className="modal-action pt-2 mt-6">
              <button type="button" onClick={handleCloseUserDialog} className="btn btn-ghost font-normal">Annulla</button>
              <button type="submit" className="btn btn-primary px-8 font-medium shadow-sm hover:shadow-md transition-all">{userFormData.id_user ? 'Salva' : 'Crea'}</button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm transition-opacity" onClick={handleCloseUserDialog}></div>
      </dialog>

      {/* ========================================== */}
      {/* MODAL: CATEGORÍAS (Minimalista)              */}
      {/* ========================================== */}
      <dialog className={`modal ${isCategoryModalOpen ? 'modal-open' : ''} modal-bottom sm:modal-middle z-50`}>
        <div className="modal-box bg-base-100 rounded-2xl p-6 md:p-8 max-w-md modal-smooth shadow-xl border border-base-200/50">
          <h3 className="font-bold text-2xl text-base-content mb-6 tracking-tight">
            {categoryFormData.id_category ? 'Modifica categoria' : 'Nuova categoria'}
          </h3>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div className="form-control">
              <label className="label pb-1"><span className="label-text text-base-content/70">Nome Categoria</span></label>
              <input type="text" required placeholder="Es: Ferie" className="input input-bordered w-full bg-base-200/30 focus:bg-base-200 focus:border-primary transition-colors" value={categoryFormData.name} onChange={e => setCategoryFormData({ ...categoryFormData, name: e.target.value })} />
            </div>

            <div className="form-control col-span-1">
              <label className="label pb-1">
                <span className="label-text text-base-content/70 font-medium">Icona</span>
              </label>
              <select
                className="select select-bordered w-full text-xl bg-base-200 text-base-content border-base-300 focus:border-primary focus:bg-base-100 transition-all duration-200 cursor-pointer px-2 text-center"
                value={categoryFormData.icon}
                onChange={e => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                required
              >
                <option value="" disabled className="bg-base-100">--</option>
                <option value="🏢" className="bg-base-100 text-2xl">🏢</option>
                <option value="🏠" className="bg-base-100 text-2xl">🏠</option>
                <option value="🏖️" className="bg-base-100 text-2xl">🏖️</option>
                <option value="🤒" className="bg-base-100 text-2xl">🤒</option>
                <option value="💼" className="bg-base-100 text-2xl">💼</option>
              </select>
            </div>

            <div className="modal-action pt-2 mt-6">
              <button type="button" onClick={handleCloseCategoryDialog} className="btn btn-ghost font-normal">Annulla</button>
              <button type="submit" className="btn btn-secondary px-8 font-medium shadow-sm hover:shadow-md transition-all">{categoryFormData.id_category ? 'Salva' : 'Crea'}</button>
            </div>
          </form>
        </div>
        <div className="modal-backdrop bg-base-300/50 backdrop-blur-sm transition-opacity" onClick={handleCloseCategoryDialog}></div>
      </dialog>

    </div>
  );
}