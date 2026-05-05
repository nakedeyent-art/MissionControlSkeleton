import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Server
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


export const SecurityView = ({ toggleSidebar }: any) => {
  const [stats, setStats] = useState<any>({
    firewall: 'ONLINE',
    tailscale: 'CONNECTED',
    encryption: 'AES-256',
    mfa: 'PROTECTED',
    lastAudit: new Date().toISOString()
  });
  const [keys, setKeys] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    try {
      const sRes = await api.get('/api/security/stats');
      setStats(sRes.data);
      const lRes = await api.get('/api/security/logs');
      setLogs(lRes.data);
      
      // Mock keys for UI
      setKeys([
        { name: 'OPENAI_API_KEY', value: 'sk-proj-••••••••••••••••', lastUsed: '2 mins ago', status: 'Active' },
        { name: 'ANTHROPIC_API_KEY', value: 'sk-ant-••••••••••••••••', lastUsed: '1 hour ago', status: 'Active' },
        { name: 'TWELVE_DATA_KEY', value: '7c2e••••••••••••••••', lastUsed: 'Live', status: 'Active' },
        { name: 'OANDA_API_KEY', value: 'df9a••••••••••••••••', lastUsed: '3 hours ago', status: 'Active' },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition 
      title="Sovereign Security" 
      subtitle="Infrastructure protection, API key management, and zero-trust audit logs." 
      icon={<Shield size={40} color="#4ade80" />}
      toggleSidebar={toggleSidebar}
    >
      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Status Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
              <Server size={32} color="#4ade80" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Firewall Status</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.firewall}</div>
            </div>
            <div className="glass-panel" style={{ padding: 20, textAlign: 'center' }}>
              <Lock size={32} color="#4ade80" style={{ marginBottom: 12 }} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Encryption</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.encryption}</div>
            </div>
          </div>

          {/* API Key Management */}
          <div className="glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>API Keys & Secrets</h3>
              <button className="primary-btn" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>+ New Secret</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {keys.map(k => (
                <div key={k.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--panel-border)' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{k.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{k.value}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>● {k.status}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Used {k.lastUsed}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Audit Trail</h3>
            <button onClick={refreshData} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {logs.map((log, i) => (
              <div key={i} style={{ padding: '12px', borderRadius: 8, background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', fontSize: '0.8rem', display: 'flex', gap: 12 }}>
                <div style={{ color: log.type === 'ALERT' ? '#f87171' : '#4ade80' }}>
                  {log.type === 'ALERT' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                </div>
                <div>
                  <div style={{ color: 'var(--text-main)', marginBottom: 2 }}>{log.message}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
