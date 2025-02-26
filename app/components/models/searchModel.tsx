'use client'

import qs from 'query-string';
import { useRouter, useSearchParams } from "next/navigation";
import Model from "./model";
import useSearchModel from "@/app/hooks/useSearchModel";
import { Suspense, useCallback, useMemo, useState } from "react";
import Heading from '../heading';
import { FieldValues, useForm } from 'react-hook-form';
import SearchInput from '../Inputs/searchInput';

const SearchModel = () => {
    const router = useRouter();
    const params = useSearchParams();
    const searchModel = useSearchModel();

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
            country: ''
        }
    });
    const category = watch('category');
    const county = watch('county');

    const onSubmit = useCallback(async () => {
        let currentQuery = {};

        if(params){
            currentQuery = qs.parse(params.toString());
        }

        const updatedQuery: any = {
            ...currentQuery,
            category,
            county
        };

        {/*const url = qs.stringify({
            url: '/',
            query: updatedQuery
        }, {skipNull: true});*/}
        const url = `/?${qs.stringify(updatedQuery, { skipNull: true })}`;

        searchModel.onClose();
        router.push(url);
    }, [searchModel, county, category, params]);

    let bodyContent = (
        <div className='flex flex-col gap-8'>
            <Heading 
                title='What trade do you want to search for?'
                subtitle='Find any trade'
            />
            <SearchInput
                id="category"
                label="Trade"
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

export default SearchModel;