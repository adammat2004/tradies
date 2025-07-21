// services/matchListings.ts
import prisma from "@/app/libs/prismadb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface MatchParams {
  description: string;
  county?: string;
  limit?: number;
}

export async function matchListings({
  description,
  county,
  limit = 10,
}: MatchParams) {
  // 1) Embed the job description
  const embedRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: description,
  });
  const jobEmbedding = embedRes.data[0].embedding as number[];

  // 2) Run the vector-search aggregation
  const raw = await prisma.$runCommandRaw({
    aggregate: "Listing",
    pipeline: [
      {
        $vectorSearch: {
          queryVector: jobEmbedding,
          path: "skillsEmbedding",
          index: "default",
          numCandidates: 100,
          limit: limit,
          //filter: {
            //isActive: true,
            //operationCounties: {
              //$in: county ? [county] : [],
            //}
          //},
        },
      },
      {
        $match: {
          isActive: true,
          ...(county ? { operationCounties: { $in: [county] } } : {}),
        },
      },
      {
        $project: {
          document: "$$ROOT",
          score: { $meta: "vectorSearchScore" },
        },
      },
    ],
    cursor: {},
  });
  // 3) Inspect shape (optional debug)
  // console.log("Raw vector search batch:", raw.cursor.firstBatch);

  // 4) Map into a flat array of listings + similarity
  const results = (raw as any).cursor.firstBatch as Array<{
    document: Record<string, any>;
    score: number;
  }>;

  return results.map(({ document, score }) => ({
    ...document,
    similarity: score,
  }));
}
