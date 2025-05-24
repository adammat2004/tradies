"use client";

import { SafeUser } from "@/app/types";
import React, { useState, useEffect } from "react";
import { IconType } from "react-icons";
import PostCard from "../postCard";
import ListingsJobCard from "../listingsJobCard";


interface ListingInfoProps {
    user: SafeUser;
    description: string;
    title: string;
    town: string;
    street: string;
    country: string;
    county: string;
    phone: string;
    email: string;
    city: string;
    listingId: string;
    category?: {
        icon: IconType;
        label: string;
        description: string;
    }[];
}

interface JobListing {
    id: string;             
    jobTitle: string;
    category: string;
    companyName: string;
    location: string;
    salary: string | undefined | null;
    jobType: string;
    requirements: string[];
    description: string;
    benefits: string[]
    contactInfo: string
    createdAt: Date;
    updatedAt: Date;
    userId: string; 
}

interface Post {
    id: string;
    userId: string;
    comment: string;
    pictures: string[];
    listingId: string;
    createdAt: Date;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
    user,
    description,
    category,
    title,
    town,
    city,
    street,
    country,
    county,
    phone,
    email,
    listingId,
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [jobs, setJobs] = useState<JobListing[]>([]);
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch(`/api/getPostsByListingId?listingId=${listingId}`);
                if (!response.ok) throw new Error("Failed to fetch posts");

                const { data } = await response.json();
                setPosts(data);
            } catch (error) {
                console.error("Fetching posts error", error);
            }
        };

        fetchPosts();
    }, [listingId]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch(`/api/getJobsByListingId?listingId=${listingId}`);
                if (!response.ok) throw new Error("Failed to fetch job listings");

                const { data } = await response.json();
                setJobs(data);
            } catch (error) {
                console.error("Fetching posts error", error);
            }
        };

        fetchJobs();
    }, [listingId]);
    return (
        <div className="md:col-span-8 flex flex-col gap-12 p-6 bg-white rounded-lg shadow-lg">
            {/* About Section */}
            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex-1">
                    <h2 className="text-gray-900 text-3xl font-bold mb-4">About Us</h2>
                    <p className="text-base text-gray-700 mb-4 leading-relaxed">{description}</p>
                    <p className="text-base text-gray-700 leading-relaxed">{title}</p>
                </div>

                {/* Address Section (Desktop) */}
                <div className="hidden lg:flex flex-col bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm w-1/3">
                    <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
                    <div className="text-base text-gray-700 space-y-2">
                        <p>{street}</p>
                        <p>{town}</p>
                        <p>{city}</p>
                        <p>{county}</p>
                        <p>{country}</p>
                    </div>
                </div>
            </div>

            {/* Address Section (Mobile) */}
            <div className="flex flex-col mt-6 lg:hidden">
                <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
                <div className="text-base text-gray-700 space-y-2">
                    <p>{street}</p>
                    <p>{town}</p>
                    <p>{city}</p>
                    <p>{county}</p>
                    <p>{country}</p>
                </div>
            </div>

            {/* Posts Section - Only Render if There Are Posts */}
            {posts.length > 0 ? (
                <div className="relative p-6 flex flex-col">
                    <h1 className="text-gray-900 text-3xl font-bold mb-6">Posts</h1>
                    <div className="relative flex flex-col flex-grow">
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map((post) => (
                                <li key={post.id}>
                                    <PostCard 
                                        id={post.id}
                                        comment={post.comment}
                                        createdAt={post.createdAt}
                                        images={post.pictures}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-600">No posts available.</p> // Show message if no posts
            )}

            {jobs.length > 0 ? (
                <div className="container mx-auto p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Job Listings</h1>
                    <div className="">
                        <ul>
                            {jobs.map((job) => (
                                <li key={job.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                                    <ListingsJobCard
                                        title={job.jobTitle}
                                        salary={job.salary}
                                        jobType={job.jobType}
                                        description={job.description}
                                        id={job.id}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center h-64 text-lg text-gray-600">
                    No Job Listings Available
                </div>
            )}


            {/* Contact Section */}
            <div className="flex flex-col w-full mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center">
                        <span className="text-base font-medium text-gray-700 w-24">Phone:</span>
                        <span className="text-base text-gray-600">{phone}</span>
                    </div>
                    <div className="flex items-center">
                        <span className="text-base font-medium text-gray-700 w-24">Email:</span>
                        <span className="text-base text-gray-600">{email}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ListingInfo;
