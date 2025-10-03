// Dynamic theme loader for Fumadocs
// This allows theme selection via environment variables at build time

const THEME = process.env.FUMADOCS_THEME || 'neutral';

// Available themes from fumadocs-ui
const AVAILABLE_THEMES = [
  'black',
  'catppuccin',
  'dusk',
  'neutral',
  'ocean',
  'preset',
  'purple',
  'shadcn',
  'shiki',
  'style',
  'vitepress'
] as const;

type ThemeType = typeof AVAILABLE_THEMES[number];

// Validate theme
const validateTheme = (theme: string): theme is ThemeType => {
  return AVAILABLE_THEMES.includes(theme as ThemeType);
};

// Get validated theme
export const getTheme = (): ThemeType => {
  const theme = THEME.toLowerCase();
  if (validateTheme(theme)) {
    return theme;
  }
  console.warn(`Invalid theme "${theme}". Using default "neutral".`);
  return 'neutral';
};

// Theme configuration
export const themeConfig = {
  name: getTheme(),
  cssPath: `fumadocs-ui/css/${getTheme()}.css`,
  primaryColor: process.env.FUMADOCS_PRIMARY_COLOR || '#007acc',
  logoUrl: process.env.FUMADOCS_LOGO_URL || '',
};

// Export for use in components
export { AVAILABLE_THEMES };
export type { ThemeType };