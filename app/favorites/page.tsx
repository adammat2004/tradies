import { Metadata } from "next";
import EmptyState from "../components/emptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getFavoriteListings from "../actions/getFavoriteListings";
import FavoritesClient from "./favoriteClient";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Your Favorite Tradesmen",
}
const ListingPage = async () => {
    const listings = await getFavoriteListings();
    const currentUser = await getCurrentUser();
    if(listings.length === 0){
        return (
            <Suspense fallback={<div>Loading...</div>} >
                <EmptyState 
                    title="No favorites found"
                    subtitle="Looks like you have no favorite listings"
                />
            </Suspense>
        )
    }

    return (
        <Suspense fallback={<div>Loading...</div>} >
            <FavoritesClient 
                listings={listings}
                currentUser={currentUser}
            />
        </Suspense>
    )
}

export default ListingPage