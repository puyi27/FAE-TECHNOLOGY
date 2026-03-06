import { Link, useLocation } from 'react-router-dom';

interface NavbarProps {
  theme: string;
  toggleTheme: () => void;
}

export default function Navbar({ theme, toggleTheme }: NavbarProps) {
  // Usamos useLocation para saber en qué página estamos y resaltar el menú
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-200/60 bg-base-100/80 backdrop-blur-md">
      <div className="navbar max-w-7xl mx-auto px-4 md:px-8 h-20">
        
        {/* LOGO */}
        <div className="flex-1">
          <Link to="/" className="group flex flex-col cursor-pointer">
            <h1 className="text-2xl md:text-3xl font-black text-base-content tracking-tighter">
              FAE <span className="text-primary font-bold">TECHNOLOGY</span>
            </h1>
            <span className="text-xs text-base-content/50 font-semibold tracking-wide uppercase mt-0.5 group-hover:text-primary transition-colors">
              Gestione Presenze
            </span>
          </Link>
        </div>

        {/* NAVEGACIÓN Y CONTROLES */}
        <div className="flex-none flex items-center gap-1 sm:gap-2">
          
          {/* Enlace: Calendario */}
          <Link 
            to="/" 
            className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              location.pathname === '/' 
                ? 'bg-base-200 text-base-content shadow-sm' 
                : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'
            }`}
          >
            <span className="text-lg">📅</span> Calendario
          </Link>

          {/* Enlace: Admin */}
          <Link 
            to="/admin" 
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              location.pathname === '/admin' 
                ? 'bg-primary/10 text-primary shadow-sm' 
                : 'text-base-content/60 hover:bg-base-200/50 hover:text-base-content'
            }`}
          >
            <span className="text-lg">⚙️</span> Admin
          </Link>
          
          {/* Separador vertical elegante */}
          <div className="w-px h-8 bg-base-300/60 mx-1 sm:mx-2 hidden sm:block"></div>

          {/* Toggle Modo Claro / Oscuro */}
          <label className="swap swap-rotate btn btn-ghost btn-circle btn-sm md:btn-md hover:bg-base-200/50">
            <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
            <div className="swap-on text-xl md:text-2xl drop-shadow-sm">🌙</div>
            <div className="swap-off text-xl md:text-2xl drop-shadow-sm">☀️</div>
          </label>

        </div>
      </div>
    </header>
  );
}