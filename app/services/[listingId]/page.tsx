import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import EmptyState from "@/app/components/emptyState";
import ServiceClient from "./serviceClient";


interface IParams {
    listingId?: string;
}

const ListingPage = async ({params}: {params: IParams}) => {
    const listing = await getListingById(params);
    const currentUser = await getCurrentUser();
    if(!currentUser){
        return <EmptyState />
    }
    
    if(!listing){
        return (
            <EmptyState/>
        )
    }
    if(listing?.userId !== currentUser.id){
        return <EmptyState />
    }
    
    return(
        <ServiceClient 
            listing={listing}
            currentUser={currentUser}
        />
    )
}

export default ListingPage;