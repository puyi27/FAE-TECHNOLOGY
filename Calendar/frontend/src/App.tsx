import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Calendar } from './components/Calendar';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { type User, type Category } from './types';
import { ProfilePage } from './components/ProfilePage';

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalData, setModalData] = useState<{ id_user: number; date: string } | null>(null);

  // 🌓 ESTADO DEL TEMA (Local Storage)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  // 🚀 ESTADOS DE SESIÓN (Para el Navbar y permisos)
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Aplicar tema y guardar en localStorage
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
    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  // 🚀 CARGA DE DATOS (Arreglada para no borrar los avatares reales)
  const loadData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/categories')
      ]);
      const usersData = await usersRes.json();
      const categoriesData = await categoriesRes.json();

      // Mantenemos la foto de la DB. Solo generamos la falsa si en la DB está vacía/null
      const usersProcessed = usersData.map((u: any) => ({
        ...u,
        avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.alias)}&background=random`
      }));

      setUsers(usersProcessed);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Error cargando datos:", error);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 🚀 SIMULACIÓN DE LOGIN (Autologin con el usuario ID 1 para pruebas)
  useEffect(() => {
    if (users.length > 0 && !currentUser) {
      const mainUser = users.find(u => u.id_user === 1) || users[0];
      setCurrentUser(mainUser);
    }
  }, [users]);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // --- FUNCIONES DE PRESENCIAS ---
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

  const onAddPresence = (userId: number, date: string) => {
    setModalData({ id_user: userId, date: date });
  };

  const presenciaActual = modalData
    ? users.find(u => u.id_user === modalData.id_user)?.presences.find(p => p.date === modalData.date)
    : null;

  // 🚀 NUEVA FUNCIÓN: GUARDAR EL PERFIL EN LA BASE DE DATOS
  const handleUpdateUser = async (updatedData: any) => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${updatedData.id_user}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alias: updatedData.alias,
          avatar: updatedData.avatar,
          description: updatedData.description,
          status: updatedData.status
        }),
      });

      if (response.ok) {
        // Actualizar el estado general de usuarios (para la tabla principal)
        setUsers(prevUsers => 
          prevUsers.map(u => u.id_user === updatedData.id_user ? { ...u, ...updatedData } : u)
        );
        
        // Si el usuario editado es el mismo que está logueado, actualizar el Navbar
        if (currentUser?.id_user === updatedData.id_user) {
          setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
        }
      } else {
        console.error("Error al guardar en el servidor");
      }
    } catch (error) {
      console.error("Error de conexión al actualizar usuario:", error);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">

        <Navbar 
          theme={theme} 
          toggleTheme={toggleTheme} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
        />

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Calendar users={users} />} />
            <Route path="/admin" element={<AdminPanel />} />
            
            {/* 🚀 Pasamos onUpdateUser a la página de perfil */}
            <Route 
              path="/profile/:id_user" 
              element={
                <ProfilePage 
                  users={users} 
                  onAddPresence={onAddPresence} 
                  onUpdateUser={handleUpdateUser} 
                />
              } 
            />
          </Routes>
        </main>

        {/* --- MODAL DE PRESENCIAS --- */}
        {modalData && (
          <div className="modal modal-open modal-bottom sm:modal-middle z-50">
            <div className="modal-box relative bg-base-100 shadow-2xl modal-smooth">
              <button onClick={() => setModalData(null)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 transition-transform hover:rotate-90">✕</button>
              <h3 className="font-bold text-lg mb-6 border-b border-base-200 pb-2">📅 Data: {modalData.date}</h3>

              <div className="grid grid-cols-3 gap-3 mb-6">
                {categories.map((cat, index) => (
                  <button
                    key={cat.id_category}
                    onClick={() => handleSavePresence(cat.id_category)}
                    className={`stagger-item flex flex-col items-center justify-center p-4 border rounded-2xl hover:bg-primary/10 hover:border-primary transition-all duration-300 ${
                      presenciaActual?.categories?.id_category === cat.id_category
                        ? 'bg-primary/20 border-primary ring-2 ring-primary ring-offset-2 ring-offset-base-100 scale-105'
                        : 'border-base-300 bg-base-200/50 hover:scale-105'
                    }`}
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
            
            <div className="modal-backdrop bg-base-300/60 backdrop-blur-sm cursor-pointer transition-opacity duration-300" onClick={() => setModalData(null)}></div>
          </div>
        )}

      </div>
    </BrowserRouter>
  );
}