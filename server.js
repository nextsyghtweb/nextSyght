import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import projectsRouter from './routes/projects.js';
import reviewsRouter from './routes/reviews.js';
import chatRouter from './routes/chat.js';
import adminRouter from './routes/admin.js';
import settingsRouter from './routes/settings.js';
import enquiriesRouter from './routes/enquiries.js';
import { initRag } from './rag/ragEngine.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/config', (req, res) => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase public configuration is missing' });
  }

  res.json({
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY
  });
});

app.use('/api/projects', projectsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/enquiries', enquiriesRouter);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`NextSyght running at http://localhost:${PORT}`);
  console.log('Starting RAG chat engine (first run downloads ~400MB of models)...');
  initRag()
    .then(() => console.log('Chat is ready.'))
    .catch((err) => console.error('Failed to start RAG engine:', err));
});
