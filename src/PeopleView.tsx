import { useState } from 'react';
import { Mail, MessageCircle, Send, Home, Briefcase, Search, Phone, Hash, UserCheck, HeartHandshake, UserPlus, FileText } from 'lucide-react';

const MOCK_PEOPLE = [
  {
    id: 'p1',
    name: 'Eleanor Vance',
    category: 'Client',
    status: 'High Value',
    email: 'eleanor.v@example.com',
    phone: '+1 (555) 123-4567',
    discord: 'eleanorV',
    whatsapp: '+15551234567',
    telegram: '@VanceTrades',
    twitter: '@VanceInvests',
    homeAddress: '123 Ocean Drive, Miami, FL',
    businessAddress: '450 Brickell Ave, Suite 300, Miami, FL',
    lastInteraction: '2 hours ago via Email',
    connection: 'Warm',
    avatarStr: 'EV'
  },
  {
    id: 'p2',
    name: 'Michael Chen',
    category: 'Partner',
    status: 'Strategic',
    email: 'm.chen@example.com',
    phone: '+1 (555) 987-6543',
    discord: 'MChen_Tech',
    whatsapp: '+15559876543',
    telegram: '@mchen_eth',
    twitter: '@MichaelC_Tech',
    homeAddress: 'Hidden',
    businessAddress: '1280 1st Ave, Seattle, WA',
    lastInteraction: '1 day ago via Discord',
    connection: 'Direct',
    avatarStr: 'MC'
  },
  {
    id: 'p3',
    name: 'Sarah Jenkins',
    category: 'Investor',
    status: 'Board Member',
    email: 's.jenkins@example.com',
    phone: '+1 (555) 456-7890',
    discord: 'SJenkins_EWS',
    whatsapp: '+15554567890',
    telegram: '@JenkinsCap',
    twitter: '@JenkinsCapital',
    homeAddress: 'Central Park West, NY',
    businessAddress: '1 Wall Street, NY',
    lastInteraction: '3 days ago via Telegram',
    connection: 'VIP',
    avatarStr: 'SJ'
  }
];

type ViewProps = {
  toggleSidebar: () => void;
};

export const PeopleView = ({ toggleSidebar }: ViewProps) => {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPeople = MOCK_PEOPLE.filter(person => {
    if (!normalizedQuery) return true;

    return [
      person.name,
      person.email,
      person.discord,
      person.category,
      person.status,
      person.phone,
      person.telegram,
      person.twitter
    ].some(value => value.toLowerCase().includes(normalizedQuery));
  });

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
            <h2 className="title-lg">People & Contacts</h2>
            <p className="text-muted-desc">

              Manage clients, partners, and network connections. Agents can dispatch data across associated platforms.
            </p>
          </div>
          <button className="primary-btn">
            <UserPlus size={18} /> Add Contact
          </button>
        </div>
      </div>
      <div className="page-content">
        {/* Search Bar */}
        <div className="search-wrapper">
          <div className="search-box">
            <Search size={18} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name, email, discord, or category..."
              className="search-input-field"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="people-list">
          {filteredPeople.map(person => (
            <div key={person.id} className="glass-panel person-card">
              
              {/* Header Info */}
              <div className="person-header-flex">
                <div className="person-avatar">
                  {person.avatarStr}
                </div>
                <div className="flex-1">
                  <h3 className="person-name-flex">
                    {person.name}
                    <span className="person-badge">{person.category}</span>
                    <span className="person-badge-active">{person.status}</span>
                  </h3>
                  <div className="person-meta">
                    <span className="person-meta-item"><UserCheck size={14}/> {person.connection} Connection</span>
                    <span className="person-meta-item"><HeartHandshake size={14}/> {person.lastInteraction}</span>
                  </div>
                </div>
              </div>

              {/* Layout for contact & addresses */}
              <div className="person-details-grid">
                
                {/* Contact Endpoints */}
                <div className="detail-col">
                  <h4 className="detail-title">Contact Endpoints</h4>
                  <div className="detail-item"><Mail size={16} color="var(--accent)"/> {person.email}</div>
                  <div className="detail-item"><Phone size={16} color="#ffa500"/> {person.phone}</div>
                </div>

                {/* Social & Messaging */}
                <div className="detail-col">
                  <h4 className="detail-title">Messaging Handles</h4>
                  <div className="detail-item"><MessageCircle size={16} color="#7289DA"/> Discord: {person.discord}</div>
                  <div className="detail-item"><Send size={16} color="#0088cc"/> Telegram: {person.telegram}</div>
                  <div className="detail-item"><MessageCircle size={16} color="#25D366"/> WhatsApp: {person.whatsapp}</div>
                  <div className="detail-item"><Hash size={16} color="#1DA1F2"/> Twitter: {person.twitter}</div>
                </div>

                {/* Addresses */}
                <div className="detail-col">
                  <h4 className="detail-title">Locations</h4>
                  <div className="detail-item-align-top">
                    <Home size={16} className="detail-icon-offset" color="#a020f0"/> 
                    <div><span className="detail-label">Home:</span><br/>{person.homeAddress}</div>
                  </div>
                  <div className="detail-item-align-top">
                    <Briefcase size={16} className="detail-icon-offset" color="#1e90ff"/> 
                    <div><span className="detail-label">Biz:</span><br/>{person.businessAddress}</div>
                  </div>
                </div>

              </div>
              
              {/* Dispatch Action Panel */}
              <div className="dispatch-panel">
                <button className="hollow-button dispatch-btn">
                  <Mail size={16} /> Send Email Auth
                </button>
                <button className="hollow-button dispatch-btn">
                  <MessageCircle size={16} /> Dispatch Discord
                </button>
                <button className="hollow-button dispatch-btn">
                  <Send size={16} /> Dispatch Telegram
                </button>
                <button className="hollow-button dispatch-btn">
                  <FileText size={16} /> Dispatch Report
                </button>
              </div>

            </div>
          ))}
          {filteredPeople.length === 0 ? (
            <div className="glass-panel person-card">
              <h3 className="person-name-flex">No matching contacts</h3>
              <p className="text-muted">Try a different name, handle, or category.</p>
            </div>
          ) : null}
        </div>
        
      </div>
    </div>
  );
};
