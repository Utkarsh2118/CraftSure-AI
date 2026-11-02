import 'dotenv/config';
import { createApp } from './app';

const PORT = parseInt(process.env['PORT'] ?? '4000', 10);

const app = createApp();

app.listen(PORT, () => {
  console.warn(`[API] Server running on http://localhost:${PORT}`);
  console.warn(`[API] Health check: http://localhost:${PORT}/health`);
});
