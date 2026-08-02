import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 정적 SPA — Vercel 자동 감지(빌드: vite build → dist/)
export default defineConfig({
  plugins: [react()],
});
