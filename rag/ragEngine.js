import { pipeline } from '@xenova/transformers';
import { knowledgeBase } from './knowledgeBase.js';

let embedder = null;
let generator = null;
let index = []; // [{ id, text, vector }]

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function embed(text) {
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
}

// Downloads and caches two small models on first run (no API key needed):
//  - Xenova/all-MiniLM-L6-v2      (~90MB)  for embeddings/retrieval
//  - Xenova/flan-t5-small         (~300MB) for generating the answer
export async function initRag() {
  console.log('[rag] loading embedding model...');
  embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  console.log('[rag] loading generation model...');
  generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small');

  console.log('[rag] embedding knowledge base...');
  index = [];
  for (const chunk of knowledgeBase) {
    const vector = await embed(chunk.text);
    index.push({ ...chunk, vector });
  }
  console.log(`[rag] ready with ${index.length} knowledge chunks.`);
}

async function retrieve(query, topK = 3) {
  const qVector = await embed(query);
  return index
    .map((item) => ({ ...item, score: cosineSimilarity(qVector, item.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function answerQuestion(query) {
  if (!embedder || !generator) {
    throw new Error('RAG engine not initialized yet');
  }

  const matches = await retrieve(query, 3);
  const context = matches.map((m) => `- ${m.text}`).join('\n');

  const prompt = `Answer the question using only the facts in the context. Be direct and concise. If the context does not contain the answer, say you are not sure and suggest contacting NextSyght directly.

Context:
${context}

Question: ${query}
Answer:`;

  const output = await generator(prompt, { max_new_tokens: 120 });
  const reply = output[0].generated_text.trim();

  return {
    reply,
    sources: matches.map((m) => m.id)
  };
}
