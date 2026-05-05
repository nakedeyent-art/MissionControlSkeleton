import { Users, Briefcase, Activity, Code, Film, Music, ShieldAlert, Car, Truck, Home, Wallet, Hammer, Video, Compass, HeartPulse } from 'lucide-react';

type ViewProps = {
  toggleSidebar: () => void;
};

const TEAMS = [
  { name: 'Trading Floor', count: 12, icon: <Activity size={24} color="#00ffcc" /> },
  { name: 'Research Dept', count: 8, icon: <Compass size={24} color="#00ffcc" /> },
  { name: 'Wealth Management', count: 4, icon: <Briefcase size={24} color="#00ffcc" /> },
  { name: 'Nak3d Eye Entertainment-Music', count: 6, icon: <Music size={24} color="#ff3366" /> },
  { name: 'Naked EyE Entertainment-Film', count: 5, icon: <Film size={24} color="#ff3366" /> },
  { name: 'Enterprise-HQ', count: 18, icon: <Home size={24} color="#a020f0" /> },
  { name: 'Transport Central', count: 9, icon: <Truck size={24} color="#ffa500" /> },
  { name: 'Pest Arrest', count: 3, icon: <ShieldAlert size={24} color="#ff4500" /> },
  { name: 'Faith Meets Finance', count: 4, icon: <Wallet size={24} color="#ffd700" /> },
  { name: 'The Mirror App', count: 5, icon: <Code size={24} color="#00bfff" /> },
  { name: 'The Construction App', count: 7, icon: <Hammer size={24} color="#ff8c00" /> },
  { name: 'Social Card App', count: 4, icon: <Users size={24} color="#32cd32" /> },
  { name: 'Real Estate', count: 8, icon: <Home size={24} color="#1e90ff" /> },
  { name: 'Health & Wellness', count: 6, icon: <HeartPulse size={24} color="#ff1493" /> },
  { name: 'Survival Prep', count: 3, icon: <Car size={24} color="#8b4513" /> },
  { name: 'IPTV', count: 5, icon: <Video size={24} color="#4682b4" /> },
  { name: 'Creativity & Tech', count: 11, icon: <Code size={24} color="#8a2be2" /> }
];

export const TeamsView = ({ toggleSidebar }: ViewProps) => {
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
            <h2 className="title-lg">Teams</h2>
            <p className="text-muted-desc">Organize agents and humans into working Teams across all business divisions.</p>
          </div>
        </div>
      </div>
      <div className="page-content">
        
        <div className="teams-grid">
          {TEAMS.map((team, idx) => (
            <div key={idx} className="glass-panel hover-card team-card">
              <div className="team-icon-box">
                {team.icon}
              </div>
              <div>
                <h3 className="team-title">{team.name}</h3>
                <p className="team-subtitle">
                  {team.count} active agents & delegates
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
