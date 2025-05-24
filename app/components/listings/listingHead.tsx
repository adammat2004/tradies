'use client'

import { SafeUser } from "@/app/types";
import Heading from "../heading";
import Image from "next/image";
import HeartButton from "../heartButton";

interface ListingHeadProps {
    title: string;
    imageSrc: string;
    company_name: string;
    town: string;
    city: string;
    county: string;
    id: string;
    currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({
    title,
    imageSrc,
    id,
    currentUser,
    company_name,
    city,
    county,
    town
}) => {
    return(
        <>
            <Heading
                title={company_name}
                subtitle={`${town}, ${county}`}
            />
            <div className="w-full h-[60vh] overflow-hidden relative rounded-xl">
                <Image 
                    alt='Profile image'
                    src={imageSrc}
                    fill
                    className="object-cover w-full"
                />
                <div className="absolute top-5 right-5">
                    <HeartButton 
                        listingId={id}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </>
    )
}

export default ListingHead;