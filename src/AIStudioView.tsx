import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FlaskConical, 
  Bot, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  CircuitBoard,
  CheckCircle2
} from 'lucide-react';
import axios from 'axios';

// --- API Instance ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true
});

const subsidiaries = [
  'Economic Wealth Systems (EWS)',
  'Nak3d Eye Music',
  'Nak3d Eye Film',
  'Nak3d Eye TV',
  'Pest Arrest',
  'ThaAfterParty (TAP)',
  'SocialCard',
  'Nak3d Eye Mirror',
  'Nak3d Eye Construction',
  'Nak3d Eye Wellness',
  'Nak3d Eye Web',
];

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


export const AIStudioView = ({ toggleSidebar }: any) => {
  const [goal, setGoal] = useState('');
  const [selectedBusiness, setSelectedBusiness] = useState(subsidiaries[0]);
  const [phase, setPhase] = useState<'IDLE' | 'THINKING' | 'AUDIT' | 'QUEUED'>('IDLE');
  const [strategicPlan, setStrategicPlan] = useState<any>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  const handleInitiate = async () => {
    setPhase('THINKING');
    try {
      const res = await api.post('/api/dispatcher/mission', {
        mission: `You are the Nak3d Eye Strategic Architect. Develop a comprehensive expansion plan for ${selectedBusiness} based on this goal: ${goal}. 
        Identify specific:
        1. Specialized Agents needed.
        2. Internal Apps or Platforms to build.
        3. External Websites or Portals for market reach.
        Return the response in a structured format with clear headings.`,
        swarmCount: 1,
        useKimi: true
      });
      setStrategicPlan(res.data.response);
      setPhase('AUDIT');
    } catch (err) {
      alert('Strategic Analysis Failed');
      setPhase('IDLE');
    }
  };

  const handleAudit = async () => {
    setPhase('THINKING'); // Re-use thinking state for audit
    try {
      const res = await api.post('/api/dispatcher/mission', {
        mission: `You are the Nak3d Eye Internal Auditor. Review the following strategic plan for ${selectedBusiness} and ensure it strictly improves operational flow and expansion efficiency. 
        Plan: ${strategicPlan}
        
        Provide a "PASS" or "REVISION REQUIRED" verdict with a brief rationale focusing on seamless operations.`,
        swarmCount: 1,
        useKimi: true
      });
      setAuditResult(res.data.response);
      setPhase('QUEUED');
    } catch (err) {
      alert('Audit Failed');
      setPhase('AUDIT');
    }
  };

  return (
    <PageTransition 
      title="AI Lab" 
      subtitle="Autonomous R&D hub for agent synthesis and business expansion prototyping." 
      icon={<FlaskConical size={40} color="#4ade80" />}
      toggleSidebar={toggleSidebar}
    >
      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Growth Architecture
            </h3>
            <div className="form-group">
              <label className="login-label">Target Entity</label>
              <select 
                className="form-input" 
                value={selectedBusiness}
                onChange={(e) => setSelectedBusiness(e.target.value)}
                style={{ width: '100%', height: '48px' }}
              >
                {subsidiaries.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="login-label">Expansion Goal / Objective</label>
              <textarea 
                className="form-textarea" 
                style={{ minHeight: 120 }}
                placeholder="Describe the desired expansion... e.g., 'Automate the royalty distribution for Nak3d Eye Music globally.'"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
              />
            </div>
            <button 
              className="primary-btn" 
              style={{ width: '100%', height: '52px' }}
              disabled={phase !== 'IDLE' || !goal}
              onClick={handleInitiate}
            >
              {phase === 'THINKING' ? <RefreshCw className="spin" size={20} /> : <Zap size={20} />}
              <span style={{ marginLeft: 10 }}>{phase === 'IDLE' ? 'Initiate Strategic Synthesis' : 'Synthesizing...'}</span>
            </button>
          </div>

          {phase === 'QUEUED' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel" 
              style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid #4ade80' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#4ade80' }}>
                <CheckCircle2 size={24} />
                <div>
                  <div style={{ fontWeight: 'bold' }}>Strategic Plan Approved & Queued</div>
                  <div style={{ fontSize: '0.8rem' }}>Assets are being prepared for synthesis by the fleet.</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', minHeight: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Lab Output / Simulation
            </h3>
            <div style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: 4 }}>
              STATUS: {phase}
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <AnimatePresence mode="wait">
              {phase === 'IDLE' && (
                <motion.div 
                  key="idle"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.2, textAlign: 'center' }}
                >
                  <CircuitBoard size={100} strokeWidth={1} />
                  <p style={{ marginTop: 20, maxWidth: 300 }}>Synthesize expansion goals into actionable agent and app infrastructure.</p>
                </motion.div>
              )}

              {strategicPlan && (
                <motion.div 
                  key="plan"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 12, border: '1px solid var(--panel-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', marginBottom: 12, fontSize: '0.8rem', fontWeight: 'bold' }}>
                      <Bot size={16} /> STRATEGIC ARCHITECT PROPOSAL
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{strategicPlan}</div>
                  </div>

                  {phase === 'AUDIT' && (
                    <button 
                      className="primary-btn" 
                      style={{ width: '100%', background: '#fbbf24', color: '#000' }}
                      onClick={handleAudit}
                    >
                      <ShieldCheck size={20} />
                      <span style={{ marginLeft: 10 }}>Internal Audit Check</span>
                    </button>
                  )}

                  {auditResult && (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      style={{ background: 'rgba(251, 191, 36, 0.1)', padding: 20, borderRadius: 12, border: '1px solid #fbbf24' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', marginBottom: 12, fontSize: '0.8rem', fontWeight: 'bold' }}>
                        <ShieldCheck size={16} /> INTERNAL AUDITOR VERDICT
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>{auditResult}</div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {phase === 'THINKING' && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(11, 12, 16, 0.8)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 16, zIndex: 10 }}>
              <RefreshCw size={48} color="var(--accent)" className="spin" style={{ marginBottom: 16 }} />
              <div style={{ fontWeight: 'bold', color: 'var(--accent)', letterSpacing: '2px' }}>LAB SYNTHESIZING ARCHITECTURE...</div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
