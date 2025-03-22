export const dynamic = "force-dynamic";

import React, { Suspense } from 'react';
import getJobs, {JobListingParams} from '../actions/getJobs';
import getCurrentUser from '../actions/getCurrentUser';
import EmptyState from '../components/emptyState';
import Container from '../components/container';
import JobCard from '../components/jobCard';
import JobSearch from '../components/jobSearch';

interface JobProps {
  searchParams: JobListingParams
}

export async function generateMetadata({ searchParams }: JobProps) {
  const { category, county, jobType } = searchParams;

  let title = "Construction jobs in Ireland - Tradeez";
  let description = "Find construction jobs in Ireland.";

  // Modify the title and description based on the searchParams
  if (category) {
    title = `${category} jobs - Tradeez`;
    description = `Find jobs with the best ${category} contractors in Ireland.`;
  }
  if (county) {
    title = `Tradesmen jobs in ${county} - Tradeez`;
    description = `Explore tradesmen jobs available in ${county}.`;
  }
  if (category && county) {
    title = `${category} jobs in ${county} - Tradeez`;
    description = `Find ${category} jobs located in ${county}.`;
  }
  if(jobType){
    title = `${jobType} tradesmen jobs in Ireland`
    description = `Explore ${jobType} jobs in Ireland`
  }
  if(jobType && category){
    title = `${jobType} ${category} jobs in Ireland`
    description = `Find ${jobType} ${category} jobs in Ireland`
  }

  return {
    title,
    description,
  };
}

const jobPage = async ({searchParams}: JobProps) => {
  const jobListings = await getJobs(searchParams);
  //console.log("job listings", jobListings);
  const currentUser = await getCurrentUser();

  if(jobListings.length === 0){
    return (
      <Suspense fallback={<div>Loading...</div>}>
        <EmptyState
          showReset
        />
      </Suspense>
    )
  }
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Container>
        <JobSearch />
        <div className='pt-8'>
          <div className="flex flex-col space-y-4">
            {jobListings.map((job) => {
              return (
                <JobCard
                  currentUser={currentUser} 
                  job={job}
                  key={job.id}
                />
              )
            })}
          </div>
        </div>
      </Container>
    </Suspense>
  )
}

export default jobPage