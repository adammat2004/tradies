import getCurrentUser from '@/app/actions/getCurrentUser';
import getJobById from '@/app/api/getJobById/route'
import EmptyState from '@/app/components/emptyState';

interface IParams {
    joblistingId?: string;
}

const JobListingPage = async ({params}: {params: IParams}) => {
    const jobListing = await getJobById(params);
    const currentUser = await getCurrentUser();
    
    if(!jobListing){
        return (
            <EmptyState/>
        )
    }

    const getDaysAgo = (createdAt: string | Date): number => {
        const createdDate = new Date(createdAt);
        const today = new Date();
        const diffTime = today.getTime() - createdDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays;
    };

    return (
        <div className="max-w-screen-xl mx-auto p-12 bg-white shadow-xl rounded-lg h-screen">
            {/* Job Title */}
            <div className="mb-8">
                <h1 className="text-5xl font-extrabold text-gray-900">{jobListing.jobTitle}</h1>
            </div>
            
            {/* Job Info (Company, Location, Job Type) */}
            <div className="flex flex-wrap gap-10 mb-8 text-xl text-gray-700">
                <p className="font-semibold">{jobListing.companyName}</p>
                <p>{jobListing.location}</p>
                <p>{jobListing.jobType}</p>
            </div>
            
            {/* Published Date and Salary */}
            <div className="flex flex-wrap gap-10 mb-8 text-lg text-gray-600">
                {getDaysAgo(jobListing.createdAt.toString()) === 1 ? (
                    <p className="text-green-700 font-semibold">Today <span className="bg-green-100 px-2 py-1 rounded-full text-xs">New</span></p>
                ) : (
                    <p>Published {getDaysAgo(jobListing.createdAt.toString())} days ago</p>
                )}
                {jobListing.salary ? <p>💰 {jobListing.salary}</p> : <p>Not Disclosed</p>}
            </div>
            
            {/* Job Description */}
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Job Description</h2>
                <p className="text-gray-700 text-lg">{jobListing.description}</p>
            </div>

            {/* Requirements Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Requirements</h2>
                <ul className="list-disc pl-8 text-lg text-gray-700">
                    {jobListing.requirements.map((requirement, index) => (
                        <li key={index} className="mb-2">{requirement}</li>
                    ))}
                </ul>
            </div>

            {/* Benefits Section */}
            <div className="mb-8">
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Benefits</h2>
                <ul className="list-disc pl-8 text-lg text-gray-700">
                    {jobListing.benefits.map((benefit, index) => (
                        <li key={index} className="mb-2">{benefit}</li>
                    ))}
                </ul>
            </div>

            {/* Contact Info */}
            <div>
                <h2 className="text-3xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                <p className="text-lg text-gray-700">{jobListing.contactInfo}</p>
            </div>
        </div>
    );
}

export default JobListingPage;
