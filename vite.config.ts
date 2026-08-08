import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, type Plugin, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * 개발 서버에서 POST /api/explain 을 처리하는 플러그인.
 * 프로덕션(Vercel)에서는 api/explain.ts 서버리스 함수가 같은 로직(api/_lib/explain)을 사용한다.
 * (vite preview 는 정적 서빙만 하므로, AI 기능 확인은 `npm run dev` 로 한다.)
 */
function apiDevPlugin(): Plugin {
  const handle = async (server: ViteDevServer, req: IncomingMessage, res: ServerResponse) => {
    const send = (status: number, body: unknown) => {
      res.statusCode = status;
      res.setHeader('content-type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(body));
    };
    if (req.method !== 'POST') {
      send(405, { ok: false, code: 'bad_input', message: 'POST만 허용됩니다.' });
      return;
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const mod = await server.ssrLoadModule('/api/_lib/explain.ts');
      const input = body ? JSON.parse(body) : {};
      const result = await mod.generateExplanation(input);
      send(mod.statusForResult(result), result);
    } catch (e) {
      send(500, { ok: false, code: 'upstream_error', message: String(e) });
    }
  };

  return {
    name: 'api-explain-dev',
    configureServer(server) {
      server.middlewares.use('/api/explain', (req, res) => {
        void handle(server, req, res);
      });
    },
  };
}

// 정적 SPA — Vercel 자동 감지(빌드: vite build → dist/), api/ 는 서버리스 함수로 배포됨.
export default defineConfig({
  plugins: [react(), apiDevPlugin()],
});
