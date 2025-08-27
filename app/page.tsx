export const dynamic = "force-dynamic";

import { Suspense } from "react";
import getCurrentUser from "./actions/getCurrentUser";
import getListings, { IListingsParams } from "./actions/getListings";
import Container from "./components/container";
import EmptyState from "./components/emptyState";
import ListingCard from "./components/listings/listingCard";
import RemoveFilterButton from "./components/removeFilterButton";
import RecommenderForm from "./components/recommenderForm";
import { redirect } from "next/navigation";

interface HomeProps{
  searchParams: IListingsParams
}

export async function generateMetadata({ searchParams }: HomeProps) {
  const { category, county } = searchParams;

  let title = "Find Trusted Tradesmen in Ireland | Tradeez";
  let description = "Find skilled and reliable tradesmen in Ireland with Tradeez.ie. Connect with professionals across various trades to meet your specific needs.";

  let canonicalUrl = "https://www.tradeez.ie";

  if (category && county) {
    title = `${category} services in ${county} - Tradeez`;
    description = `Find ${category} services located in ${county}.`;
    canonicalUrl += `/?category=${encodeURIComponent(category)}&county=${encodeURIComponent(county)}`;
  } else if (category) {
    title = `${category} services - Tradeez`;
    description = `Browse the best ${category} contractors in Ireland.`;
    canonicalUrl += `/?category=${encodeURIComponent(category)}`;
  } else if (county) {
    title = `Tradesmen in ${county} - Tradeez`;
    description = `Find tradesmen available in ${county}.`;
    canonicalUrl += `/?county=${encodeURIComponent(county)}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}


const Home = async ({ searchParams }: HomeProps) => {
  const listings = await getListings(searchParams);
  const currentUser = await getCurrentUser();
 
  if(currentUser && currentUser.mode === 'work'){
    redirect('/work');
  }

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
        <div className="pt-12">
          <RecommenderForm />
        </div>
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-8 pl-8 pr-8">
          {listings.map((listing) => {
            return (
              <div key={listing.id}>
                <ListingCard
                  currentUser={currentUser} 
                  key={listing.id}
                  data={listing}
                />
              </div>
            )
          })}
          <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 mb-8">
            <RemoveFilterButton 
              label="Remove Filters"
            />
          </div>
        </div>  
      </Container>
    </Suspense>
  );
}

export default Home;