import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Mail, 
  Cpu, 
  Code, 
  BarChart2, 
  TrendingUp, 
  CreditCard, 
  Search, 
  Mic, 
  Video, 
  Terminal, 
  Cloud, 
  Cable,
  Plus,
  Globe,
  Layers,
  Zap,
  RefreshCcw,
} from 'lucide-react';
import { PageTransition } from './App';
import axios from 'axios';

const api = axios.create({
  baseURL: '', // Uses same host
});

export const CustomizationView = ({ toggleSidebar }: any) => {
  const [activeLinks, setActiveLinks] = useState<Record<string, boolean>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'integrations' | 'creations' | 'theme'>('integrations');

  useEffect(() => {
    api.get('/api/integrations').then(res => setActiveLinks(res.data)).catch(console.error);
  }, []);

  const handleSave = async (sys: string) => {
    const val = inputs[sys];
    if (!val) return;
    
    setSaving(sys);
    try {
      await api.post('/api/integrations/save', { provider: sys, key: val });
      setActiveLinks(prev => ({ ...prev, [sys]: true }));
      setInputs(prev => ({ ...prev, [sys]: '' })); 
    } catch (err) {
      console.error("Failed to link bridge:", err);
      alert("Encryption connection to bridge failed.");
    } finally {
      setSaving(null);
    }
  };

  const integrations = [
    { name: 'WhatsApp', category: 'Communications', icon: <MessageSquare size={20} /> },
    { name: 'Discord', category: 'Communications', icon: <MessageSquare size={20} /> },
    { name: 'Telegram', category: 'Communications', icon: <MessageSquare size={20} /> },
    { name: 'Slack', category: 'Communications', icon: <MessageSquare size={20} /> },
    { name: 'AgentMail', category: 'Communications', icon: <Mail size={20} /> },
    { name: 'OpenAI', category: 'Intelligence', icon: <Cpu size={20} /> },
    { name: 'Kimi 2.5', category: 'Intelligence', icon: <Cpu size={20} /> },
    { name: 'Google Studio', category: 'Intelligence', icon: <Cpu size={20} /> },
    { name: 'Claude API', category: 'Intelligence', icon: <Code size={20} /> },
    { name: 'Twelve Data', category: 'Financials', icon: <BarChart2 size={20} /> },
    { name: 'Alpaca Trading', category: 'Financials', icon: <TrendingUp size={20} /> },
    { name: 'Oanda Trading', category: 'Financials', icon: <TrendingUp size={20} /> },
    { name: 'Capital One Eno', category: 'Financials', icon: <CreditCard size={20} /> },
    { name: 'Brave Search', category: 'Search', icon: <Search size={20} /> },
    { name: 'Google Places', category: 'Search', icon: <Search size={20} /> },
    { name: 'ElevenLabs', category: 'Media', icon: <Mic size={20} /> },
    { name: 'Meshy API', category: 'Media', icon: <Video size={20} /> },
    { name: 'Terminal CLI', category: 'System', icon: <Terminal size={20} /> },
    { name: 'Google Cloud CLI', category: 'System', icon: <Cloud size={20} /> },
  ];

  // Placeholder for "Development we created" - Active Projects & Queued Agents
  const activeCreations = [
    { id: 1, name: 'Economic Wealth Systems (EWS) Gateway', type: 'Application', status: 'LIVE', health: '99%', tech: 'FastAPI / React' },
    { id: 2, name: 'Garden State Rehab Showrunner', type: 'Agent', status: 'ACTIVE', health: '100%', tech: 'OpenClaw v2' },
    { id: 3, name: 'Nak3d Eye Music Royalty Bot', type: 'Agent', status: 'QUEUED', health: 'WAITING', tech: 'AI Lab Logic' },
    { id: 4, name: 'IreneThel Financial Auditor', type: 'System', status: 'AUDITING', health: 'N/A', tech: 'Internal Audit' },
  ];

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Customization & Sovereign Hub" subtitle="Manage integrations, view autonomous creations, and configure your fleet branding.">
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 12 }}>
        <button 
          onClick={() => setActiveTab('integrations')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            color: activeTab === 'integrations' ? '#4ade80' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'integrations' ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}
        >
          <Cable size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Integrations
        </button>
        <button 
          onClick={() => setActiveTab('creations')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            color: activeTab === 'creations' ? '#4ade80' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'creations' ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}
        >
          <Layers size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Active Creations
        </button>
        <button 
          onClick={() => setActiveTab('theme')}
          style={{ 
            background: 'none', border: 'none', padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
            color: activeTab === 'theme' ? '#4ade80' : 'var(--text-secondary)',
            backgroundColor: activeTab === 'theme' ? 'rgba(74, 222, 128, 0.1)' : 'transparent',
            fontWeight: 'bold', fontSize: '0.9rem'
          }}
        >
          <Zap size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Theme & Branding
        </button>
      </div>

      {activeTab === 'integrations' && (
        <>
          {/* Gateway Sync Panel */}
          <div className="glass-panel" style={{ marginBottom: 24, borderLeft: '4px solid #60a5fa' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ padding: 12, background: 'rgba(96, 165, 250, 0.1)', borderRadius: 12 }}>
                  <RefreshCcw size={24} color="#60a5fa" />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>Gateway Synchronization</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Target: <span style={{ color: '#60a5fa' }}>gateway.nak3deye.com</span> (34.148.98.219)
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>LAST SYNC</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>2 mins ago</div>
              </div>
              <button 
                className="btn-primary" 
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none' }}
                onClick={() => {
                  alert("Triggering remote build and rsync to gateway.nak3deye.com...");
                  // In a real app, this would hit /api/deploy
                }}
              >
                <Zap size={16} style={{ marginRight: 8 }} />
                Push Update to Gateway
              </button>
            </div>
          </div>

          <div className="grid-3">
            {integrations.map(sys => (
            <div className="glass-panel" key={sys.name} style={{ display: 'flex', flexDirection: 'column', gap: 12, borderTop: activeLinks[sys.name] ? '2px solid #4ade80' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ padding: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sys.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{sys.name}</h3>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>{sys.category}</span>
                  </div>
                </div>
                <Cable size={18} color={activeLinks[sys.name] ? '#4ade80' : 'rgba(255,255,255,0.2)'} />
              </div>

              {activeLinks[sys.name] ? (
                <div style={{ marginTop: 'auto' }}>
                  <div style={{ padding: '10px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: 8, color: '#4ade80', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 10px #4ade80' }}></div>
                    SECURE BRIDGE ACTIVE
                  </div>
                  <button 
                    onClick={() => {
                        const pass = prompt(`Enter new token for ${sys.name}:`);
                        if (pass) setInputs(prev => ({ ...prev, [sys.name]: pass }));
                    }}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '0.75rem', cursor: 'pointer', marginTop: 8, padding: 0 }}
                  >
                    Rotate Credentials?
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                  <input 
                    type="password"
                    placeholder={`Enter ${sys.name} Key...`}
                    className="glass-input"
                    value={inputs[sys.name] || ''}
                    onChange={(e) => setInputs({ ...inputs, [sys.name]: e.target.value })}
                  />
                  <button 
                    className="btn-primary" 
                    style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}
                    onClick={() => handleSave(sys.name)}
                    disabled={saving === sys.name}
                  >
                    {saving === sys.name ? 'Connecting...' : 'Establish Link'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </>
      )}

      {activeTab === 'creations' && (
        <div className="grid-2">
          {activeCreations.map(item => (
            <div className="glass-panel" key={item.id} style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.03)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.type === 'Agent' ? <Bot size={24} color="#4ade80" /> : <Globe size={24} color="#60a5fa" />}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                    <p style={{ margin: '4px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.tech}</p>
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 10px', 
                  borderRadius: 20, 
                  fontSize: '0.7rem', 
                  fontWeight: 'bold',
                  backgroundColor: item.status === 'LIVE' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.05)',
                  color: item.status === 'LIVE' ? '#4ade80' : 'var(--text-secondary)',
                  border: item.status === 'LIVE' ? '1px solid rgba(74, 222, 128, 0.2)' : '1px solid rgba(255,255,255,0.1)'
                }}>
                  {item.status}
                </div>
              </div>

              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Uptime Health</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold', color: item.health === '100%' || item.health === '99%' ? '#4ade80' : 'var(--text-secondary)' }}>
                    {item.health}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8 }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>Type</div>
                  <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.type}</div>
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1, fontSize: '0.8rem' }}>Inspect</button>
                <button className="btn-primary" style={{ flex: 1, fontSize: '0.8rem' }}>Deploy Update</button>
              </div>
            </div>
          ))}
          
          <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, border: '2px dashed rgba(255,255,255,0.05)', background: 'transparent' }}>
            <Plus size={32} color="rgba(255,255,255,0.2)" />
            <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>New Development Handled by AI Lab</p>
          </div>
        </div>
      )}

      {activeTab === 'theme' && (
        <div className="glass-panel">
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 16px 0' }}>Sovereign Brand Customization</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 24 }}>
                Configure the aesthetic parameters of your Mission Control Hub to reflect Nak3d Eye's strategic vision.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Primary Action Color</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa'].map(c => (
                      <div key={c} style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: c === '#4ade80' ? '2px solid white' : 'none', cursor: 'pointer' }} />
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Visual Density</label>
                  <input type="range" style={{ width: '100%', accentColor: '#4ade80' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                   <button className="btn-primary">Apply Changes</button>
                   <button className="btn-secondary">Reset to Nak3d Eye Default</button>
                </div>
              </div>
            </div>

            <div style={{ width: 300, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20, border: '1px solid rgba(255,255,255,0.05)' }}>
               <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>PREVIEW ENGINE</h4>
               <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--panel-border)', marginBottom: 12 }}>
                 <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                   <div style={{ width: 24, height: 24, borderRadius: 6, background: '#4ade80' }} />
                   <div style={{ height: 10, width: 60, background: 'rgba(255,255,255,0.1)', borderRadius: 4 }} />
                 </div>
                 <div style={{ height: 6, width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: 4 }} />
               </div>
               <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center' }}>Live preview of system-wide design token updates.</p>
            </div>
          </div>
        </div>
      )}

    </PageTransition>
  );
};

// Internal Bot icon for creations
const Bot = ({ size, color }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
  </svg>
);
