import { useState } from 'react';

interface LoginPageProps {
  onLogin: (user: any, token: string) => void;
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user, data.token);
      } else {
        setError(data.error || 'Credenziali non valide');
      }
    } catch (err) {
      setError("Impossibile connettersi al server. Riprova più tardi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-base-100/60 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border-2 border-base-300 p-10 relative z-10 animate-fade-in">
        
        {/* Cabecera */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 ring-1 ring-primary/30 shadow-inner">
            <span className="text-4xl">🔐</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-base-content mb-2">Benvenuto</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-base-content/50">
            Area Riservata al Team
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm font-bold p-4 rounded-2xl text-center animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            
            {/* Input Email */}
            <div className="relative group">
              <span className="absolute left-5 top-4 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">✉️</span>
              <input 
                type="email" 
                placeholder="mario.rossi@fae.technology" 
                className="input input-lg w-full bg-base-200/50 border-2 border-base-300 rounded-2xl pl-14 focus:ring-4 focus:ring-primary/10 text-base-content font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Input Password */}
            <div className="relative group">
              <span className="absolute left-5 top-4 opacity-40 group-focus-within:text-primary group-focus-within:opacity-100 transition-all">🔑</span>
              <input 
                type="password" 
                placeholder="Password" 
                className="input input-lg w-full bg-base-200/50 border-2 border-base-300 rounded-2xl pl-14 focus:ring-4 focus:ring-primary/10 text-base-content font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            
          </div> {/* Aquí es donde faltaba el </div> en tu código */}

          <button 
            type="submit" 
            className="btn btn-primary btn-lg w-full rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_-10px_rgba(var(--p),0.5)] hover:shadow-[0_10px_20px_-5px_rgba(var(--p),0.6)] transition-all"
            disabled={isLoading}
          >
            {isLoading ? <span className="loading loading-spinner"></span> : 'Accedi'}
          </button>
        </form>

        {/* Mensaje de Administrador (Sin Sign Up) */}
        <div className="mt-8 text-center border-t border-base-300/50 pt-6">
          <p className="text-[11px] font-bold text-base-content/40 uppercase tracking-widest leading-relaxed">
            Non hai un account? <br/>
            <span className="text-base-content/60">Rivolgiti all'amministratore di sistema per richiederne la creazione.</span>
          </p>
        </div>

      </div>
    </div>
  );
};