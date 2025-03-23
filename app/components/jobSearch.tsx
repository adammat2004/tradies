'use client';

import useJobSearchModel from '@/app/hooks/useJobSearchModel';
import { useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import { BiSearch } from 'react-icons/bi';

const JobSearch = () => {
  const jobSearchModel = useJobSearchModel();
  const params = useSearchParams();
  const categoryValue = params?.get('category');
  const countyValue = params?.get('county');
  const jobType = params?.get('jobType');

  const categoryLabel = useMemo(() => categoryValue || 'Category', [categoryValue]);
  const countyLabel = useMemo(() => countyValue || 'County', [countyValue]);
  const jobTypeLabel = useMemo(() => jobType || 'Job Type', [jobType]);

  return (
    <div className='flex justify-center w-full'>
      <div 
        className='w-[90%] md:w-[70%] lg:w-[70%] bg-white border border-gray-300 shadow-lg rounded-full 
                   py-3 px-6 flex items-center justify-between hover:shadow-xl transition 
                   cursor-pointer duration-200 ease-in-out transform hover:scale-105'
        onClick={jobSearchModel.onOpen}    
      >
        <div className='flex items-center space-x-4 w-full text-center sm:text-left'>
          <span className='text-gray-700 font-medium text-sm flex-1'>{categoryLabel}</span>
          <span className='hidden sm:block text-gray-500 text-sm border-l border-gray-300 pl-4 flex-1'>{countyLabel}</span>
          <span className='hidden sm:block text-gray-500 text-sm border-l border-gray-300 pl-4 flex-1'>{jobTypeLabel}</span>
        </div>
        <div className='ml-auto bg-rose-500 hover:bg-rose-700 text-white p-3 rounded-full transition'>
          <BiSearch size={20} />
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
