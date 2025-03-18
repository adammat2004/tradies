'use client';

import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image";
import { useCallback } from "react";
import { TbPhotoPlus } from "react-icons/tb";

declare global {
    var cloudinary: any;
}

interface ImageUploadProps {
    onChange: (value: string[]) => void;
    value: string[];
}

const PostImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
    const handleUpload = useCallback((result: any) => {
        let uploadedImages: string[] = [];

        if (result.info.files) {
            uploadedImages = result.info.files.map((file: any) => file.uploadInfo.secure_url);
        } else {
            uploadedImages = [result.info.secure_url];
        }

        onChange(uploadedImages);
    }, [onChange]);

    return (
        <CldUploadWidget 
            onSuccess={handleUpload}
            uploadPreset="tradeez"
            options={{
                multiple: true,
                maxFiles: 5
            }}
        >
            {({ open }) => (
                <div 
                    className={`cursor-pointer hover:opacity-70 transition border-dashed
                    border-2 p-5 border-neutral-300 flex flex-col justify-center items-center gap-4 
                    text-neutral-600 ${value.length > 0 ? 'grid grid-cols-3 gap-2' : 'flex'}`} 
                    onClick={() => open?.()}
                >
                    {value.length === 0 ? (
                        <>
                            <TbPhotoPlus size={50}/>
                            <div className="font-semibold text-lg">Click to upload</div>
                        </>
                    ) : (
                        value.map((img, index) => (
                            <div key={index} className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 overflow-hidden">
                                <Image 
                                    alt="Uploaded"
                                    src={img}
                                    layout="fill"
                                    objectFit="cover"
                                    className="rounded-md"
                                />
                            </div>
                        ))
                    )}
                </div>
            )}
        </CldUploadWidget>
    );
};

export default PostImageUpload;