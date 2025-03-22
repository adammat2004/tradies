'use client'

import { useRouter } from "next/navigation";

interface ListingsJobCardProps {
  title: string;
  salary: string | undefined | null;
  jobType: string;
  description: string;
  id: string;
}

const ListingsJobCard: React.FC<ListingsJobCardProps> = ({
  title,
  salary,
  jobType,
  description,
  id,
}) => {
  const router = useRouter();
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-sm text-gray-600 mb-4">{jobType}</p>
      {salary && <p className="text-lg font-medium text-green-600">${salary}</p>}
      <p className="text-gray-700 text-sm mt-2 line-clamp-3">{description}</p>
      <button onClick={() => router.push(`/jobs/${id}`)} className="mt-4 w-full bg-rose-500 text-white py-2 px-4 rounded-lg hover:bg-rose-600 transition-all">
        View Details
      </button>
    </div>
  );
};

export default ListingsJobCard;
