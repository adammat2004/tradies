'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import SearchInput from '../components/Inputs/searchInput';

const JobCreationPage = () => {
  const router = useRouter();
  const [loading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false); // Added for client-side rendering

  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [benefitsList, setBenefitsList] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get('/api/get-current-user');
        if (!data) {
          return;
        } else {
          setCurrentUser(data);
        }
      } catch (error) {
        toast.error('Error fetching user');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setMounted(true); // Mark that the component is mounted and ready to render on the client
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm<FieldValues>({
    defaultValues: {
      category: '',
      jobTitle: '',
      companyName: '',
      location: '',
      salary: '',
      jobType: '',
      description: '',
      contactInfo: '',
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    const jobData = {
      ...data,
      requirements: requirementsList,
      benefits: benefitsList,
    };

    try {
      const response = await axios.post('/api/create-job', jobData);

      if (response.data.error) {
        toast.error(response.data.error);
      } else {
        toast.success('Job created successfully');
        router.push('/');
      }
    } catch (error) {
      console.error('Error submitting the job:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddRequirement = () => {
    if (requirementInput.trim()) {
      setRequirementsList([...requirementsList, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setBenefitsList([...benefitsList, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  if (!mounted) return null; // Render nothing until mounted to avoid SSR mismatch

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">List a New Job</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Category */}
        <SearchInput
          id="category"
          label="Category"
          disabled={loading}
          register={register}
          errors={errors}
          required={true}
          options={['Plumber', 'Electrician', 'Carpenter', 'Painter', 'Landscaping', 'Paving', 'Bricklayer', 'Haulage', 'Roofer']}
          control={control}
        />

        {/* Job Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Job Title</label>
          <input
            type="text"
            placeholder="Site Manager"
            {...register('jobTitle', { required: 'Job title is required' })}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Name</label>
          <input
            type="text"
            placeholder="Your company name"
            {...register('companyName', { required: 'Company name is required' })}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Location */}
        <SearchInput
          id="location"
          label="County"
          disabled={loading}
          register={register}
          errors={errors}
          required={true}
          options={['Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow']}
          control={control}
        />

        {/* Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Salary</label>
          <input
            type="number"
            placeholder="50000"
            {...register('salary', { required: 'Salary is required' })}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Job Type */}
        <SearchInput
          id="jobType"
          label="Job Type"
          register={register}
          disabled={loading}
          required={true}
          errors={errors}
          options={['Full Time', 'Part Time', 'Apprenticeship', 'Summer Work', 'Sub Contract']}
          control={control}
        />

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Requirements</label>
          <input
            type="text"
            value={requirementInput}
            onChange={(e) => setRequirementInput(e.target.value)}
            placeholder="Add a requirement"
            className="mt-1 p-2 w-full border rounded"
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            className="mt-2 px-4 py-2 bg-rose-500 text-white rounded"
          >
            Add Requirement
          </button>
          <ul className="mt-2">
            {requirementsList.map((req, index) => (
              <li key={index} className="text-sm text-gray-700">
                {req}
              </li>
            ))}
          </ul>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            {...register('description', { required: 'Description is required' })}
            className="mt-1 p-2 w-full border rounded"
            placeholder='Provide some information about the job'
          ></textarea>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Benefits</label>
          <input
            type="text"
            value={benefitInput}
            onChange={(e) => setBenefitInput(e.target.value)}
            placeholder="Add a benefit"
            className="mt-1 p-2 w-full border rounded"
          />
          <button
            type="button"
            onClick={handleAddBenefit}
            className="mt-2 px-4 py-2 bg-rose-500 text-white rounded"
          >
            Add Benefit
          </button>
          <ul className="mt-2">
            {benefitsList.map((benefit, index) => (
              <li key={index} className="text-sm text-gray-700">
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Info</label>
          <input
            type="text"
            placeholder='Please ring XYZ or email ABC@gmail.com to get in touch'
            {...register('contactInfo', { required: 'Contact info is required' })}
            className="mt-1 p-2 w-full border rounded"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className={`mt-4 px-6 py-2 bg-rose-500 text-white rounded ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Job Listing'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobCreationPage;