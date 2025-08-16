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
        return categories.filter((item) => 
            listing.category.includes(item.label)
        );
    }, [listing.category]);
    return (
        <Container>
            <div className="max-w-screen-lg mx-auto">
                <div className="flex flex-col gap-6">
                    <ListingHead
                        title={listing.title}
                        imageSrc={listing.imageSrc ? listing.imageSrc : '/placeholder.png'}
                        id={listing.id}
                        city={listing.city}
                        county={listing.county}
                        company_name={listing.company_name}
                        currentUser={currentUser}
                        town={listing.town}
                    />
                    <div className="md:gap-10 mt-6">
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
                            is_business={listing.is_business}
                        />
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ListingClient;