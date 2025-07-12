export default function cosineSimilarity(a: number[], b: number[]): number {
    if (!a || !b) {
        console.warn('Vectors missing');
        return 0;
    }
  if (a.length !== b.length) {
    console.warn('Invalid embedding comparison: mismatched lengths or undefined vectors');
    return 0;
  }

  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));

  return dot / (normA * normB);
}
