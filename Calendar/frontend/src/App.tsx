import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Calendar } from './components/Calendar';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { type User, type Category } from './types';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalData, setModalData] = useState<{ id_user: number; date: string } | null>(null);

  // 🌓 ESTADO DEL TEMA (Local Storage)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // Aplicar tema y guardar en localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';

    // Comprobamos si el navegador soporta esta nueva "magia"
    if (!document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }

    // El navegador congela la pantalla, cambia el tema y hace un fundido perfecto
    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  // Carga de datos
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
    <p>Hola esto simplemente es una edición para saber como va lo de las ramas en git pero ahora es la versión 2</p>
      <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">

        <Navbar theme={theme} toggleTheme={toggleTheme} />

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Calendar users={users} onAddPresence={(id, date) => setModalData({ id_user: Number(id), date })} />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>

        {/* --- MODAL DE PRESENCIAS (Encapsulado en HTML de DaisyUI) --- */}
        {modalData && (
          <div className="modal modal-open modal-bottom sm:modal-middle z-50">
            {/* ✅ Añadimos modal-smooth para que el cuadro blanco haga zoom-in */}
            <div className="modal-box relative bg-base-100 shadow-2xl modal-smooth">
              <button onClick={() => setModalData(null)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 transition-transform hover:rotate-90">✕</button>
              <h3 className="font-bold text-lg mb-6 border-b border-base-200 pb-2">📅 Data: {modalData.date}</h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {/* ✅ Extraemos el 'index' en el map de categorías */}
                {categories.map((cat, index) => (
                  <button
                    key={cat.id_category}
                    onClick={() => handleSavePresence(cat.id_category)}
                    // ✅ Añadimos stagger-item
                    className={`stagger-item flex flex-col items-center justify-center p-4 border rounded-2xl hover:bg-primary/10 hover:border-primary transition-all duration-300 ${
                      presenciaActual?.categories?.id_category === cat.id_category
                        ? 'bg-primary/20 border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-105'
                        : 'border-base-300 bg-base-200/50 hover:scale-105'
                    }`}
                    // ✅ Hacemos que los botones entren en cascada muy rápida (30ms)
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <span className="text-3xl mb-1">{cat.icon}</span>
                    <span className="text-xs font-bold text-base-content mt-1 text-center">{cat.name}</span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button onClick={() => setModalData(null)} className="btn btn-ghost flex-1 transition-all hover:bg-base-200">Annulla</button>
                {presenciaActual && (
                  <button onClick={handleDeletePresence} className="btn btn-error text-white flex-1 shadow-sm transition-transform hover:scale-[1.02]">🗑️ Elimina</button>
                )}
              </div>
            </div>
            
            {/* Animación suave para el fondo oscuro también */}
            <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm cursor-pointer transition-opacity duration-300" onClick={() => setModalData(null)}></div>
          </div>
        )}

      </div>
    </BrowserRouter>
  );
}