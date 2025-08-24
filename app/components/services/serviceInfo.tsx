"use client";

import { SafeUser } from "@/app/types";
import React, { useState, useEffect } from "react";
import { IconType } from "react-icons";
import AboutPage from "./servicepages/aboutPage";
import ProjectsPage from "./servicepages/projectsPage";
import JobsPage from "./servicepages/jobsPage";
import EmbeddingsPage from "./servicepages/embeddingsPage";
import ContactPage from "./servicepages/contactPage";
import ProviderSchedulePage from "./servicepages/contactPage";


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
    is_business: boolean;
    category: {
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

enum Page {
    About = 0,
    Projects = 1,
    Bookings = 2,
    Jobs = 3,
    Info = 4,
}

const ServiceInfo: React.FC<ListingInfoProps> = ({
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
    is_business
}) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [page, setPage] = useState<Page>(Page.About);
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
    
    let bodyContent = (
        <AboutPage 
            paragraph1={description}
            paragraph2={title}
            category={category}
            id={listingId}
        />
    )
    if(page === Page.Projects){
        bodyContent = (
            <ProjectsPage 
                listingId={listingId}
            />
        )
    }
    if(page === Page.Bookings){
        bodyContent = (
            <ProviderSchedulePage
                listingId={listingId}
                user={user}
                category={category}        
            />
        )
    }
    if(page === Page.Jobs){
        bodyContent = (
            <JobsPage 
                jobs={jobs}
                id={listingId}
            />
        )
    }
    if(page === Page.Info){
        bodyContent = (
            <EmbeddingsPage
                listingId={listingId}
            />
        )
    }
    return (
         <div className="mx-auto max-w-screen-lg px-4 md:px-6 lg:px-8 py-6">
            <div className="w-full overflow-x-hidden">
                <div className="bg-white shadow-md">
                    {is_business ? (
                        <nav className="flex justify-around md:flex-row items-center py-4 px-6 gap-2 md:gap-8 text-lg font-medium font-serif">
                                {[
                                    { name: "About", value: Page.About },
                                    { name: "Projects", value: Page.Projects },
                                    { name: "Bookings", value: Page.Bookings },
                                    { name: "Jobs", value: Page.Jobs },
                                    { name: "Info", value: Page.Info },
                                ].map(({ name, value }) => (
                                    <button
                                    key={name}
                                    onClick={() => setPage(value)}
                                    className={`relative px-3 py-1 transition-all duration-300 hover:text-rose-500 ${
                                        page === value
                                        ? "text-rose-500 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-1 after:bg-rose-500 after:rounded-full"
                                        : "text-gray-600"
                                    }`}
                                    >
                                    {name}
                                </button>
                            ))}
                         </nav>
                    ) : (
                       <nav className="flex justify-around md:flex-row items-center py-4 px-6 gap-2 md:gap-8 text-lg font-medium font-serif">
                            {[
                                { name: "About", value: Page.About },
                                { name: "Projects", value: Page.Projects },
                                { name: "Info", value: Page.Info },
                            ].map(({ name, value }) => (
                                <button
                                key={name}
                                onClick={() => setPage(value)}
                                className={`relative px-3 py-1 transition-all duration-300 hover:text-rose-500 ${
                                    page === value
                                    ? "text-rose-500 font-semibold after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-3/4 after:h-1 after:bg-rose-500 after:rounded-full"
                                    : "text-gray-600"
                                }`}
                                >
                                {name}
                                </button>
                            ))}
                        </nav> 
                    )}
                </div>
            </div>
            <div>
                {bodyContent}
            </div>
         </div>
    )
}
export default ServiceInfo;