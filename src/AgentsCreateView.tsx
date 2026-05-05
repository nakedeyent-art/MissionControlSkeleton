import { useState, type FormEvent } from 'react';
import { Bot, Plus, X, Upload } from 'lucide-react';
import axios from 'axios';

type ViewProps = {
  toggleSidebar: () => void;
};

export const AgentsCreateView = ({ toggleSidebar }: ViewProps) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [model, setModel] = useState('claude-3-5-sonnet-20240620');
  const [objective, setObjective] = useState('');
  const [soul, setSoul] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [scenario, setScenario] = useState('');
  const [grinder, setGrinder] = useState('');
  const [outputFormat, setOutputFormat] = useState('JSON / Markdown');
  const [skills, setSkills] = useState('filesystem, shell, web_browser');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/agents', {
        name, role, model, objective, soul, responsibilities, scenario, grinder_mindset: grinder, output_format: outputFormat, skills
      }, { withCredentials: true });
      
      alert(`Success: ${name} (The Protocol Encoder variant) has been deployed to the gateway.`);
      setShowModal(false);
      // Reset form
      setName(''); setRole(''); setObjective(''); setSoul(''); setResponsibilities(''); setScenario(''); setGrinder('');
    } catch (err) {
      alert("Deployment failed. Check if Mission Control Gateway is accessible.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="view-container main-content">
      <div className="page-header">
        <div className="header-actions-row">
          <button className="mobile-menu-btn" onClick={toggleSidebar} title="Toggle Sidebar">
            <svg width={24} height={24} viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/>
            </svg>
          </button>
          <div>
            <h2 className="agents-create-title">Agents 2 Create</h2>
            <p className="text-muted-desc">Design, configure, and deploy new agent personas.</p>
          </div>
        </div>
      </div>
      <div className="page-content">
      <div className="create-agent-btn-wrapper">
        <button 
          onClick={() => setShowModal(true)} 
          className="create-agent-btn"
          title="Create Agent"
        >
          <Plus size={18} /> Create Agent
        </button>
      </div>

      <div className="glass-panel empty-agent-panel">
        <div className="empty-agent-icon"><Bot size={64}/></div>
        <h2 className="empty-agent-msg">No agents in creation queue</h2>
        <p className="text-muted">Click the Create Agent button to begin.</p>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button onClick={() => setShowModal(false)} className="modal-close-btn" title="Close Modal"><X size={24} /></button>
            <h2 className="modal-title">Create New Agent</h2>
            
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Quick Templates</label>
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setName('Lead Architect');
                    setRole('System Design & Core Engineering');
                    setModel('Enter preferred high-reasoning model');
                    setObjective('Design and implement scalable system architectures and optimized operational protocols.');
                    setSoul('Highly technical, precise, and efficient. Focused on sovereign infrastructure and robust code.');
                    setResponsibilities('Architecture, API normalization, and core logic implementation.');
                    setSkills('filesystem, shell, web_browser, python_dev');
                  }}
                  className="secondary-btn"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  🚀 Lead Architect
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setName('Mission Orchestrator');
                    setRole('Operation Coordinator');
                    setModel('Enter preferred orchestration model');
                    setObjective('Decompose complex missions into parallel sub-tasks and manage execution across the agent fleet.');
                    setSoul('Strategic, overview-oriented, and decisive. Masters the art of delegation and tracking.');
                    setSkills('mission_dispatcher, parallel_execution, task_tracking');
                  }}
                  className="secondary-btn"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                >
                  🐝 Mission Lead
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="two-col-grid">
                <div className="form-group">
                  <label>Agent Name / Persona</label>
                  <input type="text" placeholder="e.g. Bergen, Specialist..." className="form-input" value={name} onChange={e=>setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" placeholder="e.g. Lead Researcher, CFO, Trade Analyst..." className="form-input" value={role} onChange={e=>setRole(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Model & Intelligence Layer</label>
                <input type="text" placeholder="e.g. Gemini 1.5 Pro, GPT-4o, Local Ollama..." className="form-input" value={model} onChange={e=>setModel(e.target.value)} />
              </div>
              
              <div className="form-group">
                <label>Strategic Objective</label>
                <textarea rows={2} placeholder="What is the primary goal of this agent?" className="form-textarea" value={objective} onChange={e=>setObjective(e.target.value)} required />
              </div>

              <div className="form-group">
                <label>Soul/Identity & Character Traits</label>
                <textarea rows={2} placeholder="Describe tone, temperament, and personality..." className="form-textarea" value={soul} onChange={e=>setSoul(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Core Responsibilities & Capabilities</label>
                <textarea rows={3} placeholder="List out specific duties, tools, and constraints..." className="form-textarea" value={responsibilities} onChange={e=>setResponsibilities(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Scenario Example</label>
                <textarea rows={2} placeholder="Provide a sample task and expected thought process..." className="form-textarea" value={scenario} onChange={e=>setScenario(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Model Comparison & Grinder Mindset</label>
                <textarea rows={2} placeholder="Define performance benchmarks and operational intensity..." className="form-textarea" value={grinder} onChange={e=>setGrinder(e.target.value)} />
              </div>

              <div className="two-col-grid">
                <div className="form-group">
                  <label>Output Format</label>
                  <input type="text" placeholder="e.g. JSON, Bullet Points, Formal Report..." className="form-input" value={outputFormat} onChange={e=>setOutputFormat(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Primary Skills (CSV)</label>
                  <input type="text" placeholder="filesystem, shell, browser..." className="form-input" value={skills} onChange={e=>setSkills(e.target.value)} />
                </div>
              </div>

              <div className="form-group">
                <label>Reference Assets & Knowledge</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div className="upload-zone" style={{ padding: '10px' }}>
                    <Upload size={16} /> <span style={{ fontSize: '0.75rem' }}>Visual Reference</span>
                  </div>
                  <div className="upload-zone" style={{ padding: '10px' }}>
                    <Upload size={16} /> <span style={{ fontSize: '0.75rem' }}>Docs/Knowledge</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">Cancel</button>
                <button type="submit" disabled={loading} className="submit-btn" title="Deploy Agent">
                  {loading ? 'DEPLOYING...' : 'Deploy Agent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
