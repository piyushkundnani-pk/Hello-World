// PM SkillForge Design System
export const COLORS = {
  // Primary palette
  bg: '#1a1a2e',          // Deep navy background
  bgCard: '#16213e',      // Slightly lighter card bg
  bgElevated: '#0f3460',  // Elevated surfaces

  // Accents
  primary: '#4361ee',     // Electric blue — CTAs, links
  primaryLight: '#6b7ff0',
  primaryDark: '#2d4fd4',

  // Semantic
  success: '#10b981',     // Emerald — advantage/strength
  warning: '#f59e0b',     // Amber — needs work
  danger: '#f43f5e',      // Rose — critical gap
  info: '#06b6d4',        // Cyan — informational

  // Neutrals
  white: '#ffffff',
  text: '#e2e8f0',        // Primary text (light)
  textMuted: '#94a3b8',   // Secondary/muted text
  textFaint: '#475569',   // Placeholder/disabled text
  border: '#1e3a5f',      // Subtle borders
  borderLight: '#2d4a6f', // Slightly visible borders

  // Status backgrounds (translucent)
  successBg: 'rgba(16, 185, 129, 0.12)',
  warningBg: 'rgba(245, 158, 11, 0.12)',
  dangerBg: 'rgba(244, 63, 94, 0.12)',
  primaryBg: 'rgba(67, 97, 238, 0.12)',
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SKILL_CATEGORIES = [
  { id: 'product_discovery', label: 'Product Discovery', short: 'Discovery', icon: '🔍' },
  { id: 'execution_delivery', label: 'Execution & Delivery', short: 'Execution', icon: '⚡' },
  { id: 'metrics_analytics', label: 'Metrics & Analytics', short: 'Analytics', icon: '📊' },
  { id: 'technical_acumen', label: 'Technical Acumen', short: 'Technical', icon: '⚙️' },
  { id: 'stakeholder_leadership', label: 'Stakeholder & Leadership', short: 'Leadership', icon: '👥' },
  { id: 'domain_expertise', label: 'Domain Expertise', short: 'Domain', icon: '🏢' },
];

export const PROFICIENCY_LABELS = ['', 'Novice', 'Beginner', 'Competent', 'Proficient', 'Expert'];

export const STATUS_CONFIG = {
  advantage: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', label: 'Advantage ✅', icon: '✅' },
  on_track: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'On Track 🟡', icon: '🟡' },
  needs_work: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', label: 'Needs Work 🔶', icon: '🔶' },
  critical_gap: { color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.12)', label: 'Critical Gap 🔴', icon: '🔴' },
};
