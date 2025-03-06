import prisma from '@/app/libs/prismadb';


export interface JobListingParams {
    userId?: string;
    category?: string;
    county?: string;
    jobType?: string;
}

export default async function getJobs(
    params: JobListingParams
){
    try {
        const {
            userId,
            category,
            county,
            jobType
        } = params;
        let query: any = {};
        console.log(category)

        if(userId){
            query.userId;
        }
        
        if(category){
            query.category = category;
        }

        if(county){
            query.location = county;
        }

        if(jobType){
            query.jobType = jobType
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