import prisma from "@/app/libs/prismadb";

interface IParams {
    joblistingId?: string;
}

export default async function getJobById(
    params: IParams
) {
    try {
        const {joblistingId} = params;

        const jobListing = await prisma.job.findUnique({
            where: {
                id: joblistingId
            },
            include: {
                user: true
            }
        });

        if(!jobListing){
            return null;
        }
        return {
            ...jobListing,
            createdAt: jobListing.createdAt.toISOString(),
            user: {
                ...jobListing.user,
                createdAt: jobListing.user.createdAt.toISOString(),
                updatedAt: jobListing.user.updatedAt.toISOString(),
                emailVerified: jobListing.user.emailVerified,
            }
        } 
    } catch (error: any) {
        throw new Error(error);
    } 
}