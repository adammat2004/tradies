export const dynamic = "force-dynamic";

import { Suspense } from "react";
import getCurrentUser from "../actions/getCurrentUser";
import getListings, { IListingsParams } from "../actions/getListings";
import Container from "../components/container";
import EmptyState from "../components/emptyState";
import ServiceCard from "../components/services/serviceCard";
import prisma from "@/app/libs/prismadb";

const ServicesHome = async () => {
    const currentUser = await getCurrentUser();
    if(!currentUser){
        return (
            <EmptyState />
        )
    }
    const listingId = currentUser?.id;

    const listings = await prisma.listing.findMany({
    where: {
        userId: listingId
    },
    include: {
        user: true
    }
    });
    const safeListings = listings.map((listing) => ({
        ...listing,
        createdAt: listing.createdAt.toISOString(),
    }));

    if(listings.length === 0){
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <EmptyState
            showReset
        />
        </Suspense>
    )
    }
    return (
    <Suspense fallback={<div>Loading...</div>}>
    <Container>
    <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pl-8">
        {safeListings.map((listing) => {
            return (
                <ServiceCard
                currentUser={currentUser} 
                key={listing.id}
                data={listing}
                />
            )
        })}
        </div>  
        </Container>
        </Suspense>
    );
}

export default ServicesHome;