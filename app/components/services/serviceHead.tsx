'use client'

import { SafeUser } from "@/app/types";
import Heading from "../heading";
import Image from "next/image";
import HeartButton from "../heartButton";
import ImageUpload from "../Inputs/imageUpload";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ServiceHeadProps {
    title: string;
    imageSrc: string;
    company_name: string;
    city: string;
    county: string;
    id: string;
    currentUser?: SafeUser | null;
}

const ServiceHead: React.FC<ServiceHeadProps> = ({
    title,
    imageSrc,
    id,
    currentUser,
    company_name,
    city,
    county,
}) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [image, setImage] = useState(imageSrc);

    const handleImageChange = async (value: string) => {
        try {
            const response = await fetch("/api/updateImage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id, imageSrc: value }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update image");
            }
    
            const data = await response.json();
            setImage(data.imageSrc);
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            console.error("Error updating image:", error);
        }
    };

    return (
        <>
            <Heading title={company_name} subtitle={`${city}, ${county}`} />
            <div className="w-full h-[60vh] overflow-hidden relative rounded-xl">
                <Image alt="Profile image" src={image} fill className="object-cover w-full" />
                <div className="absolute top-5 right-5">
                    <HeartButton listingId={id} currentUser={currentUser} />
                </div>
                {isEditing ? (
                    <div className="absolute bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition">
                        <ImageUpload value={image} onChange={handleImageChange} />
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition ml-2"
                            onClick={() => handleImageChange(image)}
                        >
                            Save
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-600 transition ml-2"
                            onClick={() => setIsEditing(false)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        className="absolute bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition"
                        onClick={() => setIsEditing(true)}
                    >
                        Edit Photo
                    </button>
                )}
            </div>
        </>
    );
};

export default ServiceHead;