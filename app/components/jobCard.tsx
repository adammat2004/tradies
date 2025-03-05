'use client'

import React from 'react'
import { SafeJob, SafeUser } from '../types';
import { useRouter } from 'next/navigation';

interface JobCardProps {
    currentUser?: SafeUser | null;
    job: SafeJob;
}

const JobCard: React.FC<JobCardProps> = ({
    currentUser,
    job
}) => {
  const getDaysAgo = (createdAt: string | Date): number => {
    const createdDate = new Date(createdAt);
    const today = new Date();
    const diffTime = today.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  };

  const router = useRouter();

  return (
    <div 
      onClick={() => router.push(`jobs/${job.id}`)} 
      className="cursor-pointer w-[60%] md:w-[70%] sm:w-[80%] h-[320px] p-8 border border-gray-300 shadow-lg rounded-2xl 
                 hover:shadow-xl transition-shadow duration-300 bg-white flex flex-col justify-between mx-auto"
    >
      {/* Job Title */}
      <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">{job.jobTitle}</h2>
      
      {/* Company & Location */}
      <div className="flex flex-row items-center gap-2 text-xl text-gray-700">
        <p className="font-semibold">{job.companyName}</p>
        <span className="text-gray-400">•</span>
        <p>{job.location}</p>
      </div>

      {/* Salary */}
      <div className="text-lg font-medium text-gray-700">
        {job.salary ? <p>💰 {job.salary}</p> : <p className="text-gray-500">Not Disclosed</p>}
      </div>

      {/* Job Description - Truncated */}
      <div className="text-gray-700 text-base truncate w-full">
        {job.description}
      </div>

      {/* Date Posted */}
      <div className="text-sm text-gray-500">
        {getDaysAgo(job.createdAt.toString()) > 1 
          ? <p>🕒 {getDaysAgo(job.createdAt.toString())} days ago</p> 
          : <p className="text-green-700 font-semibold">Today <span className="bg-green-100 px-2 py-1 rounded-full text-xs">New</span></p>}
      </div>
    </div>
  )
}

export default JobCard;
