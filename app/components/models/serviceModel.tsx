'use client'

import useServiceModel from "@/app/hooks/useServiceModel";
import Model from "./model";
import { useEffect, useMemo, useState } from "react";
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
    BUSINESSTYPE = 1,
    CATEGORY = 2,
    WORKAREA = 3,
    LOCATION = 4,
    INFO = 5,
    IMAGES = 6,
    DESCRIPTION = 7,
    PAY = 8
}

const counties = [
    'Carlow', 'Cavan', 'Clare', 'Cork', 'Donegal', 'Dublin', 'Galway', 'Kerry',
    'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth',
    'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
].map((county) => ({ label: county, value: county }));



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
            category: [],
            imageSrc: '',
            is_business: true,
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
    const is_business = watch('is_business');


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
            {/*const { sessionUrl } = response.data; // This should be the session ID from the Stripe session
    
            if (sessionUrl) {
                // Once the listing is created and the session ID is returned, open the Stripe checkout page
                // You can pass the session ID to Stripe Checkout URL
                window.open(sessionUrl, '_blank');
            } else {
                toast.error("Session ID is missing, unable to redirect to Stripe Checkout.");
            }*/}
    
            toast.success("Listing created!");
            router.refresh();
            reset();
            setStep(STEPS.OPENING);
            serviceModel.onClose();
        })
        .catch((error) => {
            // Log the error if any, and display an error message
            console.error('Error creating listing:', error);
            toast.error("Make sure all fields are entered.");
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
                title="List Your Service & Get AI-Powered Recommendations"
                subtitle="Our AI recommends you to the right customers—effortlessly"
            />

            <section className="space-y-6">
                <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Promote Your Services
                </h2>
                <p className="text-lg text-gray-700">
                    Tradeez uses AI to analyze your skills and match you only with customers
                    seeking your expertise. By listing here, you’ll:
                </p>
                <ul className="list-disc list-inside text-lg text-gray-700 mt-2">
                    <li>Showcase your services and past projects</li>
                    <li>Get recommended to customers based on your expertise</li>
                    <li>Send quotes in minutes with our built-in quoting tools</li>
                </ul>
                </div>

                <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Stay in Control
                </h2>
                <p className="text-lg text-gray-700">
                    Update your profile anytime—the AI will instantly re-evaluate and
                    recommend you to new customers.
                </p>
                </div>

                <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Free for First 100 Users
                </h2>
                <p className="text-lg text-gray-700">
                    Be among the first 100 users to list your service and enjoy free access
                    while we improve our AI models.
                </p>
                </div>
            </section>
        </div>
    );

    if(step == STEPS.BUSINESSTYPE) {
        bodyContent = (
            <div className="flex flex-col items-center gap-6">
                <Heading 
                    title="Select listing type"
                    subtitle="Are you a business or an individual tradesman"
                />
                <div className="flex flex-col gap-4 w-full max-w-sm">
                    {[
                        {
                        label: "Business",
                        description: <div>
                            <div>Ideal for companies who want to increase their exposure, create professional quotes or post job listings.</div>
                                <ul className="list-disc list-inside mt-2">
                                    <li className="mt-2">Unlimited job postings</li>
                                    <li className="mt-1">Unlimited quotes</li>
                                    <li className="mt-1">Unlimited categories</li>
                                    <li className="mt-1">Unlimited counties</li>
                                    <li className="mt-1">Unlimited projects</li>
                                </ul>
                            </div>,
                        isSelected: is_business,
                        onClick: () => setCustomValue("is_business", true),
                        //price: "€15.99/month",
                        },
                        {
                        label: "Individual",
                        description: <div>
                            Perfect for solo tradesmen showcasing services. <br />
                            <ul className="list-disc list-inside mt-2">
                                <li>No job postings</li>
                                <li>Limited access to quotes</li>
                                <li>Unlimited categories</li>
                                <li>Max 3 counties</li>
                                <li>Unlimited projects</li>
                            </ul>
                        </div>,//"Perfect for solo tradesmen showcasing services.",
                        isSelected: !is_business,
                        onClick: () => setCustomValue("is_business", false),
                        //price: "€11.99/month",
                        },
                    ].map(({ label, description, isSelected, onClick }) => (
                        <button
                        key={label}
                        onClick={onClick}
                        type="button"
                        className={`
                            ${isSelected ? "bg-rose-500 border-rose-600" : "bg-gray-700 hover:bg-gray-800"} 
                            text-white text-left px-4 py-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105
                            ${isSelected ? "border-4" : "border-2"} border-solid cursor-pointer
                        `}
                        >
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xl font-semibold">{label}</span>
                            <span className="bg-white text-rose-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            First 100 Users Free
                            </span>
                        </div>
                        <div className="text-sm opacity-80 mb-2">{description}</div>
                        {/*<div className="font-medium">Price: {price}</div>*/}
                        </button>
                    ))}
                </div>
            </div>
        )
    }

    
    
    if(step == STEPS.CATEGORY){
        bodyContent = (
            <div className="flex flex-col gap-8">
            <Heading
                title="Which of these best describes your service?"
                subtitle="You can pick multiple categories"
            />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
                    {categories.map((item) => (
                        <div key={item.label} className="col-span-1">
                            <CategoryInput
                                 onClick={(cat) => {
                                    // If the category is already selected, remove it; otherwise, add it
                                    const currentCategories = watch('category', []);
                                    const updatedCategories = currentCategories.includes(cat)
                                        ? currentCategories.filter((categore: any) => categore !== cat)
                                        : [...currentCategories, cat];
                                    setCustomValue('category', updatedCategories);
                                }}
                                selected={watch('category', []).includes(item.label)}
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
                    required={true}
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
                    required={true}
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
                    label={is_business ? "Company name" : "Full name"}
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
                    title="Add a profile image"
                    subtitle="This will be the image displayed on our homepage!"
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
                    title="Describe your Service"
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
                    title="Create your account"
                    subtitle="You're almost there"
                />
                {/*<div className="text-lg text-gray-700">
                    Clicking the button below will take you to the payment page where you can pay for your listing.
                </div>
                <div className="text-lg text-gray-700">
                    All our payments are processed securely by Stripe.
                </div>*/}
                <div className="text-lg text-gray-700">
                    Clicking the create button below will create your listing. You can then visit the my service page to view and make changes to your listing.
                </div>
                <div className="text-sm text-gray-500 mt-2">
                    By clicking the create button, you accept our&nbsp;
                    <a href="/terms-and-conditions" className="underline hover:text-gray-700" target="_blank" rel="noopener noreferrer">
                        Terms and Conditions
                    </a>
                    &nbsp;and&nbsp;
                    <a href="/privacy-policy" className="underline hover:text-gray-700" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                    </a>.
                </div>
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