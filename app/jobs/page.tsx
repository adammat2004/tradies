import React, { Suspense } from 'react';
import getJobs, {JobListingParams} from '../actions/getJobs';
import getCurrentUser from '../actions/getCurrentUser';
import EmptyState from '../components/emptyState';
import Container from '../components/container';
import JobCard from '../components/jobCard';

interface JobProps {
  searchParams: JobListingParams
}

const jobPage = async ({searchParams}: JobProps) => {
  const jobListings = await getJobs(searchParams);
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
      </Container>
    </Suspense>
  )
}

export default jobPage