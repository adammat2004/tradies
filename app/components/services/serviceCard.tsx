'use client'

import { SafeUser, safeListing } from "@/app/types";
import {Listing} from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeartButton from "../heartButton";

interface ServiceCardProps {
    data: safeListing;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null; 
}

const ServiceCard: React.FC<ServiceCardProps> = ({
    data,
    onAction,
    disabled,
    actionLabel,
    actionId,
    currentUser
}) => {
    const router = useRouter();
    return (
        <div onClick={() => router.push(`/services/${data.id}`)} className="col-span-1 cursor-pointer group">
            <div className="flex flex-col gap-2 w-full">
                <div className="aspect-square w-full relative overflow-hidden rounded-xl">
                    <Image
                        alt='Listing'
                        fill
                        src={data.imageSrc}
                        className="object-cover h-full w-full group-hover:scale-110 transition"
                    />
                    <div className="absolute top-3 right-3">
                        <HeartButton
                            listingId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                </div>
                <div className="font-semibold text-lg">
                    {data.company_name}
                </div>
                <div className="font-light text-neutral-500">
                    <ul className="flex flex-row gap-3">
                        {data.category.slice(0, 2).map((cat) => (
                        <li key={cat}>
                            <div>{cat}</div>
                        </li>
                        ))}
                        {data.category.length > 2 && (
                        <li>
                            <div>+ more</div>
                        </li>
                        )}
                    </ul>
                </div>

                <div className="font-semibold text-lg">
                    {data?.county}, {data?.country}
                </div>
            </div>
        </div>
    )
}

export default ServiceCard;