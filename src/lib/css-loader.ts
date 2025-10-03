// CSS Loader for dynamic theme imports
// This file handles dynamic CSS imports based on environment variables

import { getTheme } from './theme';

// Dynamic theme import function
export const loadThemeCSS = async (): Promise<void> => {
  const theme = getTheme();

  try {
    // Dynamic import of theme CSS
    switch (theme) {
      case 'black':
        await import('fumadocs-ui/css/black.css');
        break;
      case 'catppuccin':
        await import('fumadocs-ui/css/catppuccin.css');
        break;
      case 'dusk':
        await import('fumadocs-ui/css/dusk.css');
        break;
      case 'neutral':
        await import('fumadocs-ui/css/neutral.css');
        break;
      case 'ocean':
        await import('fumadocs-ui/css/ocean.css');
        break;
      case 'preset':
        await import('fumadocs-ui/css/preset.css');
        break;
      case 'purple':
        await import('fumadocs-ui/css/purple.css');
        break;
      case 'shadcn':
        await import('fumadocs-ui/css/shadcn.css');
        break;
      case 'shiki':
        await import('fumadocs-ui/css/shiki.css');
        break;
      case 'style':
        await import('fumadocs-ui/css/style.css');
        break;
      case 'vitepress':
        await import('fumadocs-ui/css/vitepress.css');
        break;
      default:
        await import('fumadocs-ui/css/neutral.css');
        break;
    }
  } catch (error) {
    console.warn(`Failed to load theme "${theme}":`, error);
    // Fallback to neutral theme
    await import('fumadocs-ui/css/neutral.css');
  }
};

// For build-time CSS imports, we'll use a different approach
// This function returns the CSS import path for use in global.css
export const getThemeCSSImport = (): string => {
  const theme = getTheme();
  return `fumadocs-ui/css/${theme}.css`;
};