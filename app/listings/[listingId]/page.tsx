import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import EmptyState from "@/app/components/emptyState";
import ListingClient from "./listingClient";
import { Metadata} from 'next';

interface IParams {
    listingId?: string;
}

export async function generateMetadata({ params }: { params: IParams }): Promise<Metadata> {
    const listing = await getListingById(params);
  
    if (!listing) {
      return {
        title: "Listing Not Found",
        description: "The listing you are looking for does not exist.",
      };
    }
  
    return {
      title: listing.company_name || "Listing Details",
      description: listing.title || "View this listing on our platform.",
      openGraph: {
        title: listing.title,
        description: listing.description,
        images: [
            {
                url: listing.imageSrc,
                alt: listing.company_name,
            },
        ]
      },
    };
  }

const ListingPage = async ({params} : {params: IParams}) => {
    const listing = await getListingById(params);
    const currentUser = await getCurrentUser();

    if(!listing){
        return (
            <EmptyState/>
        )
    }
    return(
        <ListingClient 
            listing={listing}
            currentUser={currentUser}
        />
    )
}

export default ListingPage;