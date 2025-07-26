'use client'

import { SafeUser, safeListing } from "@/app/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import HeartButton from "../heartButton";

interface ListingCardProps {
    data: safeListing;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null; 
}

const ListingCard: React.FC<ListingCardProps> = ({
    data,
    onAction,
    disabled,
    actionLabel,
    actionId,
    currentUser
}) => {
    const router = useRouter();
    const imageUrl = `${data.imageSrc}?q_auto,f_auto,w_auto,dpr_auto`
    return (
        <div onClick={() => router.push(`/listings/${data.id}`)} className="col-span-1 cursor-pointer group">
            <div className="flex flex-col gap-2 w-full">
                <div className="aspect-square w-full relative overflow-hidden rounded-xl">
                    <Image
                        alt='Listing'
                        fill
                        src={imageUrl}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                    {data?.town}, {data?.county}
                </div>
            </div>
        </div>
    )
}

export default ListingCard;