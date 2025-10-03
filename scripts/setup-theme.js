#!/usr/bin/env node

/**
 * Theme setup script for Fumadocs
 * This script sets up the correct theme CSS import based on environment variables
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get theme from environment variable
let theme = (process.env.FUMADOCS_THEME || 'neutral').trim();

// Available themes
const availableThemes = [
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
];

// Validate theme
if (!availableThemes.includes(theme)) {
  console.warn(`Invalid theme "${theme}". Using default "neutral".`);
  theme = 'neutral';
}

// Get custom layout width setting
const customLayoutWidth = (process.env.FUMADOCS_CUSTOM_LAYOUT_WIDTH || 'false').trim().toLowerCase() === 'true';

// Path to the global CSS file
const cssFilePath = path.join(__dirname, '..', 'src', 'app', '(fumadocs)', 'global.css');

// Read current CSS content
let cssContent = fs.readFileSync(cssFilePath, 'utf8');

// Replace all theme imports with the selected theme
const themeImportRegex = /@import 'fumadocs-ui\/css\/[a-zA-Z]+\.css';/g;
const newThemeImport = `@import 'fumadocs-ui/css/${theme}.css';`;

cssContent = cssContent.replace(themeImportRegex, newThemeImport);

// Handle custom layout width
const layoutWidthRegex = /\/\* :root \{\s*--fd-layout-width: 1400px;\s*\} \*\//;
const layoutWidthCSS = `/* :root {
  --fd-layout-width: 1400px;
} */`;

if (customLayoutWidth) {
  // Enable the custom layout width by uncommenting it
  cssContent = cssContent.replace(layoutWidthRegex, `:root {
  --fd-layout-width: 1400px;
}`);
} else {
  // Ensure it's commented out
  if (!cssContent.includes(layoutWidthCSS)) {
    cssContent = cssContent.replace(/:root \{\s*--fd-layout-width: 1400px;\s*\}/, layoutWidthCSS);
  }
}

// Write back to file
fs.writeFileSync(cssFilePath, cssContent);

console.log(`✅ Theme set to: ${theme}`);
console.log(`✅ Updated CSS import: ${newThemeImport}`);
console.log(`✅ Custom layout width: ${customLayoutWidth ? 'enabled' : 'disabled'}`);