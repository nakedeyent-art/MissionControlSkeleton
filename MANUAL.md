# 🚀 Mission Control Skeleton: Operational Manual

Welcome to the **Mission Control Skeleton**, the professional-grade operational core for autonomous agent orchestration. This skeleton is a sanitized, high-end "Agent OS" designed for commercial deployment.

---

## 🛠️ Getting Started: The Setup Wizard
Upon first launch, the system will detect missing configurations and launch the **Setup Wizard**.
- **Identity**: Define your Master Admin credentials.
- **Intelligence**: Input API keys for Anthropic (Claude), OpenAI (GPT), and others.
- **Domain Capabilities**: Connect financial (Twelve Data) and voice (ElevenLabs) endpoints.

---

## 📱 Interface Breakdown: Tabs & Functions

### 🏢 1. Office (Dashboard)
The mission-critical overview.
- **System Status**: Real-time health of your agent fleet and gateway nodes.
- **Agent Roster**: Quick stats on your deployed autonomous personas.
- **Capabilities Registry**: Overview of loaded skills and modules.

### 💬 2. Chat & Control
The direct command interface for your fleet.
- **Agent Selection**: Toggle between different personas (e.g., Lead Architect, Mission Orchestrator).
- **Directive Injection**: Send complex missions directly to agents via the secure command line.
- **Thought Traces**: View agent reasoning and execution logs in real-time.

### 🛠️ 3. Skills Hub
The "App Store" for your agents.
- **Registry Browser**: View all pre-installed capability modules (Filesystem, Browser, Trading).
- **Granular Toggling**: Enable or disable specific skills globally or for individual agents.
- **Documentation**: Access the `SKILL.md` for each module to understand its reach and constraints.

### 🤖 4. Agents 2 Create
The design studio for new intelligence.
- **Persona Designer**: Configure the "Soul", Role, and Objectives for new agents.
- **Model Mapping**: Assign specific LLM models (local or cloud) to each agent.
- **Templates**: Use pre-defined blueprints like the "Swarm Lead" to deploy specialists in seconds.

### 📅 5. Mission Calendar
The temporal orchestration layer.
- **Unified Schedule**: See all agent-triggered tasks and system events in a single view.
- **Task Tracking**: Monitor deadlines and milestone progress for long-running missions.

### 📈 6. Pipeline & Projects
Strategic oversight for business operations.
- **Deals Pipeline**: Track high-value leads and conversion stages handled by your Sales agents.
- **Project Boards**: Manage multi-agent collaborations on complex deliverables.

### 📡 7. Signals Radar
Market and social intelligence.
- **Sentiment Analysis**: Real-time monitoring of social graphs and market volume.
- **Intensity Mapping**: Detect "High Intensity" signals that require immediate agent attention.

---

## 🔒 Security & Infrastructure
- **MFA (2FA)**: Integrated support for TOTP (Google Authenticator) to secure the command core.
- **Local Mode**: Toggle "Offline" execution to route all agent reasoning through local Ollama/DeepSeek nodes.
- **Fleet Health**: Monitor latency and uptime across your distributed infrastructure.

---

## 🏗️ For Developers: Extending the Skeleton
- **Skill Development**: Add new folders to `openclaw_data/skills/` with a `SKILL.md` to auto-register new capabilities.
- **Custom Views**: The frontend is built with React + Framer Motion for premium, smooth transitions.
- **API Bridge**: Uses a robust Express backend to bridge web commands to the local filesystem and native CLI tools.
