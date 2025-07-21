import { User, Listing, job } from "@prisma/client"

export type safeListing = Omit<
    Listing,
    "createdAt"
> & {
    createdAt: string;
}

export type SafeUser = Omit<
    User,
    "createdAt" | "updatedAt" | "emailVerified"
> & {
    createdAt: string;
    updatedAt: string;
    emailVerified: boolean;
}

export type SafeJob = Omit<
    job,
    "createdAt"
> & {
    createdAt: String;
    updatedAt: Date;
}

export type safeRecommendation = Omit<
    Listing,
    "createdAt"
> & {
    createdAt: string;  
    similarity: number;
    _id: {
        $oid: string;
    }
}