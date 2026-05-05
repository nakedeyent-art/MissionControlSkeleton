import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Briefcase, ArrowLeft, Send } from 'lucide-react';

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

export const CeoDeskView = ({ toggleSidebar }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const CEO_DESK_CHANNEL_ID = '1476117067114610794';

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:3005/discord/history?channels=${CEO_DESK_CHANNEL_ID}`);
      if (res.data && res.data.messages) {
        setMessages(res.data.messages.reverse()); // Reverse to show oldest at top, newest at bottom
      }
    } catch (err) {
      console.error('Failed to fetch CEO desk history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000); // refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');
    
    // Optimistic UI update
    setMessages(prev => [...prev, {
      id: Date.now(),
      channelId: CEO_DESK_CHANNEL_ID,
      channelName: 'ceo-desk',
      content: currentInput,
      timestamp: new Date().toISOString(),
      author: 'CEO (Mission Control)'
    }]);

    try {
      await axios.post('http://localhost:3005/discord/message', {
        channelId: CEO_DESK_CHANNEL_ID,
        agentId: 'bergen',
        message: currentInput,
        systemPrompt: "You are receiving a direct order from the CEO desk."
      });
      // Fetch history again to get actual Discord message once delivered
      setTimeout(fetchHistory, 1500); 
    } catch (err) {
      console.error('Failed to send message to CEO desk:', err);
    }
  };

  return (
    <PageTransition 
      title="CEO Desk" 
      subtitle="Executive command center and direct line to Bergen and senior agents."
      icon={<Briefcase size={40} color="var(--accent)" />}
      toggleSidebar={toggleSidebar}
    >
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '65vh', padding: 0, overflow: 'hidden', marginTop: 24 }}>
        
        {/* Messages Layout */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              Connecting to CEO Desk...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No recent communications in the CEO Desk.
            </div>
          ) : (
            messages.map((msg, i) => {
              const isCEO = msg.author.includes('CEO') || msg.author === 'Admin' || msg.author === 'rizzolini';
              return (
                <div key={`${msg.id}-${i}`} style={{ 
                  alignSelf: isCEO ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <span style={{ fontSize: '0.75rem', color: isCEO ? 'var(--accent)' : 'var(--text-muted)', marginLeft: 8 }}>
                    {msg.author} <span style={{ opacity: 0.5, marginLeft: 4 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </span>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: '12px',
                    background: isCEO ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                    color: isCEO ? '#000' : 'var(--text-main)',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.5,
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} style={{ display: 'flex', gap: 12, padding: '16px 24px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)' }}>
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Issue executive directive..."
            style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, padding: '12px 16px', color: 'white', outline: 'none' }}
          />
          <button type="submit" style={{ background: 'var(--accent)', color: 'black', border: 'none', borderRadius: 8, padding: '0 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Send size={18} />
          </button>
        </form>

      </div>
    </PageTransition>
  );
};
