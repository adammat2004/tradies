'use client'
import useSearchModel from '@/app/hooks/useSearchModel'
import { useSearchParams } from 'next/navigation'
import React from 'react'
import { BiSearch } from 'react-icons/bi'
import {useMemo} from 'react';


const Search = () => {
  const searchModel = useSearchModel();
  const params = useSearchParams();
  const categoryValue = params?.get('category');
  const countyValue = params?.get('county');

  const categoryLabel = useMemo(() => {
    if(categoryValue){
        return categoryValue;
    }
    return 'Any Trade'
  }, [categoryValue])

  const countyLabel = useMemo(() => {
    if(countyValue){
        return countyValue;
    }
    return 'Anywhere';
  }, [countyValue])
  return (
    <div 
        className='border-[1px] w-full md:w-auto py-2 rounded-full shadow-sm hover:shadow-md transition cursor-pointer'
        onClick={searchModel.onOpen}    
    >
        <div className='flex flex-row items-center justify-between'>
            <div className='text-sm font-semibold px-6'>
                {categoryLabel}
            </div>
            <div className='hidden sm:block text-sm font-semibold px-6 border-x-[1px] flex-1 text-center'>
                {countyLabel}
            </div>
            <div className='text-sm pl-6 pr-2 text-gray-600 flex flex-row items-center gap-3'>
                {/*<div className='hidden sm:block'>
                    Add guest
                </div>*/}
                <div className='p-2 bg-rose-500 rounded-full text-white'>
                    <BiSearch size={18}/>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Search