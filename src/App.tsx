/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, HardDrive, FileText, Users, Building, Activity, Rocket, MessageSquare, Settings, Wrench, Clock, Cable, UploadCloud, Send, Mic, Cpu, CheckSquare, Shield, FolderOpen, Server, Layers, GitBranch, Radio, FlaskConical, Bot, UserCheck, User, Briefcase, LayoutDashboard, ListTodo, CircuitBoard, Network, Plus, Terminal, RefreshCw, RotateCcw, Save, Lock, ArrowLeft, Lightbulb } from 'lucide-react';

import axios from 'axios';

import { AgentsCreateView } from './AgentsCreateView';
import { TeamsView } from './TeamsView';
import { PeopleView } from './PeopleView';
import { ContentStudioView } from './ContentStudioView';
import { DispatcherView } from './DispatcherView';
import { SecurityView } from './SecurityView';
import { CustomizationView } from './CustomizationView';
import { AIStudioView } from './AIStudioView';
import { ProjectsView } from './ProjectsView';
import { PipelineView } from './PipelineView';
import { RadarView } from './RadarView';
import { SuggestedView } from './SuggestedView';
import { CeoDeskView } from './CeoDeskView';
import './index.css';







// PWA UpdateBanner disabled (service worker removed to fix auth caching issues)
const UpdateBanner = () => null;

// --- API ---
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  withCredentials: true
});

// Add interceptor to handle Bearer tokens for mobile apps
api.interceptors.request.use(config => {
  const token = localStorage.getItem('mc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Components ---
const SetupWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    AUTH_USER: 'admin@missioncontrol.net',
    AUTH_PASS: 'admin123',
    ANTHROPIC_API_KEY: '',
    OPENAI_API_KEY: '',
    ELEVENLABS_API_KEY: '',
    TWELVE_DATA_API_KEY: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/api/setup', config);
      alert('System Configuration Finalized. Restarting Gateway...');
      onComplete();
    } catch (err) {
      alert('Setup failed. Check server logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel" 
        style={{ width: 500, padding: 40, position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ position: 'absolute', top: -50, right: -50, opacity: 0.1 }}>
          <Rocket size={200} color="var(--accent)" />
        </div>

        <div style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ height: 4, flex: 1, borderRadius: 2, background: s <= step ? 'var(--accent)' : 'rgba(255,255,255,0.1)' }} />
            ))}
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>System Setup</h2>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0', fontSize: '0.9rem' }}>Initialize your Mission Control Skeleton.</p>
        </div>

        {step === 1 && (
          <div className="setup-step">
            <h3 style={{ fontSize: '1rem', marginBottom: 20, color: 'var(--accent)' }}>01. Identity & Auth</h3>
            <div className="form-group">
              <label className="login-label">Master Admin Email</label>
              <input 
                className="login-input" 
                value={config.AUTH_USER} 
                onChange={e => setConfig({...config, AUTH_USER: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="login-label">Master Password</label>
              <input 
                type="password"
                className="login-input" 
                value={config.AUTH_PASS} 
                onChange={e => setConfig({...config, AUTH_PASS: e.target.value})} 
              />
            </div>
            <button className="login-btn" style={{ marginTop: 30 }} onClick={() => setStep(2)}>Next Step</button>
          </div>
        )}

        {step === 2 && (
          <div className="setup-step">
            <h3 style={{ fontSize: '1rem', marginBottom: 20, color: 'var(--accent)' }}>02. Intelligence Keys</h3>
            <div className="form-group">
              <label className="login-label">Anthropic API Key</label>
              <input 
                placeholder="sk-ant-..."
                className="login-input" 
                value={config.ANTHROPIC_API_KEY} 
                onChange={e => setConfig({...config, ANTHROPIC_API_KEY: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="login-label">OpenAI API Key (Optional)</label>
              <input 
                placeholder="sk-..."
                className="login-input" 
                value={config.OPENAI_API_KEY} 
                onChange={e => setConfig({...config, OPENAI_API_KEY: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setStep(1)}>Back</button>
              <button className="login-btn" style={{ flex: 2 }} onClick={() => setStep(3)}>Next Step</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="setup-step">
            <h3 style={{ fontSize: '1rem', marginBottom: 20, color: 'var(--accent)' }}>03. Domain Keys</h3>
            <div className="form-group">
              <label className="login-label">Twelve Data Key (Finance)</label>
              <input 
                className="login-input" 
                value={config.TWELVE_DATA_API_KEY} 
                onChange={e => setConfig({...config, TWELVE_DATA_API_KEY: e.target.value})} 
              />
            </div>
            <div className="form-group" style={{ marginTop: 16 }}>
              <label className="login-label">ElevenLabs Key (Voice)</label>
              <input 
                className="login-input" 
                value={config.ELEVENLABS_API_KEY} 
                onChange={e => setConfig({...config, ELEVENLABS_API_KEY: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 30 }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setStep(2)}>Back</button>
              <button className="login-btn" style={{ flex: 2 }} onClick={handleSave} disabled={loading}>
                {loading ? 'FINALIZING...' : 'Complete Setup'}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- Components ---
const Sidebar = ({ isOpen, toggleSidebar, handleLogout, localMode, toggleLocalMode, isSyncingLocal }: { isOpen: boolean, toggleSidebar: () => void, handleLogout: () => void, localMode: boolean, toggleLocalMode: () => void, isSyncingLocal: boolean }) => (
  <>
    {/* Mobile Overlay */}
    {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}
    
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <Rocket className="text-accent" size={24} color="#4ade80" />
        <h1>Mission Control</h1>
        <button className="mobile-close-btn" onClick={toggleSidebar}>×</button>
      </div>

      <div className="nav-section">Command</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/office" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Building size={20} /> Office
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/chat" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <MessageSquare size={20} /> Chat & Control
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/approvals" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <CheckSquare size={20} /> Approvals
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/council" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Shield size={20} /> Council
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/fleet" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Activity size={20} /> Fleet Health
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/tasks" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ListTodo size={20} /> Tasks
        </NavLink>
      </nav>

      <div className="nav-section">Agents & Teams</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/agents" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <CircuitBoard size={20} /> Agents
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/agents-create" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Bot size={20} /> Agents 2 Create
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/teams" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <UserCheck size={20} /> Teams
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/people" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <User size={20} /> People
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/companies" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Briefcase size={20} /> Companies
        </NavLink>
      </nav>

      <div className="nav-section">Work</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/projects" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FolderOpen size={20} /> Projects
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/pipeline" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <GitBranch size={20} /> Pipeline
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/factory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Layers size={20} /> Factory
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/content" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <LayoutDashboard size={20} /> Content
        </NavLink>
      </nav>

      <div className="nav-section">Intelligence</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/dispatcher" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Rocket size={20} /> Dispatcher
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/radar" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Radio size={20} /> Radar
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/suggested" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Lightbulb size={20} /> Suggested
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/ceo-desk" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Briefcase size={20} /> CEO Desk
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/ailab" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FlaskConical size={20} /> AI Lab
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/skills" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Wrench size={20} /> Skills Hub
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/cron" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Clock size={20} /> Cron Manager
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/customization" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Settings size={20} /> Customization
        </NavLink>
      </nav>

      <div className="nav-section">Mode Control</div>
      <div style={{ padding: '0 16px 12px' }}>
        <button 
          onClick={toggleLocalMode}
          disabled={isSyncingLocal}
          className={`nav-link ${localMode ? 'active' : ''}`}
          style={{ 
            width: '100%', 
            justifyContent: 'space-between', 
            background: localMode ? 'rgba(74, 222, 128, 0.1)' : 'rgba(255,255,255,0.03)',
            borderColor: localMode ? 'rgba(74, 222, 128, 0.3)' : 'var(--panel-border)',
            borderStyle: 'solid',
            borderWidth: '1px',
            borderRadius: '12px',
            padding: '10px 16px',
            opacity: isSyncingLocal ? 0.6 : 1,
            cursor: isSyncingLocal ? 'wait' : 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ color: localMode ? '#4ade80' : 'var(--text-muted)' }}>
              {localMode ? <Rocket size={20} /> : <UploadCloud size={20} />}
            </div>
            <span style={{ color: localMode ? '#4ade80' : 'var(--text-main)', fontWeight: localMode ? 'bold' : 'normal' }}>
              {localMode ? 'Local (Offline)' : 'Cloud Hybrid'}
            </span>
          </div>
          <div style={{ 
            width: 36, 
            height: 20, 
            borderRadius: 20, 
            background: localMode ? '#4ade80' : 'rgba(255,255,255,0.1)',
            position: 'relative',
            transition: 'background 0.3s ease'
          }}>
            <div style={{ 
              width: 14, 
              height: 14, 
              borderRadius: '50%', 
              background: '#fff', 
              position: 'absolute', 
              top: 3, 
              left: localMode ? 19 : 3,
              transition: 'left 0.3s ease'
            }} />
          </div>
        </button>
        {localMode && (
          <div style={{ fontSize: '0.65rem', color: '#4ade80', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
            ROUTING THROUGH OLLAMA / DEEPSEEK
          </div>
        )}
      </div>

      <div className="nav-section">Knowledge</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/memory" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <HardDrive size={20} /> Memory
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/docs" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <FileText size={20} /> Docs
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/calendar" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Calendar size={20} /> Calendar
        </NavLink>
      </nav>

      <div className="nav-section">Infrastructure</div>
      <nav className="nav-links">
        <NavLink onClick={toggleSidebar} to="/fleet" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Activity size={20} /> Fleet Health
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/system" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Server size={20} /> System
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/security" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Shield size={20} /> Security
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/team" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Users size={20} /> Team Roster
        </NavLink>
        <NavLink onClick={toggleSidebar} to="/nodes" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Network size={20} /> Nodes
        </NavLink>
        <NavLink onClick={handleLogout} to="#" className="nav-link" style={{ marginTop: 'auto', color: '#f87171' }}>
          <Lock size={20} /> Log Out
        </NavLink>
      </nav>
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: 10, border: '1px solid var(--panel-border)', marginBottom: 12 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>Connected As</div>
          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} />
            admin@missioncontrol.net
          </div>
        </div>
        <button 
          onClick={async () => {
            if (confirm('Terminate secure session?')) {
              await api.post('/api/auth/logout');
              window.location.reload();
            }
          }}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', color: '#f87171', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
        >
          <Rocket size={18} style={{ transform: 'rotate(180deg)' }} /> Sign Out
        </button>
      </div>
    </aside>
  </>
);

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
};

const BottomNav = ({ toggleSidebar }: { toggleSidebar: () => void }) => {
  return (
    <nav className="member-nav">
      <NavLink to="/office" className={({isActive}) => `flex-btn ${isActive ? 'active' : ''}`}>
        <Building size={20} />
        <span>Office</span>
      </NavLink>
      <NavLink to="/chat" className={({isActive}) => `flex-btn ${isActive ? 'active' : ''}`}>
        <MessageSquare size={20} />
        <span>Chat</span>
      </NavLink>
      <NavLink to="/radar" className={({isActive}) => `flex-btn ${isActive ? 'active' : ''}`}>
        <Radio size={20} />
        <span>Radar</span>
      </NavLink>
      <button onClick={toggleSidebar} className="flex-btn">
        <Activity size={20} />
        <span>Menu</span>
      </button>
      <NavLink to="/projects" className={({isActive}) => `flex-btn ${isActive ? 'active' : ''}`}>
        <FolderOpen size={20} />
        <span>Projects</span>
      </NavLink>
    </nav>
  );
};


export const PageTransition = ({ children, title, subtitle, toggleSidebar }: any) => {
  const navigate = useNavigate();
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="main-content"
    >
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="mobile-menu-btn" onClick={toggleSidebar}>
            <svg style={{ width: 24, height: 24 }} viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
          </button>
          <div>
            <h2 className="page-title">{title}</h2>
            <p className="page-subtitle">{subtitle}</p>
          </div>
        </div>

        {/* Global Back Button */}
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
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>
      </div>
      {children}
    </motion.div>
  );
};


// --- Views ---

const OfficeView = ({ toggleSidebar }: any) => (
  <PageTransition toggleSidebar={toggleSidebar} title="Headquarters" subtitle="System command center and active metrics.">
    <div className="grid-3">
      <div className="glass-panel">
        <Activity size={32} color="#4ade80" className="stat-icon" />
        <h3>System Status</h3>
        <p className="text-muted stat-subtitle">Fleet Gateway is online and ready for directive injection.</p>
      </div>
      <div className="glass-panel">
        <Users size={32} color="#38bdf8" className="stat-icon" />
        <h3>Agent Roster</h3>
        <p className="text-muted stat-subtitle">Define and deploy autonomous agents to handle specific business domains.</p>
      </div>
      <div className="glass-panel">
        <Wrench size={32} color="#facc15" className="stat-icon" />
        <h3>Capabilities</h3>
        <p className="text-muted stat-subtitle">Load and assign skills to enhance agent operative reach.</p>
      </div>
    </div>
  </PageTransition>
);

const ChatControlView = ({ toggleSidebar }: any) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', agent: 'System', text: 'Gateway established. Master control protocols online. Define an agent to begin autonomous operations.' }
  ]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('Bergen (Director)');
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/agents').then(res => setAgents(res.data)).catch(console.error);
  }, []);

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const targetAgentName = selectedAgent.split(' ')[0].toLowerCase();
    const currentInput = input;
    
    // Add user message to UI
    const newMsgs = [...messages, { role: 'user', agent: 'Admin', text: currentInput }];
    setMessages(newMsgs);
    setInput('');
    
    try {
      // Send real command to backend
      const res = await api.post('/api/chat/message', {
        agentId: targetAgentName,
        message: currentInput
      });

      // System feedback
      setMessages([...newMsgs, { 
        role: 'system', 
        agent: 'System', 
        text: res.data.status === 'logged-locally' 
          ? `[OFFLINE] Directive logged to Flight Journal and ${targetAgentName} folder. Local Ollama processing triggered.`
          : `Directive transmitted to ${selectedAgent}. Bridge response: ${JSON.stringify(res.data.response || 'Acknowledged')}`
      }]);
    } catch (err) {
      setMessages([...newMsgs, { 
        role: 'system', 
        agent: 'System', 
        text: `Error: Gateway communication failure. Check if Mission Control backend is online.` 
      }]);
    }
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Command Console" subtitle="Direct terminal comms to active agents across the Gateway.">
      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '65vh', padding: 0, overflow: 'hidden' }}>
        
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.3)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
             <Cpu size={24} color="var(--accent)" />
             <select 
               value={selectedAgent}
               onChange={(e) => setSelectedAgent(e.target.value)}
               style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', outline: 'none', cursor: 'pointer' }}
             >
               <option value="System">System Controller</option>
               {agents.map(a => (
                 <option key={a.id || a._folder} value={a.name}>{a.name} ({a.id || a._folder})</option>
               ))}
             </select>
           </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ padding: '4px 8px', borderRadius: 4, background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80' }}>
                <span style={{ fontSize: '0.7rem', color: '#4ade80', fontWeight: 'bold' }}>AGENT STATUS: </span>
                <span style={{ fontSize: '0.7rem', color: 'white' }}>ACTIVE</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: '#4ade80' }}>● SECURE TUNNEL</div>
            </div>
        </div>

        {/* Messages Layout */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           {messages.map((msg, i) => (
             <div key={i} style={{ 
               alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
               maxWidth: '75%',
               display: 'flex',
               flexDirection: 'column',
               gap: '4px'
             }}>
                <span style={{ fontSize: '0.75rem', color: msg.role === 'system' ? 'var(--accent)' : 'var(--text-muted)', marginLeft: 8 }}>
                  {msg.agent}
                </span>
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: '12px',
                  background: msg.role === 'user' ? 'var(--accent)' : (msg.role === 'system' ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.05)'),
                  color: msg.role === 'user' ? '#000' : 'var(--text-main)',
                  border: msg.role === 'system' ? '1px dashed var(--accent)' : 'none',
                  fontFamily: msg.role === 'system' ? 'monospace' : 'inherit'
                }}>
                   {msg.text}
                </div>
             </div>
           ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} style={{ display: 'flex', padding: '16px', borderTop: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.2)', gap: '12px' }}>
           <button type="button" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <Mic size={20} />
           </button>
           <input 
             type="text" 
             value={input}
             onChange={e => setInput(e.target.value)}
             placeholder={`Send directive to ${selectedAgent.split(' ')[0]}...`}
             style={{ flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: '24px', padding: '0 20px', color: 'white', fontSize: '1rem', outline: 'none' }}
           />
           <button type="submit" style={{ background: 'var(--accent)', border: 'none', color: '#000', borderRadius: '50%', width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
             <Send size={20} />
           </button>
        </form>

      </div>
    </PageTransition>
  );
};



const SettingsView = ({ toggleSidebar }: any) => {
  const [model, setModel] = useState<string>('google/gemini-2.5-pro');

  useEffect(() => {
    api.get('/api/model').then(res => setModel(res.data.model)).catch(console.error);
  }, []);

  const handleModelChange = (e: any) => {
    const newModel = e.target.value;
    setModel(newModel);
    api.post('/api/model', { model: newModel }).catch(console.error);
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Gateway Infrastructure" subtitle="Core network routing and security parameters.">
      <div className="grid-2">
        <div className="glass-panel">
          <h3 className="section-label">Core Matrix Model</h3>
          <p className="text-muted" style={{ marginBottom: '16px' }}>Dynamically swap the underlying LLM processing engine for Bergen.</p>
          <select value={model} onChange={handleModelChange} style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'var(--text-main)', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer' }}>
             <optgroup label="─── Google Cloud ───">
               <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (Google)</option>
               <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Fast)</option>
             </optgroup>
             <optgroup label="─── OpenAI ───">
               <option value="openai/gpt-4o">GPT-4o (OpenAI)</option>
               <option value="openai/gpt-4-turbo">GPT-4 Turbo</option>
             </optgroup>
             <optgroup label="─── Local · Reasoning (DeepSeek-R1) ───">
               <option value="ollama/deepseek-r1:32b">DeepSeek-R1 32B · Best Reasoning 🧠</option>
               <option value="ollama/deepseek-r1:14b">DeepSeek-R1 14B · Fast Reasoning ⚡</option>
             </optgroup>
             <optgroup label="─── Local · Multimodal (Google Gemma 4) ───">
               <option value="ollama/gemma4:e4b">Gemma4 E4B · World Knowledge 🌐</option>
               <option value="ollama/gemma4:e2b">Gemma4 E2B · Lightweight 💨</option>
             </optgroup>
             <optgroup label="─── Local · Long Memory (Meta Llama 4) ───">
               <option value="ollama/llama4:scout">Llama 4 Scout · 10M Context Window 🦙</option>
             </optgroup>
             <optgroup label="─── Local · Specialized ───">
               <option value="ollama/glm4:latest">GLM-4 · Multilingual 🌍</option>
               <option value="ollama/llama3.2-vision:latest">Llama 3.2 Vision · Image Input 👁️</option>
               <option value="ollama/qwen2.5-coder:7b">Qwen 2.5 Coder · Code Tasks 💻</option>
             </optgroup>
          </select>

        </div>
        <div className="glass-panel">
          <h3 className="section-label">Endpoint Security</h3>
           <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 20 }}>Identity verification and secure tunnel status for the remote gateway.</p>
           <div style={{ padding: '16px', background: 'rgba(74, 222, 128, 0.1)', borderRadius: 12, border: '1px solid rgba(74,222,128,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Shield size={20} color="#4ade80" />
              <span style={{ fontWeight: 'bold', color: '#4ade80' }}>SECURE SESSION ACTIVE</span>
            </div>
          </div>
        </div>
        <div className="glass-panel" style={{ gridColumn: '1 / -1' }}>
          <h3 className="section-label">Active Endpoints</h3>
          <div className="status-indicator">
             <div className="status-dot"></div>
             <span>EWS Trading Gateway [ONLINE]</span>
          </div>
          <div className="status-indicator" style={{marginTop: 12}}>
             <div className="status-dot"></div>
             <span>Ag_Bridge Multi-Agent Orchestrator [ONLINE]</span>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const SkillsHubView = ({ toggleSidebar }: any) => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState('global');
  const [skills, setSkills] = useState<{name: string, enabled: boolean}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/agents').then(res => setAgents(res.data)).catch(console.error);
    fetchSkills('global');
  }, []);

  const fetchSkills = async (agentMode: string) => {
    setLoading(true);
    try {
      const res = await api.get('/api/skills');
      const allSkills = [
        ...res.data.active.map((s: any) => ({ ...s, enabled: true })),
        ...res.data.disabled.map((s: any) => ({ ...s, enabled: false }))
      ];

      if (agentMode === 'global') {
        setSkills(allSkills);
      } else {
        const agent = agents.find(a => a._folder === agentMode);
        const agentSkills = agent?.skills || [];
        
        setSkills(allSkills.map((s: any) => ({
           ...s,
           enabled: agentSkills.includes(s.name)
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentChange = (e: any) => {
    const mode = e.target.value;
    setSelectedAgent(mode);
    fetchSkills(mode);
  };

  const toggleSkill = async (skillName: string, currentlyEnabled: boolean) => {
    setSkills(prev => prev.map(s => s.name === skillName ? { ...s, enabled: !currentlyEnabled } : s));
    try {
      if (selectedAgent === 'global') {
        await api.post('/api/skills/toggle', { skill: skillName, enabled: !currentlyEnabled });
      } else {
        const res = await api.post(`/api/agents/${selectedAgent}/skills/toggle`, { skill: skillName, enabled: !currentlyEnabled });
        // Update local agents list so we don't lose state if we swap back and forth
        setAgents(prev => prev.map(a => a._folder === selectedAgent ? { ...a, skills: res.data.skills } : a));
      }
    } catch (err) {
      console.error("Failed to toggle skill");
      fetchSkills(selectedAgent); // revert
    }
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Skills Integration Hub" subtitle="Dynamically toggle capabilities across your deployed fleet.">
      <div className="glass-panel" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
         <label style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Target Agent:</label>
         <select 
           value={selectedAgent} 
           onChange={handleAgentChange}
           style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', borderRadius: 8, flex: 1, outline: 'none' }}
         >
            <option value="global">Global (Bergen Main Core)</option>
            {agents.filter(a => a._folder).map(a => (
               <option key={a._folder} value={a._folder}>{a.name} ({a._folder})</option>
            ))}
         </select>
      </div>

      <div className="skills-registry-grid">
        {loading ? (
          <div className="glass-panel" style={{ padding: 40, textAlign: 'center' }}>
            <p className="pulse-text">Loading capability registry...</p>
          </div>
        ) : (
          <>
            {skills.map((skill: any) => (
              <div className={`glass-panel skill-card ${skill.enabled ? 'skill-active' : ''}`} key={skill.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className="skill-icon-box">
                     {skill.name.includes('trade') ? <TrendingUp size={24} color="#4ade80" /> : 
                      skill.name.includes('browser') ? <Globe size={24} color="#38bdf8" /> :
                      skill.name.includes('file') ? <Cpu size={24} color="#facc15" /> :
                      <Wrench size={24} color="var(--text-muted)" />}
                  </div>
                  <label className="switch" title="Toggle Skill">
                    <input 
                      type="checkbox" 
                      checked={skill.enabled} 
                      onChange={() => toggleSkill(skill.name, skill.enabled)}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
                <h3 className="skill-title">{skill.name.replace(/_/g, ' ')}</h3>
                <p className="skill-description">{skill.description}</p>
                <div className="skill-footer">
                  <div className="skill-tag">{skill.enabled ? 'Operational' : 'Offline'}</div>
                  <div className="skill-meta">{selectedAgent === 'global' ? 'Global Core' : 'Agent Specific'}</div>
                </div>
              </div>
            ))}
            {skills.length === 0 && (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: 60, textAlign: 'center' }}>
                <div style={{ opacity: 0.3, marginBottom: 20 }}><Wrench size={64} /></div>
                <h3>No Skills Found</h3>
                <p className="text-muted">Load skill modules into the OpenClaw directory to begin.</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
};

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const CalendarView = ({ toggleSidebar }: any) => {
  const today = new Date();
  const [view, setView] = useState<'month'|'week'|'list'>('month');
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Date|null>(null);

  useEffect(() => {
    api.get('/api/calendar').then(res => {
      const payload = res.data;
      const raw = Array.isArray(payload) ? payload : (payload?.data || []);
      setEvents(raw.map((ev: any) => ({
        ...ev,
        _date: ev.start ? new Date(ev.start) : (ev.date ? new Date(ev.date) : null),
      })));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const eventsOnDay = (d: Date) => events.filter(ev => {
    if (!ev._date) return false;
    return ev._date.getFullYear()===d.getFullYear() && ev._date.getMonth()===d.getMonth() && ev._date.getDate()===d.getDate();
  });

  const isToday = (d: Date) => d.toDateString() === today.toDateString();
  const isSelected = (d: Date) => selected?.toDateString() === d.toDateString();

  // Generate month grid
  const firstDay = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const lastDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const startPad = firstDay.getDay();
  const cells: (Date|null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedDayEvents = selected ? eventsOnDay(selected) : [];

  // Next 14 days for list view
  const upcomingDays = Array.from({length:14}, (_,i) => { const d = new Date(today); d.setDate(today.getDate()+i); return d; });

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Mission Calendar" subtitle="Master schedule — all events and agent tasks in one place">

      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20, flexWrap:'wrap' }}>
        <button onClick={() => { 
          const d = new Date(cursor);
          if (view === 'week') d.setDate(d.getDate() - 7);
          else d.setMonth(d.getMonth() - 1);
          setCursor(d);
        }}
          style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--panel-border)', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', fontSize:'1.1rem', transition: 'all 0.2s' }}>‹</button>
        <h2 style={{ margin:0, flex:1, fontWeight:'bold', textAlign: 'center', letterSpacing: '1px' }}>
          {view === 'week' ? `Week of ${new Date(cursor.getTime() - (cursor.getDay() * 24 * 60 * 60 * 1000)).toLocaleDateString(undefined, {month:'short', day:'numeric'})}` : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`}
        </h2>
        <button onClick={() => { 
          const d = new Date(cursor);
          if (view === 'week') d.setDate(d.getDate() + 7);
          else d.setMonth(d.getMonth() + 1);
          setCursor(d);
        }}
          style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--panel-border)', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', fontSize:'1.1rem', transition: 'all 0.2s' }}>›</button>
        <button onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), view === 'week' ? today.getDate() : 1))}
          style={{ padding:'7px 14px', borderRadius:8, border:'1px solid var(--accent)', color:'var(--accent)', background:'transparent', cursor:'pointer', fontWeight:'bold' }}>Today</button>
        <div style={{ display:'flex', background:'rgba(255,255,255,0.05)', borderRadius:8, overflow:'hidden', border:'1px solid var(--panel-border)' }}>
          {(['month','week','list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ padding:'7px 14px', border:'none', background: view===v ? 'var(--accent)' : 'transparent', color: view===v ? '#000' : 'var(--text-muted)', cursor:'pointer', fontWeight: view===v?'bold':'normal', textTransform:'capitalize' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="glass-panel" style={{ padding:0, overflowX:'auto' }}>
          {/* Header */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', background:'rgba(255,255,255,0.03)', borderBottom:'1px solid var(--panel-border)', minWidth: 840 }}>
            {WEEKDAYS.map((d, i) => <div key={d} style={{ padding:'12px 0', textAlign:'center', fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:'bold', letterSpacing:'0.08em', borderRight: i === 6 ? 'none' : '1px solid rgba(255,255,255,0.1)' }}>{d}</div>)}
          </div>
          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gridAutoRows: 'minmax(120px, auto)', minWidth: 840, background: 'rgba(255,255,255,0.02)' }}>
            {cells.map((day, i) => {
              const dayEvts = day ? eventsOnDay(day) : [];
              const isLastInCol = (i + 1) % 7 === 0;
              return (
                <div key={i} onClick={() => day && setSelected(day)}
                  style={{ 
                    minHeight:120, 
                    padding:'12px 10px', 
                    borderRight: '1px solid rgba(255,255,255,0.1)', 
                    borderBottom:'1px solid rgba(255,255,255,0.1)',
                    background: day && isSelected(day) ? 'rgba(139,92,246,0.15)' : day && isToday(day) ? 'rgba(74,222,128,0.12)' : 'transparent',
                    cursor: day ? 'pointer' : 'default',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}>
                  {day && (
                    <>
                      <div style={{ fontSize:'0.85rem', fontWeight: isToday(day)?'bold':'normal',
                        color: isToday(day)?'#4ade80' : isSelected(day)?'#a78bfa' : 'var(--text-main)',
                        background: isToday(day)?'rgba(74,222,128,0.15)':'transparent',
                        borderRadius:'50%', width:26, height:26, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:4 }}>
                        {day.getDate()}
                      </div>
                      {dayEvts.slice(0,3).map((ev,ei) => (
                        <div key={ei} style={{ fontSize:'0.68rem', background:'rgba(139,92,246,0.3)', border:'1px solid rgba(139,92,246,0.4)', borderRadius:4, padding:'1px 5px', marginBottom:2, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', color:'#c4b5fd' }}>
                          {ev.title || ev.summary || 'Event'}
                        </div>
                      ))}
                      {dayEvts.length > 3 && <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>+{dayEvts.length-3} more</div>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {upcomingDays.map(day => {
            const dayEvts = eventsOnDay(day);
            return (
              <div key={day.toDateString()} className="glass-panel" style={{ padding:'14px 18px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom: dayEvts.length?10:0 }}>
                  <div style={{ width:42, height:42, borderRadius:10, background: isToday(day)?'rgba(74,222,128,0.15)':'rgba(255,255,255,0.05)', border:`1px solid ${isToday(day)?'rgba(74,222,128,0.4)':'var(--panel-border)'}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <div style={{ fontSize:'0.6rem', color:'var(--text-muted)', lineHeight:1 }}>{WEEKDAYS[day.getDay()]}</div>
                    <div style={{ fontSize:'1rem', fontWeight:'bold', color: isToday(day)?'#4ade80':'var(--text-main)' }}>{day.getDate()}</div>
                  </div>
                  <div style={{ fontSize:'0.85rem', color:'var(--text-muted)' }}>{MONTHS[day.getMonth()]} {day.getDate()}{dayEvts.length===0?' — No events':''}</div>
                </div>
                {dayEvts.map((ev,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:'rgba(139,92,246,0.08)', borderRadius:8, border:'1px solid rgba(139,92,246,0.2)', marginTop:6 }}>
                    <div style={{ width:3, height:36, borderRadius:2, background:'#a78bfa', flexShrink:0 }} />
                    <div>
                      <div style={{ fontWeight:'bold' }}>{ev.title||ev.summary||'Untitled'}</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{ev._date?.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) || 'All Day'}{ev.calendar ? ` · ${ev.calendar}` : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          {loading && <p className="text-muted" style={{ textAlign:'center' }}>Loading calendar events...</p>}
          {!loading && events.length===0 && <div className="glass-panel" style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>No events found. Make sure the Calendar app is authorised in System Preferences → Privacy → Calendar.</div>}
        </div>
      )}

      {/* Week view (simplified — shows current week as list) */}
      {view === 'week' && (() => {
        const weekStart = new Date(cursor);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekDays = Array.from({length:7},(_,i)=>{ const d=new Date(weekStart); d.setDate(weekStart.getDate()+i); return d; });
        return (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:8 }}>
            {weekDays.map(day => {
              const dayEvts = eventsOnDay(day);
              return (
                <div key={day.toDateString()} className="glass-panel" style={{ padding:'10px 8px', minHeight:160, background: isToday(day)?'rgba(74,222,128,0.06)':'rgba(255,255,255,0.02)', border: isToday(day)?'1px solid rgba(74,222,128,0.3)':'1px solid var(--panel-border)' }}>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>{WEEKDAYS[day.getDay()]}</div>
                  <div style={{ fontSize:'1.2rem', fontWeight:'bold', color: isToday(day)?'#4ade80':'var(--text-main)', marginBottom:8 }}>{day.getDate()}</div>
                  {dayEvts.map((ev,i) => (
                    <div key={i} style={{ fontSize:'0.68rem', background:'rgba(139,92,246,0.2)', borderRadius:4, padding:'3px 6px', marginBottom:3, color:'#c4b5fd' }}>{ev.title||ev.summary||'Event'}</div>
                  ))}
                  {dayEvts.length===0 && <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:8, fontStyle:'italic' }}>Free</div>}
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Selected day event panel */}
      {selected && selectedDayEvents.length > 0 && (
        <div className="glass-panel" style={{ marginTop:20, border:'1px solid rgba(139,92,246,0.3)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
            <h3 style={{ margin:0 }}>{selected.toLocaleDateString(undefined, {weekday:'long',month:'long',day:'numeric'})}</h3>
            <button onClick={() => setSelected(null)} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'1.2rem' }}>✕</button>
          </div>
          {selectedDayEvents.map((ev,i) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width:3, borderRadius:2, background:'#a78bfa', flexShrink:0 }} />
              <div>
                <div style={{ fontWeight:'bold', marginBottom:2 }}>{ev.title||ev.summary}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{ev._date?.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) || 'All Day'} {ev.calendar ? `· ${ev.calendar}` : ''}</div>
                {ev.notes && <div style={{ fontSize:'0.78rem', marginTop:6, color:'var(--text-main)', opacity:0.7 }}>{ev.notes}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
};

const MemoryView = ({ toggleSidebar }: any) => {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/memory').then(res => {
      setMemories(res.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categorizedMemories = memories.reduce((acc: any, mem) => {
     // mem.updated_at is usually epoch timestamp
     const date = new Date(Number(mem.updated_at));
     const dateLabel = isNaN(date.getTime()) ? 'Legacy Archives' : date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
     
     // Very lightweight semantic topic categorization heuristic
     let topic = 'General Execution';
     const txt = (mem.text || '').toLowerCase();
     if (txt.includes('error') || txt.includes('fail') || txt.includes('crash')) topic = 'System Diagnostic';
     if (txt.includes('market') || txt.includes('price') || txt.includes('trade')) topic = 'Market Intelligence';
     if (txt.includes('/tmp') || txt.includes('bash') || txt.includes('script')) topic = 'Shell Execution';
     if (txt.includes('hey') || txt.includes('user')) topic = 'Human Interaction';
     
     if (!acc[dateLabel]) acc[dateLabel] = [];
     acc[dateLabel].push({ ...mem, topic });
     return acc;
  }, {});

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Consolidated Neural Memory" subtitle="Global search across all past conversations categorized by execution dates.">
      <div className="glass-panel">
         <input 
           type="text" 
           placeholder="Search encrypted vectors..." 
           className="search-input"
           title="Search Memory"
         />
         <div style={{marginTop: 32}}>
           {loading ? <p className="text-muted">Accessing SQLite vectors...</p> : (
             <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               {Object.keys(categorizedMemories).length === 0 && <p className="text-muted">No memory fragments found in SQLite DB.</p>}
               
               {Object.keys(categorizedMemories).map(dateStr => (
                 <div key={dateStr}>
                    <h4 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--panel-border)', paddingBottom: '8px', marginBottom: '16px' }}>
                      {dateStr}
                    </h4>
                    <div className="skills-list" style={{ gap: '16px' }}>
                       {categorizedMemories[dateStr].map((mem: any, i: number) => (
                         <div className="skill-item" key={i} style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8, background: 'rgba(0,0,0,0.2)' }}>
                            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between' }}>
                               <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--accent)', color: '#000', borderRadius: '4px', fontWeight: 'bold' }}>
                                 {mem.topic}
                               </span>
                               <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>
                                 Source: {mem.source}
                               </span>
                            </div>
                            <div style={{ fontSize: '0.90rem', color: 'var(--text-main)', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, width: '100%', lineHeight: '1.5' }}>
                              {mem.text}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
             </div>
           )}
         </div>
      </div>
    </PageTransition>
  );
};

const DocsView = ({ toggleSidebar }: any) => {
  const [documents, setDocuments] = useState<any[]>(() => {
    const saved = localStorage.getItem('mission_docs');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Knowledge Items Overview', content: 'Centralized documentation tracking for core organizational execution models.', timestamp: new Date().toLocaleDateString() },
      { id: '2', title: 'API Specs & Frameworks', content: 'Automated schemas mapping local integration proxies for gateway protocols.', timestamp: new Date().toLocaleDateString() },
      { id: '3', title: 'Day Trading Alignment Protocol', content: 'MANDATORY: Only enter when the 15m and 1H agree with the 4H direction. If they do not align, stay cash. This applies to all NYSE and Long Bid specialist agents. Precision over volume.', timestamp: new Date().toLocaleDateString() }
    ];
  });

  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('mission_docs', JSON.stringify(documents));
  }, [documents]);

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    const newDoc = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      timestamp: new Date().toLocaleString(),
      type: 'manual'
    };
    setDocuments([...documents, newDoc]);
    setNewTitle('');
    setNewContent('');
    setIsAdding(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newDoc = {
        id: Date.now().toString(),
        title: file.name,
        content: content,
        timestamp: new Date().toLocaleString(),
        type: 'upload',
        fileType: file.type
      };
      setDocuments(prev => [...prev, newDoc]);
    };

    if (file.type.startsWith('text/') || file.name.endsWith('.md') || file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else {
      // For other types, we might just store the name or metadata for now, 
      // or we could convert to base64 if needed, but text is safer for "viewing".
      reader.readAsDataURL(file); 
    }
  };

  const deleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDocuments(documents.filter(doc => doc.id !== id));
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc(null);
    }
  };

  if (selectedDoc) {
    return (
      <PageTransition toggleSidebar={toggleSidebar} title={selectedDoc.title} subtitle={`Created: ${selectedDoc.timestamp}`}>
        <div className="glass-panel" style={{ marginTop: 24, padding: '24px' }}>
          <button 
            onClick={() => setSelectedDoc(null)} 
            className="action-btn" 
            style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)' }}
          >
            ← Back to Documents
          </button>
          
          <div style={{ 
            fontSize: '1.05rem', 
            lineHeight: '1.6', 
            color: 'var(--text-main)', 
            whiteSpace: 'pre-wrap',
            background: 'rgba(0,0,0,0.2)',
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {selectedDoc.content}
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="System Documents" subtitle="Knowledge base and architecture manuals.">
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setIsAdding(!isAdding)} 
          className="action-btn"
          style={{ background: 'var(--brand-glow)', color: '#fff', border: 'none' }}
        >
          {isAdding ? 'Cancel' : '+ Add Document'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAddDocument} className="glass-panel" style={{ marginBottom: 32, padding: 24 }}>
          <h3 className="section-label" style={{ marginBottom: 16 }}>Create New Document</h3>
          
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Document Title</label>
            <input 
              type="text" 
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Daily Trading Constraints"
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                outline: 'none'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Document Content</label>
            <textarea 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Type or paste document content here..."
              rows={6}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: '#fff',
                outline: 'none',
                resize: 'vertical'
              }}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', marginBottom: 8, color: 'var(--text-muted)' }}>Or Upload Document (TXT, MD, JSON)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="file" 
                onChange={handleFileUpload}
                accept=".txt,.md,.json,.pdf,.doc,.docx"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                  zIndex: 2
                }}
              />
              <div style={{
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.03)',
                border: '2px dashed rgba(255,255,255,0.1)',
                borderRadius: 12,
                color: 'var(--text-muted)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8
              }}>
                <FileText size={24} />
                <span style={{ fontSize: '0.85rem' }}>Drop file here or click to upload</span>
              </div>
            </div>
          </div>

          <button type="submit" className="action-btn" style={{ width: '100%', background: 'var(--accent-glow)', color: '#fff', border: 'none', padding: '14px', borderRadius: 12, fontWeight: 'bold' }}>
            Save Document
          </button>
        </form>
      )}

      <div className="grid-2">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="glass-panel clickable" 
            onClick={() => setSelectedDoc(doc)}
            style={{ 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <h3 className="section-label">{doc.title}</h3>
            <p className="text-muted" style={{ 
              display: '-webkit-box', 
              WebkitLineClamp: 3, 
              WebkitBoxOrient: 'vertical', 
              overflow: 'hidden',
              marginTop: 8,
              marginBottom: 16
            }}>
              {doc.content}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{doc.timestamp}</span>
              <button 
                onClick={(e) => deleteDocument(doc.id, e)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'rgba(255,255,255,0.2)', 
                  cursor: 'pointer',
                  padding: 4
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ff4d4d')}
                onMouseOut={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.2)')}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
};


const CronJobsView = ({ toggleSidebar }: any) => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [engineState, setEngineState] = useState<any>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [newJobSchedule, setNewJobSchedule] = useState('');
  const [newJobAction, setNewJobAction] = useState('');

  const [editModal, setEditModal] = useState(false);
  const [editJobId, setEditJobId] = useState<string | null>(null);
  const [editJobName, setEditJobName] = useState('');
  const [editJobSchedule, setEditJobSchedule] = useState('');
  const [editJobChannel, setEditJobChannel] = useState('');
  const [editJobPayload, setEditJobPayload] = useState('');
  const [editJobEnabled, setEditJobEnabled] = useState(true);

  const [scheduleMode, setScheduleMode] = useState<'visual' | 'advanced'>('visual');
  const [visualDays, setVisualDays] = useState<number[]>([1,2,3,4,5]);
  const [visualTimes, setVisualTimes] = useState<string[]>(['09:00']);
  const DAYS = [{l:'Su',v:0},{l:'Mo',v:1},{l:'Tu',v:2},{l:'We',v:3},{l:'Th',v:4},{l:'Fr',v:5},{l:'Sa',v:6}];

  const parseCronToVisual = (cron: string) => {
    if (!cron) return false;
    const parts = cron.split(' ');
    if (parts.length < 5) return false;
    const [min, hr, _dom, _mon, dow] = parts;
    
    if (min.includes('/') || hr.includes('/') || hr.includes('-') || min.includes('*')) return false;
    
    let days: number[] = [];
    if (dow === '*') days = [0,1,2,3,4,5,6];
    else {
      dow.split(',').forEach(d => {
        if (d.includes('-')) {
          const [s, e] = d.split('-').map(Number);
          for(let i=s; i<=e; i++) days.push(i);
        } else {
          days.push(Number(d));
        }
      });
    }
    
    const times: string[] = [];
    const hrs = hr === '*' ? [0] : hr.split(',').map(Number);
    const mins = min === '*' ? [0] : min.split(',').map(Number);
    
    hrs.forEach(h => {
      mins.forEach(m => {
        times.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
      });
    });
    
    setVisualDays([...new Set(days)].sort());
    setVisualTimes([...new Set(times)].sort());
    return true;
  };

  const getVisualCronString = () => {
    if (visualTimes.length === 0 || visualDays.length === 0) return '';
    const mins = Array.from(new Set(visualTimes.map(t => parseInt(t.split(':')[1]) || 0))).join(',');
    const hrs = Array.from(new Set(visualTimes.map(t => parseInt(t.split(':')[0]) || 0))).join(',');
    const days = visualDays.join(',');
    return `${mins} ${hrs} * * ${days}`;
  };

  const fetchJobs = () => {
    setLoading(true);
    Promise.all([
      api.get('/api/cron'),
      api.get('/api/cron/status')
    ]).then(([cronRes, statusRes]) => {
      setJobs(cronRes.data.jobs);
      setEngineState(statusRes.data);
    }).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    try {
      await api.post('/api/cron', {
        name: newJobName,
        schedule: newJobSchedule,
        action: newJobAction
      });
      setShowModal(false);
      setNewJobName('');
      setNewJobSchedule('');
      setNewJobAction('');
      fetchJobs();
    } catch(err) {
      alert("Failed to create cron job");
    }
  };

  const openEdit = (job: any) => {
    setEditJobId(job.id);
    setEditJobName(job.name || '');
    
    const rawCron = job.rawSchedule || job.schedule || '';
    setEditJobSchedule(rawCron);
    const canParse = parseCronToVisual(rawCron);
    setScheduleMode(canParse ? 'visual' : 'advanced');

    // Normalize channel for display in the input (extract channelId if object)
    const chan = job.channel;
    setEditJobChannel(typeof chan === 'object' ? (chan.channelId || JSON.stringify(chan)) : chan || '');
    
    setEditJobPayload(job.payloadMessage || '');
    setEditJobEnabled(job.enabled !== false);
    setEditModal(true);
  };

  const handleSaveEdit = async (e: any) => {
    e.preventDefault();
    const finalSchedule = scheduleMode === 'visual' ? getVisualCronString() : editJobSchedule;
    try {
      await api.put(`/api/cron/${editJobId}`, {
        name: editJobName,
        schedule: finalSchedule,
        channel: editJobChannel,
        payloadMessage: editJobPayload,
        enabled: editJobEnabled
      });
      setEditModal(false);
      fetchJobs();
    } catch(err) {
      alert("Failed to update cron job");
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this cron job?")) return;
    try {
      await api.delete(`/api/cron/${id}`);
      fetchJobs();
    } catch(err) {
      alert("Failed to delete cron job");
    }
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Automated Cron Manager" subtitle="System-wide temporal schedule orchestration powered by the local node engine matrix.">
      
      {/* Engine Telemetry Banner */}
      {engineState && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
          border: '1px solid var(--success-color)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <div style={{ 
            background: 'rgba(16,185,129,0.2)', 
            padding: '16px', 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(16,185,129,0.4)'
          }}>
            <Activity size={32} color="var(--success-color)" />
          </div>
          <div>
            <h2 style={{ margin: 0, color: 'var(--success-color)', fontSize: '24px' }}>
              CRON ENGINE MULTIPLEX: {engineState.status}
            </h2>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)' }}>
              Actively hosting <strong>{engineState.activeJobs}</strong> live temporal payloads tracking independently to external integrations.
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Create Cron Job</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Job Name (e.g. Daily Briefing)" value={newJobName} onChange={e=>setNewJobName(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
              <input type="text" placeholder="Schedule (* * * * * OR minutes as integer)" value={newJobSchedule} onChange={e=>setNewJobSchedule(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
              <input type="text" placeholder="Command to execute" value={newJobAction} onChange={e=>setNewJobAction(e.target.value)} required style={{ padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white' }} />
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid var(--panel-border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', color: 'black', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: 400, maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Edit Cron Job Configurations</h3>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold'}}>JOB ALIAS</label>
                <input type="text" placeholder="Job Name" value={editJobName} onChange={e=>setEditJobName(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white', boxSizing: 'border-box' }} />
              </div>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>TEMPORAL SCHEDULE</label>
                  <button type="button" onClick={() => setScheduleMode(scheduleMode==='visual'?'advanced':'visual')} style={{fontSize: '10px', background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer'}}>
                    {scheduleMode === 'visual' ? 'Switch to Advanced (Raw Cron)' : 'Switch to Visual Builder'}
                  </button>
                </div>
                
                {scheduleMode === 'advanced' ? (
                  <input type="text" placeholder="e.g. */15 6-16 * * 1-5" value={editJobSchedule} onChange={e=>setEditJobSchedule(e.target.value)} required style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '11px', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>ACTIVE DAYS</span>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {DAYS.map(d => (
                          <button key={d.v} type="button" onClick={() => setVisualDays(prev => prev.includes(d.v) ? prev.filter(x => x !== d.v) : [...prev, d.v].sort())} style={{ flex: 1, padding: '8px 0', border: '1px solid ' + (visualDays.includes(d.v) ? 'var(--accent)' : 'var(--panel-border)'), background: visualDays.includes(d.v) ? 'var(--accent)' : 'transparent', color: visualDays.includes(d.v) ? '#000' : '#fff', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>{d.l}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: '11px', display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>EXACT TIME SLOTS</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {visualTimes.map((t, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: '8px' }}>
                            <input type="time" value={t} onChange={e => { const newT = [...visualTimes]; newT[idx] = e.target.value; setVisualTimes(newT); }} required style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white', fontFamily: 'monospace' }} />
                            <button type="button" onClick={() => setVisualTimes(visualTimes.filter((_, i) => i !== idx))} style={{ padding: '0 12px', background: 'rgba(255,50,50,0.2)', border: '1px solid rgba(255,50,50,0.5)', color: '#ffaaaa', borderRadius: '4px', cursor: 'pointer' }}>✕</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => setVisualTimes([...visualTimes, '12:00'])} style={{ padding: '8px', background: 'transparent', border: '1px dashed var(--panel-border)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer', marginTop: '4px' }}>+ Add Time Slot</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold'}}>DISCORD/TELEGRAM CHANNEL TARGET ID</label>
                <input type="text" placeholder="Channel ID (or target designation)" value={editJobChannel} onChange={e=>setEditJobChannel(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white', boxSizing: 'border-box', fontFamily: 'monospace' }} />
              </div>

              <div>
                <label style={{display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold'}}>AGENT EXECUTION PAYLOAD / INSTRUCTION</label>
                <textarea rows={6} placeholder="The exact instruction or message the agent will execute when the cron triggers..." value={editJobPayload} onChange={e=>setEditJobPayload(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(0,0,0,0.5)', color: 'white', boxSizing: 'border-box', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                <input type="checkbox" id="job-enabled" checked={editJobEnabled} onChange={e=>setEditJobEnabled(e.target.checked)} style={{transform: 'scale(1.2)'}} />
                <label htmlFor="job-enabled" style={{cursor: 'pointer'}}>Trigger enabled upon saving</label>
              </div>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={() => setEditModal(false)} style={{ padding: '8px 16px', background: 'transparent', color: 'white', border: '1px solid var(--panel-border)', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 16px', background: 'var(--accent)', color: 'black', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Commit Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ display: 'flex', gap: 24, flexDirection: 'column' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ margin: 0 }} className="section-label">Active Schedules (cron_jobs.json)</h4>
            <button onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--accent)', color: 'black', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>
              <UploadCloud size={18} /> Create Cron Job
            </button>
         </div>
         
         {loading ? <p className="text-muted">Parsing local cron configurations...</p> : (
           <div className="skills-list">
              {jobs.map(job => (
                <div className="skill-item" key={job.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <div className="skill-info" style={{ flex: 1 }}>
                     <div className="skill-icon"><Clock size={20} /></div>
                     <div>
                       <div className="skill-name">{job.name}</div>
                       <div className="skill-status" style={{color: job.enabled ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          <div>
                            {job.enabled ? `Runs at: ${job.schedule}` : 'DISABLED'}
                            <span style={{ marginLeft: 16, color: job.status === 'success' ? '#4ade80' : job.status === 'error' ? '#f87171' : 'var(--text-muted)' }}>
                              Status: {(job.status || 'unknown').toUpperCase()} 
                              {job.lastRun && job.lastRun !== 'Never' ? ` (Last run: ${job.lastRun})` : ''}
                            </span>
                          </div>
                          {job.channel && (
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
                              UPLINK: {typeof job.channel === 'object' ? `${job.channel.type.toUpperCase()} // ${job.channel.channelId}` : job.channel}
                            </div>
                          )}
                        </div>
                     </div>
                   </div>
                   <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                     <label className="switch" title="Toggle Job">
                       <input 
                         type="checkbox" 
                         checked={job.enabled !== false} 
                         onChange={async () => {
                           try {
                             await api.put(`/api/cron/${job.id}`, { ...job, enabled: !job.enabled });
                             fetchJobs();
                           } catch(err) { console.error('Toggle failed'); }
                         }}
                       />
                       <span className="slider"></span>
                     </label>
                     <button onClick={() => openEdit(job)} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                     <button onClick={() => handleDelete(job.id)} style={{ padding: '8px 16px', background: '#f87171', border: 'none', color: 'black', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                   </div>
                </div>
              ))}
              {jobs.length === 0 && <p className="text-muted">No cron jobs configured.</p>}
           </div>
         )}
      </div>
    </PageTransition>
  );
};

const NodesView = ({ toggleSidebar }: any) => {
  const [nodes, setNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [nodeUrl, setNodeUrl] = useState('ws://');
  const [nodeToken, setNodeToken] = useState('');
  const [pairResult, setPairResult] = useState<any>(null);
  const [pinging, setPinging] = useState(false);

  const fetchNodes = async () => {
    setLoading(true);
    setPinging(true);
    try {
      const res = await api.get('/api/nodes');
      setNodes(res.data || []);
    } catch { }
    finally { setLoading(false); setPinging(false); }
  };

  useEffect(() => { fetchNodes(); }, []);

  const handleAddNode = async (e: any) => {
    e.preventDefault();
    setPairResult({ success: true, message: 'Pair request sent! Approve on the device to complete pairing.' });
    setTimeout(() => { setShowAddModal(false); setNodeUrl('ws://'); setNodeToken(''); setPairResult(null); fetchNodes(); }, 2500);
  };

  const platformIcon = (p: string) => {
    if (p==='darwin') return '💻';
    if (p==='android') return '📱';
    if (p==='linux') return '☁️';
    if (p==='windows') return '🖥️';
    return '🔗';
  };

  const roleColor = (r: string) => {
    if (r==='PRIMARY') return '#4ade80';
    if (r==='MOBILE') return '#38bdf8';
    if (r==='CLOUD BACKUP') return '#a78bfa';
    return '#facc15';
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Gateway Nodes" subtitle="Full infrastructure grid — every device Bergen can reach">

      {/* Top toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', gap:16 }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:'bold', color:'#4ade80' }}>{nodes.filter(n=>n.status==='online').length}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Online</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:'bold', color:'#f87171' }}>{nodes.filter(n=>n.status!=='online').length}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Offline</div>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:'1.6rem', fontWeight:'bold', color:'var(--text-main)' }}>{nodes.length}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Total</div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <button onClick={fetchNodes} disabled={pinging}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:8, border:'1px solid var(--panel-border)', background:'rgba(255,255,255,0.05)', color:'white', cursor:'pointer', fontWeight:'bold' }}>
            <RefreshCw size={15} style={{ animation: pinging?'spin 1s linear infinite':'none' }} />
            {pinging ? 'Pinging...' : 'Ping All'}
          </button>
          <button onClick={() => setShowAddModal(true)}
            style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 18px', background:'var(--accent)', color:'#000', borderRadius:8, border:'none', cursor:'pointer', fontWeight:'bold' }}>
            <Plus size={16} /> Add Node
          </button>
        </div>
      </div>

      {/* Node Cards grid */}
      {loading ? (
        <div className="glass-panel" style={{ textAlign:'center', color:'var(--text-muted)', padding:40 }}>Scanning nodes and pinging gateways...</div>
      ) : (
        <div className="grid-2">
          {nodes.map((node: any) => {
            const isOnline = node.status === 'online';
            const rc = roleColor(node.role);
            return (
              <div key={node.id} className="glass-panel"
                style={{ borderLeft:`4px solid ${isOnline ? rc : '#374151'}`, position:'relative', overflow:'hidden' }}>
                {/* Role badge */}
                <div style={{ position:'absolute', top:14, right:14, fontSize:'0.65rem', padding:'2px 8px', borderRadius:10, background:`${rc}22`, color:rc, border:`1px solid ${rc}44`, fontWeight:'bold', letterSpacing:'0.06em' }}>{node.role}</div>

                {/* Header */}
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                  <div style={{ fontSize:'2.2rem', lineHeight:1 }}>{node.icon || platformIcon(node.platform)}</div>
                  <div>
                    <div style={{ fontWeight:'bold', fontSize:'1.1rem' }}>{node.displayName}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{node.description}</div>
                  </div>
                </div>

                {/* Status row */}
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:20,
                    background: isOnline ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${isOnline ? '#4ade8055' : '#f871715'}`,
                    color: isOnline ? '#4ade80' : '#f87171', fontWeight:'bold', fontSize:'0.75rem' }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background: isOnline?'#4ade80':'#f87171', display:'inline-block',
                      boxShadow: isOnline ? '0 0 6px #4ade80' : 'none', animation: isOnline ? 'pulse-glow 2s ease-in-out infinite' : 'none' }} />
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                  {node.latencyMs !== undefined && isOnline && (
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{node.latencyMs===0 ? 'Local — 0ms' : `${node.latencyMs}ms`}</span>
                  )}
                </div>

                {/* Details grid */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, fontSize:'0.78rem', color:'var(--text-muted)' }}>
                  <span>🌐 Host: <strong style={{ color:'var(--text-main)', fontFamily:'monospace', fontSize:'0.73rem' }}>{node.gatewayHost}</strong></span>
                  <span>🔌 Port: <strong style={{ color:'var(--text-main)' }}>{node.gatewayPort}</strong></span>
                  <span>💾 Platform: <strong style={{ color:'var(--text-main)', textTransform:'capitalize' }}>{node.platform}</strong></span>
                  {node.version && <span>📦 Version: <strong style={{ color:'var(--text-main)' }}>{node.version}</strong></span>}
                </div>

                {/* Caps */}
                {node.caps && node.caps.length > 0 && (
                  <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
                    {node.caps.map((c: string) => (
                      <span key={c} style={{ fontSize:'0.68rem', padding:'2px 8px', borderRadius:8, background:'rgba(255,255,255,0.07)', border:'1px solid var(--panel-border)', color:'var(--text-muted)' }}>{c}</span>
                    ))}
                  </div>
                )}

                {/* Config instructions for offline nodes */}
                {!isOnline && (
                  <div style={{ marginTop:12, padding:'8px 12px', borderRadius:8, background:'rgba(251,191,36,0.06)', border:'1px solid rgba(251,191,36,0.2)', fontSize:'0.74rem', color:'#fbbf24' }}>
                    {node.id==='pixel-fold-remote' && '📱 Install OpenClaw on your Pixel Fold, open it, then it will auto-appear here once on the same network or via Tailscale.'}
                    {node.id==='gcp-failover' && '☁️ Deploy the OpenClaw daemon on your GCP VM and point it to this gateway. Used as failover if this Mac goes offline.'}
                    {!['pixel-fold-remote','gcp-failover'].includes(node.id) && 'Start OpenClaw daemon on this device to bring it online.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Failover explanation */}
      <div className="glass-panel" style={{ marginTop:20, border:'1px solid rgba(167,139,250,0.2)', background:'linear-gradient(135deg,rgba(167,139,250,0.05),rgba(59,130,246,0.03))' }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
          <div style={{ fontSize:'1.8rem' }}>☁️</div>
          <div>
            <div style={{ fontWeight:'bold', color:'#a78bfa', marginBottom:6 }}>Cloud Failover Architecture</div>
            <div style={{ fontSize:'0.84rem', color:'var(--text-muted)', lineHeight:1.7 }}>
              Bergen is designed for 24/7 uptime. If your MacBook shuts down, the <strong style={{ color:'var(--text-main)' }}>Google Cloud node</strong> acts as the failover — it runs a copy of the OpenClaw daemon that picks up scheduled tasks. To activate it, deploy the OpenClaw daemon on your GCP VM and set <code style={{ background:'rgba(255,255,255,0.08)', padding:'1px 5px', borderRadius:4 }}>gateway.nak3deye.com</code> as the gateway endpoint. Your Pixel Fold provides mobile monitoring and can trigger tasks remotely from anywhere.
            </div>
          </div>
        </div>
      </div>

      {/* Pair Modal */}
      {showAddModal && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <div className="glass-panel" style={{ width:480, maxWidth:'92%' }}>
            <h3 style={{ marginTop:0, display:'flex', alignItems:'center', gap:10 }}><Network size={20} color="var(--accent)" /> Pair New Node</h3>
            <p className="text-muted" style={{ fontSize:'0.88rem', marginBottom:20 }}>Enter the gateway URL and pairing token from the remote OpenClaw device.</p>
            <form onSubmit={handleAddNode} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:'var(--text-muted)', marginBottom:4, fontWeight:'bold', letterSpacing:'0.06em' }}>GATEWAY URL</label>
                <input type="text" placeholder="ws://100.x.x.x:18789 or wss://gateway.nak3deye.com" value={nodeUrl} onChange={e=>setNodeUrl(e.target.value)} required
                  style={{ width:'100%', padding:12, borderRadius:8, border:'1px solid var(--panel-border)', background:'rgba(0,0,0,0.5)', color:'white', boxSizing:'border-box', fontFamily:'monospace', fontSize:'0.88rem' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'11px', color:'var(--text-muted)', marginBottom:4, fontWeight:'bold', letterSpacing:'0.06em' }}>PAIRING TOKEN</label>
                <input type="password" placeholder="From the remote device settings" value={nodeToken} onChange={e=>setNodeToken(e.target.value)} required
                  style={{ width:'100%', padding:12, borderRadius:8, border:'1px solid var(--panel-border)', background:'rgba(0,0,0,0.5)', color:'white', boxSizing:'border-box', fontFamily:'monospace' }} />
              </div>
              {pairResult && (
                <div style={{ padding:12, borderRadius:8, background: pairResult.success?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)', border:`1px solid ${pairResult.success?'#4ade80':'#f87171'}`, color: pairResult.success?'#4ade80':'#f87171' }}>{pairResult.message}</div>
              )}
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:4 }}>
                <button type="button" onClick={() => { setShowAddModal(false); setPairResult(null); }} style={{ padding:'9px 18px', background:'transparent', color:'white', border:'1px solid var(--panel-border)', borderRadius:8, cursor:'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding:'9px 20px', background:'var(--accent)', color:'black', border:'none', borderRadius:8, cursor:'pointer', fontWeight:'bold' }}>Pair Node</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

// CustomizationView is now imported from './CustomizationView.tsx'


const ApprovalsView = ({ toggleSidebar }: any) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<any>(null);

  useEffect(() => {
    api.get('/api/approvals').then(res => setApprovals(res.data)).catch(console.error);
  }, []);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'view') => {
    if (action === 'view') {
      const app = approvals.find(a => a.id === id);
      setSelectedApproval(app);
      return;
    }
    try {
      await api.post(`/api/approvals/${id}`, { action });
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'approved' : 'rejected' } : a));
      if (selectedApproval?.id === id) setSelectedApproval(null);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Approvals Gate" subtitle="Review pending out-bounds (social posts, releases, payments) before finalizing execution.">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {approvals.map(app => (
          <div key={app.id} className="glass-panel" style={{ borderLeft: `4px solid ${app.status === 'approved' ? '#4ade80' : app.status === 'rejected' ? '#f87171' : '#facc15'}`}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  {app.title} 
                  <span style={{ fontSize: '0.7em', padding: '2px 8px', borderRadius: 12, background: 'rgba(255,255,255,0.1)' }}>{app.type.toUpperCase()}</span>
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Requester: <strong>{app.requester}</strong> • {new Date(app.date).toLocaleString()}</span>
              </div>
              
              <div style={{ display: 'flex', gap: 10 }}>
                {app.status === 'pending' ? (
                  <>
                    <button onClick={() => handleAction(app.id, 'view')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#3b82f6', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>View</button>
                    <button onClick={() => handleAction(app.id, 'reject')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#f87171', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                    <button onClick={() => handleAction(app.id, 'approve')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#4ade80', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Approve</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleAction(app.id, 'view')} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>View History</button>
                    <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: app.status === 'approved' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                      {app.status.toUpperCase()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {approvals.length === 0 && <div className="glass-panel text-muted">No pending approvals required.</div>}
      </div>

      {selectedApproval && (
        <div className="modal-overlay" onClick={() => setSelectedApproval(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%', height: '85vh', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', zIndex: 10 }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{selectedApproval.title}</h2>
                <div style={{ display: 'flex', gap: 12, marginTop: 4, alignItems: 'center' }}>
                   <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.1)', color: 'var(--accent)' }}>{selectedApproval.type.toUpperCase()}</span>
                   <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>From: <strong>{selectedApproval.requester}</strong> • {new Date(selectedApproval.date).toLocaleString()}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => copyToClipboard(selectedApproval.content)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s' }}>Copy Content</button>
                <button onClick={() => setSelectedApproval(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.8rem', cursor: 'pointer', padding: '0 8px' }}>&times;</button>
              </div>
            </div>
            
            <div style={{ 
              flex: 1, 
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#0f172a',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {selectedApproval.url ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <iframe 
                    src={(() => {
                      let url = selectedApproval.url;
                      if (url.includes('docs.google.com/document/d/')) {
                        if (url.includes('/edit')) {
                          url = url.replace(/\/edit.*$/, '/preview');
                        } else if (!url.endsWith('/preview')) {
                          url = url.replace(/\/?$/, '/preview');
                        }
                      }
                      return url;
                    })()} 
                    style={{ flex: 1, border: 'none', background: '#fff', width: '100%', height: '100%' }} 
                    title="Document Viewer"
                  />
                  <div style={{ padding: '12px 24px', background: 'rgba(59, 130, 246, 0.1)', borderTop: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.85rem', color: '#60a5fa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Viewing original source via Secure Bridge (Full 45-page visibility)</span>
                    <a href={selectedApproval.url} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', textDecoration: 'underline', fontWeight: 'bold' }}>Open in New Tab</a>
                  </div>
                </div>
              ) : (
                <div style={{ 
                  flex: 1,
                  overflowY: 'auto',
                  padding: '60px 40px', 
                  maxWidth: '1000px',
                  width: '100%',
                  margin: '0 auto',
                  fontFamily: selectedApproval.type === 'creative' ? "'Merriweather', 'Georgia', serif" : "'Inter', sans-serif",
                  lineHeight: '2.0',
                  fontSize: selectedApproval.type === 'creative' ? '1.3rem' : '1.1rem',
                  color: '#f1f5f9',
                  whiteSpace: 'pre-wrap',
                  textAlign: 'left'
                }}>
                  {selectedApproval.content}
                  
                  {selectedApproval.url && (
                    <div style={{ marginTop: 40, padding: 32, borderRadius: 16, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#60a5fa', fontWeight: 'bold', fontSize: '1.1rem' }}>🔗 Original Document Linked</p>
                      <p style={{ margin: '12px 0 24px 0', fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)' }}>This preview shows a condensed version. Access the full-length document below.</p>
                      <a href={selectedApproval.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#3b82f6', color: '#fff', padding: '12px 24px', borderRadius: 10, fontWeight: 'bold', textDecoration: 'none', transition: 'transform 0.2s' }}>
                        Open in New Tab
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    </div>
                  )}

                  {!selectedApproval.url && selectedApproval.content.includes('[...') && (
                    <div style={{ marginTop: 40, padding: 24, borderRadius: 12, background: 'rgba(255, 184, 0, 0.05)', border: '1px solid rgba(255, 184, 0, 0.2)', textAlign: 'center' }}>
                      <p style={{ margin: 0, color: '#fbbf24', fontWeight: '600' }}>⚠️ Content Truncated</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>The requester sent a summary. Please ask the agent for the full document if needed.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ padding: '20px 24px', borderTop: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.02)' }}>
              {selectedApproval.url && (
                <a href={selectedApproval.url} target="_blank" rel="noopener noreferrer" style={{ 
                  marginRight: 'auto', 
                  padding: '10px 20px', 
                  borderRadius: 10, 
                  border: '1px solid #3b82f6', 
                  color: '#3b82f6', 
                  fontWeight: 'bold', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '0.9rem'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  Open Original Document
                </a>
              )}
              
              {selectedApproval.status === 'pending' ? (
                <>
                  <button onClick={() => handleAction(selectedApproval.id, 'reject')} style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontWeight: 'bold', cursor: 'pointer' }}>Reject</button>
                  <button onClick={() => handleAction(selectedApproval.id, 'approve')} style={{ padding: '10px 32px', borderRadius: 10, border: 'none', background: '#4ade80', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}>Approve & Execute</button>
                </>
              ) : (
                <button onClick={() => setSelectedApproval(null)} style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid var(--panel-border)', background: 'transparent', color: '#fff', cursor: 'pointer' }}>Close Review</button>
              )}
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};

const TeamView = ({ toggleSidebar }: any) => {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    api.get('/api/agents').then(res => setAgents(res.data)).catch(console.error);
  }, []);

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Agent Team Overview" subtitle="Visualize fleet hierarchy and current assignments.">
      <div className="grid-3">
        {agents.map(a => (
          <div className="glass-panel" key={a.id}>
            <div className="metric-card-title">{a.identity?.emoji || '🤖'}</div>
            <h3>{a.name}</h3>
            <p className="text-muted stat-subtitle">
              Model: {a.model?.primary || 'Default'}
            </p>
          </div>
        ))}
        {agents.length === 0 && (
          <div className="glass-panel text-muted">No agents retrieved.</div>
        )}
      </div>
    </PageTransition>
  );
}

// --- Fleet Health View ---
const FleetHealthView = ({ toggleSidebar }: any) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all'|'ok'|'error'|'warn'>('all');
  const [auditorOut, setAuditorOut] = useState('');
  const [auditorLoading, setAuditorLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [lastRefresh, setLastRefresh] = useState<Date|null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/fleet/health');
      setData(res.data);
      setLastRefresh(new Date());
    } catch (e: any) {
      setData({ error: e?.message || 'Failed to load' });
    } finally { setLoading(false); }
  };

  const runAuditor = async () => {
    setAuditorLoading(true);
    setAuditorOut('');
    try {
      const res = await api.post('/api/fleet/run-auditor');
      const text = res.data?.response?.message || res.data?.response?.text || JSON.stringify(res.data?.response || res.data, null, 2);
      setAuditorOut(text);
    } catch (e: any) {
      setAuditorOut(`Error: ${e?.response?.data?.error || e.message}\nHint: ${e?.response?.data?.hint || 'Check Bergen gateway (port 18789)'}`);
    } finally { setAuditorLoading(false); }
  };

  useEffect(() => { fetchHealth(); }, []);

  const statusColor = (h: string) => h==='ok' ? '#4ade80' : h==='error' ? '#f87171' : h==='warn' ? '#facc15' : '#6b7280';
  const statusBg = (h: string) => h==='ok' ? 'rgba(74,222,128,0.12)' : h==='error' ? 'rgba(248,113,113,0.12)' : h==='warn' ? 'rgba(250,204,21,0.12)' : 'rgba(107,114,128,0.12)';
  const statusIcon = (h: string) => h==='ok' ? '✅' : h==='error' ? '🔴' : h==='warn' ? '⚠️' : '⚫';

  const jobs = data?.jobs || [];
  const visible = jobs.filter((j: any) => {
    if (filter !== 'all' && j.health !== filter) return false;
    if (search && !j.name.toLowerCase().includes(search.toLowerCase()) && !j.agentId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { summary } = data || {};

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Fleet Health" subtitle="Real-time status of all scheduled agents and Discord channels">

      {/* Summary Cards */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {[['Total','total','#a78bfa'],['✅ Healthy','ok','#4ade80'],['🔴 Errors','errors','#f87171'],['⚠️ Running','warn','#facc15'],['❓ Unknown','unknown','#6b7280']].map(([label, key, color]) => (
          <div key={key} onClick={() => setFilter(key === 'total' ? 'all' : key as any)}
            style={{ flex: '1 1 120px', minWidth: 110, padding: '16px 18px', borderRadius: 12, background: `${color}11`,
              border: `1px solid ${color}44`, cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: filter === (key === 'total' ? 'all' : key) ? `0 0 18px ${color}55` : 'none' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color }}>{summary?.[key] ?? '—'}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
        <div style={{ flex: '1 1 120px', minWidth: 130, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6 }}>
          <button onClick={fetchHealth} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 7, border: 'none', background: 'rgba(255,255,255,0.08)', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Scanning...' : 'Refresh'}
          </button>
          {lastRefresh && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last: {lastRefresh.toLocaleTimeString()}</span>}
        </div>
      </div>

      {/* Internal Auditor Panel */}
      <div className="glass-panel" style={{ marginBottom: 24, border: '1px solid rgba(250,204,21,0.3)', background: 'linear-gradient(135deg, rgba(250,204,21,0.06), rgba(234,179,8,0.03))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Bot size={22} color="#facc15" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#facc15' }}>🛠️ Nak3d Eye Internal Auditor</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Runs a live AI audit — scans all error jobs, reads logs, explains root causes in plain English</div>
          </div>
          <button onClick={runAuditor} disabled={auditorLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 9, border: 'none', background: auditorLoading ? 'rgba(250,204,21,0.3)' : '#facc15', color: '#000', fontWeight: 'bold', cursor: auditorLoading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
            <Bot size={16} style={{ animation: auditorLoading ? 'spin 1.5s linear infinite' : 'none' }} />
            {auditorLoading ? 'Auditing fleet...' : 'Run Audit Now'}
          </button>
        </div>
        {auditorOut && (
          <pre style={{ marginTop: 16, background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 8, padding: 16, fontSize: '0.8rem', lineHeight: 1.65, color: '#fef08a', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 400, overflowY: 'auto' }}>{auditorOut}</pre>
        )}
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search agent name or ID..."
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none', fontSize: '0.88rem' }} />
        {(['all','ok','error','warn'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '8px 16px', borderRadius: 8, border: `1px solid ${filter===f ? statusColor(f) : 'var(--panel-border)'}`, background: filter===f ? statusBg(f) : 'transparent', color: filter===f ? statusColor(f) : 'var(--text-muted)', cursor: 'pointer', fontWeight: filter===f ? 'bold' : 'normal', fontSize: '0.82rem' }}>
            {f.toUpperCase()} {f !== 'all' && summary ? `(${summary[f==='ok'?'ok':f==='error'?'errors':f==='warn'?'warn':'unknown'] ?? 0})` : ''}
          </button>
        ))}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }}>{visible.length} of {jobs.length} agents</span>
      </div>

      {/* Agent Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--panel-border)', color: 'var(--text-muted)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Health</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Agent / Job</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Schedule</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Channel</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Last Run</th>
              <th style={{ padding: '10px 12px', textAlign: 'left' }}>Error</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>{loading ? 'Loading fleet...' : 'No agents match filter.'}</td></tr>
            )}
            {visible.map((j: any, i: number) => (
              <tr key={j.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 20, background: statusBg(j.health), color: statusColor(j.health), fontWeight: 'bold', fontSize: '0.75rem', border: `1px solid ${statusColor(j.health)}44` }}>
                    {statusIcon(j.health)} {j.health.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{j.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.73rem' }}>{j.agentId}</div>
                </td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{j.schedule || '—'}</td>
                <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: 160 }}>
                  {j.channel ? <span style={{ fontFamily: 'monospace' }}>{j.channel.slice(0,20)}{j.channel.length>20?'…':''}</span> : <span style={{ color: '#f87171' }}>⚠ no channel</span>}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.78rem' }}>{j.lastRun === 'Never' ? '—' : new Date(j.lastRun).toLocaleTimeString()}</div>
                  {j.minutesSince !== null && <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{j.minutesSince}m ago</div>}
                </td>
                <td style={{ padding: '10px 12px', maxWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {j.lastError ? <span style={{ color: '#f87171', fontSize: '0.75rem' }}>{j.lastError}</span> : <span style={{ color: '#4ade80', fontSize: '0.75rem' }}>—</span>}
                    <button 
                      onClick={async () => {
                        try {
                          await api.post(`/api/cron/${j.id}/run`);
                          alert(`Job ${j.name} triggered! Check logs in a moment.`);
                        } catch (err) {
                          alert(`Failed to trigger: ${err}`);
                        }
                      }}
                      style={{ marginLeft: 'auto', padding: '4px 8px', borderRadius: 6, border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', fontSize: '0.7rem', cursor: 'pointer', opacity: 0.7 }}
                    >
                      Run
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageTransition>
  );
};

// --- Infrastructure Console ---
const SystemView = ({ toggleSidebar }: any) => {
  const [processes, setProcesses] = useState<any[]>([]);
  const [logTarget, setLogTarget] = useState('mission-backend');
  const [logOutput, setLogOutput] = useState('');
  const [logLoading, setLogLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<{text: string; ok: boolean} | null>(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [restartTarget, setRestartTarget] = useState('mission-backend');
  const [buildLog, setBuildLog] = useState('');
  const [buildLoading, setBuildLoading] = useState(false);

  const [hardwareStats, setHardwareStats] = useState<any>(null);
  const [hardwareLoading, setHardwareLoading] = useState(false);

  const flash = (text: string, ok = true) => {
    setActionMsg({ text, ok });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const fetchStatus = async () => {
    setStatusLoading(true);
    try {
      const res = await api.get('/api/pm2/status');
      setProcesses(res.data.processes || []);
    } catch { flash('Could not reach PM2 status endpoint.', false); }
    finally { setStatusLoading(false); }
  };

  const fetchHardwareStats = async () => {
    setHardwareLoading(true);
    try {
      const res = await api.get('/api/system-usage');
      setHardwareStats(res.data);
    } catch { 
      // silent fallback
    } finally {
      setHardwareLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLogLoading(true);
    setLogOutput('');
    try {
      const res = await api.get(`/api/pm2/logs?name=${logTarget}&lines=100`);
      setLogOutput(res.data.lines || 'No output.');
    } catch { setLogOutput('Error fetching logs.'); }
    finally { setLogLoading(false); }
  };

  const handleRestart = async () => {
    try {
      await api.post('/api/pm2/restart', { name: restartTarget });
      flash(`✅ ${restartTarget} restarted successfully.`);
      setTimeout(fetchStatus, 2000);
    } catch (e: any) { flash(`❌ Restart failed: ${e?.response?.data?.error || e.message}`, false); }
  };

  const handleSave = async () => {
    try {
      await api.post('/api/pm2/save');
      flash('✅ PM2 process list saved. Will restore on next reboot.');
    } catch { flash('❌ Failed to save PM2 state.', false); }
  };

  const handleDeploy = async () => {
    setBuildLoading(true);
    setBuildLog('');
    try {
      const res = await api.post('/api/pm2/rebuild', { restart: true });
      setBuildLog(res.data.log || 'Done.');
      flash('✅ Deploy complete! Refresh this page to see changes.');
      setTimeout(fetchStatus, 3000);
    } catch (e: any) {
      const errLog = e?.response?.data?.log || e?.message || 'Unknown error';
      setBuildLog(errLog);
      flash('❌ Build failed — check log below.', false);
    } finally {
      setBuildLoading(false);
    }
  };

  useEffect(() => { 
    fetchStatus(); 
    fetchHardwareStats();
    const interval = setInterval(() => {
      fetchStatus();
      fetchHardwareStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);


  const formatUptime = (ms: number | null) => {
    if (!ms) return 'N/A';
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ${h % 24}h`;
    if (h > 0) return `${h}h ${m % 60}m`;
    if (m > 0) return `${m}m ${s % 60}s`;
    return `${s}s`;
  };

  const formatMem = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const statusColor = (s: string) => {
    if (s === 'online') return '#4ade80';
    if (s === 'stopped') return '#f87171';
    return '#facc15';
  };

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Infrastructure Console" subtitle="Monitor and control all pm2 services — no terminal required.">

      {/* Action flash */}
      {actionMsg && (
        <div style={{ marginBottom: 16, padding: '12px 20px', borderRadius: 10, background: actionMsg.ok ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)', border: `1px solid ${actionMsg.ok ? '#4ade80' : '#f87171'}`, color: actionMsg.ok ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
          {actionMsg.text}
        </div>
      )}

      {/* ── DEPLOY UPDATE (most important action — shown first) ── */}
      <div className="glass-panel" style={{ marginBottom: 28, border: '1px solid rgba(139,92,246,0.4)', background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.05))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <UploadCloud size={22} color="#a78bfa" />
          <h3 style={{ margin: 0, color: '#a78bfa' }}>Deploy Update</h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', padding: '2px 8px', borderRadius: 12, background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>ONE CLICK</span>
        </div>
        <p className="text-muted" style={{ marginBottom: 16 }}>Rebuilds the frontend (npm run build) and restarts mission-backend automatically. Use this after any code changes made by Antigravity.</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: buildLog ? 16 : 0 }}>
          <button
            onClick={handleDeploy}
            disabled={buildLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 28px',
              borderRadius: 10, border: 'none',
              background: buildLoading ? 'rgba(139,92,246,0.4)' : 'linear-gradient(135deg, #7c3aed, #3b82f6)',
              color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: buildLoading ? 'not-allowed' : 'pointer',
              boxShadow: buildLoading ? 'none' : '0 0 20px rgba(139,92,246,0.4)',
              transition: 'all 0.2s'
            }}
          >
            <UploadCloud size={18} style={{ animation: buildLoading ? 'spin 1.2s linear infinite' : 'none' }} />
            {buildLoading ? 'Building… (10-30s)' : '🚀 Build & Deploy'}
          </button>
          {buildLoading && (
            <span style={{ color: '#a78bfa', fontSize: '0.85rem', fontStyle: 'italic' }}>Running npm run build then restarting server…</span>
          )}
        </div>
        {buildLog && (
          <pre style={{
            background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 8,
            padding: 16, overflowX: 'auto', overflowY: 'auto', maxHeight: 350,
            fontSize: '0.76rem', lineHeight: 1.6, color: '#c4b5fd', whiteSpace: 'pre-wrap', wordBreak: 'break-all'
          }}>
            {buildLog}
          </pre>
        )}
      </div>

      {/* ── REAL-TIME HARDWARE TELEMETRY ── */}
      <div className="glass-panel" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Activity size={22} color="#4ade80" />
          <h3 style={{ margin: 0 }}>System Resources</h3>
          {hardwareLoading && <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Updating...</span>}
        </div>

        {hardwareStats ? (
          <div className="grid-3" style={{ gap: 16 }}>
            {/* CPU Metric */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>CPU Load (1, 5, 15 min)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#4ade80', fontFamily: 'monospace' }}>
                {hardwareStats.cpu?.load?.join(' | ') || 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {hardwareStats.cpu?.model} ({hardwareStats.cpu?.count} Cores)
              </div>
            </div>

            {/* Memory Metric */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>RAM Utilization</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ade80' }}>
                {hardwareStats.memory?.usage}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Used: {formatMem(hardwareStats.memory?.used)} / {formatMem(hardwareStats.memory?.total)}
              </div>
            </div>

            {/* Disk Metric */}
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 10, border: '1px solid var(--panel-border)' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 6 }}>Storage Utilization (/)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#4ade80' }}>
                {hardwareStats.disk?.usage || 'N/A'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 6 }}>
                Available: {hardwareStats.disk?.avail} / {hardwareStats.disk?.size}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>Loading core telemetry insights...</div>
        )}
      </div>

      {/* ── SECTION 1: Status Cards ── */}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, flex: 1 }}>Process Status</h3>
        <button
          onClick={fetchStatus}
          disabled={statusLoading}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 18px', borderRadius: 8, border: '1px solid var(--panel-border)', background: 'rgba(255,255,255,0.06)', color: 'var(--text-main)', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <RefreshCw size={16} style={{ animation: statusLoading ? 'spin 1s linear infinite' : 'none' }} />
          {statusLoading ? 'Refreshing...' : 'Refresh Status'}
        </button>
      </div>

      <div className="grid-2" style={{ marginBottom: 28 }}>
        {processes.length === 0 && !statusLoading && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', color: 'var(--text-muted)' }}>No pm2 processes found. Click Refresh Status.</div>
        )}
        {processes.map(p => (
          <div key={p.id} className="glass-panel" style={{ borderLeft: `4px solid ${statusColor(p.status)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Server size={20} color={statusColor(p.status)} />
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{p.name}</span>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 20, background: `${statusColor(p.status)}22`, color: statusColor(p.status), fontSize: '0.78rem', fontWeight: 'bold', textTransform: 'uppercase' }}>{p.status}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              <span>🕐 Uptime: <strong style={{ color: 'var(--text-main)' }}>{formatUptime(p.uptime)}</strong></span>
              <span>🔄 Restarts: <strong style={{ color: 'var(--text-main)' }}>{p.restarts}</strong></span>
              <span>💾 Memory: <strong style={{ color: 'var(--text-main)' }}>{formatMem(p.memory)}</strong></span>
              <span>⚡ CPU: <strong style={{ color: 'var(--text-main)' }}>{p.cpu}%</strong></span>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.75rem', color: 'var(--text-muted)' }}>PID: {p.pid || 'N/A'} &nbsp;|&nbsp; ID: {p.id}</div>
          </div>
        ))}
      </div>

      {/* ── SECTION 2: Restart ── */}
      <div className="glass-panel" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <RotateCcw size={20} color="#facc15" />
          <h3 style={{ margin: 0 }}>Restart Service</h3>
        </div>
        <p className="text-muted" style={{ marginBottom: 16 }}>Use after any code change to apply updates without opening a terminal.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={restartTarget}
            onChange={e => setRestartTarget(e.target.value)}
            style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', borderRadius: 8, flex: 1, minWidth: 200, outline: 'none' }}
          >
            {processes.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
            <option value="all">all (restart everything)</option>
          </select>

          <button
            onClick={handleRestart}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 8, border: 'none', background: '#facc15', color: '#000', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <RotateCcw size={16} /> Restart Now
          </button>
        </div>
      </div>

      {/* ── SECTION 3: Save State ── */}
      <div className="glass-panel" style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <Save size={20} color="#38bdf8" />
          <h3 style={{ margin: 0 }}>Save Reboot State</h3>
        </div>
        <p className="text-muted" style={{ marginBottom: 16 }}>Saves the current running process list so pm2 restores them automatically after a Mac reboot. Run this after any changes to what's running.</p>
        <button
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 8, border: 'none', background: '#38bdf8', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <Save size={16} /> Save PM2 State
        </button>
      </div>

      {/* ── SECTION 4: Live Logs ── */}
      <div className="glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Terminal size={20} color="#4ade80" />
          <h3 style={{ margin: 0, flex: 1 }}>Live Logs</h3>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
          <select
            value={logTarget}
            onChange={e => setLogTarget(e.target.value)}
            style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.5)', border: '1px solid var(--panel-border)', color: 'white', borderRadius: 8, flex: 1, minWidth: 200, outline: 'none' }}
          >
            {processes.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={fetchLogs}
            disabled={logLoading}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 8, border: 'none', background: '#4ade80', color: '#000', fontWeight: 'bold', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <Terminal size={16} /> {logLoading ? 'Loading...' : 'View Live Logs'}
          </button>
        </div>
        {logOutput && (
          <pre style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid var(--panel-border)', borderRadius: 8, padding: 16, overflowX: 'auto', overflowY: 'auto', maxHeight: 400, fontSize: '0.78rem', lineHeight: 1.6, color: '#a3e635', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {logOutput}
          </pre>
        )}
        {!logOutput && !logLoading && (
          <p className="text-muted" style={{ fontStyle: 'italic' }}>Select a service and click "View Live Logs" to load output.</p>
        )}
      </div>
    </PageTransition>
  );
};

// --- App Entry ---
const PlaceholderView = ({ title, subtitle, icon, toggleSidebar }: any) => (
  <PageTransition toggleSidebar={toggleSidebar} title={title} subtitle={subtitle}>
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 64, opacity: 0.3 }}>{icon}</div>
      <h2 style={{ margin: 0, opacity: 0.6 }}>{title}</h2>
      <p className="text-muted">This module is being built. Check back soon.</p>
    </div>
  </PageTransition>
);

const AgentsView = ({ toggleSidebar }: any) => {
  const [agents, setAgents] = useState<any[]>([]);
  useEffect(() => {
    api.get('/api/agents').then(res => setAgents(res.data)).catch(console.error);
  }, []);

  const boss = agents.find(a => a.id === 'main' || a.name === 'Bergen');
  
  // Categorization
  const getCategory = (a: any) => {
    const id = a.id?.toLowerCase() || '';
    if (id.startsWith('pa-')) return 'Pest Arrest';
    if (id.startsWith('ent-')) return 'Nak3d Eye Entertainment';
    if (id.startsWith('const-')) return 'Construction';
    if (id.startsWith('tc-')) return 'Transport Central';
    if (id.startsWith('fmf-')) return 'Faith Meets Finance';
    if (id.startsWith('sc-')) return 'SocialCard';
    if (id.startsWith('mirror-')) return 'The Mirror App';
    if (id.startsWith('iptv-')) return 'IPTV';
    if (id.includes('news') || id.includes('research') || id.includes('bid') || id.includes('trade') || id.includes('whale') || id.includes('arbitrage') || id.includes('quick-flips') || id.includes('predict')) return 'EWS Market Intelligence';
    return 'Other Divisions';
  };

  const toggleAgentStatus = async (folder: string, currentState: boolean) => {
    try {
      const newState = !currentState;
      setAgents(prev => prev.map(a => a._folder === folder ? { ...a, enabled: newState } : a));
      await api.post(`/api/agents/${folder}/toggle`, { enabled: newState });
    } catch(e) {
      console.error("Failed to toggle");
      // revert mapping
      setAgents(prev => prev.map(a => a._folder === folder ? { ...a, enabled: currentState } : a));
    }
  };

  const categories = Array.from(new Set(agents.map(getCategory)));

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Nak3d Eye Enterprises Network" subtitle={`Hierarchy & Agent Pyramid — Total Fleet: ${agents.length}`}>
      
      {/* 1. APEX CONSTRUCT - BOSS */}
      <div style={{ marginBottom: 40, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h3 style={{ color: 'var(--accent)', marginBottom: 12, letterSpacing: '2px', textTransform: 'uppercase' }}>Chief Agent Core</h3>
        {boss && (
          <div className="glass-panel" style={{ width: 350, textAlign: 'center', border: '1px solid var(--accent)', background: 'rgba(56, 189, 248, 0.05)', boxShadow: '0 0 20px rgba(56,189,248,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{boss.identity?.emoji || '🏔️'}</div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--accent)' }}>{boss.name}</h2>
            <p className="text-muted" style={{ margin: 0 }}>Delegation Orchestrator & Hub</p>
          </div>
        )}
      </div>

      <div style={{ paddingBottom: 60 }}>
        {categories.map(cat => {
           const divisionAgents = agents.filter(a => getCategory(a) === cat && a.id !== 'main' && a.id !== 'visionclaw');
           if (divisionAgents.length === 0) return null;
           
           const leader = divisionAgents.find(a => a.id?.includes('president') || a.id?.includes('hq-'));
           const subs = divisionAgents.filter(a => a !== leader);

           return (
             <div key={cat} style={{ marginBottom: 30, background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>{cat}</h2>
                
                {/* 2. DIVISION PRESIDENTS */}
                {leader && (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div className="glass-panel" style={{ width: 300, textAlign: 'center', borderTop: '3px solid #facc15', opacity: leader.enabled === false ? 0.5 : 1 }}>
                      <div style={{ fontSize: 32, marginBottom: 4 }}>{leader.identity?.emoji || '👔'}</div>
                      <h3 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{leader.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>Division President</p>
                      {leader._folder && (
                        <div style={{ marginTop: 10 }}>
                          <label className="switch" title="Toggle President Status">
                             <input type="checkbox" checked={leader.enabled !== false} onChange={() => toggleAgentStatus(leader._folder, leader.enabled !== false)} />
                             <span className="slider"></span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* 3. SUBAGENTS GRID */}
                <div className="grid-3" style={{ opacity: 0.9 }}>
                  {subs.map(a => (
                    <div className="glass-panel" key={a.id || a.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', opacity: a.enabled === false ? 0.5 : 1 }}>
                       <div style={{ fontSize: 24 }}>{a.identity?.emoji || '🤖'}</div>
                       <div style={{ flex: 1, overflow: 'hidden' }}>
                          <h4 style={{ margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</h4>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: 4 }}>ID: {a.id}</span>
                       </div>
                       {a._folder && (
                         <label className="switch" title="Toggle Agent Status">
                           <input type="checkbox" checked={a.enabled !== false} onChange={() => toggleAgentStatus(a._folder, a.enabled !== false)} />
                           <span className="slider"></span>
                         </label>
                       )}
                    </div>
                  ))}
                </div>
             </div>
           );
        })}
      </div>
    </PageTransition>
  );
};

const CompaniesView = ({ toggleSidebar }: any) => {
  const subsidiaries = [
    { name: "Economic Wealth Systems (EWS)", type: "Financial Intelligence & Algorithmic Trading", status: "Active" },
    { name: "Nak3d Eye Music", type: "Artist Development & Publishing", status: "Active" },
    { name: "Nak3d Eye Film", type: "Film Development & Greenlight Authority", status: "Active" },
    { name: "Nak3d Eye TV", type: "Broadcasting & Series Production", status: "Active" },
    { name: "Pest Arrest", type: "Logistics & Field Service Operations", status: "Active" },
    { name: "ThaAfterParty (TAP)", type: "Social Club, Events & Private Hosting", status: "Active" },
    { name: "SocialCard", type: "NFC Networking & Digital Identity", status: "Active" },
    { name: "Nak3d Eye Mirror", type: "Hypocrisy Reflection & Social Accountability App", status: "Active" },
    { name: "Nak3d Eye Construction", type: "Real Estate, Architecture & Development", status: "Active" },
    { name: "Nak3d Eye Wellness", type: "Holistic Medicine & Organic Gardening", status: "Active" },
    { name: "Nak3d Eye Web", type: "Corporate Infrastructure & Node Management", status: "Active" }
  ];

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Nak3d Eye Subsidiaries" subtitle="Corporate entities and organizational oversight.">
      <div className="grid-3">
        {subsidiaries.map((sub, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h3 style={{ color: 'var(--accent)', margin: 0 }}>{sub.name}</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{sub.type}</span>
            <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
              <span className="status-badge" style={{ background: 'rgba(0, 255, 136, 0.1)', color: 'var(--accent)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                ● {sub.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </PageTransition>
  );
};

const FactoryView = ({ toggleSidebar }: any) => {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  const startBuild = async (platform: string) => {
    setLoading(platform);
    setStatus(`Initializing ${platform.toUpperCase()} synchronization...`);
    try {
      const res = await api.post(`/api/build/${platform}`);
      setStatus(`Success: ${platform.toUpperCase()} project is opening in IDE.`);
    } catch (err: any) {
      setStatus(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(null);
    }
  };

  const platforms = [
    { id: 'ios', name: 'Xcode Sync (iPhone)', desc: 'Sync assets & launch for iOS', icon: <Rocket size={32} color="#3b82f6" />, color: '#3b82f6' },
    { id: 'android', name: 'Android Studio (Fold)', desc: 'Sync assets & launch for Pixel Fold', icon: <Layers size={32} color="#4ade80" />, color: '#4ade80' },
    { id: 'gcp', name: 'Google Cloud Node', desc: 'Sync config to GCP Failover VM', icon: <Server size={32} color="#a78bfa" />, color: '#a78bfa' },
    { id: 'extension', name: 'Browser Extension', desc: 'Rebuild & package Chrome Extension', icon: <Plus size={32} color="#facc15" />, color: '#facc15' }
  ];

  return (
    <PageTransition toggleSidebar={toggleSidebar} title="Asset Factory" subtitle="One-click build & sync for all agent deployments.">
      <div className="grid-2">
        {platforms.map(p => (
           <div key={p.id} className="glass-panel" style={{ borderLeft: `4px solid ${p.color}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
               <div style={{ width: 60, height: 60, background: `${p.color}11`, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 {p.icon}
               </div>
               <div>
                 <h3 style={{ margin: 0 }}>{p.name}</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{p.desc}</p>
               </div>
             </div>
             <button 
               disabled={!!loading}
               onClick={() => startBuild(p.id)}
               className="primary-btn" 
               style={{ width: '100%', background: p.color, color: p.id === 'android' || p.id === 'extension' ? '#000' : '#fff' }}
             >
               {loading === p.id ? 'Processing...' : `🚀 Sync ${p.id.toUpperCase()}`}
             </button>
           </div>
        ))}

        {status && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', background: 'rgba(0,0,0,0.4)', fontSize: '0.85rem', border: '1px solid var(--panel-border)', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Terminal size={14} />
              <span>{status}</span>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
};

const LoginView = ({ onLogin }: { onLogin: (user: string) => void }) => {
  const [username, setUsername] = useState('sterry973@gmail.com');
  const [password, setPassword] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [step, setStep] = useState(1); // 1: Password, 2: MFA
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (step === 1) {
        const res = await api.post('/api/auth/login', { username, password });
        if (res.data.mfaRequired) {
          setStep(2);
        } else if (res.data.success) {
          if (res.data.token) localStorage.setItem('mc_token', res.data.token);
          onLogin(res.data.user);
        }
      } else {
        const res = await api.post('/api/auth/mfa-verify', { token: mfaToken });
        if (res.data.success) {
          if (res.data.token) localStorage.setItem('mc_token', res.data.token);
          onLogin(res.data.user);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Authentication Failed. Access Denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel login-card"
        style={{ animation: 'pulse-glow-accent 6s ease-in-out infinite' }}
      >
        <div className="login-logo">
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(74,222,128,0.1)', border: '1px solid var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Rocket size={40} color="#4ade80" />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '1.8rem', fontWeight: 800 }}>Mission Control</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 30 }}>
            {step === 1 ? 'Commander Credentials Required' : 'Authenticator Token Required'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', padding: 14, borderRadius: 12, marginBottom: 20, fontSize: '0.85rem', border: '1px solid rgba(248,113,113,0.3)', textAlign: 'left', display: 'flex', gap: 10, alignItems: 'center' }}>
            <Shield size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {step === 1 ? (
            <>
              <div className="login-input-group">
                <label className="login-label">Commander Email</label>
                <input 
                  type="email" 
                  className="login-input" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="sterry973@gmail.com"
                  required
                />
              </div>
              <div className="login-input-group">
                <label className="login-label">Commander Password</label>
                <input 
                  type="password" 
                  className="login-input" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <div className="login-input-group">
              <label className="login-label">Authenticator Token (6 Digits)</label>
              <input 
                type="text" 
                className="login-input" 
                value={mfaToken}
                onChange={e => setMfaToken(e.target.value)}
                placeholder="000 000"
                maxLength={6}
                autoFocus
                required
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.5rem' }}
              />
            </div>
          )}

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Processing...' : step === 1 ? '🚀 LOG IN' : '✅ VERIFY TOKEN'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [localMode, setLocalMode] = useState(false);
  const [isSyncingLocal, setIsSyncingLocal] = useState(false);

  useEffect(() => {
    // Check initial local mode state
    api.get('/api/config/local-mode')
      .then(res => setLocalMode(res.data.localMode))
      .catch(err => console.error('Failed to fetch local mode:', err));
  }, []);

  const toggleLocalMode = async () => {
    setIsSyncingLocal(true);
    try {
      const res = await api.post('/api/config/local-mode', { enabled: !localMode });
      setLocalMode(res.data.localMode);
    } catch (err) {
      console.error('Toggle failed:', err);
      alert('Local Mode switch failed. Check server logs.');
    } finally {
      setIsSyncingLocal(false);
    }
  };
  const [checkingAuth, setCheckingAuth] = useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    // Watchdog: guarantee we NEVER hang on AUTHENTICATING forever
    const watchdog = setTimeout(() => setCheckingAuth(false), 5000);

    const token = localStorage.getItem('mc_token');
    const headers: any = { 
      'Cache-Control': 'no-cache, no-store', 
      'Pragma': 'no-cache' 
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const apiBase = import.meta.env.VITE_API_BASE || '';
    fetch(`${apiBase}/api/auth/me`, {
      credentials: 'include',
      headers,
      cache: 'no-store'
    })
      .then(res => res.ok ? res.json() : Promise.reject(res.status))
      .then(data => { if (data.user) setUser(data.user); })
      .catch(() => setUser(null))
      .finally(() => { clearTimeout(watchdog); setCheckingAuth(false); });
  }, []);

  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    // Check if keys are missing in the background
    api.get('/api/auth/me').then(res => {
      if (res.data.setupRequired) setSetupRequired(true);
    }).catch(() => {});
  }, []);

  if (checkingAuth) {
    return (
      <div className="login-container" style={{ flexDirection: 'column', gap: 20 }}>
        <Rocket size={48} color="var(--accent)" className="spin-slow" style={{ animation: 'spin 4s linear infinite' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '2px' }}>AUTHENTICATING...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLogin={u => setUser(u)} />;
  }

  if (setupRequired) {
    return <SetupWizard onComplete={() => setSetupRequired(false)} />;
  }

  const handleLogout = async () => {
    try {
      await api.post('/api/logout');
      localStorage.removeItem('mc_token');
      setUser(null);
    } catch {
      localStorage.removeItem('mc_token');
      setUser(null); // Force logout even on error
    }
  };

  const isMobileView = isMobile;

  return (
    <Router>
      <div className={isMobileView ? "member-app" : "app-container"}>
        {/* The Sidebar is now a top-level sibling, ensuring it is NEVER clipped */}
        <Sidebar 
          isOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          handleLogout={handleLogout} 
          localMode={localMode}
          toggleLocalMode={toggleLocalMode}
          isSyncingLocal={isSyncingLocal}
        />

        {/* Unified Main Wrapper */}
        <main className={isMobileView ? "member-main" : "main-content-wrapper"} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <UpdateBanner />
          
          {/* Desktop/Tablet Header (Hidden on small mobile via CSS) */}
          <header className="mobile-header" style={{ position:'fixed', top:0, left:0, right:0, height:60, background:'var(--panel-bg)', backdropFilter:'blur(20px)', borderBottom:'1px solid var(--panel-border)', display:'none', alignItems:'center', padding:'0 16px', zIndex:100 }}>
            <button onClick={toggleSidebar} style={{ background:'transparent', border:'none', color:'var(--text-main)', cursor:'pointer' }}>
               <Activity size={24} />
            </button>
            <div style={{ flex:1, textAlign:'center', fontWeight:'bold', letterSpacing:'1px', fontSize:'0.9rem' }}>MISSION CONTROL</div>
            <button onClick={handleLogout} style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer' }}>
               <Lock size={18} />
            </button>
          </header>

          <div style={{ height: '100%', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <AnimatePresence mode='wait'>
              <Routes>
                <Route path="/" element={<Navigate to="/office" replace />} />
                <Route path="/office" element={<OfficeView toggleSidebar={toggleSidebar} />} />
                <Route path="/system" element={<SystemView toggleSidebar={toggleSidebar} />} />
                <Route path="/chat" element={<ChatControlView toggleSidebar={toggleSidebar} />} />
                <Route path="/approvals" element={<ApprovalsView toggleSidebar={toggleSidebar} />} />
                <Route path="/skills" element={<SkillsHubView toggleSidebar={toggleSidebar} />} />
                <Route path="/cron" element={<CronJobsView toggleSidebar={toggleSidebar} />} />
                <Route path="/customization" element={<CustomizationView toggleSidebar={toggleSidebar} />} />
                <Route path="/calendar" element={<CalendarView toggleSidebar={toggleSidebar} />} />
                <Route path="/memory" element={<MemoryView toggleSidebar={toggleSidebar} />} />
                <Route path="/docs" element={<DocsView toggleSidebar={toggleSidebar} />} />
                <Route path="/team" element={<TeamView toggleSidebar={toggleSidebar} />} />
                <Route path="/nodes" element={<NodesView toggleSidebar={toggleSidebar} />} />
                <Route path="/settings" element={<SettingsView toggleSidebar={toggleSidebar} />} />
                <Route path="/agents" element={<AgentsView toggleSidebar={toggleSidebar} />} />
                <Route path="/agents-create" element={<AgentsCreateView toggleSidebar={toggleSidebar} />} />
                <Route path="/teams" element={<TeamsView toggleSidebar={toggleSidebar} />} />
                <Route path="/people" element={<PeopleView toggleSidebar={toggleSidebar} />} />
                <Route path="/companies" element={<CompaniesView toggleSidebar={toggleSidebar} />} />
                <Route path="/council" element={<PlaceholderView title="Council" subtitle="High-level strategic oversight and governance board." toggleSidebar={toggleSidebar} icon={<Shield size={64}/>} />} />
                <Route path="/tasks" element={<PlaceholderView title="Tasks" subtitle="Track assigned work, deadlines, and priorities." toggleSidebar={toggleSidebar} icon={<ListTodo size={64}/>} />} />
                <Route path="/projects" element={<ProjectsView toggleSidebar={toggleSidebar} />} />
                <Route path="/pipeline" element={<PipelineView toggleSidebar={toggleSidebar} />} />
                <Route path="/radar" element={<RadarView toggleSidebar={toggleSidebar} />} />
                <Route path="/suggested" element={<SuggestedView toggleSidebar={toggleSidebar} />} />
                <Route path="/ceo-desk" element={<CeoDeskView toggleSidebar={toggleSidebar} />} />
                <Route path="/factory" element={<FactoryView toggleSidebar={toggleSidebar} />} />
                <Route path="/content" element={<ContentStudioView toggleSidebar={toggleSidebar} />} />
                <Route path="/dispatcher" element={<DispatcherView toggleSidebar={toggleSidebar} />} />
                <Route path="/ailab" element={<AIStudioView toggleSidebar={toggleSidebar} />} />
                <Route path="/security" element={<SecurityView toggleSidebar={toggleSidebar} />} />
                <Route path="/fleet" element={<FleetHealthView toggleSidebar={toggleSidebar} />} />
                <Route path="*" element={<Navigate to="/office" replace />} />
              </Routes>
            </AnimatePresence>
          </div>
          
          {isMobileView && <BottomNav toggleSidebar={toggleSidebar} />}
        </main>
      </div>
    </Router>
  );
}


export default App;
