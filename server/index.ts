
console.log("--- MISSION CONTROL SERVER STARTING - VERSION ABNJ01 ---"); // UNIQUE IDENTIFIER FOR DEBUGGING

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec as execCb, execFile as execFileCb } from 'child_process';
import util from 'util';
import cron from 'node-cron';
import axios from 'axios';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import qrcode from 'qrcode';
const speakeasy = require('speakeasy');
const FileStore = require('session-file-store')(session);
dotenv.config();

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// --- EWS Gateway Proxy ---
// Forward all /ews/* requests to the EWS microservice on port 8000
app.all(/^\/ews\/(.*)/, async (req, res) => {
  const strippedPath = req.url.replace(/^\/ews/, '') || '/';
  const targetUrl = `http://localhost:8000${strippedPath}`;
  console.log(`[PROXY] ${new Date().toLocaleTimeString()} - Forwarding ${req.method} ${req.url} -> ${targetUrl}`);
  
  try {
    const config: any = {
      method: req.method,
      url: targetUrl,
      headers: { ...req.headers },
      validateStatus: () => true, // Forward all status codes (including 401, 404, etc.)
      responseType: 'arraybuffer' // Handle potential binary data (images/favicons)
    };
    
    // Clean up headers for the target request
    delete config.headers.host;
    delete config.headers.connection;
    
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      config.data = req.body;
    }

    const response = await axios(config);
    
    // Set response headers and send data
    res.status(response.status);
    Object.entries(response.headers).forEach(([key, value]) => {
      res.set(key, value as string);
    });
    res.send(response.data);
  } catch (error: any) {
    console.error(`[PROXY ERROR] Failed to reach EWS at ${targetUrl}: ${error.message}`);
    res.status(502).json({ 
      error: 'EWS Gateway Offline', 
      details: 'Mission Control was unable to communicate with the EWS trading backend on port 8000.',
      message: error.message
    });
  }
});
// --- Environment & Paths ---
const PORT = process.env.PORT || 18789;
const OPENCLAW_DIR = process.env.OPENCLAW_DIR || path.join(process.env.HOME || process.cwd(), '.openclaw');
const PROVIDERS_DIR = path.join(OPENCLAW_DIR, 'providers');
const PROVIDER_PUSH_TOKEN = process.env.PROVIDER_PUSH_TOKEN || '';

const ensureDir = (p: string) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
ensureDir(OPENCLAW_DIR);
ensureDir(path.join(OPENCLAW_DIR, 'sessions'));

app.use(session({
  store: new FileStore({
    path: path.join(OPENCLAW_DIR, 'sessions'),
    ttl: 86400 * 7,
    logFn: () => {} // Disable noisy logs
  }),
  secret: 'mission-control-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 86400000 * 7
  }
}));

const JWT_SECRET = process.env.JWT_SECRET || 'mission-control-shell-secret';
const AUTH_USER = 'sterry973@gmail.com';
const AUTH_PASS = '61V@ss@r@venue';

// --- Auth Middleware ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.mc_token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token invalid or expired' });
  }
};

// --- Auth Endpoints ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`[AUTH] Login attempt for user: ${username}`);
  
  if (username === AUTH_USER && password === AUTH_PASS) {
    if (IS_2FA_ENABLED) {
      console.log(`🔒 Step 1 Login successful for ${username}. Awaiting MFA...`);
      (req.session as any).preAuthUser = AUTH_USER;
      return res.json({ success: true, mfaRequired: true, user: AUTH_USER });
    }

    console.log(`🔑 Login successful for ${username}. 2FA is currently DISABLED.`);
    const token = jwt.sign({ user: AUTH_USER }, JWT_SECRET); 
    res.cookie('mc_token', token, {
      httpOnly: true,
      secure: false, // Changed to false to allow login over HTTP/Tailscale
      sameSite: 'lax' // Changed to lax for better compatibility
    });
    return res.json({ success: true, user: AUTH_USER, token });
  }
  console.warn(`❌ Login FAILED for user: ${username}`);
  res.status(401).json({ error: 'Invalid username or password' });
});

app.post('/api/auth/mfa-verify', (req, res) => {
  const { token } = req.body;
  const preAuthUser = (req.session as any).preAuthUser;

  if (!preAuthUser) return res.status(401).json({ error: 'Session expired or invalid' });

  const isValid = speakeasy.totp.verify({ secret: COMMANDER_2FA_SECRET, encoding: 'base32', token });
  if (isValid) {
    console.log(`✅ MFA Verified for ${preAuthUser}. Access Granted.`);
    const jwtToken = jwt.sign({ user: AUTH_USER }, JWT_SECRET); 
    res.cookie('mc_token', jwtToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax'
    });
    delete (req.session as any).preAuthUser;
    res.json({ success: true, user: AUTH_USER, token: jwtToken });
  } else {
    res.status(401).json({ error: 'Invalid MFA token' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('mc_token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  });
  res.json({ success: true });
});


app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('mc_token');
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.mc_token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (decoded.user === AUTH_USER) {
      const anthropicKey = process.env.ANTHROPIC_API_KEY || '';
      const envPath = path.join(process.cwd(), '.env');
      const setupRequired = !fs.existsSync(envPath) || !anthropicKey || anthropicKey.includes('your_anthropic_key_here');
      
      res.json({ user: AUTH_USER, setupRequired });
    } else {
      res.status(401).json({ error: 'Invalid user' });
    }
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

app.get('/api/radar', authenticate, (req, res) => {
  res.json({
    signals: [
      { id: 'sig-1', source: 'social', title: 'Viral AI Trends Spikes @david_wehner', description: 'Monetization paths for generative agent workflows peaking on social graphs.', timestamp: '10m ago', intensity: 'high', category: 'Growth' },
      { id: 'sig-2', source: 'web', title: 'Winceyco Graphics Framework Alert', description: 'Competitor benchmarking showcases asset pipeline requirements exceeding current parameters.', timestamp: '1h ago', intensity: 'medium', category: 'Product Benchmarking' },
      { id: 'sig-3', source: 'market', title: 'BTC Breaches Resistance Level', description: 'Breakout patterns suggest volume surges across liquidity pools on Alpaca networks.', timestamp: '2h ago', intensity: 'high', category: 'Asset Flow' },
      { id: 'sig-4', source: 'system', title: 'GCP Cluster Health Green', description: 'Node latency evaluations hovering below critical threshold bounds of 15ms.', timestamp: '5h ago', intensity: 'low', category: 'System Health' },
      { id: 'sig-5', source: 'social', title: 'Trending Pattern: @aiwithrone strategies', description: 'Continuous review of automation frameworks indicates shift toward autonomous workflow chains.', timestamp: '1d ago', intensity: 'medium', category: 'AI Trends' }
    ],
    tickers: [
      { id: 't1', symbol: 'BTC/USD', price: 92340.50, change: 4.25, type: 'crypto' },
      { id: 't2', symbol: 'ETH/USD', price: 3450.20, change: -1.12, type: 'crypto' },
      { id: 't3', symbol: 'EUR/USD', price: 1.0850, change: 0.05, type: 'forex' },
      { id: 't4', symbol: 'GBP/JPY', price: 195.40, change: 0.32, type: 'forex' },
      { id: 't5', symbol: 'SPY', price: 512.40, change: 1.22, type: 'equity' },
      { id: 't6', symbol: 'TSLA', price: 185.10, change: -2.40, type: 'equity' }
    ]
  });
});

app.get('/api/projects', authenticate, (req, res) => {
  res.json({
    projects: [
      { id: 'p1', name: 'Winceyco World Games', status: 'active', priority: 'high', lead: 'Franklin R.', deadline: '2026-07-15', completion: 45, milestones: [{ id: 'm1', title: 'Seeddance Integration', status: 'completed' }, { id: 'm2', title: 'Image 2 Pipeline', status: 'in_progress' }] },
      { id: 'p3', name: 'AI Monetization Engine', status: 'active', priority: 'high', lead: 'AI Infrastructure', deadline: '2026-05-30', completion: 15, milestones: [{ id: 'm4', title: 'David Wehner Strategies Audit', status: 'completed' }] }
    ]
  });
});

app.get('/api/pipeline', authenticate, (req, res) => {
  res.json({
    deals: [
      { id: 'd1', name: 'Nak3d Eye Merchandise', company: 'Shopify Sync', value: 25000, stage: 'proposal', probability: 80, closeDate: '2026-06-01', contact: 'Sales Mac' },
      { id: 'd2', name: 'Voice Clone Services', company: 'ElevenLabs', value: 12000, stage: 'negotiation', probability: 95, closeDate: '2026-05-15', contact: 'Sales Lead' }
    ]
  });
});

app.post('/api/build/:platform', authenticate, (req, res) => {

  const { platform } = req.params;
  const scriptPath = path.join(REPO_ROOT, 'native_build.sh');
  
  console.log(`[BUILD] Starting native sync for ${platform}...`);
  
  // Use execCb to run the script. We don't wait for it to fully finish opening 
  // the IDE if it spawns a background process, but we wait for the npm build part.
  const child = execCb(`"${scriptPath}" ${platform}`, (error, stdout, stderr) => {
    if (error) {
       console.error(`[BUILD ERROR] ${stderr}`);
       return res.status(500).json({ error: stderr || error.message });
    }
    console.log(`[BUILD SUCCESS] ${platform} synchronization complete.`);
    res.json({ success: true, output: stdout });
  });
});

// Log incoming requests for gateway debugging
app.use((req, res, next) => {
  console.log(`[REQ] ${new Date().toLocaleTimeString()} - ${req.method} ${req.url}`);
  // Protect all /api endpoints except auth, providers (which have their own token), and status
  if (!req.url) return next();
  
  const isAuth = req.url.startsWith('/api/auth/');
  const isProvider = req.url.startsWith('/api/providers/');
  const isStatus = req.url.startsWith('/api/status');
  const isFleetHealth = req.url.startsWith('/api/fleet/health');
  const isRunAuditor = req.url.startsWith('/api/fleet/run-auditor');
  const isCronRun = req.url.startsWith('/api/cron/') && req.url.endsWith('/run');
  const isPublic = isAuth || isProvider || isStatus || isFleetHealth || isRunAuditor || isCronRun;

  if (req.url.startsWith('/api/') && !isPublic) {
    return authenticate(req, res, next);
  }
  next();
});

// Serve static frontend in production
const REPO_ROOT = path.resolve(__dirname, '..');
const DIST_PATH = process.env.DIST_PATH || path.join(REPO_ROOT, 'dist');
app.use(express.static(DIST_PATH));

// SPA fallback — serve index.html for ALL non-API routes so React Router works on direct URL hits
// This must come after all API routes are registered
app.get(/^\/(?!api\/).*$/, (req, res) => {
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Pull Discord Bridge Env for Bot Token
const dotenvPath = process.env.DOTENV_PATH;
if (dotenvPath) {
  dotenv.config({ path: dotenvPath });
} else {
  dotenv.config();
}

const execAsync = util.promisify(execCb);
const execFileAsync = util.promisify(execFileCb);

const SKILLS_DIR = path.join(OPENCLAW_DIR, 'skills');
const SKILLS_DISABLED_DIR = path.join(OPENCLAW_DIR, 'skills.disabled');
const CRON_PATH = path.join(OPENCLAW_DIR, 'cron', 'jobs.json');
const INTEGRATIONS_PATH = path.join(OPENCLAW_DIR, 'integrations.json');
const APPROVALS_PATH = path.join(OPENCLAW_DIR, 'approvals.json');

const isMac = process.platform === 'darwin';

type AgentRecord = {
  id?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  skills?: string[];
  _folder?: string;
};

type OpenClawConfig = {
  agents?: {
    list?: AgentRecord[];
    defaults?: {
      model?: {
        primary?: string;
      };
    };
  };
};

type CalendarProviderItem = {
  title: string;
  start: string | null;
};

type ReminderProviderItem = {
  name: string;
  dueDate: string | null;
};

type ApprovalRecord = {
  id: string;
  status?: string;
  [key: string]: unknown;
};



const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'Unknown error';

const readJsonFile = <T>(filePath: string, fallback: T): T => {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    console.error(`[SYS] Failed to read JSON at ${filePath}:`, err);
    return fallback;
  }
};

const writeJsonFile = (filePath: string, data: unknown) => {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- Global Security State ---
const SECURITY_PATH = path.join(OPENCLAW_DIR, 'security.json');

// Security state with persistence
const securityData = readJsonFile<any>(SECURITY_PATH, {
  is2faEnabled: false,
  commander2faSecret: ''
});

let IS_2FA_ENABLED = securityData.is2faEnabled;
let COMMANDER_2FA_SECRET = securityData.commander2faSecret;

const saveSecurity = () => {
  writeJsonFile(SECURITY_PATH, {
    is2faEnabled: IS_2FA_ENABLED,
    commander2faSecret: COMMANDER_2FA_SECRET,
    localMode: IS_LOCAL_MODE
  });
};

let IS_LOCAL_MODE = securityData.localMode || false;

const readOpenClawConfig = () => {
  const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
  return readJsonFile<OpenClawConfig>(configPath, {});
};

const readSubAgents = (includeFolder = false): AgentRecord[] => {
  const agentsDir = path.join(OPENCLAW_DIR, 'agents');
  if (!fs.existsSync(agentsDir)) return [];

  const subAgents: AgentRecord[] = [];
  for (const folder of fs.readdirSync(agentsDir)) {
    if (folder.startsWith('.')) continue;

    const agentJsonPath = path.join(agentsDir, folder, 'agent.json');
    if (!fs.existsSync(agentJsonPath)) continue;

    try {
      const agentData = readJsonFile<AgentRecord | null>(agentJsonPath, null);
      if (!agentData) continue;
      if (includeFolder) agentData._folder = folder;
      subAgents.push(agentData);
    } catch (error) {
      console.warn(`[SYS] Skipping invalid agent definition at ${agentJsonPath}: ${getErrorMessage(error)}`);
    }
  }

  return subAgents;
};

const listSkillEntries = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) return [];

  return fs.readdirSync(dirPath).filter(entry => {
    if (entry.startsWith('.')) return false;
    const entryPath = path.join(dirPath, entry);
    try {
      return fs.statSync(entryPath).isDirectory();
    } catch (error) {
      return false;
    }
  }).map(name => {
    const skillPath = path.join(dirPath, name);
    const mdPath = path.join(skillPath, 'SKILL.md');
    let description = 'Autonomous capability module.';
    if (fs.existsSync(mdPath)) {
      const content = fs.readFileSync(mdPath, 'utf8');
      const lines = content.split('\n');
      // Try to find the first paragraph after # Header
      const descLine = lines.find(l => l.trim() && !l.startsWith('#') && !l.startsWith('---'));
      if (descLine) description = descLine.trim();
    }
    return { name, description };
  });
};

// Create directories if they don't exist
ensureDir(SKILLS_DIR);
ensureDir(SKILLS_DISABLED_DIR);

// Agents endpoint
app.get('/api/agents', (req, res) => {
  try {
    const coreAgents = readOpenClawConfig().agents?.list || [];
    const subAgents = readSubAgents(true);
    res.json([...coreAgents, ...subAgents]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read agents' });
  }
});

app.post('/api/agents', async (req, res) => {
  try {
    const agent = req.body;
    const folderName = (agent.name || 'unnamed-agent').toLowerCase().replace(/\s+/g, '-');
    const agentDir = path.join(OPENCLAW_DIR, 'agents', folderName);
    const agentJsonPath = path.join(agentDir, 'agent.json');

    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }

    // Format for OpenClaw agent.json
    const agentData = {
      name: agent.name,
      role: agent.role,
      model: {
        primary: agent.model || 'claude-3-5-sonnet-20240620'
      },
      identity: {
        soul: agent.soul,
        objective: agent.objective,
        scenario: agent.scenario,
        grinder_mindset: agent.grinder_mindset,
        emoji: '🔧'
      },
      output_format: agent.output_format,
      skills: agent.skills ? agent.skills.split(',').map((s: string) => s.trim()) : ['filesystem', 'shell'],
      enabled: true
    };

    fs.writeFileSync(agentJsonPath, JSON.stringify(agentData, null, 2));
    console.log(`[AGENT] Created new agent: ${agent.name} in ${folderName}`);

    res.json({ success: true, agent: agentData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create agent record.' });
  }
});

app.post('/api/agents/:folder/skills/toggle', async (req, res) => {
  try {
    const { skill, enabled } = req.body;
    const folder = req.params.folder;
    const agentJsonPath = path.join(OPENCLAW_DIR, 'agents', folder, 'agent.json');
    
    if (!fs.existsSync(agentJsonPath)) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    const agentData = JSON.parse(fs.readFileSync(agentJsonPath, 'utf8'));
    if (!agentData.skills) agentData.skills = [];
    
    if (enabled) {
      if (!agentData.skills.includes(skill)) agentData.skills.push(skill);
    } else {
      agentData.skills = agentData.skills.filter((s: string) => s !== skill);
    }
    
    fs.writeFileSync(agentJsonPath, JSON.stringify(agentData, null, 2));
    
    // Auto-restart gateway to hot-load changes
    try {
      if (isMac) {
        await execAsync('launchctl stop ai.openclaw.gateway; sleep 1; launchctl start ai.openclaw.gateway');
        console.log(`[SYS] OpenClaw Gateway auto-restarted to apply skill toggle for agent ${folder}`);
      }
    } catch (err) {
      console.error('[SYS] Failed to restart gateway:', err);
    }

    res.json({ success: true, skills: agentData.skills });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle skill' });
  }
});

app.post('/api/agents/:folder/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    const folder = req.params.folder;
    const agentJsonPath = path.join(OPENCLAW_DIR, 'agents', folder, 'agent.json');
    if (!fs.existsSync(agentJsonPath)) return res.status(404).json({ error: 'Agent not found' });
    
    const agentData = JSON.parse(fs.readFileSync(agentJsonPath, 'utf8'));
    agentData.enabled = enabled;
    fs.writeFileSync(agentJsonPath, JSON.stringify(agentData, null, 2));

    res.json({ success: true, enabled: agentData.enabled });
  } catch {
    res.status(500).json({ error: 'Failed to toggle agent status' });
  }
});

// Skills endpoint
app.get('/api/skills', (req, res) => {
  try {
    const activeSkills = listSkillEntries(SKILLS_DIR);
    const disabledSkills = listSkillEntries(SKILLS_DISABLED_DIR);
    
    res.json({
      active: activeSkills,
      disabled: disabledSkills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read skills' });
  }
});

app.post('/api/skills/toggle', async (req, res) => {
  const { skill, enabled } = req.body;
  if (!skill) return res.status(400).json({ error: 'Skill name required' });
  
  try {
    const activePath = path.join(SKILLS_DIR, skill);
    const disabledPath = path.join(SKILLS_DISABLED_DIR, skill);
    
    if (enabled) {
      // Move from disabled to active
      if (fs.existsSync(disabledPath)) {
        fs.renameSync(disabledPath, activePath);
      } else if (!fs.existsSync(activePath)) { // create dummy if missing
        fs.mkdirSync(activePath, { recursive: true });
        fs.writeFileSync(path.join(activePath, 'SKILL.md'), `# ${skill}\nAuto-generated skill.`);
      }
    } else {
      // Move from active to disabled
      if (fs.existsSync(activePath)) {
        fs.renameSync(activePath, disabledPath);
      }
    }
    
    // Auto-restart gateway to hot-load skill changes globally
    try {
      if (isMac) {
        await execAsync('launchctl stop ai.openclaw.gateway; sleep 1; launchctl start ai.openclaw.gateway');
        console.log(`[SYS] OpenClaw Gateway auto-restarted to apply global skill toggle for ${skill}`);
      }
    } catch (err) {
      console.error('[SYS] Failed to restart gateway:', err);
    }
    
    res.json({ success: true, skill, enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle skill' });
  }
});

// Memory endpoint - pulls directly from Bergen's vector SQLite DB
app.get('/api/memory', async (req, res) => {
  try {
    const memoryDbPath = path.join(OPENCLAW_DIR, 'memory', 'main.sqlite');
    if (!fs.existsSync(memoryDbPath)) {
      return res.json([]);
    }
    const sql = `SELECT updated_at, source, text FROM chunks ORDER BY updated_at DESC LIMIT 50;`;
    const { stdout } = await execFileAsync('sqlite3', [memoryDbPath, '-json', sql]);
    res.json(JSON.parse(stdout || '[]'));
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// Skill Marketplace: Import from URL
app.post('/api/skills/import', async (req, res) => {
  try {
    const { url, name } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });
    
    const skillsDir = path.join(process.cwd(), 'openclaw_data', 'skills');
    const targetDir = path.join(skillsDir, name || path.basename(url, '.git'));
    
    if (fs.existsSync(targetDir)) {
      return res.status(400).json({ error: 'Skill already exists' });
    }

    console.log(`[SYS] Importing skill from: ${url}`);
    // Use git clone via shell
    const { exec } = require('child_process');
    exec(`git clone ${url} "${targetDir}"`, (error: any) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to clone repository' });
      }
      res.json({ success: true, message: 'Skill imported successfully' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Import failed' });
  }
});

// Infrastructure: Tunneling Status
app.get('/api/infra/status', (req, res) => {
  // Mock status for now, will integrate with actual CLI checks in next step
  res.json({
    tunnelActive: false,
    localLLMDetected: false,
    nodes: [
      { id: 'gateway-01', type: 'Primary', status: 'online' }
    ]
  });
});

// Infrastructure: Local LLM Autodiscovery
app.get('/api/infra/local-llm-check', async (req, res) => {
  try {
    const axios = require('axios');
    const ollamaCheck = await axios.get('http://localhost:11434/api/tags').catch(() => null);
    const lmStudioCheck = await axios.get('http://localhost:1234/v1/models').catch(() => null);
    
    res.json({
      ollama: !!ollamaCheck,
      lmStudio: !!lmStudioCheck,
      models: ollamaCheck?.data?.models || [],
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.json({ ollama: false, lmStudio: false });
  }
});

// Voice Commander: Speech-to-Text / Action Bridge
app.post('/api/voice/process', async (req, res) => {
  try {
    const { audioData } = req.body;
    // In a real implementation, this would hit Whisper or OpenAI Realtime
    // For the skeleton, we provide the hook for the customer to plug their key.
    console.log('[VOICE] Received audio payload for processing...');
    res.json({ 
      transcript: "Mission Control, deploy research agent.", 
      action: "DEPLOY_AGENT", 
      target: "Research" 
    });
  } catch (err) {
    res.status(500).json({ error: 'Voice processing failed' });
  }
});

// ROI Analytics: Performance Tracking
app.get('/api/analytics/roi', (req, res) => {
  res.json({
    timeSaved: 142, // hours
    costEfficiency: 88, // %
    taskCompletion: 94, // %
    agentPerformance: [
      { name: 'Lead Architect', score: 98, tasks: 45 },
      { name: 'Sales Agent', score: 82, tasks: 120 },
      { name: 'Researcher', score: 91, tasks: 32 }
    ]
  });
});

// Setup / Config endpoint
app.post('/api/setup', async (req, res) => {
  try {
    const config = req.body;
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Simple key-value replacement in .env
    Object.keys(config).forEach(key => {
      const regex = new RegExp(`^${key}=.*`, 'm');
      const newLine = `${key}=${config[key]}`;
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${key}=${config[key]}`;
      }
    });
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    console.log('[SYS] Configuration updated via Setup Wizard.');
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update configuration.' });
  }
});

// Memory endpoint...
  data: T[];
};

const unsupportedProvider = <T>(reason: string): ProviderResult<T> => ({
  supported: false,
  reason,
  data: []
});

const readProviderData = <T>(name: string): T[] | null => {
  try {
    const filePath = path.join(PROVIDERS_DIR, `${name}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.data)) return raw.data;
    return null;
  } catch (err) {
    console.error(`[SYS] Failed to read provider ${name}:`, err);
    return null;
  }
};

const providerResponse = <T>(data: T[], source: string): ProviderResult<T> & { source: string } => ({
  supported: true,
  data,
  source
});

const requireProviderToken = (req: express.Request, res: express.Response): boolean => {
  if (!PROVIDER_PUSH_TOKEN) {
    res.status(500).json({ error: 'PROVIDER_PUSH_TOKEN not configured' });
    return false;
  }
  const token = req.headers['x-provider-token'];
  console.log(`[DEBUG] Provider Token Check - Name: ${req.params.name}, Header Token: ${token}, Expected: ${PROVIDER_PUSH_TOKEN}`);
  if (!token || token !== PROVIDER_PUSH_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' });
    return false;
  }
  return true;
};

const isValidProviderName = (name: string) => ['calendar', 'reminders', 'files'].includes(name);

app.get('/api/calendar', async (req, res) => {
  const allEvents: any[] = [];
  
  // 1. Fetch file-based events (Centralized/Bridge data)
  const fileData = readProviderData<CalendarProviderItem>('calendar');
  if (fileData) {
    allEvents.push(...fileData.map(ev => ({
      ...ev,
      source: 'central'
    })));
  }

  // 2. Fetch macOS Local events if applicable
  if (isMac) {
    try {
      await execFileAsync('open', ['-a', 'Calendar', '-g']);
      
      const scriptPromise = execFileAsync(path.join(__dirname, '../test_cal'));
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Calendar timeout')), 30000)
      );
      
      const result = await Promise.race([scriptPromise, timeoutPromise]) as any;
      const eventsRaw = result.stdout ? result.stdout.trim() : "";
      
      if (eventsRaw !== "" && eventsRaw !== "ACCESS_DENIED") {
        const macEvents = eventsRaw.split('||').filter((s: string) => s.length > 0).map((eventStr: string) => {
          const parts = eventStr.split('::');
          // Node can parse "MM/DD/YYYY HH:MM:SS AM/PM" reliably
          const startDate = parts[2] ? new Date(parts[2]) : null;
          return {
            title: parts[0] || 'Untitled Event',
            start: (startDate && !isNaN(startDate.getTime())) ? startDate.toISOString() : null,
            source: 'macos'
          };
        });
        allEvents.push(...macEvents);
      }
    } catch (err) {
      console.error('[Calendar] macOS fetch error:', err);
    }
  }

  // Return merged results
  res.json(providerResponse(allEvents, isMac ? 'hybrid' : 'file'));
});

// Reminder endpoint - pulls directly from Apple Reminders via osascript
app.get('/api/reminders', async (req, res) => {
  const allReminders: any[] = [];

  // 1. Fetch file-based reminders (Centralized/Bridge data)
  const fileData = readProviderData<ReminderProviderItem>('reminders');
  if (fileData) {
    allReminders.push(...fileData.map(rem => ({
      ...rem,
      source: 'central'
    })));
  }

  // 2. Fetch macOS Local reminders if applicable
  if (isMac) {
    try {
      await execFileAsync('open', ['-a', 'Reminders', '-g']);

      const script = `
        set remindersStr to ""
        tell application "Reminders"
          set allLists to every list
          repeat with aList in allLists
            try
              set listReminders to (every reminder of aList whose completed is false)
              repeat with aReminder in listReminders
                set dStr to ""
                if (due date of aReminder) is not missing value then
                  set d to due date of aReminder
                  set dStr to (month of d as integer as string) & "/" & (day of d as string) & "/" & (year of d as string) & " " & (time string of d)
                end if
                set remindersStr to remindersStr & (name of aReminder) & "::" & dStr & "||"
              end repeat
            end try
          end repeat
        end tell
        return remindersStr
      `;
      
      const scriptPromise = execFileAsync('osascript', ['-e', script]);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Reminders timeout')), 30000)
      );

      const result = await Promise.race([scriptPromise, timeoutPromise]);
      const remindersRaw = (result as any).stdout.trim();
      
      if (remindersRaw !== "") {
        const macReminders = remindersRaw.split('||').filter((s: string) => s.length > 0).map((remStr: string) => {
          const parts = remStr.split('::');
          const dueDate = (parts[1] && parts[1] !== "missing value" && parts[1] !== "") ? new Date(parts[1]) : null;
          return {
            name: parts[0] || 'Untitled Task',
            dueDate: (dueDate && !isNaN(dueDate.getTime())) ? dueDate.toISOString() : null,
            source: 'macos'
          };
        });
        allReminders.push(...macReminders);
      }
    } catch (err) {
      console.error('[Reminders] macOS fetch error:', err);
    }
  }

  res.json(providerResponse(allReminders, isMac ? 'hybrid' : 'file'));
});


// Files endpoint - search local files
app.get('/api/files', async (req, res) => {
  const query = req.query.q as string;
  if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });
  if (!isMac) {
    const fileData = readProviderData<string>('files');
    if (fileData) {
      const q = query.toLowerCase();
      const filtered = fileData.filter(p => (p || '').toLowerCase().includes(q));
      return res.json(providerResponse(filtered, 'file'));
    }
    return res.json(unsupportedProvider('File search endpoint is only supported on macOS.'));
  }

  try {
    const home = process.env.HOME || process.cwd();
    const roots = ['Documents', 'Downloads', 'Desktop']
      .map(dir => path.join(home, dir))
      .filter(dir => fs.existsSync(dir));
    if (roots.length === 0) return res.json(providerResponse([], 'macos'));
    const args = ['-name', query, ...roots.flatMap(dir => ['-onlyin', dir])];
    const { stdout } = await execFileAsync('mdfind', args);
    const files = stdout.split('\n').filter(Boolean); // Filter out empty strings
    res.json(providerResponse(files, 'macos'));
  } catch (err) {
    console.error(err);
    res.json(unsupportedProvider('Failed to search files.'));
  }
});

// Model endpoints
app.get('/api/model', (req, res) => {
  try {
    const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
    if (!fs.existsSync(configPath)) return res.json({ model: 'Unknown' });
    const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const defaultModel = data.agents?.defaults?.model?.primary || 'google/gemini-2.5-pro';
    res.json({ model: defaultModel });
  } catch {
    res.status(500).json({ error: 'Failed to read model' });
  }
});

app.post('/api/model', (req, res) => {
  try {
    const { model } = req.body || {};
    if (!model) return res.status(400).json({ error: 'Model is required' });
    const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
    const data = readJsonFile<OpenClawConfig>(configPath, {});
    data.agents = data.agents || {};
    data.agents.defaults = data.agents.defaults || {};
    data.agents.defaults.model = data.agents.defaults.model || {};
    data.agents.defaults.model.primary = model;
    writeJsonFile(configPath, data);
    res.json({ model });
  } catch {
    res.status(500).json({ error: 'Failed to update model' });
  }
});

type CronJobRecord = {
  id: string;
  name?: string;
  schedule?: string;
  rawSchedule?: string;
  enabled?: boolean;
  action?: string;
  channel?: string;
  payloadMessage?: string;
  agentId?: string;
  agent?: string;
  systemPrompt?: string;
  timezone?: string;
  status?: 'idle' | 'running' | 'success' | 'error' | 'unknown';
  lastRun?: string;
  lastError?: string;
};

const cronTasks = new Map<string, ReturnType<typeof cron.schedule>>();
let cronEngineReady = false;

const loadCronData = () => readJsonFile<{ jobs: CronJobRecord[] }>(CRON_PATH, { jobs: [] });
const saveCronData = (data: { jobs: CronJobRecord[] }) => writeJsonFile(CRON_PATH, data);

const normalizeSchedule = (input: any) => {
  let scheduleStr = '';
  if (typeof input === 'string') {
    scheduleStr = input.trim();
  } else if (input && typeof input === 'object' && input.expr) {
    scheduleStr = input.expr.trim();
  } else if (input && typeof input === 'object' && input.schedule) {
    // Some nested formats: { schedule: { expr: "..." } }
    return normalizeSchedule(input.schedule);
  } else {
    // If it's something else, try to stringify it or throw
    scheduleStr = String(input || '').trim();
  }

  if (!scheduleStr) throw new Error('Invalid schedule format: empty expression.');

  if (/^\d+$/.test(scheduleStr)) {
    const step = Math.max(1, parseInt(scheduleStr, 10));
    const minutes: number[] = [];
    for (let m = 0; m < 60; m += step) minutes.push(m);
    return `${minutes.join(',')} * * * *`;
  }
  
  const parts = scheduleStr.split(/\s+/);
  // node-cron supports 5 or 6 parts (seconds is first if 6)
  if (parts.length === 5 || parts.length === 6) return scheduleStr;
  throw new Error(`Invalid schedule format: "${scheduleStr}" must be 5 or 6 parts.`);
};

const updateCronJobRecord = (id: string, patch: Partial<CronJobRecord>) => {
  const data = loadCronData();
  const idx = data.jobs.findIndex(j => j.id === id);
  if (idx === -1) return null;
  data.jobs[idx] = { ...data.jobs[idx], ...patch };
  saveCronData(data);
  return data.jobs[idx];
};

const recordCronStatus = (id: string, status: CronJobRecord['status'], lastError?: string) => {
  const now = new Date().toISOString();
  updateCronJobRecord(id, { status, lastRun: now, lastError });
};

const auditTaskWithIrenethel = async (job: CronJobRecord, durationMs: number, status: string) => {
  if (job.agentId === 'irenethel' || job.id.includes('audit')) return; // Avoid recursion

  const agent = job.agentId || "Generic Agent";
  const mission = job.name || job.id;
  
  console.log(`[AUDIT] 👸 Irenethel analyzing task: ${mission} (Agent: ${agent})`);
  
  try {
    // Push the audit request to Irenethel via the Discord Bridge
    await axios.post(`http://localhost:3005/discord/message`, {
      channelId: '1468560847491174535', // #management
      agentId: 'irenethel',
      message: `MISSION COMPLETE: "${mission}"
Agent: ${agent}
Status: ${status}
Duration: ${durationMs}ms

Irenethel, execute your Operations Manager functions:
1. Perform 'Candy Bar' cost translation for this task.
2. Log the execution in the fleet health registry.
3. If Status is ERROR, suggest an immediate architectural fix.
4. Keep it brief and pragmatic (ELI12).`,
      systemPrompt: "You are Irenethel, Operations Manager. You have just been notified of a task completion. Your primary job is to provide financial and operational oversight. Use your 'token_economics_v2' skill to estimate the cost based on the task description and agent role. Deliver a 'Candy Bar' translation. If there was an error, diagnose the most likely infrastructure failure. Be the 'grinder'—quick, efficient, and data-driven."
    });
  } catch (err) {
    console.error(`[AUDIT ERROR] Irenethel failed to audit task ${job.id}:`, err);
  }
};

const executeCronJob = async (job: CronJobRecord) => {
  const startTime = Date.now();
  recordCronStatus(job.id, 'running');
  try {
    if (job.action) {
      let cmd = job.action;
      if (cmd.includes('openclaw agent ask') && !cmd.includes(' -m ') && !cmd.includes(' --message ')) {
        console.log(`[CRON] 🔧 Injecting missing -m flag into command for job ${job.id}`);
        // Robust injection: find the agent name and insert -m after it
        // Pattern: openclaw agent ask [agent-name] "prompt" -> openclaw agent ask [agent-name] -m "prompt"
        const askRegex = /(openclaw agent ask\s+[\w-]+)\s+/;
        if (askRegex.test(cmd)) {
          cmd = cmd.replace(askRegex, '$1 -m ');
        } else {
          // Fallback to simple replacement if pattern doesn't match exactly
          cmd = cmd.replace(/openclaw agent ask\s+/, 'openclaw agent ask -m ');
        }
      }
      
      console.log(`[CRON] 🚀 Executing CLI command for job ${job.id}: "${cmd}"`);
      await execAsync(cmd);
      recordCronStatus(job.id, 'success');
      const duration = Date.now() - startTime;
      await auditTaskWithIrenethel(job, duration, 'SUCCESS');
      return;
    }

    // Handle both Flat and Nested (OpenClaw Native) job structures
    const messagePayload = job.payloadMessage || (job as any).prompt || (job as any).payload?.message;
    
    // Channel detection logic:
    // 1. job.channel.channelId (Mission Control UI format)
    // 2. job.channel (Flat string format)
    // 3. job.delivery.to (OpenClaw Native format)
    let targetChannel = job.channel;
    if (typeof job.channel === 'object') {
      targetChannel = (job.channel as any).channelId || (job.channel as any).to;
    }
    if (!targetChannel && (job as any).delivery?.to) {
      targetChannel = (job as any).delivery.to;
    }

    // System Prompt detection:
    let finalSystemPrompt = job.systemPrompt || (job as any).payload?.systemPrompt;

    // Dynamic variable injection
    // Apply Context Injection
    const processedMessage = injectContext(job, messagePayload);
    finalSystemPrompt = injectContext(job, finalSystemPrompt);

    const agentId = job.agentId || job.agent || "Generic Agent";

    if (processedMessage && targetChannel) {
      
      // 🚀 Offline Resilience: If in Local Mode, also log to a local "Flight Journal"
      if (IS_LOCAL_MODE) {
        const flightJournalPath = path.join(os.homedir(), '.openclaw', 'flight_journal.md');
        const journalEntry = `\n\n### [${new Date().toISOString()}] Job: ${job.name} (#${job.id})\n**Agent**: ${agentId}\n**Channel**: ${targetChannel}\n**Content**:\n${processedMessage}\n---\n`;
        try {
          fs.appendFileSync(flightJournalPath, journalEntry);
          console.log(`[CRON] ✈️ Logged to Flight Journal: ${job.id}`);
        } catch (err) {
          console.error(`[CRON] Failed to write to Flight Journal:`, err);
        }
      }

      try {
        await axios.post(`http://localhost:3005/discord/message`, {
          channelId: targetChannel,
          agentId: agentId,
          message: processedMessage,
          systemPrompt: finalSystemPrompt
        });
      } catch (err) {
        if (IS_LOCAL_MODE) {
          console.log(`[CRON] ✈️ Offline Mode: Discord delivery failed (expected), local journal entry preserved.`);
        } else {
          throw err;
        }
      }
      
      recordCronStatus(job.id, 'success');
      const duration = Date.now() - startTime;
      await auditTaskWithIrenethel(job, duration, 'SUCCESS');
      return;
    }

    recordCronStatus(job.id, 'error', 'Missing action or payloadMessage/channel.');
    const duration = Date.now() - startTime;
    await auditTaskWithIrenethel(job, duration, 'ERROR');
  } catch (error) {
    recordCronStatus(job.id, 'error', getErrorMessage(error));
    const duration = Date.now() - startTime;
    await auditTaskWithIrenethel(job, duration, 'ERROR');
  }
};

const rebuildCronTasks = () => {
  if (!cronTasks) return;
  cronTasks.forEach(task => task.stop());
  cronTasks.clear();
  
  const data = loadCronData();
  if (!data || !Array.isArray(data.jobs)) {
    console.warn("[CRON] No valid jobs found to schedule.");
    return;
  }

  // 🧹 De-duplicate jobs by ID to prevent ghost tasks and noise
  const uniqueJobs = new Map<string, CronJobRecord>();
  data.jobs.forEach(job => {
    if (!job || !job.id) return;
    // Prefer enabled jobs if duplicates exist
    if (!uniqueJobs.has(job.id) || (job.enabled && !uniqueJobs.get(job.id)?.enabled)) {
      uniqueJobs.set(job.id, job);
    }
  });

  const jobsToSchedule = Array.from(uniqueJobs.values());
  
  // If we cleaned up duplicates, save the clean state back to disk
  if (jobsToSchedule.length !== data.jobs.length) {
    console.log(`[CRON] 🧹 Cleaned up ${data.jobs.length - jobsToSchedule.length} duplicate job entries from jobs.json`);
    saveCronData({ jobs: jobsToSchedule });
  }

  jobsToSchedule.forEach(job => {
    if (job.enabled === false) return;
    if (!job.schedule) return;
    
    try {
      // Handle schedule as string or OpenClaw native object { expr, tz }
      let scheduleExpr = normalizeSchedule(job.schedule);
      const timezone = job.timezone || (job.schedule as any).tz || "America/New_York";
      
      console.log(`[CRON] 🗓️ Scheduling: ${job.name || job.id} [${scheduleExpr}]`);
      const task = cron.schedule(scheduleExpr, () => {
        executeCronJob(job).catch(e => console.error(`[CRON] Fatal runtime error in ${job.id}:`, e));
      }, { timezone });
      
      cronTasks.set(job.id, task);
      
      if (job.lastError === 'Invalid cron schedule') {
        updateCronJobRecord(job.id, { lastError: undefined });
      }
    } catch (err) {
      console.error(`[CRON] ❌ Failed to schedule job ${job.id} ("${job.name}"):`, getErrorMessage(err));
      recordCronStatus(job.id, 'error', 'Invalid cron schedule');
    }
  });
  cronEngineReady = true;
};

// Cron endpoints
app.get('/api/cron', (req, res) => {
  try {
    const data = loadCronData();
    const jobs = (data.jobs || []).map(j => {
      // 1. Resolve Schedule String
      let scheduleStr = 'cron';
      if (typeof j.schedule === 'string') {
        scheduleStr = j.schedule;
      } else if (j.schedule && (j.schedule as any).expr) {
        scheduleStr = (j.schedule as any).expr;
      }

      // 2. Resolve Channel/Uplink
      let uplink = 'n/a';
      if (typeof j.channel === 'string') {
        uplink = j.channel;
      } else if (j.channel && (j.channel as any).channelId) {
        uplink = (j.channel as any).channelId;
      } else if ((j as any).delivery && (j as any).delivery.to) {
        uplink = (j as any).delivery.to;
      }

      // 3. Resolve Payload/Prompt
      const payload = j.payloadMessage || (j as any).prompt || (j as any).payload?.message || '';

      // 4. Resolve System Prompt
      const sysPrompt = j.systemPrompt || (j as any).payload?.systemPrompt || '';

      // 5. Resolve Agent ID
      const agent = j.agentId || j.agent || '';

      return {
        id: j.id,
        name: j.name || 'Unnamed',
        enabled: j.enabled !== false,
        schedule: scheduleStr,
        rawSchedule: scheduleStr,
        channel: uplink,
        payloadMessage: payload,
        action: j.action || '',
        agentId: agent,
        systemPrompt: sysPrompt,
        status: j.status || 'unknown',
        lastRun: j.lastRun || 'Never'
      };
    });
    res.json({ jobs });
  } catch (err) {
    console.error('[API] Error in /api/cron:', err);
    res.status(500).json({ error: 'Failed to fetch cron jobs' });
  }
});

// Mock user store (In production, move to DB)
// Definitions moved to top

app.get('/api/auth/session', (req, res) => {
  res.json({ user: (req.session as any).user || null });
});

// 2FA Setup - Generates a new secret and returns QR code
app.get('/api/security/2fa/setup', async (req, res) => {
  try {
    console.log('[DEBUG] speakeasy object:', typeof speakeasy, speakeasy ? Object.keys(speakeasy) : 'null');
    const secretData = speakeasy.generateSecret({ name: 'Mission Control Hub (sterry973@gmail.com)' });
    const secret = secretData.base32;
    const otpauth = secretData.otpauth_url || '';
    const qrCodeUrl = await qrcode.toDataURL(otpauth);
    
    // Store temporarily until verified
    (req.session as any).tempSecret = secret;
    
    res.json({ qrCodeUrl, secret });
  } catch (err) {
    console.error('[2FA Setup Error]:', err);
    res.status(500).json({ error: 'Failed to generate 2FA setup' });
  }
});

// 2FA Verify & Enable
app.post('/api/security/2fa/enable', (req, res) => {
  const { token } = req.body;
  const secret = (req.session as any).tempSecret;
  
  if (!secret) return res.status(400).json({ error: 'No setup session found' });
  
  const isValid = speakeasy.totp.verify({ secret, encoding: 'base32', token });
  if (isValid) {
    COMMANDER_2FA_SECRET = secret;
    IS_2FA_ENABLED = true;
    saveSecurity();
    delete (req.session as any).tempSecret;
    res.json({ success: true, message: '2FA Enabled Successfully' });
  } else {
    res.status(400).json({ error: 'Invalid verification code' });
  }
});

// 2FA Disable
app.post('/api/security/2fa/disable', (req, res) => {
  IS_2FA_ENABLED = false;
  COMMANDER_2FA_SECRET = '';
  saveSecurity();
  res.json({ success: true, message: '2FA Disabled' });
});

// --- Local Mode Toggle ---
app.get('/api/config/local-mode', authenticate, (req, res) => {
  res.json({ localMode: IS_LOCAL_MODE });
});

app.post('/api/config/local-mode', authenticate, async (req, res) => {
  const { enabled } = req.body;
  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'Boolean "enabled" required' });
  }
  
  IS_LOCAL_MODE = enabled;
  saveSecurity();
  
  console.log(`[SYS] ✈️ Local Mode ${IS_LOCAL_MODE ? 'ENABLED' : 'DISABLED'}. Re-routing agents...`);
  
  try {
    // Re-route agents by modifying their agent.json files
    const agentsDir = path.join(OPENCLAW_DIR, 'agents');
    if (fs.existsSync(agentsDir)) {
      const folders = fs.readdirSync(agentsDir).filter(f => !f.startsWith('.'));
      for (const folder of folders) {
        const agentJsonPath = path.join(agentsDir, folder, 'agent.json');
        if (fs.existsSync(agentJsonPath)) {
          const agentData = readJsonFile<any>(agentJsonPath, null);
          if (agentData && agentData.model) {
            if (IS_LOCAL_MODE) {
              // Backup original model if not already backed up
              if (!agentData._cloudModel) agentData._cloudModel = agentData.model.primary;
              agentData.model.primary = 'ollama/deepseek-r1:14b';
            } else {
              // Restore cloud model
              if (agentData._cloudModel) {
                agentData.model.primary = agentData._cloudModel;
                // We keep the backup field so we can toggle back and forth
              }
            }
            writeJsonFile(agentJsonPath, agentData);
          }
        }
      }
    }
    
    // Also update global defaults in openclaw.json
    const configPath = path.join(OPENCLAW_DIR, 'openclaw.json');
    if (fs.existsSync(configPath)) {
      const config = readJsonFile<any>(configPath, {});
      if (!config.agents) config.agents = {};
      if (!config.agents.defaults) config.agents.defaults = {};
      if (!config.agents.defaults.model) config.agents.defaults.model = {};
      
      if (IS_LOCAL_MODE) {
        if (!config.agents.defaults.model._cloudPrimary) {
           config.agents.defaults.model._cloudPrimary = config.agents.defaults.model.primary || 'google/gemini-2.5-pro';
        }
        config.agents.defaults.model.primary = 'ollama/deepseek-r1:14b';
      } else if (config.agents.defaults.model._cloudPrimary) {
        config.agents.defaults.model.primary = config.agents.defaults.model._cloudPrimary;
      }
      writeJsonFile(configPath, config);
    }

    // Restart gateway to apply changes
    if (isMac) {
      execCb('launchctl stop ai.openclaw.gateway; sleep 1; launchctl start ai.openclaw.gateway');
    }

    res.json({ success: true, localMode: IS_LOCAL_MODE });
  } catch (err) {
    console.error('[SYS] Failed to apply local mode:', err);
    res.status(500).json({ error: 'Failed to apply local mode configuration' });
  }
});

app.get('/api/security/stats', (req, res) => {
  res.json({
    firewall: 'ACTIVE',
    tailscale: 'CONNECTED',
    encryption: 'AES-256-GCM',
    mfa: IS_2FA_ENABLED ? 'ENABLED (AUTHENTICATOR)' : 'DISABLED (BYPASS ACTIVE)',
    lastAudit: new Date().toISOString(),
    whitelistEntries: 3,
    activeThreats: 0,
    mfaEnabled: IS_2FA_ENABLED
  });
});

app.get('/api/security/logs', (req, res) => {
  res.json([
    { event: 'Authorized Dashboard Login', ip: '172.69.134.12', time: '10 mins ago', status: 'SUCCESS' },
    { event: 'Tailscale Node Handshake', ip: 'iphone172.local', time: '14 mins ago', status: 'GRANTED' },
    { event: 'Cron Job Execution Burst', ip: '127.0.0.1', time: '30 mins ago', status: 'SUCCESS' },
    { event: 'Failed Root SSH Attempt', ip: '185.22.154.21', time: '2 hours ago', status: 'BLOCKED' }
  ]);
});

app.get('/api/cron/status', (req, res) => {
  res.json({ status: cronEngineReady ? 'ONLINE' : 'OFFLINE', activeJobs: cronTasks.size });
});

app.post('/api/cron', (req, res) => {
  try {
    const body = req.body || {};
    const normalized = normalizeSchedule(body.schedule || '');
    const newJob: CronJobRecord = {
      id: body.id || Math.random().toString(36).slice(2, 11),
      name: body.name || 'Unnamed Job',
      enabled: body.enabled !== false,
      schedule: normalized,
      rawSchedule: normalized,
      action: body.action || '',
      channel: body.channel || '',
      payloadMessage: body.payloadMessage || '',
      agentId: body.agentId || '',
      systemPrompt: body.systemPrompt || '',
      status: 'idle',
      lastRun: 'Never'
    };
    const data = loadCronData();
    data.jobs.push(newJob);
    saveCronData(data);
    rebuildCronTasks();
    res.json(newJob);
  } catch (err) {
    res.status(400).json({ error: getErrorMessage(err) || 'Failed to add job' });
  }
});

app.put('/api/cron/:id', (req, res) => {
  try {
    const body = req.body || {};
    const patch: Partial<CronJobRecord> = {};
    if (body.name !== undefined) patch.name = body.name;
    if (body.enabled !== undefined) patch.enabled = body.enabled;
    if (body.schedule !== undefined) {
      const normalized = normalizeSchedule(body.schedule);
      patch.schedule = normalized;
      patch.rawSchedule = normalized;
    }
    if (body.channel !== undefined) patch.channel = body.channel;
    if (body.payloadMessage !== undefined) patch.payloadMessage = body.payloadMessage;
    if (body.action !== undefined) patch.action = body.action;
    if (body.agentId !== undefined) patch.agentId = body.agentId;
    if (body.systemPrompt !== undefined) patch.systemPrompt = body.systemPrompt;

    const updated = updateCronJobRecord(req.params.id, patch);
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    rebuildCronTasks();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: getErrorMessage(err) || 'Failed to update job' });
  }
});

app.put('/api/cron/:id/toggle', (req, res) => {
  try {
    const updated = updateCronJobRecord(req.params.id, { enabled: !!req.body.enabled });
    if (!updated) return res.status(404).json({ error: 'Job not found' });
    rebuildCronTasks();
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Toggle failed' });
  }
});

app.delete('/api/cron/:id', (req, res) => {
  try {
    const data = loadCronData();
    data.jobs = data.jobs.filter(j => j.id !== req.params.id);
    saveCronData(data);
    rebuildCronTasks();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.post('/api/cron/:id/run', async (req, res) => {
  try {
    const data = loadCronData();
    const job = data.jobs.find(j => j.id === req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    console.log(`[CRON] ⚡ Manual trigger for job: ${job.id} (${job.name})`);
    // We run it asynchronously so the request doesn't hang if the job is slow
    executeCronJob(job).catch(err => console.error(`[CRON] Manual run failed for ${job.id}:`, err));
    
    res.json({ success: true, message: 'Job execution triggered' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to trigger job' });
  }
});

app.get('/api/nodes', async (req, res) => {
  const KNOWN_NODES = [
    {
      id: 'macbook-pro-local',
      displayName: "Sean's MacBook Pro",
      platform: 'darwin',
      role: 'PRIMARY',
      icon: '💻',
      url: 'http://localhost:18789',
      gatewayHost: 'localhost',
      gatewayPort: 18788,
      isLocal: true,
      description: 'Main compute node — runs Bergen, all cron jobs, and Mission Control',
    },
    {
      id: 'pixel-fold-remote',
      displayName: 'Google Pixel Fold',
      platform: 'android',
      role: 'MOBILE',
      icon: '📱',
      url: 'ws://pixel-fold.local:18789',
      gatewayHost: 'pixel-fold.local',
      gatewayPort: 18788,
      isLocal: false,
      description: 'Mobile node — OpenClaw on Android, on-the-go access and monitoring',
    },
    {
      id: 'iphone-172-visionclaw',
      displayName: 'iPhone 17.2 (VisionClaw)',
      platform: 'ios',
      role: 'VISION / WEARABLE',
      icon: '🕶️',
      url: 'ws://iphone172.local:18789',
      gatewayHost: 'iphone172.local',
      gatewayPort: 18788,
      isLocal: false,
      description: 'Wearable node — Meta 2 Wayfarer bridge for audio & vision tasks',
    },
    {
      id: 'gcp-failover',
      displayName: 'Google Cloud (Failover)',
      platform: 'linux',
      role: 'CLOUD BACKUP',
      icon: '☁️',
      url: 'http://gateway.nak3deye.com:18789',
      gatewayHost: 'gateway.nak3deye.com',
      gatewayPort: 18788,
      isLocal: false,
      description: 'Always-on cloud failover — keeps Bergen alive if Mac shuts down',
    },
  ];

  // Read paired nodes from file
  const pairedPath = path.join(os.homedir(), '.openclaw', 'nodes', 'paired.json');
  let paired: any = {};
  try { paired = JSON.parse(fs.readFileSync(pairedPath, 'utf8')); } catch {}

  // Ping a node to get latency + status
  const pingNode = async (url: string): Promise<{ online: boolean; latencyMs?: number }> => {
    const start = Date.now();
    try {
      await axios.get(url.replace('ws://', 'http://').replace('wss://', 'https://').split('/').slice(0, 3).join('/') + '/api/status', { timeout: 3000 });
      return { online: true, latencyMs: Date.now() - start };
    } catch {
      // Try health endpoint
      try {
        await axios.get(url.replace('ws://', 'http://').replace('wss://', 'https://').split('/').slice(0, 3).join('/'), { timeout: 2500 });
        return { online: true, latencyMs: Date.now() - start };
      } catch {
        return { online: false };
      }
    }
  };

  // Build combined node list
  const pairedArr = Object.values(paired).map((p: any) => ({
    id: p.nodeId || p.requestId,
    displayName: p.displayName || 'Remote Node',
    platform: p.platform || 'unknown',
    role: 'PAIRED',
    icon: '🔗',
    url: `ws://${p.host || 'unknown'}:${p.port || 18788}`,
    gatewayHost: p.host || 'unknown',
    gatewayPort: p.port || 18788,
    isLocal: false,
    description: `Paired node — ${p.caps?.join(', ') || 'unknown caps'}`,
    version: p.version,
    caps: p.caps,
  }));

  // Merge: known first, then any extra paired not already in known
  const knownIds = new Set(KNOWN_NODES.map(n => n.id));
  const extraPaired = pairedArr.filter((p: any) => !knownIds.has(p.id));
  const all = [...KNOWN_NODES, ...extraPaired];

  // Ping all in parallel
  const results = await Promise.all(all.map(async node => {
    const { online, latencyMs } = await pingNode(node.url);
    return {
      ...node,
      status: online ? 'online' : (node.isLocal ? 'online' : 'offline'), // local Mac always online
      latencyMs: node.isLocal ? 0 : latencyMs,
    };
  }));

  // Force local MacBook online (it IS running since we got this response)
  const final = results.map(n => n.id === 'macbook-pro-local' ? { ...n, status: 'online', latencyMs: 0 } : n);
  res.json(final);
});


app.get('/api/integrations', (req, res) => {
  const data = readJsonFile<{ links?: Record<string, boolean>; tokens?: Record<string, string> }>(INTEGRATIONS_PATH, {});
  const links = data.links || {};
  const tokens = data.tokens || {};
  const active = Object.fromEntries(Object.keys(tokens).map(k => [k, true]));
  res.json({ ...links, ...active });
});

app.post('/api/integrations/save', (req, res) => {
  const { provider, key } = req.body || {};
  if (!provider || !key) return res.status(400).json({ error: 'provider and key are required' });
  const data = readJsonFile<{ links?: Record<string, boolean>; tokens?: Record<string, string> }>(INTEGRATIONS_PATH, {});
  data.tokens = data.tokens || {};
  data.links = data.links || {};
  data.tokens[provider] = key;
  data.links[provider] = true;
  writeJsonFile(INTEGRATIONS_PATH, data);
  res.json({ success: true });
});

app.get('/api/approvals', (req, res) => {
  const data = readJsonFile<{ approvals: ApprovalRecord[] }>(APPROVALS_PATH, { approvals: [] });
  res.json(data.approvals || []);
});

app.post('/api/approvals/:id', (req, res) => {
  const { action } = req.body || {};
  const data = readJsonFile<{ approvals: ApprovalRecord[] }>(APPROVALS_PATH, { approvals: [] });
  const idx = data.approvals.findIndex(a => a.id === req.params.id);
  if (idx !== -1 && action) {
    data.approvals[idx].status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : data.approvals[idx].status;
    writeJsonFile(APPROVALS_PATH, data);
  }
  res.json({ success: true });
});

// Provider bridge endpoints (cross-platform)
app.get('/api/providers', (req, res) => {
  const list = ['calendar', 'reminders', 'files'].map(name => {
    const filePath = path.join(PROVIDERS_DIR, `${name}.json`);
    return { name, available: fs.existsSync(filePath) };
  });
  res.json({ providers: list });
});

app.post('/api/providers/:name', (req, res) => {
  if (!requireProviderToken(req, res)) return;
  const name = req.params.name;
  if (!isValidProviderName(name)) return res.status(400).json({ error: 'Invalid provider name' });
  if (!Array.isArray(req.body)) return res.status(400).json({ error: 'Body must be a JSON array' });
  ensureDir(PROVIDERS_DIR);
  const filePath = path.join(PROVIDERS_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
  res.json({ success: true, count: req.body.length });
});

// ── Fleet Health Endpoint ──────────────────────────────────────────────────────
app.get('/api/fleet/health', async (req, res) => {
  try {
    // 1. Parse jobs.json robustly
    const rawJobs = fs.readFileSync(CRON_PATH, 'utf8');
    let allJobs: any[] = [];
    try {
      const parsed = JSON.parse(rawJobs);
      allJobs = Array.isArray(parsed) ? parsed : (parsed.jobs || []);
    } catch {
      // File corrupted at end — scan backwards for valid JSON
      const arrStart = rawJobs.indexOf('"jobs"');
      const bracketStart = rawJobs.indexOf('[', arrStart);
      for (let i = rawJobs.length - 1; i > bracketStart; i--) {
        try { allJobs = JSON.parse(rawJobs.slice(bracketStart, i + 1)); break; } catch {}
      }
    }

    // 2. Read last 200 lines of discord-bot log for recent errors
    let botLogLines: string[] = [];
    const botLog = '/Users/rizzolini/.openclaw/logs/discord-bot.log';
    const botErrLog = '/Users/rizzolini/.openclaw/logs/discord-bot-err.log';
    try {
      const { stdout } = await execAsync(`tail -n 200 "${botLog}" 2>/dev/null; tail -n 100 "${botErrLog}" 2>/dev/null`);
      botLogLines = stdout.split('\n').filter(Boolean);
    } catch {}

    // 3. Parse recent discord errors from log
    const discordErrors: Record<string, string> = {};
    const recentFires: Record<string, string> = {};
    botLogLines.forEach(line => {
      const errMatch = line.match(/\[SCHEDULER\]\s*\[ERROR\]\s*(#[\w-]+):\s*(.+)/);
      if (errMatch) discordErrors[errMatch[1]] = errMatch[2].slice(0, 100);
      const fireMatch = line.match(/\[SCHEDULER\]\s*🔥\s*Firing:\s*(#[\w-]+)/);
      if (fireMatch) recentFires[fireMatch[1]] = line.slice(0, 30);
    });

    // 4. Build per-job health report
    const enabled = allJobs.filter((j: any) => j.enabled !== false);
    const report = enabled.map((j: any) => {
      const rawSched = typeof j.schedule === 'string' ? j.schedule : (j.schedule as any)?.expr || '';
      const channel = typeof j.channel === 'string' ? j.channel
        : (j.channel as any)?.channelId || (j as any).delivery?.to || '';
      const agentId = j.agentId || j.agent || (j as any).delivery?.agentId || '';
      const lastRun = j.lastRun || 'Never';
      const status = j.status || 'unknown';
      const lastError = j.lastError || '';

      // Compute minutes since last run
      let minutesSince: number | null = null;
      if (lastRun && lastRun !== 'Never') {
        minutesSince = Math.floor((Date.now() - new Date(lastRun).getTime()) / 60000);
      }

      // Health classification
      let health: 'ok' | 'warn' | 'error' | 'unknown' = 'unknown';
      if (status === 'success') health = 'ok';
      else if (status === 'error') health = 'error';
      else if (status === 'running') health = 'warn';
      if (!channel) health = 'error';

      return {
        id: j.id,
        name: j.name || 'Unnamed',
        agentId,
        schedule: rawSched,
        channel,
        status,
        health,
        lastRun,
        minutesSince,
        lastError: lastError.slice(0, 120),
      };
    });

    // 5. Summary stats
    const ok = report.filter((r: any) => r.health === 'ok').length;
    const errors = report.filter((r: any) => r.health === 'error').length;
    const warn = report.filter((r: any) => r.health === 'warn').length;
    const unknown = report.filter((r: any) => r.health === 'unknown').length;

    res.json({
      summary: { total: report.length, ok, errors, warn, unknown },
      jobs: report,
      discordErrors,
      recentFires,
      auditedAt: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// POST /api/dispatcher/mission - The Swarm Dispatcher
app.post('/api/dispatcher/mission', async (req, res) => {
  try {
    const { mission, swarmCount = 5, useKimi = false } = req.body;
    console.log(`🚀 Dispatching Swarm Mission: "${mission}" (Agents: ${swarmCount}, Kimi: ${useKimi})`);

    // In a real swarm, we would decompose here. 
    // For now, we ping Bergen as the primary commander to start the mission.
    const result = await axios.post('http://localhost:3005/discord/message', {
      channelId: '1476117067114610794', // #ceo-desk
      agentId: 'bergen',
      message: `SWARM MISSION START: ${mission}. 
                Parameters: Agents=${swarmCount}, IntelligenceEngine=${useKimi ? 'Kimi-K2.6-HighSpawn' : 'Gemini-1.5-Pro'}.
                Decompose into parallel sub-tasks and execute across available nodes. 
                Activate ${useKimi ? 'Swarm Intensity Level 3 (300 Parallel Tools)' : 'Standard Orchestration'}.
                Provide a unified report in Mission Control.`
    });
    
    // Audit the swarm launch
    await auditTaskWithIrenethel({ id: 'swarm-mission', name: `Swarm: ${mission}`, agentId: 'bergen' } as any, 0, 'LAUNCHED');

    // Deeper decomposition for Kimi
    let threads = [
      { id: 1, name: 'Discord Audit & Telemetry', status: 'RUNNING' },
      { id: 2, name: 'EWS Scanner (Multithreaded)', status: 'RUNNING' },
      { id: 3, name: 'VisionClaw Pivot Strategy', status: 'PENDING' },
      { id: 4, name: 'GCP Infrastructure Health', status: 'COMPLETED' },
      { id: 5, name: 'Supabase Data Integrity', status: 'RUNNING' }
    ];

    if (useKimi) {
       threads = [
         ...threads,
         { id: 6, name: 'Kimi Orchestration Node Alpha', status: 'ACTIVE' },
         { id: 7, name: 'Parallel Tool Dispatch (Batch 1-50)', status: 'ACTIVE' },
         { id: 8, name: 'Parallel Tool Dispatch (Batch 51-100)', status: 'ACTIVE' },
         { id: 9, name: 'Global Intelligence Merge', status: 'PENDING' }
       ];
    }

    res.json({ success: true, missionId: Date.now(), response: result.data, threads });
  } catch (err) {
    res.status(500).json({ error: 'Failed to launch swarm mission', hint: 'Is the Discord bot running on port 3005?' });
  }
});

// POST /api/chat/message - Send direct commands to agents
app.post('/api/chat/message', authenticate, async (req, res) => {
  try {
    const { agentId, message } = req.body;
    console.log(`[CHAT] Command to ${agentId}: ${message}`);

    // 🚀 Local Routing: Log to flight journal and agent folder
    if (IS_LOCAL_MODE) {
      const flightJournalPath = path.join(os.homedir(), '.openclaw', 'flight_journal.md');
      const entry = `\n\n### [${new Date().toISOString()}] USER COMMAND -> ${agentId}\n${message}\n---\n`;
      fs.appendFileSync(flightJournalPath, entry);
      
      const hqPath = path.join(os.homedir(), 'Gemini', 'antigravity', 'scratch', 'Agent HQ', 'Mission-Control-HQ');
      const folderMap: any = {
        'bergen': 'ceo-desk'
      };
      const folder = folderMap[agentId.toLowerCase()] || 'general';
      const dest = path.join(hqPath, folder, 'commands.md');
      if (fs.existsSync(path.dirname(dest))) {
        fs.appendFileSync(dest, `\n\n> [${new Date().toLocaleTimeString()}] COMMAND: ${message}\n`);
      }
    }

    // Try sending to the Discord bridge (will handle local Ollama if bridge is local)
    const result = await axios.post('http://localhost:3005/discord/message', {
      channelId: '1476117067114610794', // #ceo-desk
      agentId: agentId || 'bergen',
      message: message
    });

    res.json({ success: true, response: result.data });
  } catch (err) {
    if (IS_LOCAL_MODE) {
      // In local mode, we don't treat bridge failure as a hard error for the UI
      res.json({ success: true, status: 'logged-locally', note: 'Offline: Logged to journal and agent folder.' });
    } else {
      res.status(500).json({ error: 'Bridge unreachable', hint: 'Is the Discord bot running on port 3005?' });
    }
  }
});

// POST /api/fleet/run-auditor — fires the internal auditor agent via Bergen
app.post('/api/fleet/run-auditor', async (req, res) => {
  try {
    const result = await axios.post('http://localhost:3005/discord/message', {
      channelId: '1468560847491174535', // #auditor channel
      agentId: 'nak3d-eye-internal-auditor',
      message: `Fleet Health Audit — ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}. Scan ~/.openclaw/cron/jobs.json for error-status jobs. Check ~/.openclaw/logs/ for discord failures. Identify root causes. Report findings in a structured table: Agent | Status | Last Run | Issue | Suggested Fix. ELI13 tone. Be specific about model errors, missing channels, and rate limits.`
    });
    res.json({ success: true, response: result.data });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err), hint: 'Is the Discord bot running on port 3005?' });
  }
});
// ────────────────────────────────────────────────────────────────────────────────

// ── PM2 Management Endpoints ─────────────────────────────────────────────────
const PM2_BIN = '/usr/local/bin/pm2';
const MC_ROOT = path.resolve(__dirname, '..');  // MissionControlHub root
const EXEC_DIR = path.dirname(process.execPath);
const STD_PATH = `${EXEC_DIR}:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin`;

// POST /api/pm2/rebuild — builds frontend then restarts mission-backend
app.post('/api/pm2/rebuild', async (req, res) => {
  const { restart = true } = req.body || {};
  const env = { ...process.env, PATH: STD_PATH, HOME: '/Users/rizzolini' };
  let log = '';
  const ts = () => `[${new Date().toLocaleTimeString()}] `;

  try {
    // Step 1: npm run build
    log += `${ts()}▶ Starting frontend build in ${MC_ROOT}...\n`;
    const { stdout: buildOut, stderr: buildErr } = await execAsync(
      `cd "${MC_ROOT}" && /usr/local/bin/npm run build 2>&1`,
      { env, timeout: 120000 }
    );
    log += buildOut || buildErr || '(no output)';
    log += `\n${ts()}✅ Build complete.\n`;

    // Step 2: restart mission-backend
    if (restart) {
      log += `\n${ts()}▶ Restarting mission-backend...\n`;
      const { stdout: restartOut } = await execAsync(`${PM2_BIN} restart mission-backend`, { env, timeout: 15000 });
      log += restartOut || '(restarted)';
      log += `\n${ts()}✅ mission-backend restarted. New UI is live — refresh your browser.\n`;
    }

    res.json({ success: true, log });
  } catch (err: any) {
    log += `\n${ts()}❌ Error: ${err.message || err}\n`;
    if (err.stdout) log += err.stdout;
    if (err.stderr) log += err.stderr;
    res.status(500).json({ success: false, log, error: getErrorMessage(err) });
  }
});

// GET /api/pm2/status — returns pm2 process list as JSON
app.get('/api/pm2/status', async (req, res) => {
  try {
    const { stdout } = await execAsync(`${PM2_BIN} jlist`, {
      env: { ...process.env, PATH: STD_PATH }
    });
    const processes = JSON.parse(stdout || '[]');
    const summary = processes.map((p: any) => ({
      id: p.pm_id,
      name: p.name,
      status: p.pm2_env?.status || 'unknown',
      uptime: p.pm2_env?.pm_uptime ? Date.now() - p.pm2_env.pm_uptime : null,
      restarts: p.pm2_env?.restart_time || 0,
      memory: p.monit?.memory || 0,
      cpu: p.monit?.cpu || 0,
      pid: p.pid || null,
    }));
    res.json({ processes: summary });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// GET /api/pm2/logs?name=mission-backend&lines=100 — returns recent log lines
app.get('/api/pm2/logs', async (req, res) => {
  const name = (req.query.name as string) || 'mission-backend';
  const lines = Math.min(parseInt((req.query.lines as string) || '80', 10), 300);
  try {
    // Read from the log file written by pm2
    const logFile = `/Users/rizzolini/.openclaw/logs/${name}.log`;
    const errFile = `/Users/rizzolini/.openclaw/logs/${name}-err.log`;
    let output = '';

    const readTail = async (file: string) => {
      if (!fs.existsSync(file)) return '';
      const { stdout } = await execAsync(`tail -n ${lines} "${file}"`);
      return stdout;
    };

    const [out, err] = await Promise.all([readTail(logFile), readTail(errFile)]);

    // Interleave and label
    const outLines = out.split('\n').filter(Boolean).map((l: string) => `[OUT] ${l}`);
    const errLines = err.split('\n').filter(Boolean).map((l: string) => `[ERR] ${l}`);
    output = [...outLines, ...errLines]
      .sort((a, b) => a.localeCompare(b))
      .slice(-lines)
      .join('\n');

    if (!output) output = `No logs yet for "${name}". Process may be starting up.`;
    res.json({ name, lines: output });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// POST /api/pm2/restart — restarts a named pm2 process
app.post('/api/pm2/restart', async (req, res) => {
  const { name = 'mission-backend' } = req.body || {};
  const allowed = ['mission-backend', 'discord-bot', 'all'];
  if (!allowed.includes(name)) {
    return res.status(400).json({ error: `Invalid process name. Allowed: ${allowed.join(', ')}` });
  }
  try {
    const { stdout } = await execAsync(`${PM2_BIN} restart ${name}`, {
      env: { ...process.env, PATH: STD_PATH }
    });
    res.json({ success: true, output: stdout.trim() });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// POST /api/pm2/save — saves current pm2 process list so it survives reboot
app.post('/api/pm2/save', async (req, res) => {
  try {
    const { stdout } = await execAsync(`${PM2_BIN} save`, {
      env: { ...process.env, PATH: STD_PATH }
    });
    res.json({ success: true, output: stdout.trim() });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// GET /api/system-usage — returns raw OS hardware telemetry
app.get('/api/system-usage', async (req, res) => {
  try {
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const memUsage = totalMem > 0 ? (usedMem / totalMem) * 100 : 0;

    const cpus = os.cpus();
    const cpuCount = cpus.length;
    const loadAvg = os.loadavg();

    let diskUsage = { size: 'N/A', used: 'N/A', avail: 'N/A', usage: '0%' };
    try {
      const { stdout } = await execAsync('df -h /');
      const lines = stdout.trim().split('\n');
      if (lines.length >= 2) {
        const parts = lines[1].replace(/\s+/g, ' ').split(' ');
        if (parts.length >= 5) {
          diskUsage = {
            size: parts[1],
            used: parts[2],
            avail: parts[3],
            usage: parts[4],
          };
        }
      }
    } catch (e) {
      // ignore
    }

    res.json({
      memory: {
        free: freeMem,
        total: totalMem,
        used: usedMem,
        usage: memUsage.toFixed(1),
      },
      cpu: {
        count: cpuCount,
        load: loadAvg.map(l => l.toFixed(2)),
        model: cpus[0]?.model || 'Unknown',
      },
      disk: diskUsage,
      platform: os.platform(),
      uptime: os.uptime(),
    });
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) });
  }
});

// ─────────────────────────────────────────────────────────────────────────────


// React Router Fallback
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(DIST_PATH, 'index.html'));
});

// Status and Monitoring Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    version: 'ABNJ01',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    node: 'mission-control-primary'
  });
});

app.post('/api/local-agents', (req, res) => {
  // This endpoint receives agent status updates from local nodes/gateways
  const { agents = [] } = req.body || {};
  console.log(`[TELEMETRY] Received status update for ${agents.length} agents.`);
  // In a future update, we can store this in a database or memory-cache for the dashboard
  res.json({ success: true, received: agents.length });
});

// Core utilities
const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_URL = process.env.API_URL || "https://gateway.nak3deye.com";
const GATEWAY_URL = process.env.GATEWAY_URL || "https://gateway.nak3deye.com";

async function sendAgentStatus() {
  if (!DISCORD_BOT_TOKEN) {
    console.log("Discord bot token not configured. Skipping agent status update.");
    return;
  }

  try {
    const coreAgents = readOpenClawConfig().agents?.list || [];
    const subAgents = readSubAgents(false);
    // Combine core and sub-agents
    const allAgents = [...coreAgents, ...subAgents];
    
    // Extract relevant data for the gateway
    const agentStatuses = allAgents.map(agent => ({
      id: agent.id || agent.name, // Use id if available, fallback to name
      name: agent.name,
      description: agent.description || "No description provided.",
      enabled: agent.enabled !== false, // Default to true if not specified
      lastHeartbeat: new Date().toISOString()
    }));

    await axios.post(`${GATEWAY_URL}/api/local-agents`, {
      token: DISCORD_BOT_TOKEN, // Use bot token for authentication
      agents: agentStatuses
    });
    console.log("[STATUS] Agent status sent to gateway.");
  } catch (error) {
    console.error("[STATUS] Failed to send agent status to gateway:", getErrorMessage(error));
  }
}

async function initializeCronEngine() {
  console.log("⚙️ Booting Mission Control Cron Engine...");
  rebuildCronTasks();
  console.log(`✅ Mission Control Cron Engine booted successfully. Active jobs: ${cronTasks.size}`);
}


// Start the server
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Mission Control backend running on port ${PORT}`);
  await initializeCronEngine(); // Initialize cron engine on server start

  // Start sending agent status updates periodically
  // intervalId = setInterval(sendAgentStatus, statusUpdateInterval); // Temporarily commented out for manual control
  await sendAgentStatus(); // Send status immediately on start
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down Mission Control backend...');
  process.exit(0);
});
