import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";
import EmptyState from "@/app/components/emptyState";
import PostClient from "./createPostClient";


interface IParams {
    listingId?: string;
}

const CreatePost = async ({params}: {params: IParams}) => {
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
        <PostClient 
            listing={listing}
            currentUser={currentUser}
        />
    )
}

export default CreatePost;