'use client'

import Container from "@/app/components/container";
import ServiceHead from "../../components/services/serviceHead";
import ServiceInfo from "../../components/services/serviceInfo";
import { categories } from "@/app/components/navbar/categories";
import { safeListing, SafeUser } from "@/app/types";
import { useMemo } from "react";

interface ServiceClientProps {
    listing: safeListing & {
        user: SafeUser
    };
    currentUser?: SafeUser | null;
}

const ServiceClient: React.FC<ServiceClientProps> = ({
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
                    <ServiceHead
                        title={listing.title}
                        imageSrc={listing.imageSrc}
                        id={listing.id}
                        city={listing.city}
                        county={listing.county}
                        company_name={listing.company_name}
                        currentUser={currentUser}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-7 md:gap-10 mt-6">
                        <ServiceInfo 
                            id={listing.id}
                            user={listing.user}
                            city={listing.city}
                            category={category}
                            description={listing.description}
                            town={listing.town}
                            street={listing.street}
                            country={listing.country}
                            county={listing.county}
                            phone={listing.phone_number}
                            email={listing.email}
                            title={listing.title}
                        />
                    </div>
                </div>
            </div>
        </Container>
    )
}

export default ServiceClient;