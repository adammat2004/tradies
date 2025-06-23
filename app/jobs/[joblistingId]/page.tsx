import getCurrentUser from '@/app/actions/getCurrentUser';
import getJobById from '@/app/api/getJobById/route';
import EmptyState from '@/app/components/emptyState';

interface IParams {
    joblistingId?: string;
}

const JobListingPage = async ({ params }: { params: IParams }) => {
    const jobListing = await getJobById(params);
    const currentUser = await getCurrentUser();

    if (!jobListing) {
        return <EmptyState />;
    }

    const getDaysAgo = (createdAt: string | Date): number => {
        const createdDate = new Date(createdAt);
        const today = new Date();
        const diffTime = today.getTime() - createdDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? 1 : diffDays;
    };

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 bg-white shadow-2xl rounded-2xl mt-10 mb-20">
            {/* Title */}
            <div className="mb-6">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">{jobListing.jobTitle}</h1>
            </div>

            {/* Company Info */}
            <div className="flex flex-wrap gap-6 text-lg text-gray-700 mb-6">
                <p className="font-semibold">{jobListing.companyName}</p>
                <span className="text-gray-500">|</span>
                <p>{jobListing.location}</p>
                <span className="text-gray-500">|</span>
                <p>{jobListing.jobType}</p>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-md text-gray-600 mb-10">
                {getDaysAgo(jobListing.createdAt.toString()) === 1 ? (
                    <p className="text-green-700 font-semibold">
                        Today <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs ml-1">New</span>
                    </p>
                ) : (
                    <p>Published {getDaysAgo(jobListing.createdAt.toString())} days ago</p>
                )}
                <span className="text-gray-400">|</span>
                {jobListing.salary ? (
                    <p>💰 {jobListing.salary}</p>
                ) : (
                    <p className="italic text-gray-500">Salary not disclosed</p>
                )}
            </div>

            {/* Description */}
            <div className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-800 mb-3">Job Description</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{jobListing.description}</p>
            </div>

            {/* Requirements */}
            {jobListing.requirements && jobListing.requirements.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Requirements</h2>
                    <ul className="list-disc pl-6 text-lg text-gray-700 space-y-2">
                        {jobListing.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Benefits */}
            {jobListing.benefits && jobListing.benefits.length > 0 && (
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">Benefits</h2>
                    <ul className="list-disc pl-6 text-lg text-gray-700 space-y-2">
                        {jobListing.benefits.map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Contact Info */}
            <div className="pt-6 border-t border-gray-200">
                <h2 className="text-2xl font-semibold text-gray-800 mt-6 mb-3">Contact Information</h2>
                <p className="text-lg text-gray-700">{jobListing.contactInfo}</p>
            </div>
        </div>
    );
};

export default JobListingPage;
