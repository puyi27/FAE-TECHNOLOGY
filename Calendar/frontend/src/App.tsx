import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/it';
import 'dayjs/locale/es';
import 'dayjs/locale/en';
import { useTranslation } from 'react-i18next';

import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import { type User, type Category } from './types';
import { Calendar } from './components/Calendar';
import { ProfilePage } from './components/ProfilePage';
import { LoginPage } from './components/LoginPage';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDynamicCategoryName, getCategoryIcon } from './utils/categoryUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export default function App() {
  const { t, i18n } = useTranslation();

  const [token, setToken] = useState<string | null>(localStorage.getItem('fae_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fae_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalData, setModalData] = useState<{ id_user: number; date: string } | null>(null);

  // Aplicar preferencias del usuario al cargar
  useEffect(() => {
    if (currentUser) {
      i18n.changeLanguage(currentUser.language || 'it');
      document.documentElement.setAttribute('data-theme', currentUser.theme || 'light');
    }
    dayjs.locale(i18n.language);
  }, [currentUser, i18n.language]);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [uRes, cRes] = await Promise.all([ fetch(`${API_URL}/users`), fetch(`${API_URL}/categories`) ]);
      const uData = await uRes.json();
      setUsers(uData.map((u: User) => ({ ...u, avatar: u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.alias)}&background=random` })));
      setCategories(await cRes.json());
    } catch (e) { console.error(e); }
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  // LOGIN Y LOGOUT ULTRA LIMPIOS
  const handleLogin = (user: User, token: string) => {
    localStorage.setItem('fae_token', token);
    localStorage.setItem('fae_user', JSON.stringify(user));
    setToken(token);
    setCurrentUser(user);
    window.history.replaceState(null, '', '/');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; 
  };

  const updatePreferences = async (updates: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    localStorage.setItem('fae_user', JSON.stringify(updatedUser));
    
    // MAGIA: Borramos el password del paquete antes de enviarlo al backend
    const payload: any = { ...updatedUser };
    delete payload.password;

    try {
      await fetch(`${API_URL}/users/${currentUser.id_user}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      loadData();
    } catch (error) { console.error("Error al guardar preferencias", error); }
  };

  // ACTUALIZAR PERFIL COMPLETO
  const handleUpdateUser = async (updatedData: any) => {
    // MAGIA: Si no han escrito una nueva contraseña, la borramos del paquete
    const payload: any = { ...updatedData };
    if (!payload.password || payload.password.trim() === '') {
      delete payload.password;
    }

    try {
      const response = await fetch(`${API_URL}/users/${updatedData.id_user}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        loadData();
        if (currentUser?.id_user === updatedData.id_user) {
          const newUserState = { ...currentUser, ...payload };
          setCurrentUser(newUserState);
          localStorage.setItem('fae_user', JSON.stringify(newUserState));
        }
      }
    } catch (error) { console.error("Error:", error); }
  };

  // 🚀 FUNCIÓN RECUPERADA: GUARDAR PRESENCIA 
  const handleSavePresence = async (cid: number) => {
    if (!modalData) return;
    await fetch(`${API_URL}/presences`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: modalData.id_user, date: modalData.date, id_category: cid }),
    });
    setModalData(null); loadData();
  };

  const handleDeletePresence = async () => {
    if (!modalData) return;
    await fetch(`${API_URL}/presences`, {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_user: modalData.id_user, date: modalData.date })
    });
    setModalData(null); loadData();
  };

  if (!token || !currentUser) return <LoginPage onLogin={handleLogin} />;

  const presenciaActual = modalData ? users.find(u => u.id_user === modalData.id_user)?.presences.find(p => p.date === modalData.date) : null;

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
        
        <Navbar 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          onChangeTheme={(t) => { document.documentElement.setAttribute('data-theme', t); updatePreferences({ theme: t }); }} 
          onChangeLang={(l) => { i18n.changeLanguage(l); updatePreferences({ language: l }); }} 
        />

        <main className="max-w-7xl mx-auto p-4 pb-24 md:p-8">
          <Routes>
            <Route path="/" element={<Calendar users={users} onAddPresence={(uid, d) => setModalData({id_user: uid, date: d})} currentUser={currentUser} />} />
            <Route path="/admin" element={(currentUser.role?.toLowerCase() === 'admin') ? <AdminPanel refreshGlobalData={loadData}/> : <Navigate to="/" replace />} />
            <Route path="/profile/:id_user" element={
              <ProfilePage 
                users={users} 
                onAddPresence={(uid, d) => setModalData({id_user: uid, date: d})} 
                onUpdateUser={handleUpdateUser} // 🚀 AQUÍ AHORA LLAMA A LA FUNCIÓN CORRECTA
                currentUser={currentUser} 
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {modalData && (
          <div className="modal modal-open modal-bottom sm:modal-middle z-[100]">
            <div className="modal-box bg-base-100 p-6 rounded-[2rem]">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CalendarMonthIcon/> {t('app.date')}: {modalData.date}</h3>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => (
                  <button key={cat.id_category} onClick={() => handleSavePresence(cat.id_category)} className={`flex flex-col items-center p-3 border rounded-xl transition-all ${presenciaActual?.categories?.id_category === cat.id_category ? 'bg-primary/20 border-primary ring-2 ring-primary scale-105' : 'bg-base-200 hover:scale-105'}`}>
                    <span className="text-3xl mb-1">{getCategoryIcon(cat.icon)}</span>
                    <span className="text-[10px] font-bold text-center leading-tight">{getDynamicCategoryName(cat, i18n.language, t)}</span>
                  </button>
                ))}
              </div>
              <div className="modal-action">
                <button className="btn btn-ghost rounded-xl" onClick={() => setModalData(null)}>{t('app.cancel')}</button>
                {presenciaActual && <button className="btn btn-error rounded-xl text-white" onClick={handleDeletePresence}><DeleteIcon fontSize="small"/> {t('app.delete')}</button>}
              </div>
            </div>
            <div className="modal-backdrop bg-base-300/60" onClick={() => setModalData(null)}></div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}