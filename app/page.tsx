export const dynamic = "force-dynamic";

import { Suspense } from "react";
import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IListingsParams } from "./actions/getListings";
import Container from "./components/container";
import EmptyState from "./components/emptyState";
import ListingCard from "./components/listings/listingCard";

interface HomeProps{
  searchParams: IListingsParams
}

const Home = async ({ searchParams }: HomeProps) => {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();

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
          {listings.map((listing) => {
            return (
              <ListingCard
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

export default Home;