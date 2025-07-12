'use client'
import { useState } from 'react';

export default function Home() {
  const [description, setDescription] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const res = await fetch('/api/tradesman-recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    console.log('Response:', res);
    if (!res.ok) {
        console.error('Error fetching recommendations:', res.statusText);
        setLoading(false);
        return;
    }
    const data = await res.json();
    console.log(data);
    setResults(data.matches);
    setLoading(false);
  };

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Find a Tradesman</h1>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the job you need done..."
        className="w-full border p-2 rounded mb-4"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Searching...' : 'Get Recommendations'}
      </button>
      <ul className="mt-6 space-y-3">
        {results.map((res, i) => (
          <li key={i} className="border p-3 rounded shadow">
            <h2 className="font-semibold text-lg">{res.name}</h2>
            <p className="text-sm">Score: {res.score.toFixed(3)}</p>
            <p className="text-gray-600">{res.bio}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}