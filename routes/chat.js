import express from 'express';
import { answerQuestion } from '../rag/ragEngine.js';

const router = express.Router();

// POST /api/chat — { message: string } -> { reply, sources }
router.post('/', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const result = await answerQuestion(message.trim());
    res.json(result);
  } catch (err) {
    console.error('[chat] error:', err.message);
    res.status(503).json({ error: 'Chat engine is still starting up, try again in a moment' });
  }
});

export default router;
