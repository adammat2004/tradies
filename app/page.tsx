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

export async function generateMetadata({ searchParams }: HomeProps) {
  const { category, county } = searchParams;

  let title = "Irelands best tradesmen - Tradeez";
  let description = "Find tradesmen to suit your needs.";

  // Modify the title and description based on the searchParams
  if (category) {
    title = `${category} services - Tradeez`;
    description = `Browse the best ${category} contractors in Ireland.`;
  }
  if (county) {
    title = `Tradesmen in ${county} - Tradeez`;
    description = `Find tradesmen available in ${county}.`;
  }
  if (category && county) {
    title = `${category} services in ${county} - Tradeez`;
    description = `Find ${category} services located in ${county}.`;
  }

  return {
    title,
    description,
  };
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
        <div className="pt-24 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pl-8 pr-8">
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