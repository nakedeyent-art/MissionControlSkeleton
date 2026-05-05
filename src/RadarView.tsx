import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};
import { 
  Radio, 
  Eye, 
  Zap, 
  Globe, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Sparkles,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';


import axios from 'axios';

// --- API Instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true
});

import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const PageTransition = ({ children, title, subtitle, icon, toggleSidebar }: any) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
          </button>
          {icon}
          <div>
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>

        <button 
          onClick={() => navigate(-1)} 
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', borderRadius: 8,
            border: '1px solid var(--panel-border)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-muted)', fontSize: '0.82rem',
            fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      {children}
    </motion.div>
  );
};


interface IntelligenceSignal {
  id: string;
  source: 'web' | 'social' | 'system' | 'market';
  title: string;
  description: string;
  timestamp: string;
  intensity: 'high' | 'medium' | 'low';
  category: string;
}

interface MarketTicker {
  id: string;
  symbol: string;
  price: number;
  change: number;
  type: 'crypto' | 'forex' | 'equity';
}

export const RadarView = ({ toggleSidebar }: any) => {
  const isMobile = useIsMobile();
  const [signals, setSignals] = useState<IntelligenceSignal[]>([]);
  const [tickers, setTickers] = useState<MarketTicker[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);
  const [addSignalModal, setAddSignalModal] = useState(false);
  
  const signalListRef = useRef<HTMLDivElement>(null);

  const scrollUp = () => {
    if (signalListRef.current) {
      signalListRef.current.scrollBy({ top: -200, behavior: 'smooth' });
    }
  };

  const scrollDown = () => {
    if (signalListRef.current) {
      signalListRef.current.scrollBy({ top: 200, behavior: 'smooth' });
    }
  };
  
  // New Signal Form State

  const [title, setTitle] = useState('');
  const [source, setSource] = useState<IntelligenceSignal['source']>('web');
  const [description, setDescription] = useState('');
  const [intensity, setIntensity] = useState<IntelligenceSignal['intensity']>('medium');
  const [category, setCategory] = useState('');

  const fetchRadarData = async () => {
    try {
      const res = await api.get('/api/radar');
      if (res.data && res.data.signals) {
        setSignals(res.data.signals);
        setTickers(res.data.tickers);
      } else {
        loadDefaultRadar();
      }
    } catch (err) {
      loadDefaultRadar();
    }
  };

  const loadDefaultRadar = () => {
    const cachedSignals = localStorage.getItem('nak3d_radar_signals');
    const cachedTickers = localStorage.getItem('nak3d_radar_tickers');

    if (cachedSignals && cachedTickers) {
      setSignals(JSON.parse(cachedSignals));
      setTickers(JSON.parse(cachedTickers));
    } else {
      const defaultSignals: IntelligenceSignal[] = [
        { id: 'sig-1', source: 'social', title: 'Viral AI Workflow: @david_wehner Insights', description: 'Agent mapped specific monetization strategies using automated image-generation nodes.', timestamp: '10m ago', intensity: 'high', category: 'Monetization' },
        { id: 'sig-2', source: 'web', title: 'Winceyco Graphics Framework Alert', description: 'Competitor benchmarking showcases asset pipeline requirements exceeding current parameters.', timestamp: '1h ago', intensity: 'medium', category: 'Product Benchmarking' },
        { id: 'sig-3', source: 'market', title: 'BTC Breaches Resistance Level', description: 'Breakout patterns suggest volume surges across liquidity pools on Alpaca networks.', timestamp: '2h ago', intensity: 'high', category: 'Asset Flow' },
        { id: 'sig-4', source: 'system', title: 'GCP Cluster Health Green', description: 'Node latency evaluations hovering below critical threshold bounds of 15ms.', timestamp: '5h ago', intensity: 'low', category: 'System Health' },
        { id: 'sig-5', source: 'social', title: 'Trending Pattern: @aiwithrone strategies', description: 'Continuous review of automation frameworks indicates shift toward autonomous workflow chains.', timestamp: '1d ago', intensity: 'medium', category: 'AI Trends' }
      ];

      const defaultTickers: MarketTicker[] = [
        { id: 't1', symbol: 'BTC/USD', price: 92340.50, change: 4.25, type: 'crypto' },
        { id: 't2', symbol: 'ETH/USD', price: 3450.20, change: -1.12, type: 'crypto' },
        { id: 't3', symbol: 'EUR/USD', price: 1.0850, change: 0.05, type: 'forex' },
        { id: 't4', symbol: 'GBP/JPY', price: 195.40, change: 0.32, type: 'forex' },
        { id: 't5', symbol: 'SPY', price: 512.40, change: 1.22, type: 'equity' },
        { id: 't6', symbol: 'TSLA', price: 185.10, change: -2.40, type: 'equity' }
      ];

      setSignals(defaultSignals);
      setTickers(defaultTickers);
      localStorage.setItem('nak3d_radar_signals', JSON.stringify(defaultSignals));
      localStorage.setItem('nak3d_radar_tickers', JSON.stringify(defaultTickers));
    }
  };

  useEffect(() => {
    fetchRadarData();

    // Simulate price ticker fluctuations
    const interval = setInterval(() => {
      setTickers(prev => prev.map(t => {
        const percent = (Math.random() - 0.5) * 0.4; // +/- 0.2%
        const nextPrice = t.price * (1 + percent / 100);
        const nextChange = t.change + (percent * 2);
        return { ...t, price: nextPrice, change: nextChange };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleCreateSignal = (e: React.FormEvent) => {
    e.preventDefault();
    const created: IntelligenceSignal = {
      id: `sig-${Date.now()}`,
      source,
      title,
      description,
      timestamp: 'Just now',
      intensity,
      category: category || 'General'
    };

    const updated = [created, ...signals];
    setSignals(updated);
    localStorage.setItem('nak3d_radar_signals', JSON.stringify(updated));

    setAddSignalModal(false);
    setTitle('');
    setDescription('');
    setCategory('');
  };

  const handleDeleteSignal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = signals.filter(s => s.id !== id);
    setSignals(updated);
    localStorage.setItem('nak3d_radar_signals', JSON.stringify(updated));
    if (selectedSignal && selectedSignal.id === id) setSelectedSignal(null);
  };

  const sourceColor = (s: string) => {
    switch(s) {
      case 'social': return '#f472b6'; // Pink
      case 'web': return '#60a5fa'; // Blue
      case 'market': return '#34d399'; // Green
      case 'system': return '#a78bfa'; // Purple
      default: return 'var(--text-muted)';
    }
  };

  const intensityColor = (i: string) => {
    switch(i) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#38bdf8';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <PageTransition 
      title="Intelligence Radar" 
      subtitle="Scanning continuous external signals, market metrics, and emergent trend directives."
      icon={<Radio size={40} color="var(--accent)" />}
      toggleSidebar={toggleSidebar}
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', 
        gap: 24, 
        marginTop: 24,
        transition: 'all 0.3s' 
      }}>
        
        {/* Left Side: Radar Animation & Signals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Radar Scanner Graphic */}
          <div 
            className="glass-panel" 
            style={{ 
              height: 300, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              position: 'relative',
              overflow: 'hidden',
              background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.05) 0%, transparent 70%)'
            }}
          >
            {/* SVG Radar */}
            <svg width="250" height="250" viewBox="0 0 250 250" style={{ position: 'absolute' }}>
              <circle cx="125" cy="125" r="110" stroke="rgba(34, 211, 238, 0.2)" strokeWidth="1" fill="none" />
              <circle cx="125" cy="125" r="80" stroke="rgba(34, 211, 238, 0.15)" strokeWidth="1" fill="none" strokeDasharray="5,5" />
              <circle cx="125" cy="125" r="50" stroke="rgba(34, 211, 238, 0.1)" strokeWidth="1" fill="none" />
              <line x1="15" y1="125" x2="235" y2="125" stroke="rgba(34, 211, 238, 0.1)" />
              <line x1="125" y1="15" x2="125" y2="235" stroke="rgba(34, 211, 238, 0.1)" />
            </svg>

            {/* Sweep Line */}
            <motion.div
              style={{
                width: 120,
                height: 120,
                position: 'absolute',
                top: 125,
                left: 125,
                originX: 0,
                originY: 0,
                background: 'linear-gradient(90deg, rgba(34, 211, 238, 0.4) 0%, transparent 50%)',
                transformStyle: 'preserve-3d',
                borderRadius: '0 100% 0 0'
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            {/* Animated Signal Blips */}
            {signals.slice(0, 4).map((sig, idx) => {
              const positions = [
                { top: '30%', left: '40%' },
                { top: '60%', left: '55%' },
                { top: '25%', left: '65%' },
                { top: '70%', left: '35%' }
              ];
              const pos = positions[idx % positions.length];

              return (
                <motion.div
                  key={sig.id}
                  style={{
                    position: 'absolute',
                    ...pos,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: intensityColor(sig.intensity),
                    boxShadow: `0 0 10px ${intensityColor(sig.intensity)}`
                  }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity, delay: idx * 0.5 }}
                />
              );
            })}

            <div style={{ position: 'absolute', bottom: 16, display: 'flex', gap: 12, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Radio size={12} color="#f472b6" /> Social</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={12} color="#60a5fa" /> Web</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Target size={12} color="#34d399" /> Market</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={12} color="#a78bfa" /> System</span>
            </div>

            <button 
              onClick={() => setAddSignalModal(true)}
              style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '6px 12px', color: 'white', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', cursor: 'pointer' }}
            >
              <Plus size={14} /> Inject Signal
            </button>
          </div>

          {/* Signals Stream List */}
          <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={18} color="var(--accent)" /> Signal Feed</h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button 
                  onClick={scrollUp} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Scroll Up"
                >
                  <ChevronUp size={16} />
                </button>
                <button 
                  onClick={scrollDown} 
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Scroll Down"
                >
                  <ChevronDown size={16} />
                </button>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>Real-time parsing active</span>
              </div>
            </div>

            <div ref={signalListRef} style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 12, 
              maxHeight: isMobile ? '60vh' : '500px', 
              overflowY: 'auto', 
              paddingRight: '4px',
              scrollBehavior: 'smooth'
            }}>

              {signals.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active intelligence signals parsed.</div>
              )}
              {signals.map(sig => (
                <div 
                  key={sig.id} 
                  onClick={() => setSelectedSignal(selectedSignal?.id === sig.id ? null : sig)}
                  style={{ 
                    padding: 14, 
                    borderRadius: 10, 
                    background: 'rgba(0,0,0,0.2)', 
                    border: `1px solid ${selectedSignal?.id === sig.id ? 'var(--accent)' : 'var(--panel-border)'}`,
                    borderLeft: `4px solid ${sourceColor(sig.source)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12
                  }}
                >
                  <div style={{ padding: 8, borderRadius: 8, background: `${sourceColor(sig.source)}22`, color: sourceColor(sig.source) }}>
                    {sig.source === 'social' && <Sparkles size={16} />}
                    {sig.source === 'web' && <Globe size={16} />}
                    {sig.source === 'market' && <Target size={16} />}
                    {sig.source === 'system' && <Zap size={16} />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4, gap: 12 }}>
                      <span style={{ fontWeight: 'bold', fontSize: '0.95rem', lineHeight: 1.2, wordBreak: 'break-word' }}>{sig.title}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{sig.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{sig.description}</p>
                    
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(255,255,255,0.03)', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                        {sig.category}
                      </span>
                      <span style={{ padding: '2px 6px', borderRadius: 4, background: `${intensityColor(sig.intensity)}22`, color: intensityColor(sig.intensity), fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        {sig.intensity} Priority
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => handleDeleteSignal(sig.id, e)} 
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', opacity: 0.5, cursor: 'pointer', alignSelf: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.5'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            {/* Additional Bottom Scroll Controls for Mobile/Accessibility */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 20, 
              marginTop: 12,
              padding: '12px 0',
              borderTop: '1px solid rgba(255,255,255,0.05)'
            }}>
              <button 
                onClick={scrollUp}
                className="scroll-btn-bottom"
                style={{ 
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px var(--accent-glow)'
                }}
              >
                <ArrowUp size={28} />
              </button>
              <button 
                onClick={scrollDown}
                className="scroll-btn-bottom"
                style={{ 
                  background: 'var(--accent-glow)',
                  border: '1px solid var(--accent)',
                  borderRadius: '50%',
                  width: 50,
                  height: 50,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  cursor: 'pointer',
                  boxShadow: '0 0 20px var(--accent-glow)'
                }}
              >
                <ArrowDown size={28} />
              </button>
            </div>

            {/* Mobile-only floating "Center Scroll" arrows for extreme accessibility */}
            {isMobile && (
              <div style={{
                position: 'fixed',
                right: 20,
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                zIndex: 2000
              }}>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollUp}
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--accent)', borderRadius: '50%', width: 44, height: 44, color: 'var(--accent)', backdropFilter: 'blur(5px)' }}
                >
                  <ChevronUp size={24} />
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.9 }}
                  onClick={scrollDown}
                  style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--accent)', borderRadius: '50%', width: 44, height: 44, color: 'var(--accent)', backdropFilter: 'blur(5px)' }}
                >
                  <ChevronDown size={24} />
                </motion.button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Market Tickers */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          <div className="glass-panel">
            <h3 style={{ margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingUp size={18} color="#34d399" /> Asset Vectors
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickers.map(t => (
                <div 
                  key={t.id}
                  style={{ 
                    padding: '12px 16px', 
                    borderRadius: 10, 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--panel-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{t.symbol}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{t.type}</div>
                  </div>
                  
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {t.type === 'forex' ? t.price.toFixed(4) : t.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                    </div>
                    <span 
                      style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 'bold', 
                        color: t.change >= 0 ? '#34d399' : '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 2
                      }}
                    >
                      {t.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {t.change >= 0 ? '+' : ''}{t.change.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              Auto-updating via decentralized WebSocket streams.
            </div>
          </div>

          {/* Quick Help context */}
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <ShieldAlert size={18} color="var(--accent)" />
              <h4 style={{ margin: 0 }}>Operational Rule</h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Signal events marked as <b>High Priority</b> instruct background LLMs to generate automated briefings within 30 minutes of receipt.
            </p>
          </div>
        </div>

      </div>

      {/* Add Signal Modal */}
      {addSignalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ width: 450, maxWidth: '90%', border: '1px solid var(--panel-border)' }}
          >
            <h2 style={{ margin: '0 0 20px 0' }}>Inject Custom Signal</h2>
            <form onSubmit={handleCreateSignal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Signal Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. Unusual port scan detected"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Intelligence Source</label>
                <select 
                  value={source} 
                  onChange={e => setSource(e.target.value as IntelligenceSignal['source'])}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                >
                  <option value="social">Social Intelligence</option>
                  <option value="web">Web Scraper / API</option>
                  <option value="market">Financial Markets</option>
                  <option value="system">Internal Systems</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Description / Payload</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  placeholder="Insert exact observational rules or data logs..."
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none', minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Intensity Level</label>
                  <select 
                    value={intensity} 
                    onChange={e => setIntensity(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Category</label>
                  <input 
                    type="text" 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    placeholder="e.g. AI Trends"
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setAddSignalModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--panel-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🛰️ Broadcast Signal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
};
