import { MapaBase } from './MapaBase';

function App() {



  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f0f4f8', 
      fontFamily: 'sans-serif'
    }}>
      <h1 style={{ color: '#334155', marginBottom: '20px' }}>Monitor de Fallos Globales</h1>
      

      <MapaBase />
      
      <p style={{ marginTop: '20px', color: '#64748b', fontSize: '14px' }}>
        Componente MapaBase v1.0 - FAE Technology
      </p>
    </div>
  );
}


export default App;