import { OpenAI } from 'openai';
import tradesmen from '@/app/sample-data/tradesmen.json';
import cosineSimilarity from '@/app/libs/cosine';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const body = await req.json();
  const { description } = body;
  
  if (!description) {
    return new Response(JSON.stringify({ error: 'Missing description' }), { status: 400 });
  }

  try {
    const embeddingRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: description
    });
    const jobEmbedding = embeddingRes.data[0].embedding;
    
    const matches = tradesmen.map((tradesman: any) => ({
      ...tradesman,
      score: cosineSimilarity(jobEmbedding, tradesman.embedding)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

    return new Response(JSON.stringify({ matches }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Embedding failed' }), { status: 500 });
  }
}
