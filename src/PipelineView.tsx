import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  DollarSign, 
  Building, 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Plus, 
  User, 

  TrendingUp,
  Briefcase
} from 'lucide-react';

import axios from 'axios';

// --- API Instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true
});

import { useNavigate } from 'react-router-dom';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react';

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
          <ArrowLeftIcon size={16} /> Back
        </button>
      </div>
      {children}
    </motion.div>
  );
};


interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: 'lead' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost';
  assignedAgent: string;
  expectedClose: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

const STAGES = [
  { id: 'lead', name: 'Lead Identified', color: '#a78bfa' }, 
  { id: 'contacted', name: 'Contacted', color: '#60a5fa' }, 
  { id: 'proposal', name: 'Proposal Sent', color: '#fbbf24' }, 
  { id: 'negotiation', name: 'Negotiation', color: '#fb923c' }, 
  { id: 'won', name: 'Closed Won', color: '#4ade80' }, 
  { id: 'lost', name: 'Closed Lost', color: '#f87171' }
] as const;

export const PipelineView = ({ toggleSidebar }: any) => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [newDealModal, setNewDealModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [value, setValue] = useState<number>(0);
  const [stage, setStage] = useState<Deal['stage']>('lead');
  const [assignedAgent, setAssignedAgent] = useState('Bergen');
  const [expectedClose, setExpectedClose] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [notes, setNotes] = useState('');

  const fetchDeals = async () => {
    try {
      const res = await api.get('/api/pipeline');
      if (res.data && res.data.length > 0) {
        setDeals(res.data);
      } else {
        loadDefaultDeals();
      }
    } catch (err) {
      loadDefaultDeals();
    }
  };

  const loadDefaultDeals = () => {
    const cached = localStorage.getItem('nak3d_pipeline_deals');
    if (cached) {
      setDeals(JSON.parse(cached));
    } else {
      const defaultDeals: Deal[] = [
        { id: 'deal-1', name: 'Enterprise CRM Suite', company: 'Pest Arrest', value: 45000, stage: 'proposal', assignedAgent: 'Bergen', expectedClose: '2026-05-15', priority: 'high', notes: 'Tailoring mobile operations management module.' },
        { id: 'deal-2', name: 'SocialCard White Label', company: 'Global Events LLC', value: 25000, stage: 'negotiation', assignedAgent: 'Bergen', expectedClose: '2026-05-30', priority: 'high', notes: 'Needs custom hardware NFC integrations.' },
        { id: 'deal-3', name: 'AI Market Scraping API', company: 'Alpha Traders', value: 12000, stage: 'lead', assignedAgent: 'Bergen', expectedClose: '2026-06-10', priority: 'medium', notes: 'Following up via automated lead flow.' },
        { id: 'deal-4', name: 'EWS Dashboard Setup', company: 'Bermuda Wealth', value: 85000, stage: 'won', assignedAgent: 'Bergen', expectedClose: '2026-04-20', priority: 'high', notes: 'Successfully connected execution nodes.' },
        { id: 'deal-5', name: 'Custom Bot Maintenance', company: 'TechVibe', value: 5000, stage: 'contacted', assignedAgent: 'Bergen', expectedClose: '2026-05-05', priority: 'low', notes: 'Client requested basic Slack connector upgrades.' }
      ];
      setDeals(defaultDeals);
      localStorage.setItem('nak3d_pipeline_deals', JSON.stringify(defaultDeals));
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const persistDeals = (updated: Deal[]) => {
    setDeals(updated);
    localStorage.setItem('nak3d_pipeline_deals', JSON.stringify(updated));
    api.post('/api/pipeline/sync', updated).catch(() => {
      // Ignore API sync errors, trust local storage
    });
  };

  const handleCreateDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Deal = {
      id: `deal-${Date.now()}`,
      name,
      company,
      value: Number(value),
      stage,
      assignedAgent,
      expectedClose: expectedClose || new Date().toISOString().split('T')[0],
      priority,
      notes
    };

    const updated = [...deals, created];
    persistDeals(updated);

    setNewDealModal(false);
    setName('');
    setCompany('');
    setValue(0);
    setNotes('');
  };

  const handleMoveDeal = (dealId: string, direction: 'forward' | 'backward') => {
    const updated = deals.map(d => {
      if (d.id !== dealId) return d;
      const currentIdx = STAGES.findIndex(s => s.id === d.stage);
      let nextIdx = currentIdx;
      if (direction === 'forward' && currentIdx < STAGES.length - 1) nextIdx++;
      if (direction === 'backward' && currentIdx > 0) nextIdx--;
      return { ...d, stage: STAGES[nextIdx].id as Deal['stage'] };
    });
    persistDeals(updated);
    
    if (selectedDeal && selectedDeal.id === dealId) {
      const match = updated.find(u => u.id === dealId);
      if (match) setSelectedDeal(match);
    }
  };

  const handleDeleteDeal = (dealId: string) => {
    const updated = deals.filter(d => d.id !== dealId);
    persistDeals(updated);
    setSelectedDeal(null);
  };

  // Stats calculation
  const totalPipeline = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').reduce((sum, d) => sum + d.value, 0);
  const closedWon = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + d.value, 0);
  const activeCount = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
  
  const wonCount = deals.filter(d => d.stage === 'won').length;
  const lostCount = deals.filter(d => d.stage === 'lost').length;
  const conversionRate = (wonCount + lostCount) > 0 ? Math.round((wonCount / (wonCount + lostCount)) * 100) : 0;

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const priorityColor = (p: string) => {
    switch(p) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#34d399';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <PageTransition 
      title="Deal Pipeline" 
      subtitle="Strategic management of ongoing proposals, prospective conversions, and financial scaling."
      icon={<GitBranch size={40} color="var(--accent)" />}
      toggleSidebar={toggleSidebar}
    >
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 24 }}>
        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(167, 139, 254, 0.1)', color: '#a78bfa' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pipeline Value</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formatValue(totalPipeline)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Closed Won</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{formatValue(closedWon)}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(96, 165, 250, 0.1)', color: '#60a5fa' }}>
            <Briefcase size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Deals</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{activeCount}</div>
          </div>
        </div>

        <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ padding: 12, borderRadius: 12, background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conversion Rate</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{conversionRate}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <button 
          onClick={() => setNewDealModal(true)}
          style={{ 
            padding: '10px 20px', 
            borderRadius: 8, 
            border: 'none', 
            background: 'var(--accent)', 
            color: '#000', 
            fontWeight: 'bold', 
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} /> New Deal Opportunity
        </button>
      </div>

      {/* Kanban Board Container */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))', 
          gap: 16, 
          overflowX: 'auto', 
          paddingBottom: 20,
          alignItems: 'start'
        }}
      >
        {STAGES.map(stage => {
          const stageDeals = deals.filter(d => d.stage === stage.id);
          const stageTotal = stageDeals.reduce((sum, d) => sum + d.value, 0);

          return (
            <div 
              key={stage.id} 
              style={{ 
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid var(--panel-border)', 
                borderRadius: 12, 
                padding: 16, 
                minHeight: 400,
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}
            >
              {/* Stage Header */}
              <div style={{ borderBottom: `2px solid ${stage.color}`, paddingBottom: 10, marginBottom: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: stage.color }}>{stage.name}</span>
                  <span style={{ padding: '2px 6px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {stageDeals.length}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatValue(stageTotal)}
                </div>
              </div>

              {/* Deal Cards */}
              <AnimatePresence>
                {stageDeals.map(deal => (
                  <motion.div
                    key={deal.id}
                    layoutId={deal.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedDeal(deal)}
                    style={{ 
                      background: 'var(--panel-bg)', 
                      border: `1px solid ${selectedDeal?.id === deal.id ? stage.color : 'var(--panel-border)'}`,
                      borderRadius: 10,
                      padding: 14,
                      cursor: 'pointer',
                      boxShadow: selectedDeal?.id === deal.id ? `0 0 15px ${stage.color}22` : 'none',
                      transition: 'border-color 0.2s'
                    }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{deal.name}</h4>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: 8 }}>
                      <Building size={12} />
                      <span>{deal.company}</span>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: 12 }}>
                      {formatValue(deal.value)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem' }}>
                        <User size={10} /> {deal.assignedAgent}
                      </span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: priorityColor(deal.priority), textTransform: 'uppercase' }}>
                        {deal.priority}
                      </span>
                    </div>

                    {/* Quick Move Buttons */}
                    <div style={{ display: 'flex', gap: 4, marginTop: 12, justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: 8 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveDeal(deal.id, 'backward'); }}
                        disabled={stage.id === 'lead'}
                        style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 4, padding: 4, color: stage.id === 'lead' ? '#444' : 'var(--text-muted)', cursor: stage.id === 'lead' ? 'default' : 'pointer' }}
                      >
                        <ArrowLeft size={14} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleMoveDeal(deal.id, 'forward'); }}
                        disabled={stage.id === 'lost'}
                        style={{ background: 'rgba(0,0,0,0.2)', border: 'none', borderRadius: 4, padding: 4, color: stage.id === 'lost' ? '#444' : 'var(--text-muted)', cursor: stage.id === 'lost' ? 'default' : 'pointer' }}
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Selected Deal Sidebar/Inspector */}
      <AnimatePresence>
        {selectedDeal && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'flex-end', zIndex: 900 }}>
            <motion.div 
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="glass-panel"
              style={{ 
                width: 400, 
                height: '100vh', 
                borderRadius: 0, 
                borderLeft: '1px solid var(--panel-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                padding: 24,
                overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Deal Inspector</h3>
                <button onClick={() => setSelectedDeal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deal Name</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: 4 }}>{selectedDeal.name}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Client Entity</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem', marginTop: 4 }}>
                  <Building size={16} color="var(--text-muted)" /> {selectedDeal.company}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Value</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginTop: 4 }}>{formatValue(selectedDeal.value)}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 'bold', color: priorityColor(selectedDeal.priority), textTransform: 'capitalize', marginTop: 4 }}>
                    ● {selectedDeal.priority}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target Close</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: 4 }}>
                    <Calendar size={16} color="var(--text-muted)" /> {selectedDeal.expectedClose}
                  </div>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Assigned Agent</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', marginTop: 4 }}>
                  <User size={16} color="var(--text-muted)" /> {selectedDeal.assignedAgent}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operational Notes</div>
                <p style={{ background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 8, fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--text-muted)', margin: '6px 0 0 0' }}>
                  {selectedDeal.notes || 'No execution directives attached.'}
                </p>
              </div>

              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button 
                    onClick={() => handleMoveDeal(selectedDeal.id, 'backward')} 
                    disabled={selectedDeal.stage === 'lead'}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'transparent', color: selectedDeal.stage === 'lead' ? '#444' : 'white', cursor: selectedDeal.stage === 'lead' ? 'default' : 'pointer' }}
                  >
                    ← Regress Stage
                  </button>
                  <button 
                    onClick={() => handleMoveDeal(selectedDeal.id, 'forward')} 
                    disabled={selectedDeal.stage === 'lost'}
                    style={{ padding: 10, borderRadius: 8, border: 'none', background: 'rgba(255,255,255,0.1)', color: selectedDeal.stage === 'lost' ? '#444' : 'white', cursor: selectedDeal.stage === 'lost' ? 'default' : 'pointer' }}
                  >
                    Advance Stage →
                  </button>
                </div>
                
                <button 
                  onClick={() => handleDeleteDeal(selectedDeal.id)}
                  style={{ padding: 12, borderRadius: 8, border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Delete Opportunity
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create New Deal Opportunity Modal */}
      {newDealModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ width: 450, maxWidth: '90%', border: '1px solid var(--panel-border)' }}
          >
            <h2 style={{ margin: '0 0 20px 0' }}>New Deal Opportunity</h2>
            <form onSubmit={handleCreateDeal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Deal Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Licensing Distribution"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Client Entity / Company</label>
                <input 
                  type="text" 
                  value={company} 
                  onChange={e => setCompany(e.target.value)} 
                  required 
                  placeholder="e.g. Acme Corp"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Deal Value ($)</label>
                  <input 
                    type="number" 
                    value={value} 
                    onChange={e => setValue(Number(e.target.value))} 
                    required 
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Initial Stage</label>
                  <select 
                    value={stage} 
                    onChange={e => setStage(e.target.value as Deal['stage'])}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  >
                    {STAGES.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Priority</label>
                  <select 
                    value={priority} 
                    onChange={e => setPriority(e.target.value as any)}
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Expected Close</label>
                  <input 
                    type="date" 
                    value={expectedClose} 
                    onChange={e => setExpectedClose(e.target.value)} 
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Assigned Agent</label>
                <select 
                  value={assignedAgent} 
                  onChange={e => setAssignedAgent(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                >
                  <option value="Bergen">Bergen</option>
                  <option value="Bergen">Bergen</option>
                  <option value="Lead Agent">Lead Agent</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Internal Notes</label>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Outline client objectives or initial discovery data..."
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none', minHeight: 80, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setNewDealModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--panel-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🚀 Capture Deal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
};
