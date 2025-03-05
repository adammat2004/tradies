'use client'

import useServiceModel from "@/app/hooks/useServiceModel";
import Model from "./model";
import { useMemo, useState } from "react";
import Heading from "../heading";
import { categories } from "../navbar/categories";
import CategoryInput from "../Inputs/categoryInput";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import ImageUpload from "../Inputs/imageUpload";
import Input from "../Inputs/input";
import axios from "axios";
import toast from "react-hot-toast";
import { redirect, useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import SearchInput from "../Inputs/searchInput";
import Select from "react-select";

enum STEPS {
    OPENING = 0,
    CATEGORY = 1,
    WORKAREA = 2,
    LOCATION = 3,
    INFO = 4,
    IMAGES = 5,
    DESCRIPTION = 6,
    PAY = 7
}

const counties = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
].map((county) => ({label: county, value: county}));

const ServiceModel = () => {
    const router = useRouter();
    const serviceModel = useServiceModel();

    const [step ,setStep] = useState(STEPS.OPENING);
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
            imageSrc: '',
            //title: '',
            description: '',
            description2: '',	
            email: '',
            phone_number: '',
            company_name: '',
            street: '',
            town: '',
            city: '',
            county: '',
            country: '',
            operationCounties: []
        }
    });

    const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

    const category = watch('category');
    const imageSrc  = watch('imageSrc');


    const setCustomValue = (id: string, value: any) => {
        setValue(id, value, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
        })
    }

    const onBack = () => {
        setStep((value) => value - 1);
    };

    const onNext = () => {
        setStep((value) => value + 1);
    }

    const onSubmit: SubmitHandler<FieldValues> = async (data) => {
        // If the current step isn't the payment step, just go to the next step
        if (step !== STEPS.PAY) {
            return onNext();
        }
    
        setIsLoading(true);
        // Make a POST request to create the listing first
        axios.post('/api/listings', data)
        .then((response) => {
            // Assuming the response contains the session ID or relevant session data
            const { sessionUrl } = response.data; // This should be the session ID from the Stripe session
    
            if (sessionUrl) {
                // Once the listing is created and the session ID is returned, open the Stripe checkout page
                // You can pass the session ID to Stripe Checkout URL
                window.open(sessionUrl, '_blank');
            } else {
                toast.error("Session ID is missing, unable to redirect to Stripe Checkout.");
            }
    
            toast.success("Listing created!");
            router.refresh();
            reset();
            setStep(STEPS.OPENING);
            serviceModel.onClose();
        })
        .catch((error) => {
            // Log the error if any, and display an error message
            console.error('Error creating listing:', error);
            toast.error("Something went wrong.");
        })
        .finally(() => {
            setIsLoading(false);
        });
    };
    

    const actionLabel = useMemo(() => {
        if(step == STEPS.PAY){
            return 'Create';
        }

        return 'Next';
    }, [step])

    const secondaryActionLabel = useMemo(() => {
        if(step == STEPS.OPENING){
            return undefined;
        }
        return 'Back';
    }, [step])

    let bodyContent = (
        <div className="flex flex-col gap-8">
            <Heading
                title="List your service!"
                subtitle="Get noticed online and attract more clients with ease"
            />
            <section>
                <p className="text-lg text-gray-700">
                    As a tradesman, showcasing your services online is crucial to growing your business. For just <strong>€10 a month</strong>, you can display information about your services, availability, and past projects to potential clients looking for reliable professionals like you.
                </p>
            </section>
            <section>
                <p className="text-lg text-gray-700">
                    You can easily update your business details anytime. Whether it's changing your contact information, adding a new service, or updating your portfolio with recent work, everything is fully editable. This way, you're always in control of how your business is presented to clients.
                </p>
            </section>
        </div>
    );


    if(step == STEPS.CATEGORY){
        bodyContent = (
            <div className="flex flex-col gap-8">
            <Heading
                title="Which of these best describes your service?"
                subtitle="Pick a category"
            />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {categories.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput 
                                onClick={(category) => setCustomValue('category', category)}
                                selected={category == item.label}
                                label={item.label}
                                icon={item.icon}
                            />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if(step == STEPS.WORKAREA){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="What counties do you work in?"
                    subtitle="Select all that apply"
                />
                <Select
                        id="operationCounties"
                        name="operationCounties"
                        isMulti
                        options={counties}
                        onChange={(selectedOptions) => setValue('operationCounties', selectedOptions.map(option => option.value))}
                        getOptionLabel={(e) => e.label}
                        getOptionValue={(e) => e.value}
                />
                {errors.operationCounties && <span className="text-red-500 mt-2">This field is required</span>}
            </div>
        )
    }

    if(step == STEPS.LOCATION){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Where is your service located?"
                    subtitle="Help clients find your service!"
                />
                <Input 
                    id="street"
                    label="Street"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input 
                    id="town"
                    label="Town"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input 
                    id="city"
                    label="City"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <SearchInput
                    id="county"
                    label="County"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    options={['Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
                                'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
                                'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
                                'Waterford', 'Westmeath', 'Wexford', 'Wicklow']}
                    control={control}        
                />
                <SearchInput
                    id="country"
                    label="Country"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    options={['Ireland']}
                    control={control}
                />
                {/*<CountrySelect 
                    value={location}
                    onChange={(value) => setCustomValue('location', value)}
                />*/}
                {/*<Map
                    center={location?.latlng}
                />*/}
                {/*<AddressForm 
                    onSubmit={setAddress}
                />*/}
            </div>
        )
    }
    if(step == STEPS.INFO){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Share some information about your service"
                    subtitle="Provide your contact details"
                />
                <Input 
                    id="company_name"
                    label="Company name"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input 
                    id="phone_number"
                    label="Phone number"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input 
                    id="email"
                    label="Company email"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if(step == STEPS.IMAGES){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Add a photo of your work or logo"
                    subtitle="Show clients some of your work!"
                />
                <ImageUpload 
                    value={imageSrc}
                    onChange={(value) => setCustomValue('imageSrc', value)}
                />
            </div>
        )
    }

    if(step == STEPS.DESCRIPTION){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading
                    title="How would you describe your Service"
                    subtitle="Tell clients about your service"
                />
                <Input
                    id="description"
                    label="Paragraph 1"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
                <Input
                    id="title"
                    label="Paragraph 2"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                />
            </div>
        )
    }

    if(step == STEPS.PAY){
        bodyContent = (
            <div className="flex flex-col gap-8">
                <Heading 
                    title="Pay and create your account"
                    subtitle="You're almost there"
                />
            </div>
        )
    }

    return (
        <Model 
            isOpen={serviceModel.isOpen}
            onClose={serviceModel.onClose}
            onSubmit={handleSubmit(onSubmit)}
            actionLabel={actionLabel}
            secondaryActionLabel={secondaryActionLabel}
            secondaryAction={step == STEPS.OPENING ? undefined: onBack}
            title="List your service!"
            body={bodyContent}
        />
    )
}

export default ServiceModel;