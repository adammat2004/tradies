"use client"
import { useState } from "react"
import Container from "../components/container"
import RecommendedListingCard from "../components/listings/recommendedListingCard"

export function MatchForm() {
  const [desc, setDesc] = useState("")
  const [county, setCounty] = useState("")
  const [results, setResults] = useState<any[]>([])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch("/api/match", {
      method: "POST",
      body: JSON.stringify({ description: desc, county }),
      headers: { "Content-Type": "application/json" },
    })
    const { matches } = await res.json()
    setResults(matches)
  }

  return (
    <Container>
      <div className="max-w-5xl mx-auto p-4">
        <form
          onSubmit={onSubmit}
          className="space-y-4 bg-white shadow-md rounded-2xl p-6"
        >
          <textarea
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Describe your job…"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[100px]"
          />
          <input
            value={county}
            onChange={e => setCounty(e.target.value)}
            placeholder="County (optional)"
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Find Tradesmen
          </button>
        </form>

        {results.length > 0 && (
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {results.map(r => (
              r.similarity > 0.65 && (
                <RecommendedListingCard key={r._id.$oid} data={r} />
              )
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}

export default MatchForm;