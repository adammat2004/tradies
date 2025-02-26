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

enum STEPS {
    CATEGORY = 0,
    LOCATION = 1,
    INFO = 2,
    IMAGES = 3,
    DESCRIPTION = 4,
    PAY = 5
}

const ServiceModel = () => {
    const router = useRouter();
    const serviceModel = useServiceModel();

    const [step ,setStep] = useState(STEPS.CATEGORY);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: {
            errors,
        },
        reset
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
            country: ''
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

    const onSubmit: SubmitHandler<FieldValues> = (data) => {
        // If the current step isn't the payment step, just go to the next step
        if (step !== STEPS.PAY) {
            return onNext();
        }
    
        setIsLoading(true);
        console.log("hello there");
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
            setStep(STEPS.CATEGORY);
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
        if(step == STEPS.CATEGORY){
            return undefined;
        }
        return 'Back';
    }, [step])

    let bodyContent = (
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
                    options={['Dublin', 'Cork', 'Galway', 'Limerick', 'Waterford', 'Kilkenny']}
                />
                <SearchInput 
                    id="country"
                    label="Country"
                    disabled={isLoading}
                    register={register}
                    errors={errors}
                    required
                    options={['Ireland']}
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
            secondaryAction={step == STEPS.CATEGORY ? undefined: onBack}
            title="List your service!"
            body={bodyContent}
        />
    )
}

export default ServiceModel;