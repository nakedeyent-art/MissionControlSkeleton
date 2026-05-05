import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Rocket, 
  Cpu, 
  RefreshCw,
  Network,
  Zap
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


export const DispatcherView = ({ toggleSidebar }: any) => {
  const [mission, setMission] = useState('');
  const [swarmCount, setSwarmCount] = useState(50);
  const [useKimi, setUseKimi] = useState(true);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);

  const launchMission = async () => {
    setLoading(true);
    try {
      const res = await api.post('/api/dispatcher/mission', { mission, swarmCount, useKimi });
      setResponse(res.data.response);
      setThreads(res.data.threads || []);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Mission Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition 
      title="Swarm Dispatcher" 
      subtitle="Autonomous task decomposition and parallel execution via Bergen Gateway." 
      icon={<Rocket size={40} color="#4ade80" />}
      toggleSidebar={toggleSidebar}
    >
      <div className="grid-2">
        <div className="glass-panel" style={{ borderTop: '4px solid var(--accent)' }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Mission Control
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="login-label">Strategic Mission Directive</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: 150 }}
                placeholder="Enter high-level goal... e.g., 'Analyze market trends for Nak3d Eye Music and generate a growth strategy for Q3.'"
                value={mission}
                onChange={e => setMission(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="login-label">Swarm Intensity (Agents: {swarmCount})</label>
              <input 
                type="range" 
                min="1" max="300" 
                value={swarmCount}
                onChange={e => setSwarmCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', height: '8px', borderRadius: '4px' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>
                <span>Standard (1)</span>
                <span>Hyper-Swarm (300)</span>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Cpu size={20} color={useKimi ? 'var(--accent)' : '#94a3b8'} />
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Kimi K2.6 Swarm Engine</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Advanced strategic decomposition</div>
                  </div>
                </div>
                <div 
                  onClick={() => setUseKimi(!useKimi)}
                  style={{ 
                    width: 48, height: 24, 
                    background: useKimi ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                    borderRadius: 12, position: 'relative', cursor: 'pointer', transition: '0.3s' 
                  }}
                >
                  <div style={{ 
                    width: 20, height: 20, background: useKimi ? '#000' : 'white', 
                    borderRadius: '50%', position: 'absolute', top: 2, left: useKimi ? 26 : 2, 
                    transition: '0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' 
                  }} />
                </div>
              </div>
            </div>

            <button 
              onClick={launchMission}
              disabled={!mission || loading}
              className="primary-btn" 
              style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
            >
              {loading ? (
                <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Zap size={24} />
              )}
              <span style={{ marginLeft: 12 }}>
                {loading ? 'Sychronizing Swarm...' : 'INITIATE SWARM DEPLOYMENT'}
              </span>
            </button>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Live Feed / Intelligence
          </h3>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {threads.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {threads.map(t => (
                  <div key={t.id} style={{ padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 10, border: '1px solid var(--panel-border)', position: 'relative' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>NODE #{t.id}</div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                    <div style={{ marginTop: 8, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 6, color: t.status === 'COMPLETED' ? '#4ade80' : 'var(--accent)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 10px currentColor' }} />
                      {t.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2, textAlign: 'center' }}>
                <Network size={80} strokeWidth={1} />
                <p style={{ marginTop: 16 }}>Awaiting swarm initialization...</p>
              </div>
            )}

            {response && (
              <div style={{ 
                flex: 1, 
                background: 'rgba(0,0,0,0.4)', 
                borderRadius: 12, 
                padding: 20, 
                border: '1px solid var(--panel-border)', 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                lineHeight: 1.6,
                color: '#4ade80'
              }}>
                <div style={{ color: 'white', marginBottom: 10, fontWeight: 'bold' }}>[COLLECTIVE_RESPONSE]</div>
                {response}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
