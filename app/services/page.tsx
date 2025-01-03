

import EmptyState from "../components/emptyState";
import getCurrentUser from "../actions/getCurrentUser";
import getListings from "../actions/getListings";



const ServicesPage = async () => {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        return (
        <EmptyState
            title="Unauthorized"
            subtitle="You must be logged in to view this page"
        />
        );
    }
    
    const listings = await getListings({
        userId: currentUser.id
    })
    if(listings.length === 0) {
        return (
        <EmptyState
            title="No Services"
            subtitle="You have no listings"
        />
        );
    }   
    return(
        <div>
            
        </div>
    )
}

export default ServicesPage;