import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Calendar } from './components/Calendar';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { ProfilePage } from './components/ProfilePage';
import { type User, type Category } from './types';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalData, setModalData] = useState<{ id_user: number; date: string } | null>(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // --- LÓGICA DE TEMA ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }
    document.startViewTransition(() => setTheme(nextTheme));
  };

  // --- CARGA DE DATOS DESDE API ---
  const loadData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/categories')
      ]);
      const usersData = await usersRes.json();
      const categoriesData = await categoriesRes.json();

      const usersWithAvatars = usersData.map((u: any) => ({
        ...u,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || u.alias)}&background=random`
      }));

      setUsers(usersWithAvatars);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- FUNCIONES DEL MODAL (Añadir/Eliminar) ---
  const onAddPresence = (userId: number, date: string) => {
    setModalData({ id_user: userId, date: date });
  };

  const handleSavePresence = async (categoryId: number) => {
    if (!modalData) return;
    await fetch('http://localhost:4000/api/presences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: modalData.id_user, date: modalData.date, id_category: categoryId }),
    });
    setModalData(null);
    loadData();
  };

  const handleDeletePresence = async () => {
    if (!modalData) return;
    await fetch('http://localhost:4000/api/presences', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: modalData.id_user, date: modalData.date })
    });
    setModalData(null);
    loadData();
  };

  const presenciaActual = modalData
    ? users.find(u => u.id_user === modalData.id_user)?.presences.find(p => p.date === modalData.date)
    : null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            {/* El calendario principal es SOLO LECTURA */}
            <Route path="/" element={<Calendar users={users} />} />
            
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* El perfil recibe la función onAddPresence para abrir el modal */}
            <Route 
              path="/profile/:id_user" 
              element={<ProfilePage users={users} onAddPresence={onAddPresence} />} 
            />
          </Routes>
        </main>

        {/* --- MODAL DE DAISYUI (Reutilizado para el Perfil) --- */}
        {modalData && (
          <div className="modal modal-open modal-bottom sm:modal-middle z-50">
            <div className="modal-box relative bg-base-100 shadow-2xl">
              <button onClick={() => setModalData(null)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4">✕</button>
              <h3 className="font-bold text-lg mb-6 border-b border-base-200 pb-2">📅 Data: {modalData.date}</h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {categories.map((cat, index) => (
                  <button
                    key={cat.id_category}
                    onClick={() => handleSavePresence(cat.id_category)}
                    className={`flex flex-col items-center justify-center p-4 border rounded-2xl hover:bg-primary/10 transition-all ${
                      presenciaActual?.categories?.id_category === cat.id_category
                        ? 'bg-primary/20 border-primary ring-2 ring-primary'
                        : 'border-base-300 bg-base-200/50'
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="text-3xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold text-center">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button onClick={() => setModalData(null)} className="btn btn-ghost flex-1">Annulla</button>
                {presenciaActual && (
                  <button onClick={handleDeletePresence} className="btn btn-error text-white flex-1">🗑️ Elimina</button>
                )}
              </div>
            </div>
            <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm" onClick={() => setModalData(null)}></div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}