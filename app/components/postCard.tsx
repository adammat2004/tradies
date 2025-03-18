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
    const [isFullscreen, setIsFullscreen] = useState(false);

    return (
        <div className={`bg-white shadow-lg rounded-lg p-6 mx-auto border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50 bg-black flex items-center justify-center' : 'max-w-2xl'}`}>
            <Swiper 
                modules={[Navigation, Pagination]} 
                navigation 
                pagination={{ clickable: true }}
                className="rounded-md overflow-hidden w-full"
            >
                {images.map((image, index) => (
                    <SwiperSlide key={index}>
                        <div 
                            className={`relative w-full ${isFullscreen ? 'h-screen' : 'h-80'}`} 
                            onClick={() => setIsFullscreen(!isFullscreen)}
                        >
                            <Image 
                                src={image} 
                                alt={`Post image ${index + 1}`} 
                                layout="fill" 
                                objectFit="cover" 
                                className={`rounded-md cursor-pointer ${isFullscreen ? 'w-[60vw] h-auto' : ''}`} // Apply 60% screen width in fullscreen
                            />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            {!isFullscreen && (
                <div className="mt-4">
                    <p className="text-gray-800 text-lg font-medium">{comment}</p>
                    <p className="text-gray-500 text-sm mt-2">{new Date(createdAt).toLocaleDateString()}</p>
                </div>
            )}
        </div>
    );
};

export default PostCard;

