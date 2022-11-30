import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.Node_ENV === 'production'
    ? '/expt-vannila-ts/'
    : './'
});