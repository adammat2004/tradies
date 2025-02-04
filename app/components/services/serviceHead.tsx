'use client'

import { SafeUser } from "@/app/types";
import Heading from "../heading";
import prisma from "@/app/libs/prismadb";
import Image from "next/image";
import HeartButton from "../heartButton";
import ImageUpload from "../Inputs/imageUpload";
import { useState } from "react";

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
            setImage(data.imageSrc); // Update the state with the new image URL
            setIsEditing(false); // Close the editor
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
                <div className="absolute bottom-5 right-5 text-red-700">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)}>Change Photo</button>
                    ) : (
                        <ImageUpload value={image} onChange={handleImageChange} />
                    )}
                </div>
            </div>
        </>
    );
};

export default ServiceHead;
