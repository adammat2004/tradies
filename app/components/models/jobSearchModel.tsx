'use client'

import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import Model from "./model";
import useJobSearchModel from '@/app/hooks/useJobSearchModel';
import { Suspense, useCallback, useMemo, useState } from "react";
import Heading from '../heading';
import { FieldValues, useForm } from 'react-hook-form';
import SearchInput from '../Inputs/searchInput';

const JobSearchModel = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModel = useJobSearchModel();

    const [isLoading, setIsLoading] = useState(false);
    
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset,
        control
    } = useForm<FieldValues>({
        defaultValues: {
            category: '',
            county: '',
            jobType: ''
        }
    });
    const category = watch('category');
    const county = watch('county');
    const jobType = watch('jobType');

    const onSubmit = useCallback(async () => {
        let currentQuery = {};

        if(params){
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            category,
            county,
            jobType
        };

        const url = `/jobs?${qs.stringify(updatedQuery, { skipNull: true })}`;
        searchModel.onClose();
        router.push(url);
    }, [searchModel, category, county, jobType, params]);

    let bodyContent = (
        <div className='flex flex-col gap-8'>
            <Heading 
                title='What job do you want to search for?'
                subtitle='Filter your search'
            />
            <SearchInput
                id="category"
                label="Category"
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
                options={['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Landscaping', 'Paving', 'Bricklayer', 'Haulage', 'Roofer']}
                control={control}
            />
            <SearchInput
                id="county"
                label="County"
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
                options={["Antrim", "Armagh", "Carlow", "Cavan", "Clare", "Cork", "Derry", "Donegal", 
                    "Down", "Dublin", "Fermanagh", "Galway", "Kerry", "Kildare", "Kilkenny", 
                    "Laois", "Leitrim", "Limerick", "Longford", "Louth", "Mayo", "Meath", 
                    "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary", "Tyrone", 
                    "Waterford", "Westmeath", "Wexford", "Wicklow"]}
                control={control}
            />
            <SearchInput 
                id='jobType'
                label='Job Type'
                disabled={isLoading}
                register={register}
                errors={errors}
                required={false}
                options={['Full Time', 'Part Time', 'Contract', 'Temporary', 'Apprenticeship']}
                control={control}
            />
        </div>
    )

    return (
        <Model 
            isOpen={searchModel.isOpen}
            onClose={searchModel.onClose}
            onSubmit={handleSubmit(onSubmit)}
            title="Filters"
            actionLabel='Search'
            body={bodyContent}
        />
    )
}

export default JobSearchModel;