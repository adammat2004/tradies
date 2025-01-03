import prisma from '@/app/libs/prismadb';

export interface IListingsParams {
    userId?: string;
    category?: string;
    county?: string;
}

export default async function getListings(
    params: IListingsParams
){
    try {
        const {
            userId,
            category,
            county
        } = params;
        let isActive = true;
        let query: any = {};

        if(userId){
            query.userId;
        }
        if(isActive){
            query.isActive = isActive;
        }

        if(category){
            query.category = category;
        }

        if(county){
            query.county = county;
        }

        const listings = await prisma.listing.findMany({
            where: query,
            orderBy: {
                createdAt: 'desc'
            }
        })
        const safeListings = listings.map((listing) => ({
            ...listing,
            createdAt: listing.createdAt.toISOString(),
        }));

        return safeListings;
    } catch (error: any) {
        throw new Error(error);
    }
}