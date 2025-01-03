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
      <EmptyState
        showReset
      />
    )
  }
  return (
    <Container>
      <div className="pt-24 grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
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
  );
}

export default Home;