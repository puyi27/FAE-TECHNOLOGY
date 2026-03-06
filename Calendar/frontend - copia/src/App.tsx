import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { type User, type WorkCategory } from './types';

// Nuestras categorías
const CATEGORIAS: WorkCategory[] = [
  { id: '1', name: 'Oficina', icon: '🏢' },
  { id: '2', name: 'Casa', icon: '🏠' },
  { id: '3', name: 'Vacaciones', icon: '🌴' }
];

// Usuarios de prueba
const USUARIOS_INICIALES: User[] = [
  {
    id: 'u1',
    name: 'Alex (Admin)',
    email: 'admin@empresa.com',
    avatar: 'https://ui-avatars.com/api/?name=Alex&background=random',
    presences: []
  },
  {
    id: 'u2',
    name: 'Lucía García',
    email: 'lucia@empresa.com',
    avatar: 'https://ui-avatars.com/api/?name=Lucia+Garcia&background=random',
    presences: []
  }
];

function App() {
  const [users, setUsers] = useState<User[]>(USUARIOS_INICIALES);
  
  // Estado para controlar la ventana flotante (Modal)
  const [modalData, setModalData] = useState<{ userId: string; date: string } | null>(null);

  // Cuando hacemos clic en un día, abrimos la ventana en lugar del 'prompt'
  const handleOpenModal = (userId: string, date: string) => {
    setModalData({ userId, date });
  };

  // Función para guardar la opción elegida en la ventana
  const handleSavePresence = (category: WorkCategory) => {
    if (!modalData) return;

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === modalData.userId) {
        const presenciasFiltradas = user.presences.filter(p => p.date !== modalData.date);
        return {
          ...user,
          presences: [
            ...presenciasFiltradas,
            { 
              id: Date.now().toString(), 
              date: modalData.date, 
              categoryId: category.id, 
              category: category 
            }
          ]
        };
      }
      return user;
    }));
    
    setModalData(null); // Cerramos la ventana al guardar
  };

  // Función para borrar (editar/limpiar) el día
  const handleDeletePresence = () => {
    if (!modalData) return;

    setUsers(prevUsers => prevUsers.map(user => {
      if (user.id === modalData.userId) {
        // Quitamos la presencia de ese día
        return {
          ...user,
          presences: user.presences.filter(p => p.date !== modalData.date)
        };
      }
      return user;
    }));

    setModalData(null); // Cerramos la ventana
  };

  // Buscamos si el día seleccionado ya tenía algo marcado para mostrar el botón de borrar
  const presenciaActual = modalData 
    ? users.find(u => u.id === modalData.userId)?.presences.find(p => p.date === modalData.date) 
    : null;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 relative">
      <header className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">
          FAE <span className="text-blue-600">TECHNOLOGY</span>
        </h1>
        <p className="text-gray-500 mt-2 font-medium">Gestión de Presencia (Versión Visual)</p>
      </header>
      
      <main className="max-w-7xl mx-auto">
        <Calendar users={users} onAddPresence={handleOpenModal} />
      </main>

      {/* --- VENTANA FLOTANTE (MODAL) --- */}
      {modalData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fade-in-up">
            
            {/* Cabecera de la ventana */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">
                Opciones para el {modalData.date.split('-').reverse().join('/')}
              </h3>
              <button 
                onClick={() => setModalData(null)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Opciones a elegir */}
            <div className="p-6">
              <p className="text-sm text-gray-500 mb-4 text-center">
                ¿Desde dónde va a trabajar este usuario?
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {CATEGORIAS.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleSavePresence(cat)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-xs font-bold text-gray-600">{cat.name}</span>
                  </button>
                ))}
              </div>

              {/* Botones de acción (Borrar y Cerrar) */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                {presenciaActual && (
                  <button 
                    onClick={handleDeletePresence}
                    className="flex-1 py-2 px-4 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
                <button 
                  onClick={() => setModalData(null)}
                  className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default App;