'use client'

import Container from "@/app/components/container";
import ListingHead from "@/app/components/listings/listingHead";
import ListingInfo from "@/app/components/listings/listingInfo";
import { categories } from "@/app/components/navbar/categories";
import { safeListing, SafeUser } from "@/app/types";
import { useMemo } from "react";

interface ListingClientProps {
    listing: safeListing & {
        user: SafeUser
    };
    currentUser?: SafeUser | null;
}

const ListingClient: React.FC<ListingClientProps> = ({
    listing,
    currentUser
}) => {
    const category = useMemo(() => {
        return categories.find((item) => 
            item.label === listing.category)
    }, [listing.category]);
    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        id={listing.id}
                        city={listing.city}
                        county={listing.county}
                        company_name={listing.company_name}
                        currentUser={currentUser}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                        <ListingInfo
                            title={listing.title}
                            town={listing.town}
                            street={listing.street}
                            country={listing.country}
                            county={listing.county}
                            phone={listing.phone_number}
                            email={listing.email}
                            city={listing.city}
                            user={listing.user}
                            listingId={listing.id}
                            category={category}
                            description={listing.description}
                        />
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ListingClient;