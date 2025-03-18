'use client';

import { safeListing, SafeUser } from '@/app/types';
import PostImageUpload from '@/app/components/Inputs/postsImageUpload';
import { FieldValues, useForm } from 'react-hook-form';
import { useState } from 'react';
import { redirect } from 'next/navigation';

interface PostClientProps {
    listing: safeListing & { user: SafeUser };
    currentUser?: SafeUser | null;
}

const PostClient: React.FC<PostClientProps> = ({ currentUser, listing }) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        reset
    } = useForm<FieldValues>({
        defaultValues: {
            comment: '',
            imageSrc: [],
        }
    });

    const [images, setImages] = useState<string[]>([]);

    const handleImageUpload = (newImages: string[]) => {
        setImages((prev) => [...prev, ...newImages]);
    };

    const onSubmit = async (data: FieldValues) => {
        const payload = {
            ...data,
            listingId: listing.id,
            userId: currentUser?.id,
            imageSrc: images,
        };

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to submit post');
            }

            reset();
            setImages([]);
            redirect('/');
        } catch (error) {
            console.error('Error submitting post:', error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mx-auto min-h-screen flex flex-col justify-start mt-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Post about your recent work</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full">
                <PostImageUpload value={images} onChange={handleImageUpload} />
                <textarea 
                    {...register("comment", { required: true })} 
                    placeholder="Write a comment..."
                    className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[150px]"
                />
                {errors.comment && <p className="text-red-500 text-sm">Comment is required</p>}
                <button 
                    type="submit" 
                    className="w-full bg-rose-500 text-white font-medium py-3 rounded-lg hover:bg-rose-600 transition"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default PostClient;

