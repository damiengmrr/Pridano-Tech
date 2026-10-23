import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules/**', 'public/**', 'brand-source/**', '.qa/**', 'test-results/**', 'playwright-report/**', 'src/scripts/quote/quote.js'] },
  { files: ['site/**/*.js', 'scripts/**/*.js', 'tests/**/*.js', 'server/**/*.js', 'netlify/functions/**/*.js', 'server.js', 'playwright.config.js'], ...js.configs.recommended, languageOptions: { sourceType: 'commonjs', globals: globals.node }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
  { files: ['src/scripts/**/*.js'], ...js.configs.recommended, languageOptions: { sourceType: 'module', globals: { ...globals.browser, __SDF_WORKER__: 'readonly' } }, rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
];
