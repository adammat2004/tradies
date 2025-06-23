import React from 'react'
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

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

interface jobsPageProps {
    jobs: JobListing[];
    id: string;
}

const JobsPage: React.FC<jobsPageProps> = ({
  jobs,
  id
}) => {
    const router = useRouter();
    const [jobListings, setJobListings] = useState<JobListing[]>(jobs);
    const handleJobListingDelete = async (id: string) => {
        try {
        const response = await fetch(`/api/deleteJobListing?id=${id}`, {
            method: "DELETE",
            headers: {
            "Content-Type": "application/json",
            },
        });
        if(!response.ok){
            throw new Error("Failed to delete jobLising");
        }
        setJobListings((prevJobListings) => 
            prevJobListings.filter((job) => job.id !== id)
        );

        return toast.success("Job Listing Deleted!");

        } catch (error) {
            return console.error("Error deleting job listing", error);
        }
    }
    return (
        <div>
            {jobs.length > 0 ? (
                <div className="container mx-auto p-6">
                    <div className="">
                        <ul>
                            {jobListings.map((job) => (
                                <li key={job.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                                    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">{job.jobTitle}</h2>
                                        <p className="text-sm text-gray-600 mb-4">{job.jobType}</p>
                                        {job.salary && <p className="text-lg font-medium text-green-600">${job.salary}</p>}
                                        <p className="text-gray-700 text-sm mt-2 line-clamp-3">{job.description}</p>
                                        <button onClick={() => handleJobListingDelete(job.id)} className="mt-4 w-full bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-all">
                                            Delete Job Listing
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex justify-end mt-6">
                        <button 
                            onClick={() => router.push(`/create-job-listing/${id}`)} 
                            className="bg-rose-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                            Add Job Listing
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-64 text-lg text-gray-600">
                    <div>No Job Listings Available</div>
                    <div className="flex justify-end mt-6">
                        <button 
                            onClick={() => router.push(`/create-job-listing/${id}`)} 
                            className="bg-rose-500 text-white px-5 py-3 rounded-lg shadow-md hover:bg-red-600 transition"
                        >
                            Add Job Listing
                        </button>
                    </div>
                </div>
        )}
    </div>
  )
}

export default JobsPage