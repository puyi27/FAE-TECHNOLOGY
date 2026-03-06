import { Link, useLocation } from 'react-router-dom';
import { type User } from '../types'; // Asegúrate de que la ruta a types.ts sea la correcta

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
  // Hacemos que sean opcionales (?) para que no te dé error si aún no hay sesión
  currentUser?: User | null; 
  onLogout?: () => void;
}

export default function Navbar({ theme, toggleTheme, currentUser, onLogout }: NavbarProps) {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-200/60 bg-base-100/80 backdrop-blur-md transition-colors duration-300">
      <div className="navbar max-w-[1600px] mx-auto px-4 md:px-8 h-20">
        
        {/* --- LOGO --- */}
        <div className="flex-1">
          <Link to="/" className="group flex flex-col cursor-pointer w-max">
            <h1 className="text-2xl md:text-3xl font-black text-base-content tracking-tighter">
              FAE <span className="text-primary font-bold">TECHNOLOGY</span>
            </h1>
            <span className="text-[10px] md:text-xs text-base-content/50 font-semibold tracking-widest uppercase mt-0.5 group-hover:text-primary transition-colors">
              Gestione Presenze
            </span>
          </Link>
        </div>

        {/* --- NAVEGACIÓN Y CONTROLES --- */}
        <div className="flex-none flex items-center gap-1 sm:gap-2">
          
          {/* Enlace: Calendario (Oculto en móvil, se mueve al menú del usuario) */}
          <Link 
            to="/" 
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              location.pathname === '/' 
                ? 'bg-base-200 text-base-content shadow-sm ring-1 ring-base-300' 
                : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'
            }`}
          >
            <span className="text-lg opacity-80">📅</span> Calendario
          </Link>

          {/* Enlace: Admin */}
          <Link 
            to="/admin" 
            className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all ${
              location.pathname === '/admin' 
                ? 'bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20' 
                : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'
            }`}
          >
            <span className="text-lg opacity-80">⚙️</span> Admin
          </Link>
          
          {/* Separador vertical */}
          <div className="w-[2px] h-8 bg-base-300/60 mx-1 sm:mx-2 hidden sm:block rounded-full"></div>

          {/* Toggle Modo Claro / Oscuro */}
          <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm md:btn-md hover:bg-base-200/50 transition-colors">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
            <div className="swap-on text-xl md:text-2xl drop-shadow-sm">🌙</div>
            <div className="swap-off text-xl md:text-2xl drop-shadow-sm">☀️</div>
          </label>

          {/* --- MENÚ DESPLEGABLE DEL USUARIO (Solo si hay alguien logueado) --- */}
          {currentUser && (
            <div className="dropdown dropdown-end ml-1">
              {/* Botón del Avatar */}
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost btn-circle avatar ring-2 ring-transparent hover:ring-primary/30 focus:ring-primary transition-all ml-1"
              >
                <div className="w-9 md:w-10 rounded-full border-2 border-base-100 shadow-sm bg-base-300">
                  <img 
                    alt={currentUser.alias} 
                    src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} 
                    className="object-cover" 
                  />
                </div>
              </div>
              
              {/* Contenido del Menú */}
              <ul tabIndex={0} className="mt-4 z-[1] p-2 shadow-2xl menu menu-sm dropdown-content bg-base-100/95 backdrop-blur-xl rounded-[1.5rem] border border-base-300 w-64 origin-top-right">
                
                {/* Cabecera del menú con nombre y rol */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-base-200/50 mb-2">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-full">
                       <img 
                          alt={currentUser.alias} 
                          src={currentUser.avatar ?? `https://ui-avatars.com/api/?name=${currentUser.alias}`} 
                       />
                    </div>
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-black text-base-content truncate leading-tight">{currentUser.alias}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary truncate mt-0.5">{currentUser.work || 'Team Member'}</span>
                  </div>
                </div>
                
<li>
                  <Link 
                    to={`/profile/${currentUser.id_user}`} 
                    // 👇 AÑADE ESTO: Quita el foco y cierra el menú al instante
                    onClick={() => {
                      const elem = document.activeElement as HTMLElement;
                      if (elem) elem.blur();
                    }}
                    className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors flex justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg opacity-50 group-hover:opacity-100 transition-opacity">👤</span> 
                      Il Mio Profilo
                    </div>
                  </Link>
                </li>

                {/* Enlaces versión móvil */}
                <div className="md:hidden">
                  <li>
                    <Link 
                      to="/" 
                      // 👇 AQUÍ TAMBIÉN
                      onClick={() => (document.activeElement as HTMLElement)?.blur()}
                      className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors"
                    >
                      <span className="text-lg opacity-50 mr-2">📅</span> Calendario
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin" 
                      // 👇 Y AQUÍ
                      onClick={() => (document.activeElement as HTMLElement)?.blur()}
                      className="py-3 font-bold hover:bg-base-200/80 rounded-xl transition-colors text-primary"
                    >
                      <span className="text-lg opacity-50 mr-2">⚙️</span> Admin
                    </Link>
                  </li>
                </div>

                <div className="divider my-1 opacity-50"></div>
                
                {/* Botón Logout */}
                <li>
                  <button 
                    onClick={onLogout} 
                    className="py-3 font-bold text-error hover:bg-error/10 hover:text-error rounded-xl transition-colors group flex justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">🚪</span> 
                      Esci
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}