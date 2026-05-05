#!/usr/bin/env node
// Mission Control Sub-Agent Fleet Generator
// Run this from a FRESH terminal: node setup-subagents.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JOBS_PATH = path.join(process.env.HOME, '.openclaw/cron/jobs.json');
const AGENTS_DIR = path.join(process.env.HOME, '.openclaw/agents');

if (!fs.existsSync(JOBS_PATH)) {
  console.error('ERROR: Cannot find', JOBS_PATH);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf8'));
const jobs = data.jobs || [];

const EMOJIS = ['🤖','🚀','📊','💡','🔥','⚡','🌐','🎯','💰','📈','🔬','🎭','🛡️','🌟','⚙️','🧠','📡','🏆'];
let created = 0;

jobs.forEach((job, i) => {
  if (!job.name || job.name === 'Test Job') return;

  const slug = job.name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/-$/, '')
    .substring(0, 45);

  const agentDir = path.join(AGENTS_DIR, slug);
  if (!fs.existsSync(agentDir)) {
    fs.mkdirSync(agentDir, { recursive: true });
  }

  const channel = job.delivery?.to || '#general';
  let scheduleStr = '';
  if (job.schedule?.kind === 'cron') {
    scheduleStr = `Cron: ${job.schedule.expr}`;
  } else if (job.schedule?.everyMs) {
    const ms = job.schedule.everyMs;
    if (ms < 3600000) scheduleStr = `Every ${ms/60000}m`;
    else scheduleStr = `Every ${ms/3600000}h`;
  }

  const isHighFreq = job.schedule?.kind === 'cron' && 
    (job.schedule.expr.includes('*/5') || 
     job.schedule.expr.includes('*/10') || 
     job.schedule.expr.includes('*/15') || 
     job.schedule.expr.includes('*/20') || 
     job.schedule.expr.includes('*/30'));

  const config = {
    id: job.id,
    name: job.name,
    role: 'Sub-Agent',
    mission: (job.payload?.message || '').substring(0, 250),
    workspace: channel,
    model: { primary: isHighFreq ? 'ollama/deepseek-r1:14b' : 'google/gemini-2.5-flash' },
    capabilities: ['discord-delivery', 'autonomous-research', 'web-search'],
    schedule: scheduleStr,
    channel,
    enabled: job.enabled !== false,
    parent: 'biggmacc',
    skills: ['karpathy-guardrails', 'web-search', 'filesystem', 'shell'],
    identity: { emoji: EMOJIS[i % EMOJIS.length] }
  };

  fs.writeFileSync(
    path.join(agentDir, 'agent.json'),
    JSON.stringify(config, null, 2)
  );
  created++;
  console.log(`  ✅ ${job.name}`);
});

console.log(`\n🚀 Done! Created/updated ${created} sub-agents.`);
console.log(`   Total agents: ${fs.readdirSync(AGENTS_DIR).length}`);
