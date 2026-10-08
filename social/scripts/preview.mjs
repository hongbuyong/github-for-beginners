// npm run preview → 브라우저에서 http://localhost:4173 을 열어 슬라이드를 확인해요.
import { startServer } from './server.mjs';

const port = Number(process.env.PORT) || 4173;
await startServer(port);
console.log(`미리보기: http://localhost:${port}`);
console.log('케이스 파일을 고친 뒤 브라우저를 새로고침하면 바로 반영돼요. 끝내려면 Ctrl+C');
