export interface CreativeAsset {
  title: string;
  type: 'Album' | 'Single' | 'Music Video' | 'Performance' | 'Collaboration';
  year?: string;
  description?: string;
  link?: string;
  collaborators?: string[];
}

export const BRAND_HISTORY = {
  name: "Nak3d Eye Entertainment",
  founder: "Franklin Rizzolini",
  aesthetic: "Futuristic, tech-forward, high-quality 2D/3D animations, stylized 'NE' logo.",
  coreCollaborators: ["Jersey Demic", "Unkle Mook", "djinn davis", "SPORTY 'C'", "Hotep Jesus", "Jk D Animator"],
  themes: ["Resilience", "Strategic Growth", "Tactical Execution", "Institutional Barriers", "Street Professionalism"],
  assets: [
    {
      title: "Rizzolini Presents: Toxic Traits",
      type: "Album",
      year: "2025",
      description: "R&B/Soul focused project featuring tracks like 'New Level', 'Save Her', and 'Diva'.",
      collaborators: ["Rizzolini"]
    },
    {
      title: "Rizzolini Presents: Many Mo' Miles 1 & 2",
      type: "Album",
      year: "2025",
      description: "Dual-volume series highlighting recent creative evolution.",
      collaborators: ["Rizzolini"]
    },
    {
      title: "Flood the Gates (Vol. 1–3)",
      type: "Album",
      description: "Cornerstone strategic album series."
    },
    {
      title: "30/30 Series (Vol. 1–4)",
      type: "Collaboration",
      description: "Foundational series with Jersey Demic, featuring dozens of tracks.",
      collaborators: ["Jersey Demic"]
    },
    {
      title: "Deli",
      type: "Music Video",
      description: "Major official music video with over 411,000 views. Street aesthetic.",
      collaborators: ["Jersey Demic", "Franklin Rizzolini", "Pone"]
    },
    {
      title: "Lonely at the top",
      type: "Music Video",
      description: "Iconic animated music video by Jk D Animator. Over 234,000 views.",
      collaborators: ["Jersey Demic", "Franklin Rizzolini"]
    },
    {
      title: "Backpack",
      type: "Music Video",
      description: "In-studio performance video highlighting gritty creative process.",
      collaborators: ["Jersey Demic"]
    },
    {
      title: "Sins Of The Father",
      type: "Single",
      description: "Gritty and reflective solo track by Franklin Rizzolini."
    },
    {
      title: "Swish / Deal Wit Us",
      type: "Single",
      description: "High-energy solo releases."
    }
  ] as CreativeAsset[]
};
