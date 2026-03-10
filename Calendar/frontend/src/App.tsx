import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import BusinessIcon from '@mui/icons-material/Business';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import BeachAccessIcon from '@mui/icons-material/BeachAccess';
import SickIcon from '@mui/icons-material/Sick';
import LuggageIcon from '@mui/icons-material/Luggage';
import DeleteIcon from '@mui/icons-material/Delete';

// 🚀 FUNCIÓN ACTUALIZADA: Ahora recibe 't' y busca en el JSON si la BD está vacía
export const getDynamicCategoryName = (cat: any, currentLang: string, t: any) => {
  if (!cat) return '';
  if (currentLang === 'es' && cat.name_es) return cat.name_es;
  if (currentLang === 'en' && cat.name_en) return cat.name_en;
  return t(`categories_list.${cat.name}`, { defaultValue: cat.name });
};

export default function App() {
  const { t, i18n } = useTranslation(); 

  useEffect(() => {
    dayjs.locale(i18n.language);
  }, [i18n.language]);

  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalData, setModalData] = useState<{ id_user: number; date: string } | null>(null);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('fae_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('fae_token'));

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

  const loadData = async () => {
    try {
      const [usersRes, categoriesRes] = await Promise.all([
        fetch('http://localhost:4000/api/users'),
        fetch('http://localhost:4000/api/categories')
      ]);
      const usersData = await usersRes.json();
      const categoriesData = await categoriesRes.json();

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

  const handleLogin = (user: User, jwtToken: string) => {
    setCurrentUser(user);
    setToken(jwtToken);
    localStorage.setItem('fae_user', JSON.stringify(user));
    localStorage.setItem('fae_token', jwtToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('fae_user');
    localStorage.removeItem('fae_token');
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

  const onAddPresence = (userId: number, date: string) => {
    setModalData({ id_user: userId, date: date });
  };

  const presenciaActual = modalData
    ? users.find(u => u.id_user === modalData.id_user)?.presences.find(p => p.date === modalData.date)
    : null;

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
        setUsers(prevUsers => 
          prevUsers.map(u => u.id_user === updatedData.id_user ? { ...u, ...updatedData } : u)
        );
        if (currentUser?.id_user === updatedData.id_user) {
          const newUserState = { ...currentUser, ...updatedData };
          setCurrentUser(newUserState);
          localStorage.setItem('fae_user', JSON.stringify(newUserState));
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (!currentUser || !token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">

        <Navbar theme={theme} toggleTheme={toggleTheme} currentUser={currentUser} onLogout={handleLogout} />

        <main className="max-w-7xl mx-auto p-4 md:p-8">
          <Routes>
            <Route path="/" element={<Calendar users={users} onAddPresence={onAddPresence} currentUser={currentUser} />} />
            {currentUser.role === 'admin' || currentUser.role === 'ADMIN' ? (
              <Route path="/admin" element={<AdminPanel />} />
            ) : null}
            <Route path="/profile/:id_user" element={<ProfilePage users={users} onAddPresence={onAddPresence} onUpdateUser={handleUpdateUser} currentUser={currentUser} />} />
          </Routes>
        </main>

        {modalData && (
          <div className="modal modal-open modal-bottom sm:modal-middle z-[100]">
            <div className="modal-box relative bg-base-100 shadow-2xl modal-smooth">
              <button onClick={() => setModalData(null)} className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 transition-transform hover:rotate-90">✕</button>
              
              <h3 className="font-bold text-lg mb-6 border-b border-base-200 pb-2"><CalendarMonthIcon/> {t('app.date')}: {modalData.date}</h3>

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
                    <span className="text-4xl mb-2 flex items-center justify-center">{getCategoryIcon(cat.icon)}</span>

                    <span className="text-xs font-bold text-base-content mt-1 text-center">
                      {getDynamicCategoryName(cat, i18n.language, t)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex gap-2 w-full mt-4">
                <button onClick={() => setModalData(null)} className="btn btn-ghost flex-1 transition-all hover:bg-base-200">{t('app.cancel')}</button>
                {presenciaActual && (
                  <button onClick={handleDeletePresence} className="btn btn-error text-white flex-1 shadow-sm transition-transform hover:scale-[1.02]"> <DeleteIcon/>{t('app.delete')}</button>
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