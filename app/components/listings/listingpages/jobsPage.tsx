import React from 'react'
import ListingsJobCard from '../../listingsJobCard';

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
}

const JobsPage: React.FC<jobsPageProps> = ({
  jobs
}) => {
  return (
    <div>
      {jobs.length > 0 ? (
                <div className="container mx-auto p-6">
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
    </div>
  )
}

export default JobsPage