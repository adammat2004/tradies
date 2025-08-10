//changes second paragraph
import {NextResponse} from "next/server";
import prisma from "@/app/libs/prismadb";

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function PATCH(req: Request) {
    try {
        const {id, description} = await req.json();
        if (!id || !description) {
            return NextResponse.json(
                {error: "Missing required fields"},
                {status: 400}
            );
        }
        const partsRecord = await prisma.listing.findUnique({
            where: {id: id},
            select: {
                embeddingParts: true, 
            }
        })
        const parts = partsRecord?.embeddingParts as any;
        const updatedParts = {
            ...parts,
            description1: description,
        }

        const texts = [
            updatedParts.description1,
            updatedParts.description2,
            `Categories: ${updatedParts.categories.join(", ")}`,
            `Preferred Jobs: ${updatedParts.preferredJobs.join(", ")}`,
            `Jobs to Avoid: ${updatedParts.jobsToAvoid.join(", ")}`,
            `Company: ${updatedParts.company}`,
            `Address: ${updatedParts.street}, ${updatedParts.town}, ${updatedParts.city}, ${updatedParts.county}, ${updatedParts.country}`,
            `Service Areas: ${updatedParts.serviceAreas.join(", ")}`,
            updatedParts.minJobValue != null ? `Min job value: ${updatedParts.minJobValue}` : "",
            updatedParts.maxJobValue != null ? `Max job value: ${updatedParts.maxJobValue}` : "",
            updatedParts.availability.length
                ? `Availability: ${updatedParts.availability.join(", ")}`
                : "",
            updatedParts.certifications.length
                ? `Certifications: ${updatedParts.certifications.join(", ")}`
                : "",
            updatedParts.languages.length
                ? `Languages: ${updatedParts.languages.join(", ")}`
                : "",
            updatedParts.yearsExperience != null
                ? `Experience: ${updatedParts.yearsExperience} years`
                : "",
        ]
        .filter(Boolean)
        .join(". ");

        const embedRes = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: texts,
        });
        const skillsEmbedding = embedRes.data[0].embedding as number[];
        
        const updatedListing = await prisma.listing.update({
            where: {id: id},
            data: {
                title: description,
                embeddingParts: updatedParts,
                embeddingInput: texts,
                skillsEmbedding,
            },
        });
        return NextResponse.json(updatedListing);
    } catch (error) {
        console.error("Error updating description:", error);
        return NextResponse.json(
            {error: "Failed to update description"},
            {status: 500}
        );
    }
}