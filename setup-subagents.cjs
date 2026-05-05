#!/usr/bin/env node
// Mission Control Sub-Agent Fleet Generator
const fs = require('fs');
const path = require('path');

const JOBS_PATH = path.join(process.env.HOME, '.openclaw/cron/jobs.json');
const AGENTS_DIR = path.join(process.env.HOME, '.openclaw/agents');

const data = JSON.parse(fs.readFileSync(JOBS_PATH, 'utf8'));
const jobs = data.jobs || [];
const EMOJIS = ['🤖','🚀','📊','💡','🔥','⚡','🌐','🎯','💰','📈','🔬','🎭','🛡️','🌟','⚙️','🧠','📡','🏆'];
let created = 0;

jobs.forEach((job, i) => {
  if (!job.name || job.name === 'Test Job') return;
  const slug = job.name.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')
    .replace(/-$/, '').substring(0, 45);
  const agentDir = path.join(AGENTS_DIR, slug);
  if (!fs.existsSync(agentDir)) fs.mkdirSync(agentDir, { recursive: true });
  const channel = job.delivery?.to || '#general';
  const ms = job.schedule?.everyMs;
  const scheduleStr = job.schedule?.kind === 'cron'
    ? `Cron: ${job.schedule.expr}`
    : ms ? (ms < 3600000 ? `Every ${ms/60000}m` : `Every ${ms/3600000}h`) : 'scheduled';
  const config = {
    id: job.id, name: job.name, role: 'Sub-Agent',
    mission: (job.payload?.message || '').substring(0, 250),
    workspace: channel, model: { primary: 'google/gemini-2.5-flash' },
    capabilities: ['discord-delivery', 'autonomous-research', 'web-search'],
    schedule: scheduleStr, channel, enabled: job.enabled !== false,
    parent: 'biggmacc', identity: { emoji: EMOJIS[i % EMOJIS.length] }
  };
  fs.writeFileSync(path.join(agentDir, 'agent.json'), JSON.stringify(config, null, 2));
  created++;
  console.log(`  ✅ ${job.name}`);
});

console.log(`\n🚀 Done! Created ${created} sub-agents.`);
console.log(`   Total agents now: ${fs.readdirSync(AGENTS_DIR).length}`);
