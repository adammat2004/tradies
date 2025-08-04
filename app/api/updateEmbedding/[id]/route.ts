// app/api/listings/[id]/embeddingInput/route.ts
import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface EmbeddingInput {
  description1: string;
  description2: string;
  categories: string[];
  preferredJobs: string[];
  jobsToAvoid: string[];
  company: string;
  street: string;
  town: string;
  city: string;
  county: string;
  country: string;
  serviceAreas: string[];
  minJobValue?: number;
  maxJobValue?: number;
  availability: string[];
  certifications: string[];
  languages: string[];
  yearsExperience?: number;
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const parts = (await req.json());

    // Build the flat embedding input
    const texts = [
      parts.description1,
      parts.description2,
      `Categories: ${parts.categories.join(", ")}`,
      `Preferred Jobs: ${parts.preferredJobs.join(", ")}`,
      `Jobs to Avoid: ${parts.jobsToAvoid.join(", ")}`,
      `Company: ${parts.company}`,
      `Address: ${parts.street}, ${parts.town}, ${parts.city}, ${parts.county}, ${parts.country}`,
      `Service Areas: ${parts.serviceAreas.join(", ")}`,
      parts.minJobValue != null ? `Min job value: ${parts.minJobValue}` : "",
      parts.maxJobValue != null ? `Max job value: ${parts.maxJobValue}` : "",
      parts.availability.length
        ? `Availability: ${parts.availability.join(", ")}`
        : "",
      parts.certifications.length
        ? `Certifications: ${parts.certifications.join(", ")}`
        : "",
      parts.languages.length
        ? `Languages: ${parts.languages.join(", ")}`
        : "",
      parts.yearsExperience != null
        ? `Experience: ${parts.yearsExperience} years`
        : "",
    ]
      .filter(Boolean)
      .join(". ");

    // Generate new embedding
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });
    const skillsEmbedding = embedRes.data[0].embedding as number[];

    // Persist structured parts and vector
    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: {
        embeddingParts: parts,    // structured JSON
        embeddingInput: texts,    // flat string
        skillsEmbedding,          // vector
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (err: any) {
    console.error("Embedding update error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
