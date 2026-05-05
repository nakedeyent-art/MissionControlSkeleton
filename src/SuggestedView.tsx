import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lightbulb, ArrowLeft, TrendingUp, Target, Bitcoin, DollarSign, Activity } from 'lucide-react';

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

export const SuggestedView = ({ toggleSidebar }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Channels mapped by their category
  const channelCategories = {
    'suggested-predictions': ['1475372080655761460', '1475390653671145503', '1469486946941403275'],
    'suggested-sports-bets': ['1475372050964156477'],
    'suggested-stocks': ['1469486937218875677', '1469486936325357620', '1469486939269890200'],
    'suggested-crypto': ['1475390829169348730', '1469486946245148804'],
    'suggested-options': ['1469486938456195152', '1469486937843699886'],
  };

  const allChannels = Object.values(channelCategories).flat();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`http://localhost:3005/discord/history?channels=${allChannels.join(',')}`);
        if (res.data && res.data.messages) {
          setMessages(res.data.messages);
        }
      } catch (err) {
        console.error('Failed to fetch suggested history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getCategoryIcon = (channelName: string) => {
    if (channelName.includes('crypto')) return <Bitcoin size={18} color="#f59e0b" />;
    if (channelName.includes('options') || channelName.includes('puts') || channelName.includes('calls')) return <Activity size={18} color="#8b5cf6" />;
    if (channelName.includes('stock') || channelName.includes('bids') || channelName.includes('nyse')) return <TrendingUp size={18} color="#10b981" />;
    if (channelName.includes('bets')) return <DollarSign size={18} color="#ef4444" />;
    if (channelName.includes('prediction')) return <Target size={18} color="#3b82f6" />;
    return <Lightbulb size={18} color="#6b7280" />;
  };

  return (
    <PageTransition 
      title="Suggested Actions" 
      subtitle="Real-time predictive insights from specialized trading and forecasting channels."
      icon={<Lightbulb size={40} color="var(--accent)" />}
      toggleSidebar={toggleSidebar}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            Loading market intelligence...
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {messages.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No recent suggestions found in the trading floor.
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={`${msg.id}-${i}`} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {getCategoryIcon(msg.channelName)}
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        #{msg.channelName}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)', 
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    background: 'rgba(0,0,0,0.2)',
                    padding: 12,
                    borderRadius: 8,
                    maxHeight: 200,
                    overflowY: 'auto'
                  }}>
                    {msg.content}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold' }}>
                      via {msg.author}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
};
