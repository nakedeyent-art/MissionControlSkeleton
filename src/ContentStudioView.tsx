import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Briefcase,
  Mic,
  Layers,
  Radio,
  Shield,
  Rocket,
  User,
  Users,
  Building,
  Activity,
  Network,
  MessageSquare,
  FileText,
  RefreshCw,
  Plus,
  History,
  BookOpen
} from 'lucide-react';
import axios from 'axios';
import { BRAND_HISTORY } from './BrandMemory';

// --- API Instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true
});

const subsidiaries = [
  { name: 'Economic Wealth Systems (EWS)', sector: 'Financial Strategy & Quant Trading', icon: <Briefcase size={20} color="#4ade80"/> },
  { name: 'Nak3d Eye Music', sector: 'Music Production & Distribution', icon: <Mic size={20} color="#f472b6"/> },
  { name: 'Nak3d Eye Film', sector: 'Cinematic Production', icon: <Layers size={20} color="#60a5fa"/> },
  { name: 'Nak3d Eye TV', sector: 'Broadcasting & Streaming', icon: <Radio size={20} color="#fbbf24"/> },
  { name: 'Pest Arrest', sector: 'Field Service & Operations', icon: <Shield size={20} color="#4ade80"/> },
  { name: 'ThaAfterParty (TAP)', sector: 'Entertainment & Events', icon: <Rocket size={20} color="#f472b6"/> },
  { name: 'SocialCard', sector: 'Digital Networking', icon: <User size={20} color="#38bdf8"/> },
  { name: 'Nak3d Eye Mirror', sector: 'Wellness Tech', icon: <Users size={20} color="#4ade80"/> },
  { name: 'Nak3d Eye Construction', sector: 'Infrastructure', icon: <Building size={20} color="#94a3b8"/> },
  { name: 'Nak3d Eye Wellness', sector: 'Health & Fitness', icon: <Activity size={20} color="#f87171"/> },
  { name: 'Nak3d Eye Web', sector: 'Digital Development', icon: <Network size={20} color="#60a5fa"/> },
];

const PageTransition = ({ children, title, subtitle, icon }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.3 }}
  >
    <div className="page-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {icon}
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
      </div>
    </div>
    {children}
  </motion.div>
);

export const ContentStudioView = ({ toggleSidebar }: any) => {
  const [selectedBusiness, setSelectedBusiness] = useState(subsidiaries[0].name);
  const [topic, setTopic] = useState('');
  const [postType, setPostType] = useState('Instagram Caption');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [useHistory, setUseHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const postTypes = [
    { name: 'Instagram Caption', icon: <LayoutDashboard size={18} /> },
    { name: 'Instagram Carousel', icon: <Layers size={18} /> },
    { name: 'Twitter / X Thread', icon: <MessageSquare size={18} /> },
    { name: 'LinkedIn Article', icon: <Users size={18} /> },
    { name: 'YouTube Script', icon: <Radio size={18} /> },
    { name: 'Blog Post', icon: <FileText size={18} /> },
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedContent(null);
    try {
      const res = await api.post('/api/dispatcher/mission', {
        mission: `Generate a high-impact ${postType} for ${selectedBusiness} regarding the following topic: ${topic}. 
        
        ${useHistory ? `CRITICAL CONTEXT: Compare and align this with Nak3d Eye's creative history:
        Brand Aesthetic: ${BRAND_HISTORY.aesthetic}
        Past Key Releases: ${BRAND_HISTORY.assets.slice(0, 5).map(a => `${a.title} (${a.type})`).join(', ')}
        Core Themes: ${BRAND_HISTORY.themes.join(', ')}
        Ensure the new content respects the gritty, futuristic street-professionalism established in past works like 'Lonely at the top' and 'Toxic Traits'.` : ""}
        
        Provide the final copy, including necessary formatting.` ,
        swarmCount: 1,
        useKimi: false
      });
      setGeneratedContent(res.data.response);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Generation Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition 
      title="Content Studio" 
      subtitle="AI-Powered creative suite for cross-platform content strategy." 
      icon={<LayoutDashboard size={40} color="#4ade80" />}
      toggleSidebar={toggleSidebar}
    >
      {/* Brand History Awareness Banner */}
      <div className="glass-panel" style={{ 
        marginBottom: 24, 
        borderLeft: '4px solid var(--accent)', 
        background: 'linear-gradient(90deg, rgba(74, 222, 128, 0.05) 0%, transparent 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 10, background: 'rgba(74, 222, 128, 0.1)', borderRadius: 10 }}>
            <History size={24} color="var(--accent)" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Brand Memory Active</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Content Studio is synchronized with <span style={{ color: 'var(--accent)' }}>{BRAND_HISTORY.assets.length}</span> released assets from nak3deye.com.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
          >
            {showHistory ? 'Hide History' : 'View History Memory'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use History Context</span>
             <div 
               onClick={() => setUseHistory(!useHistory)}
               style={{ 
                 width: 40, height: 20, borderRadius: 10, background: useHistory ? 'var(--accent)' : 'rgba(255,255,255,0.1)', 
                 position: 'relative', cursor: 'pointer', transition: 'all 0.3s' 
               }}
             >
               <div style={{ 
                 width: 16, height: 16, borderRadius: '50%', background: 'white', 
                 position: 'absolute', top: 2, left: useHistory ? 22 : 2, transition: 'all 0.3s' 
               }} />
             </div>
          </div>
        </div>
      </div>

      {showHistory && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          style={{ marginBottom: 24, overflow: 'hidden' }}
        >
          <div className="glass-panel" style={{ background: 'rgba(0,0,0,0.2)' }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={16} /> DATA SOURCE: NAK3DEYE.COM RELEASES
            </h4>
            <div className="grid-3" style={{ gap: 12 }}>
              {BRAND_HISTORY.assets.map((asset, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{asset.title}</span>
                      <span style={{ fontSize: '0.6rem', color: 'var(--accent)', textTransform: 'uppercase' }}>{asset.type}</span>
                   </div>
                   <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{asset.description}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid-2">
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="form-group">
            <label className="login-label">Business / Category</label>
            <div style={{ position: 'relative' }}>
              <select 
                className="form-input" 
                style={{ width: '100%', appearance: 'none', paddingLeft: 40, height: '48px' }}
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
              >
                {subsidiaries.map(sub => (
                  <option key={sub.name} value={sub.name}>{sub.name}</option>
                ))}
              </select>
              <div style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
                {subsidiaries.find(s => s.name === selectedBusiness)?.icon}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="login-label">Content Topic / Directive</label>
            <textarea 
              className="form-textarea" 
              style={{ minHeight: 120, fontSize: '0.95rem' }}
              placeholder="What are we talking about today? e.g., 'New algorithmic trading strategy for EWS' or 'Sneak peek of the upcoming film trailer'."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="login-label">Post Format</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {postTypes.map(type => (
                <div 
                  key={type.name}
                  onClick={() => setPostType(type.name)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid var(--panel-border)',
                    background: postType === type.name ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    borderColor: postType === type.name ? 'var(--accent)' : 'var(--panel-border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.2s',
                    color: postType === type.name ? 'var(--accent)' : 'var(--text-main)'
                  }}
                >
                  {type.icon}
                  <span style={{ fontSize: '0.8rem', fontWeight: postType === type.name ? 'bold' : '500' }}>{type.name}</span>
                </div>
              ))}
            </div>
          </div>

          <button 
            className="primary-btn" 
            style={{ 
              width: '100%', 
              padding: '16px', 
              marginTop: 10,
              fontSize: '1rem',
              letterSpacing: '0.5px'
            }}
            onClick={handleGenerate}
            disabled={loading || !topic}
          >
            {loading ? (
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Rocket size={20} />
            )}
            <span style={{ marginLeft: 8 }}>
              {loading ? 'Generating Strategy...' : 'Create Strategic Content'}
            </span>
          </button>
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 550, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Strategic Output
            </h3>
            {generatedContent && (
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  alert('Content copied to clipboard!');
                }}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--panel-border)', 
                  color: 'var(--text-main)', 
                  padding: '6px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}
              >
                <Plus size={14} /> Copy to Clipboard
              </button>
            )}
          </div>

          {!generatedContent ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3, textAlign: 'center', padding: 40 }}>
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <LayoutDashboard size={80} strokeWidth={1} />
                <Rocket size={32} style={{ position: 'absolute', top: -10, right: -10, color: 'var(--accent)' }} />
              </div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>Ready for Deployment</h4>
              <p style={{ fontSize: '0.9rem', maxWidth: 300 }}>Enter a topic and select your target business to generate high-conversion content.</p>
            </div>
          ) : (
            <div style={{ 
              flex: 1, 
              background: 'rgba(0,0,0,0.3)', 
              borderRadius: 12, 
              padding: 24, 
              border: '1px solid var(--panel-border)', 
              overflowY: 'auto',
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)'
            }}>
              <div style={{ 
                whiteSpace: 'pre-wrap', 
                lineHeight: 1.7, 
                fontSize: '0.95rem',
                color: '#e2e8f0',
                fontFamily: "'Inter', sans-serif"
              }}>
                {generatedContent}
              </div>
            </div>
          )}
          
          {loading && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(11, 12, 16, 0.7)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 16,
              zIndex: 10
            }}>
              <RefreshCw size={48} color="var(--accent)" style={{ animation: 'spin 2s linear infinite', marginBottom: 16 }} />
              <div style={{ fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '1px' }}>AGENT ANALYZING BRAND HISTORY...</div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
