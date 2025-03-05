import prisma from '@/app/libs/prismadb';


export interface JobListingParams {
    userId?: string;
    category?: string;
    county?: string;
}

export default async function getJobs(
    params: JobListingParams
){
    try {
        const {
            userId,
            category,
            county
        } = params;
        let query: any = {};

        if(userId){
            query.userId;
        }
        
        if(category){
            query.category = category;
        }

        if(county){
            query.county = county;
        }

        const listings = await prisma.job.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            }
        })

        const safeJobListing = listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
        }));

        return safeJobListing
    } catch (error: any) {
        throw new Error(error);
    }
}