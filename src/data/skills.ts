export interface Project {
  name: string;
  url: string;
  note: string;
}

export type OrbShape = "ico" | "dodeca" | "octa" | "tetra" | "knot";

export interface SkillCategory {
  id: string;
  label: string;
  tagline: string;
  color: string;
  position: [number, number, number];
  /** Base radius of the orb. */
  size: number;
  /** Icosahedron detail: 0 = chunky crystal, 1 = smooth rock. */
  detail: 0 | 1;
  /** Silhouette: each orb gets its own geometry. */
  shape: OrbShape;
  /** Whether this orb gets a tiny orbiting moon. */
  moon: boolean;
  skills: string[];
  projects: Project[];
}

const GH = "https://github.com/Imluckyluke";

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    tagline: "Chat UI people actually enjoy using",
    color: "#38bdf8",
    position: [4.4, 1.2, 0.5],
    size: 0.5,
    detail: 1,
    shape: "ico",
    moon: false,
    skills: ["JavaScript", "PWA", "Responsive UI", "Theming", "REST"],
    projects: [
      {
        name: "Luckyroom",
        url: `${GH}/Luckyroom`,
        note: "Realtime Persian chat SPA with 4 themes, installable PWA",
      },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    tagline: "Realtime APIs with real security",
    color: "#a78bfa",
    position: [-4.2, 0.6, 1.8],
    size: 0.6,
    detail: 0,
    shape: "dodeca",
    moon: false,
    skills: ["Node.js", "Express", "Socket.IO", "SQLite", "JWT + OTP"],
    projects: [
      {
        name: "Luckyroom",
        url: `${GH}/Luckyroom`,
        note: "Express + Socket.IO server, RBAC admin panel, AES-256 file vault",
      },
      {
        name: "Music-arch",
        url: `${GH}/Music-arch`,
        note: "Telethon userbot + Aiogram inline bot sharing one song database",
      },
    ],
  },
  {
    id: "mobile",
    label: "Mobile",
    tagline: "Native Android, offline-first",
    color: "#34d399",
    position: [0.4, 2.6, -4.3],
    size: 0.42,
    detail: 1,
    shape: "octa",
    moon: true,
    skills: ["Kotlin", "Android", "Persian Calendar", "Local Storage"],
    projects: [
      {
        name: "exptrac",
        url: `${GH}/exptrac`,
        note: "Expense tracker with Jalali calendar, APK via GitHub Actions",
      },
    ],
  },
  {
    id: "bots",
    label: "Bots",
    tagline: "Telegram bots that run businesses",
    color: "#fbbf24",
    position: [-1.4, -2.2, 4.1],
    size: 0.55,
    detail: 0,
    shape: "knot",
    moon: true,
    skills: ["Python", "Telethon", "Aiogram", "Bot API"],
    projects: [
      {
        name: "Tgfbot",
        url: `${GH}/Tgfbot`,
        note: "Long-running Telegram bot, maintained since 2025",
      },
      {
        name: "pbotchannel",
        url: `${GH}/pbotchannel`,
        note: "Channel management bot",
      },
      {
        name: "secretary-bot",
        url: `${GH}/secretary-bot`,
        note: "Personal assistant bot",
      },
    ],
  },
  {
    id: "devops",
    label: "DevOps",
    tagline: "Ships stay up while I sleep",
    color: "#fb7185",
    position: [1.8, -1.6, -4.0],
    size: 0.44,
    detail: 1,
    shape: "tetra",
    moon: false,
    skills: ["Railway", "VPS", "PM2", "Nginx + SSL", "Backups"],
    projects: [
      {
        name: "Luckyroom",
        url: `${GH}/Luckyroom`,
        note: "Railway + VPS deploys, volume-backed DB, documented ops runbook",
      },
    ],
  },
];
