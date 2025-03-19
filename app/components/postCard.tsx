'use client';

import { FC, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Image from "next/image";

interface PostCardProps {
    comment: string;
    images: string[];
    createdAt: Date;
    id: string;
}

const PostCard: FC<PostCardProps> = ({ comment, images, createdAt, id }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative bg-white shadow-lg rounded-lg p-6 mx-auto border border-gray-200 max-w-2xl">
            {/* Swiper for normal mode */}
            <Swiper 
                modules={[Navigation, Pagination]} 
                navigation 
                pagination={{ clickable: true }}
                className="rounded-md overflow-hidden w-full"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div 
                            className="relative w-full h-80 cursor-pointer"
                            onClick={() => setIsExpanded(true)}
                        >
                            <Image 
                                src={image} 
                                alt={`Post image ${index + 1}`} 
                                layout="fill" 
                                objectFit="cover" 
                                className="rounded-md"
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>

            {/* Fullscreen Mode */}
            {isExpanded && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setIsExpanded(false)}
                >
                    {/* Container for Swiper (resizes based on screen size) */}
                    <div 
                        className="relative sm:w-[80vw] md:w-[60vw] max-h-[85vh] w-[90vw]" 
                        onClick={(e) => e.stopPropagation()} // Prevent closing on click inside
                    >
                        <Swiper 
                            modules={[Navigation, Pagination]} 
                            navigation 
                            pagination={{ clickable: true }}
                            className="rounded-lg overflow-hidden w-full h-full"
                        >
                            {images.map((image, index) => (
                                <SwiperSlide key={index}>
                                    <div className="relative w-full h-[70vh]">
                                        <Image 
                                            src={image} 
                                            alt={`Fullscreen image ${index + 1}`} 
                                            layout="fill" 
                                            objectFit="contain" 
                                            className="rounded-lg shadow-lg"
                                        />
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            )}

            {/* Post content */}
            <div className="mt-4">
                <p className="text-gray-800 text-lg font-medium">{comment}</p>
                <p className="text-gray-500 text-sm mt-2">{new Date(createdAt).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default PostCard;