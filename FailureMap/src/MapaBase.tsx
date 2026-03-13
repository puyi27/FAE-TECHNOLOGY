import { useEffect, useMemo, useState, useRef } from 'react';
import * as d3 from 'd3';
import { hexbin } from 'd3-hexbin';
import PublicIcon from '@mui/icons-material/Public';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CloseIcon from '@mui/icons-material/Close';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Filler
);

interface PuntoFallo extends Array<number> {
  0: number;
  1: number;
  data?: {
    lng: number;
    lat: number;
    color: string;
    info?: string;
    historial?: number[];
  };
}

export const MapaBase = () => {
  const [worldData, setWorldData] = useState<any>(null);
  const [datosApi, setDatosApi] = useState<any[]>([]);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; x: number; y: number; fallos: any[] }>({
    visible: false, x: 0, y: 0, fallos: []
  });
  const [filtro, setFiltro] = useState<string>('TODOS');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<any | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const zoomContainerRef = useRef<SVGGElement>(null);
  const realMapRef = useRef<SVGGElement>(null);
  const hexRef = useRef<SVGGElement>(null);
  const faultsRef = useRef<SVGGElement>(null);

  const width = 1000;
  const height = 500;

  useEffect(() => {
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
      .then((data: any) => {
        if (data) {
          data.features = data.features.filter((f: any) => f.properties.name !== "Antarctica");
          setWorldData(data);
        }
      });

    const cargarDatos = () => {
      fetch('/fallos.json')
        .then(res => res.json())
        .then(data => {
          const datosProcesados = data.map((d: any) => {
            const hist = d.historial || [];
            const ultimoValor = hist.length > 0 ? hist[hist.length - 1] : 0;
            const ciudad = d.info ? (d.info.includes(':') ? d.info.split(':')[1].trim() : d.info) : '';
            
            let estado = 'FUNCIONANDO';
            let color = '#2ef380';

            if (ultimoValor >= 10) {
              estado = 'CRÍTICO';
              color = '#ef4444';
            } else if (ultimoValor > 0) {
              estado = 'AVISO';
              color = '#f97316';
            }

            return {
              ...d,
              color,
              info: `${estado}: ${ciudad}`
            };
          });
          setDatosApi(datosProcesados);
        })
        .catch(err => console.error(err));
    };

    cargarDatos();
    const intervalo = setInterval(cargarDatos, 10000);

    return () => clearInterval(intervalo);
  }, []);

  const contadores = useMemo(() => {
    return {
      TODOS: datosApi.length,
      CRÍTICO: datosApi.filter(d => d.info?.includes('CRÍTICO')).length,
      AVISO: datosApi.filter(d => d.info?.includes('AVISO')).length,
      FUNCIONANDO: datosApi.filter(d => d.info?.includes('FUNCIONANDO')).length
    };
  }, [datosApi]);

  const opcionesFiltro = [
    { id: 'TODOS', texto: 'Todos los estados', icono: <PublicIcon fontSize="small" style={{ color: isDark ? '#94a3b8' : '#0084ff' }} /> },
    { id: 'CRÍTICO', texto: 'Críticos', icono: <ErrorIcon fontSize="small" style={{ color: '#ef4444' }} /> },
    { id: 'AVISO', texto: 'Avisos', icono: <WarningIcon fontSize="small" style={{ color: '#f97316' }} /> },
    { id: 'FUNCIONANDO', texto: 'Funcionando', icono: <CheckCircleIcon fontSize="small" style={{ color: '#00d600da' }} /> }
  ];

  const datosFiltrados = useMemo(() => {
    if (filtro === 'TODOS') return datosApi;
    return datosApi.filter(d => d.info && d.info.includes(filtro));
  }, [datosApi, filtro]);

  const projection = useMemo(() => {
    if (!worldData) return null;
    return d3.geoMercator().fitExtent([[50, 50], [width - 50, height - 50]], worldData);
  }, [worldData]);

  const pathGeneratorReal = useMemo(() => {
    if (!projection) return null;
    return d3.geoPath().projection(projection);
  }, [projection]);

  const hexagonsBase = useMemo(() => {
    if (!worldData || !projection) return [];
    const canvas = document.createElement('canvas');
    canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return [];

    const pathGenCanvas = d3.geoPath().projection(projection).context(context);
    context.fillStyle = '#000'; context.beginPath();
    pathGenCanvas(worldData); context.fill();

    const imageData = context.getImageData(0, 0, width, height).data;
    const hexRadiusBase = 4;
    const hexWidth = Math.sqrt(3) * hexRadiusBase;
    const rowHeight = 1.5 * hexRadiusBase;
    const points: [number, number][] = [];

    for (let y = 0, row = 0; y < height; y += rowHeight, row++) {
      for (let x = (row % 2 === 0) ? 0 : hexWidth / 2; x < width; x += hexWidth) {
        if (imageData[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] > 128) {
          points.push([x, y]);
        }
      }
    }
    return points;
  }, [worldData, projection]);

  const fallosExactos = useMemo(() => {
    if (!projection) return [];
    return datosFiltrados.map(d => {
      const coords = projection([d.lng, d.lat]);
      return { ...d, px: coords ? coords[0] : 0, py: coords ? coords[1] : 0 };
    });
  }, [projection, datosFiltrados]);

  useEffect(() => {
    if (!svgRef.current || !zoomContainerRef.current || !faultsRef.current || !realMapRef.current || !hexRef.current) return;

    const svg = d3.select(svgRef.current);
    const container = d3.select(zoomContainerRef.current);
    const faultsGroup = d3.select(faultsRef.current);
    const clusterHexbin = hexbin<PuntoFallo>().radius(12);
    
    let lastK = -1;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 15])
      .translateExtent([[-150, -150], [width + 150, height + 150]])
      .on('zoom', (event) => {
        const t = event.transform;
        
        container.attr('transform', t);
        faultsGroup.attr('transform', `translate(${t.x}, ${t.y})`);

        if (t.k !== lastK) {
          lastK = t.k;

          let realOpacity = (t.k - 2.5) / (4.0 - 2.5);
          realOpacity = Math.max(0, Math.min(1, realOpacity));
          d3.select(hexRef.current).style('opacity', 1 - realOpacity);
          d3.select(realMapRef.current).style('opacity', realOpacity);
          d3.select(realMapRef.current).selectAll('path').attr('stroke-width', 0.8 / t.k);

          const puntosEscalados: PuntoFallo[] = fallosExactos.map(f => {
            const p = [f.px * t.k, f.py * t.k] as PuntoFallo;
            p.data = f;
            return p;
          });

          const bins = clusterHexbin(puntosEscalados);

          faultsGroup.selectAll<SVGGElement, any>('g.cluster')
            .data(bins)
            .join(
              enter => {
                const g = enter.append('g').attr('class', 'cluster').style('cursor', 'pointer');
                g.append('path').attr('class', 'hex-pulse').style('pointer-events', 'none');
                g.append('path').attr('class', 'hex-base');
                g.append('text')
                  .attr('text-anchor', 'middle')
                  .attr('dy', '0.35em')
                  .style('font-size', '10px')
                  .style('font-family', 'sans-serif')
                  .style('font-weight', 'bold')
                  .style('fill', '#ffffff')
                  .style('pointer-events', 'none');
                return g;
              },
              update => update,
              exit => exit.remove()
            )
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .on('mouseenter', (e, d) => {
              setTooltipInfo({ visible: true, x: e.clientX, y: e.clientY, fallos: d.map(p => p.data) });
            })
            .on('mouseleave', () => setTooltipInfo(prev => ({ ...prev, visible: false })))
            .on('click', (e, d) => {
              if (d.length === 1) {
                setPuntoSeleccionado(d[0].data);
              }
            })
            .each(function(d) {
              const node = d3.select(this);
              
              let color = '#2ef380';
              let animClass = '';

              if (d.length > 1) {
                color = '#0084ff';
                animClass = 'pulse-slow';
              } else {
                const info = d[0].data?.info || '';
                if (info.includes('CRÍTICO')) {
                  color = '#ef4444';
                  animClass = 'pulse-fast';
                } else if (info.includes('AVISO')) {
                  color = '#f97316';
                  animClass = 'pulse-slow';
                }
              }

              node.select('path.hex-base')
                .attr('d', clusterHexbin.hexagon())
                .attr('fill', color)
                .attr('stroke', 'var(--stroke-hex-cluster)')
                .attr('stroke-width', 1.5);

              node.select('path.hex-pulse')
                .attr('d', clusterHexbin.hexagon())
                .attr('stroke', color)
                .attr('fill', 'none')
                .attr('stroke-width', 1.5)
                .attr('class', `hex-pulse ${animClass}`);

              node.select('text')
                .text(d.length > 1 ? d.length : '');
            });
        }
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity);

  }, [worldData, fallosExactos]);

  useEffect(() => {
    if (puntoSeleccionado) {
      const puntoActualizado = datosApi.find(
        (p) => p.lat === puntoSeleccionado.lat && p.lng === puntoSeleccionado.lng
      );
      if (puntoActualizado) {
        setPuntoSeleccionado(puntoActualizado);
      }
    }
  }, [datosApi]);

  const getStatusIcon = (info: string = '') => {
    if (info.includes('CRÍTICO')) return <ErrorIcon fontSize="small" style={{ color: '#ef4444' }} />;
    if (info.includes('AVISO')) return <WarningIcon fontSize="small" style={{ color: '#f97316' }} />;
    return <CheckCircleIcon fontSize="small" style={{ color: '#00d600da' }} />;
  };

  const chartData = useMemo(() => {
    if (!puntoSeleccionado) return null;
    
    const labels = Array.from({ length: 24 }, (_, i) => `-${24 - i}h`);
    const data = puntoSeleccionado.historial || new Array(24).fill(0);

    const hasCritical = puntoSeleccionado.info?.includes('CRÍTICO');
    const isWarning = !hasCritical && puntoSeleccionado.info?.includes('AVISO');
    
    let colorHex = '#2ef380';
    let bgColor = 'rgba(46, 243, 128, 0.2)';
    
    if (hasCritical) {
      colorHex = '#ef4444';
      bgColor = 'rgba(239, 68, 68, 0.2)';
    } else if (isWarning) {
      colorHex = '#f97316';
      bgColor = 'rgba(249, 115, 22, 0.2)';
    }

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Eventos registrados',
          data,
          borderColor: colorHex,
          backgroundColor: bgColor,
          tension: 0.4,
          pointRadius: 2,
          pointHoverRadius: 5
        }
      ]
    };
  }, [puntoSeleccionado]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#f8fafc' : '#334155',
        bodyColor: isDark ? '#cbd5e1' : '#475569',
        borderColor: isDark ? '#334155' : '#cbd5e1',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(203, 213, 225, 0.4)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', maxTicksLimit: 8 }
      }
    }
  };

  if (!worldData) return null;

  const hexPathBase = hexbin().hexagon(3);
  const opcionSeleccionada = opcionesFiltro.find(o => o.id === filtro);

  const cssVars = {
    '--bg-container': isDark ? '#040912' : '#eaf0f8',
    '--bg-map': isDark ? '#1a2639' : '#cbd5e1',
    '--stroke-map': isDark ? '#2e4159' : '#ffffff',
    '--fill-hex': isDark ? '#2a3b52' : '#ffffff',
    '--stroke-hex-cluster': isDark ? '#040912' : '#ffffff',
    '--bg-menu': isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
    '--border-menu': isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.5)',
    '--text-main': isDark ? '#f8fafc' : '#334155',
    '--bg-hover': isDark ? 'rgba(51, 65, 85, 0.8)' : 'rgba(241, 245, 249, 0.8)',
    '--bg-badge': isDark ? '#1e293b' : '#f1f5f9',
    '--bg-badge-active': isDark ? '#475569' : '#e2e8f0',
    '--text-badge': isDark ? '#cbd5e1' : '#475569',
  } as React.CSSProperties;

  return (
    <div style={{ ...cssVars, position: 'relative', width: 'fit-content', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <style>
        {`
          @keyframes animPulseFast {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @keyframes animPulseSlow {
            0% { transform: scale(1); opacity: 0.6; }
            100% { transform: scale(1.4); opacity: 0; }
          }
          .pulse-fast { animation: animPulseFast 1.2s ease-out infinite; }
          .pulse-slow { animation: animPulseSlow 2.5s ease-out infinite; }
          .smooth-theme { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; }
        `}
      </style>
      
      <div className="smooth-theme" style={{ backgroundColor: 'var(--bg-container)', padding: '20px', borderRadius: '15px', overflow: 'hidden', position: 'relative', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
        
        <div style={{ position: 'absolute', top: '30px', right: '30px', zIndex: 40, display: 'flex', gap: '12px', alignItems: 'flex-start', fontFamily: 'sans-serif' }}>
          
          <button
            onClick={() => setIsDark(!isDark)}
            className="smooth-theme"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '42px', height: '42px', backgroundColor: 'var(--bg-menu)', borderRadius: '8px',
              border: '1px solid var(--border-menu)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              color: 'var(--text-main)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            {isDark ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </button>

          <div style={{ width: '240px' }}>
            <div
              onClick={() => setMenuAbierto(!menuAbierto)}
              className="smooth-theme"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', backgroundColor: 'var(--bg-menu)', borderRadius: '8px',
                border: '1px solid var(--border-menu)', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {opcionSeleccionada?.icono}
                {opcionSeleccionada?.texto}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="smooth-theme" style={{ backgroundColor: 'var(--bg-badge)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-badge)' }}>
                  {contadores[filtro as keyof typeof contadores]}
                </span>
                <span style={{ fontSize: '10px', transform: menuAbierto ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: 'var(--text-badge)' }}>▼</span>
              </div>
            </div>

            {menuAbierto && (
              <div className="smooth-theme" style={{
                position: 'absolute', top: '100%', left: '54px', right: 0, marginTop: '8px',
                backgroundColor: 'var(--bg-menu)', borderRadius: '8px', border: '1px solid var(--border-menu)',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
              }}>
                {opcionesFiltro.map(op => (
                  <div
                    key={op.id}
                    onClick={() => { setFiltro(op.id); setMenuAbierto(false); }}
                    className="smooth-theme"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px',
                      cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-main)',
                      backgroundColor: filtro === op.id ? 'var(--bg-hover)' : 'transparent'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = filtro === op.id ? 'var(--bg-hover)' : 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {op.icono}
                      {op.texto}
                    </div>
                    <span className="smooth-theme" style={{ backgroundColor: filtro === op.id ? 'var(--bg-badge-active)' : 'var(--bg-badge)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-badge)' }}>
                      {contadores[op.id as keyof typeof contadores]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <svg ref={svgRef} width={width} height={height} style={{ display: 'block', cursor: 'grab' }}>
          <defs>
            <filter id="shadow"><feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity={isDark ? 0.9 : 0.2} /></filter>
            <filter id="shadow-faults"><feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity={isDark ? 0.8 : 0.3} /></filter>
          </defs>
          <g ref={zoomContainerRef} filter="url(#shadow)">
            <g ref={realMapRef} style={{ opacity: 0 }}>
              {worldData.features.map((feature: any, i: number) => (
                <path key={`real-${i}`} d={pathGeneratorReal!(feature) || ''} fill="var(--bg-map)" stroke="var(--stroke-map)" strokeWidth="0.8" />
              ))}
            </g>
            <g ref={hexRef} style={{ opacity: 1 }}>
              {hexagonsBase.map((pt, i) => (
                <path key={`hex-${i}`} d={`M${pt[0]},${pt[1]}${hexPathBase}`} fill="var(--fill-hex)" stroke="none" />
              ))}
            </g>
          </g>
          <g ref={faultsRef} filter="url(#shadow-faults)"></g>
        </svg>
      </div>

      {puntoSeleccionado && chartData && (
        <div className="smooth-theme" style={{
          backgroundColor: 'var(--bg-container)', padding: '20px', borderRadius: '15px', 
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)', height: '220px', display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', fontFamily: 'sans-serif' }}>
            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getStatusIcon(puntoSeleccionado.info)} Detalles: {puntoSeleccionado.info}
            </h3>
            <button 
              onClick={() => setPuntoSeleccionado(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-badge)', display: 'flex' }}
            >
              <CloseIcon fontSize="small" />
            </button>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
      
      {tooltipInfo.visible && (
        <div className="smooth-theme" style={{
          position: 'fixed', left: tooltipInfo.x + 15, top: tooltipInfo.y - 25,
          backgroundColor: 'var(--bg-menu)', color: 'var(--text-main)',
          padding: '12px', borderRadius: '8px', fontSize: '13px',
          fontFamily: 'sans-serif', pointerEvents: 'none', zIndex: 50,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          border: '1px solid var(--border-menu)',
          minWidth: '180px', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}>
          {tooltipInfo.fallos.length === 1 ? (
            <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {getStatusIcon(tooltipInfo.fallos[0].info)} {tooltipInfo.fallos[0].info}
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 'bold', borderBottom: '1px solid var(--border-menu)', paddingBottom: '8px', marginBottom: '8px' }}>
                {tooltipInfo.fallos.length} Incidentes en zona
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {tooltipInfo.fallos.slice(0, 5).map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getStatusIcon(f.info)} {f.info}
                  </li>
                ))}
                {tooltipInfo.fallos.length > 5 && (
                  <li style={{ color: 'var(--text-badge)', fontSize: '11px', marginTop: '4px', textAlign: 'center', fontWeight: 'bold' }}>
                    + {tooltipInfo.fallos.length - 5} incidentes más
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};