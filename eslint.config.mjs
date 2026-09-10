import js from '@eslint/js';
import globals from 'globals';
export default [
 {ignores:['node_modules/**','public/assets/js/app.js','public/assets/js/pages/**','public/assets/js/components/**','public/assets/js/utils/**','public/assets/js/site-data.js']},
 {files:['site/**/*.js','scripts/build.js','scripts/check.js','tests/**/*.js','server/handlers/contact.js','netlify/functions/contact.js','server.js'],...js.configs.recommended,languageOptions:{sourceType:'commonjs',globals:globals.node},rules:{'no-unused-vars':['error',{argsIgnorePattern:'^_'}]}},
 {files:['public/assets/js/pridano.js'],...js.configs.recommended,languageOptions:{sourceType:'script',globals:globals.browser}}
];
