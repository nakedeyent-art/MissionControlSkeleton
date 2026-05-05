import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderOpen, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  Calendar, 
  ArrowUpRight,
  Plus
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


interface Milestone {
  id: string;
  title: string;
  status: 'completed' | 'in_progress' | 'pending';
}

interface Project {
  id: string;
  name: string;
  division: string;
  description: string;
  status: 'active' | 'planning' | 'blocked' | 'completed';
  priority: 'high' | 'medium' | 'low';
  dueDate: string;
  progress: number;
  assignedAgents: string[];
  milestones: Milestone[];
}

export const ProjectsView = ({ toggleSidebar }: any) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<'all' | 'active' | 'planning' | 'blocked' | 'completed'>('all');

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectModal, setNewProjectModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [division, setDivision] = useState('EWS Market Intelligence');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');

  const fetchProjects = async () => {
    try {
      const res = await api.get('/api/projects');

      if (res.data && res.data.length > 0) {
        setProjects(res.data);
      } else {
        // Seed default projects
        setProjects([
          {
            id: 'proj-1',
            name: 'Winceyco World Games',
            division: 'Nak3d Eye Entertainment',
            description: 'Integrating enhanced graphics algorithms and multi-platform deployment systems for the world games tournament ecosystem.',
            status: 'active',
            priority: 'high',
            dueDate: '2026-06-15',
            progress: 45,
            assignedAgents: ['Bergen'],
            milestones: [
              { id: 'm1', title: 'Seeddance & Image2 Graphics Pipeline Evaluation', status: 'completed' },
              { id: 'm2', title: 'Multiplayer Node Latency Tests', status: 'in_progress' },
              { id: 'm3', title: 'Asset Pack Packaging Optimization', status: 'pending' },
            ]
          },
          {
            id: 'proj-2',
            name: 'SocialCard NFC Suite',
            division: 'SocialCard',
            description: 'Next-gen networking framework offering dynamic digital portfolios directly accessible via hardware interfaces.',
            status: 'planning',
            priority: 'medium',
            dueDate: '2026-08-01',
            progress: 15,
            assignedAgents: ['Bergen'],
            milestones: [
              { id: 'm4', title: 'NFC Read/Write Authorization Flow', status: 'completed' },
              { id: 'm5', title: 'User Multi-profile Customizer', status: 'pending' },
            ]
          },
          {
            id: 'proj-3',
            name: 'Predictive Analytics Dashboard',
            division: 'EWS Market Intelligence',
            description: 'Live feed computation connecting OANDA and Alpaca APIs into multi-asset trade models.',
            status: 'blocked',
            priority: 'high',
            dueDate: '2026-05-20',
            progress: 68,
            assignedAgents: ['Bergen'],
            milestones: [
              { id: 'm6', title: 'Websocket Hub Latency Calibration', status: 'completed' },
              { id: 'm7', title: 'Trade Execution Gateways Deployment', status: 'completed' },
              { id: 'm8', title: 'Live Prediction Telemetry Sync', status: 'in_progress' },
            ]
          },
          {
            id: 'proj-4',
            name: 'Corporate Knowledge Base Wiki',
            division: 'Nak3d Eye Web',
            description: 'Central indexing of execution rules, procedures, and operator continuity scripts.',
            status: 'completed',
            priority: 'low',
            dueDate: '2026-04-10',
            progress: 100,
            assignedAgents: ['Bergen'],
            milestones: [
              { id: 'm9', title: 'Scaffold Core Document Hierarchy', status: 'completed' },
              { id: 'm10', title: 'Build Continuous Deployment Hooks', status: 'completed' },
            ]
          }
        ]);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };


  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const created: Project = {
      id: `proj-${Date.now()}`,
      name,
      division,
      description,
      status: 'planning',
      priority,
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      progress: 0,
      assignedAgents: ['Bergen'],
      milestones: []
    };

    try {
      await api.post('/api/projects', created);
      setProjects([...projects, created]);
    } catch {
      // Fallback local update
      setProjects([...projects, created]);
    }

    setNewProjectModal(false);
    setName('');
    setDescription('');
  };

  const handleToggleMilestone = async (projId: string, milestoneId: string) => {
    const updatedProjects = projects.map(p => {
      if (p.id !== projId) return p;
      const updatedMilestones = p.milestones.map(m => {
        if (m.id !== milestoneId) return m;
        const nextStatus: 'completed' | 'in_progress' | 'pending' = m.status === 'completed' ? 'in_progress' : m.status === 'in_progress' ? 'pending' : 'completed';
        return { ...m, status: nextStatus };
      });

      
      const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
      const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
      
      return { ...p, milestones: updatedMilestones, progress };
    });

    setProjects(updatedProjects);
    if (selectedProject && selectedProject.id === projId) {
      const match = updatedProjects.find(u => u.id === projId);
      if (match) setSelectedProject(match);
    }

    try {
      await api.put(`/api/projects/${projId}`, updatedProjects.find(p => p.id === projId));
    } catch (err) {
      console.error('API sync failed, state kept local.');
    }
  };

  const visibleProjects = projects.filter(p => filter === 'all' || p.status === filter);

  const statusColor = (s: string) => {
    switch(s) {
      case 'active': return '#38bdf8';
      case 'planning': return '#a78bfa';
      case 'blocked': return '#f87171';
      case 'completed': return '#4ade80';
      default: return 'var(--text-muted)';
    }
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
      title="Strategic Projects" 
      subtitle="Fleet-wide oversight of active operations, deadlines, and delivery milestones."
      icon={<FolderOpen size={40} color="var(--accent)" />}
      toggleSidebar={toggleSidebar}
    >
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'active', 'planning', 'blocked', 'completed'] as const).map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            style={{ 
              padding: '8px 16px', 
              borderRadius: 8, 
              border: `1px solid ${filter === f ? statusColor(f) : 'var(--panel-border)'}`,
              background: filter === f ? `${statusColor(f)}22` : 'rgba(0,0,0,0.2)',
              color: filter === f ? statusColor(f) : 'var(--text-muted)',
              cursor: 'pointer',
              fontWeight: filter === f ? 'bold' : 'normal',
              fontSize: '0.82rem',
              textTransform: 'capitalize'
            }}
          >
            {f}
          </button>
        ))}
        <button 
          onClick={() => setNewProjectModal(true)}
          style={{ 
            marginLeft: 'auto', 
            padding: '8px 16px', 
            borderRadius: 8, 
            border: 'none', 
            background: 'var(--accent)', 
            color: '#000', 
            fontWeight: 'bold', 
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr 350px' : '1fr', gap: 24, transition: 'all 0.3s' }}>
        {/* Project Grid/List */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {visibleProjects.map(p => (
            <div 
              key={p.id} 
              className="glass-panel"
              onClick={() => setSelectedProject(p.id === selectedProject?.id ? null : p)}
              style={{ 
                borderLeft: `4px solid ${statusColor(p.status)}`,
                cursor: 'pointer',
                background: selectedProject?.id === p.id ? 'rgba(255,255,255,0.04)' : 'var(--panel-bg)',
                transform: selectedProject?.id === p.id ? 'scale(1.01)' : 'none',
                transition: 'all 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{p.division}</span>
                  <h3 style={{ margin: '4px 0 0 0', fontSize: '1.1rem' }}>{p.name}</h3>
                </div>
                <span 
                  style={{ 
                    padding: '3px 8px', 
                    borderRadius: 12, 
                    background: `${statusColor(p.status)}22`, 
                    color: statusColor(p.status), 
                    fontSize: '0.72rem', 
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}
                >
                  {p.status}
                </span>
              </div>

              <p className="text-muted" style={{ fontSize: '0.85rem', lineHeight: 1.5, marginBottom: 16 }}>{p.description}</p>

              {/* Progress Bar */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                  <span style={{ fontWeight: 'bold' }}>{p.progress}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${p.progress}%`, height: '100%', background: statusColor(p.status), borderRadius: 10, transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {p.assignedAgents.map(a => (
                    <span key={a} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: 'rgba(255,255,255,0.05)', fontSize: '0.7rem' }}>
                      <User size={12} /> {a}
                    </span>
                  ))}
                </div>
                <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={14} /> {p.dueDate}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Project Drawer/Sidebar */}
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-panel"
            style={{ 
              position: 'sticky', 
              top: 24, 
              alignSelf: 'start', 
              border: `1px solid ${statusColor(selectedProject.status)}44`,
              boxShadow: `0 0 30px ${statusColor(selectedProject.status)}11`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Project Actions</h3>
              <button onClick={() => setSelectedProject(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Priority</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', fontWeight: 'bold', color: priorityColor(selectedProject.priority), textTransform: 'capitalize' }}>
                  ● {selectedProject.priority}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Milestones & Action Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedProject.milestones.length === 0 && (
                    <span style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No milestones created.</span>
                  )}
                  {selectedProject.milestones.map(m => (
                    <div 
                      key={m.id}
                      onClick={() => handleToggleMilestone(selectedProject.id, m.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 10, 
                        padding: '10px 12px', 
                        background: 'rgba(0,0,0,0.2)', 
                        border: '1px solid var(--panel-border)', 
                        borderRadius: 8, 
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = statusColor(selectedProject.status)}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--panel-border)'}
                    >
                      {m.status === 'completed' ? (
                        <CheckCircle2 size={18} color="#4ade80" />
                      ) : m.status === 'in_progress' ? (
                        <Clock size={18} color="#facc15" />
                      ) : (
                        <AlertCircle size={18} color="var(--text-muted)" />
                      )}
                      <span 
                        style={{ 
                          fontSize: '0.8rem', 
                          textDecoration: m.status === 'completed' ? 'line-through' : 'none',
                          color: m.status === 'completed' ? 'var(--text-muted)' : 'var(--text-main)',
                          flex: 1
                        }}
                      >
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                <button 
                  className="primary-btn" 
                  style={{ flex: 1, padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}
                  onClick={() => alert('Feature coming soon: Assign/Delegate via Antigravity directly.')}
                >
                  <ArrowUpRight size={16} /> Delegate
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* New Project Modal */}
      {newProjectModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-panel"
            style={{ width: 450, maxWidth: '90%', border: '1px solid var(--panel-border)' }}
          >
            <h2 style={{ margin: '0 0 20px 0' }}>Create New Operation</h2>
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Project Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                  placeholder="e.g. Winceyco World Expansion"
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Division</label>
                <select 
                  value={division} 
                  onChange={e => setDivision(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                >
                  <option value="EWS Market Intelligence">EWS Market Intelligence</option>
                  <option value="Nak3d Eye Entertainment">Nak3d Eye Entertainment</option>
                  <option value="SocialCard">SocialCard</option>
                  <option value="Nak3d Eye Web">Nak3d Eye Web</option>
                  <option value="Pest Arrest">Pest Arrest</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Description</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  required 
                  placeholder="Outline objectives..."
                  style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none', minHeight: 80, resize: 'vertical' }}
                />
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
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    style={{ width: '100%', padding: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--panel-border)', borderRadius: 8, color: 'white', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button 
                  type="button" 
                  onClick={() => setNewProjectModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: '1px solid var(--panel-border)', background: 'transparent', color: 'var(--text-main)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ flex: 1, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#000', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🚀 Launch Operation
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
};
