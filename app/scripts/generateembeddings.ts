require('dotenv').config();
const fs = require('fs');
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const raw = JSON.parse(fs.readFileSync('app/sample-data/tradesmen_raw.json', 'utf-8'));
  const enhanced = [];

  for (const t of raw) {
    const input = `Name: ${t.name}\nTrade: ${t.trade}\nExperience: ${t.experience}\nRecent Jobs: ${t.recentJobs.join(', ')}\n`;

    const res = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input
    });

    const vector = res.data[0].embedding;
    enhanced.push({
      ...t,
      embedding: vector
    });

    console.log(`✔ Embedded: ${t.name}`);
  }

  fs.writeFileSync('app/sample-data/tradesmen.json', JSON.stringify(enhanced, null, 2));
  console.log('✅ tradesmen.json with embeddings created!');
}

run().catch(console.error);
