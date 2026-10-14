import js from '@eslint/js';
import ts from 'typescript-eslint';

export default [
  { ignores: ['dist/**', 'vendor/**', 'node_modules/**'] },
  js.configs.recommended,
  ...ts.configs.recommended,
  { languageOptions: { globals: { console: 'readonly', process: 'readonly', URL: 'readonly', fetch: 'readonly', setTimeout: 'readonly' } } },
];
