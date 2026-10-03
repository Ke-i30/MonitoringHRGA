import React, { useState, useRef, useEffect } from 'react';
import { ClipboardList, Clock, RefreshCw, CheckCircle2, TrendingUp } from 'lucide-react';

export const RequestAnalytics = ({ requisitions = [] }) => {
  const [hoveredData, setHoveredData] = useState(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 160 });

  const total = requisitions.length;
  const waiting = requisitions.filter(r => r.status === 'Pending').length;
  const processing = requisitions.filter(r => r.status === 'In Process' || r.status === 'Approved').length;
  const completed = requisitions.filter(r => r.status === 'Completed').length;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();

  const numMonths = 6;
  const monthlyBuckets = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(currentYear, currentMonthIdx - i, 1);
    const mIdx = d.getMonth();
    const yr = d.getFullYear();
    monthlyBuckets.push({
      label: monthNames[mIdx],
      monthIdx: mIdx,
      year: yr,
      completed: 0,
      processing: 0,
      waiting: 0
    });
  }

  requisitions.forEach((req) => {
    if (!req.created_at) return;
    const reqDate = new Date(req.created_at);
    const rMonth = reqDate.getMonth();
    const rYear = reqDate.getFullYear();

    const bucket = monthlyBuckets.find(b => b.monthIdx === rMonth && b.year === rYear);
    if (bucket) {
      if (req.status === 'Completed') bucket.completed += 1;
      else if (req.status === 'In Process' || req.status === 'Approved') bucket.processing += 1;
      else if (req.status === 'Pending') bucket.waiting += 1;
    }
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 600,
          height: 160
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const maxReal = Math.max(
    ...monthlyBuckets.map(b => Math.max(b.completed, b.processing, b.waiting)),
    1
  );

  const { width, height } = dimensions;
  const paddingX = 12;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const stepX = chartWidth / (numMonths - 1 || 1);

  const generatePoints = (valExtractor) => {
    const pts = monthlyBuckets.map((b, idx) => {
      const val = valExtractor(b);
      const x = paddingX + idx * stepX;
      const y = height - paddingY - (val / maxReal) * chartHeight;
      return { x, y, val, label: b.label };
    });

    const pathD = pts.map((p, idx) => {
      if (idx === 0) return `M ${p.x} ${p.y}`;
      const prev = pts[idx - 1];
      const cp1X = prev.x + stepX * 0.4;
      const cp2X = p.x - stepX * 0.4;
      return `C ${cp1X} ${prev.y}, ${cp2X} ${p.y}, ${p.x} ${p.y}`;
    }).join(' ');

    return { pathD, pts };
  };

  const completedData = generatePoints(b => b.completed);
  const processingData = generatePoints(b => b.processing);
  const waitingData = generatePoints(b => b.waiting);

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* 4 KPI Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div className="table-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>TOTAL PERMINTAAN</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#1e1e24', marginTop: '2px' }}>{total}</div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
              <TrendingUp size={12} /> Realtime data
            </span>
          </div>
          <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '12px', color: '#1e1e24' }}>
            <ClipboardList size={24} />
          </div>
        </div>

        <div className="table-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#d97706', textTransform: 'uppercase' }}>MENUNGGU (WAITING)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{waiting}</div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '4px', display: 'block' }}>Butuh ACC HRGA</span>
          </div>
          <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '12px', color: '#d97706' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="table-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>SEDANG DIPROSES</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#4f46e5', marginTop: '2px' }}>{processing}</div>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '4px', display: 'block' }}>Pengerjaan fisik</span>
          </div>
          <div style={{ background: '#eef2ff', padding: '12px', borderRadius: '12px', color: '#4f46e5' }}>
            <RefreshCw size={24} />
          </div>
        </div>

        <div className="table-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>SELESAI (COMPLETED)</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{completed}</div>
            <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '4px', display: 'block' }}>Selesai tuntas</span>
          </div>
          <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '12px', color: '#059669' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* SVG Pixel-Perfect Chart Container */}
      <div className="table-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e1e24' }}>Tren & Statistik Permintaan Perbaikan</h4>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>Aktivitas dan volume pengajuan barang per bulan</p>
          </div>

          <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#059669' }}></span> Completed
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#6366f1' }}></span> Processing
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>
              <span style={{ width: '12px', height: '3px', borderRadius: '2px', background: '#f59e0b' }}></span> Waiting
            </span>
          </div>
        </div>

        <div ref={containerRef} style={{ height: '160px', width: '100%', position: 'relative' }}>
          <svg width={width} height={height} style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="completedAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="amberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            <line x1={paddingX} y1={height * 0.25} x2={width - paddingX} y2={height * 0.25} stroke="#f1f5f9" strokeDasharray="3" strokeWidth="1" />
            <line x1={paddingX} y1={height * 0.5} x2={width - paddingX} y2={height * 0.5} stroke="#f1f5f9" strokeDasharray="3" strokeWidth="1" />
            <line x1={paddingX} y1={height * 0.75} x2={width - paddingX} y2={height * 0.75} stroke="#f1f5f9" strokeDasharray="3" strokeWidth="1" />

            {/* Soft Gradient Area Fills */}
            <path d={`${completedData.pathD} L ${width - paddingX} ${height} L ${paddingX} ${height} Z`} fill="url(#completedAreaGrad)" />
            <path d={`${waitingData.pathD} L ${width - paddingX} ${height} L ${paddingX} ${height} Z`} fill="url(#amberAreaGrad)" />

            {/* Curves */}
            <path d={completedData.pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" />
            <path d={processingData.pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
            <path d={waitingData.pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />

            {/* Circles */}
            {completedData.pts.map((p, idx) => (
              <circle
                key={`c-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoveredData?.idx === idx && hoveredData?.type === 'C' ? 6 : 4}
                fill="#ffffff"
                stroke="#059669"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredData({ idx, label: p.label, val: p.val, type: 'C', title: 'Completed', x: p.x, y: p.y })}
                onMouseLeave={() => setHoveredData(null)}
              />
            ))}

            {processingData.pts.map((p, idx) => (
              <circle
                key={`p-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoveredData?.idx === idx && hoveredData?.type === 'P' ? 6 : 4}
                fill="#ffffff"
                stroke="#6366f1"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredData({ idx, label: p.label, val: p.val, type: 'P', title: 'Processing', x: p.x, y: p.y })}
                onMouseLeave={() => setHoveredData(null)}
              />
            ))}

            {waitingData.pts.map((p, idx) => (
              <circle
                key={`w-${idx}`}
                cx={p.x}
                cy={p.y}
                r={hoveredData?.idx === idx && hoveredData?.type === 'W' ? 6 : 4}
                fill="#ffffff"
                stroke="#f59e0b"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                onMouseEnter={() => setHoveredData({ idx, label: p.label, val: p.val, type: 'W', title: 'Waiting', x: p.x, y: p.y })}
                onMouseLeave={() => setHoveredData(null)}
              />
            ))}
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredData && (
            <div 
              style={{
                position: 'absolute',
                left: `${hoveredData.x}px`,
                top: `${Math.max(0, hoveredData.y - 45)}px`,
                transform: 'translateX(-50%)',
                background: '#1e1e24',
                color: '#ffffff',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                zIndex: 10
              }}
            >
              <div style={{ color: '#a1a1aa', fontSize: '0.68rem' }}>{hoveredData.label} • {hoveredData.title}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: hoveredData.type === 'P' ? '#818cf8' : '#fbbf24' }}>
                {hoveredData.val} Tiket
              </div>
            </div>
          )}
        </div>

        {/* X-Axis Month Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
          {monthlyBuckets.map((b, idx) => (
            <span key={idx} style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
