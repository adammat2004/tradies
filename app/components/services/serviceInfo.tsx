'use client'

import { SafeUser } from "@/app/types"
import React from "react";
import { IconType } from "react-icons";
import { useState, useEffect } from "react";
import InputChange from "../Inputs/inputChange";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ServiceInfoProps {
    user: SafeUser;
    description: string;
    title: string;
    town: string;
    street: string;
    country: string;
    county: string;
    phone: string;
    email: string;
    id: string;
    city: string;
    category: {
        icon: IconType;
        label: string;
        description: string;
    } | undefined;
}

interface JobListing {
  id: string;             
  jobTitle: string;
  category: string;
  companyName: string;
  location: string;
  salary: string | undefined | null;
  jobType: string;
  requirements: string[];
  description: string;
  benefits: string[]
  contactInfo: string
  createdAt: Date;
  updatedAt: Date;
  userId: string; 
}

const ServiceInfo: React.FC<ServiceInfoProps> = ({
    user,
    description,
    town,
    county,
    street,
    country,
    phone,
    city,
    email,
    category,
    title,
    id
}) => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isEditing2, setIsEditing2] = useState(false);
    const [jobListings, setJobListings] = useState<JobListing[]>([]);
    const [descriptionValue, setDescriptionValue] = useState(description);
    const [titleValue, setTitleValue] = useState(title);
    useEffect(() => {
      const fetchJobListings = async () => {
        try{
          const response = await fetch(`/api/getJobsByUserId?userId=${user.id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch job listings");
          }
          const { data } = await response.json(); // Extracting data properly
          setJobListings(data);
        } catch(error){
          console.error("Fetching job listings error", error);
        }
      }
      fetchJobListings()
    }, [user.id])

    const handleParagraph1Change = async (value: string) => {
      try {
            const response = await fetch("/api/changeDescription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id, description: value }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update description");
            }
    
            const data = await response.json();
            setDescriptionValue(data.description); // Update the state with the new description
            setIsEditing(false); // Close the editor
            router.refresh();
        } catch (error) {
            console.error("Error updating description:", error);
        }
    }
    const handleParagraph2Change = async (value: string) => {
        try {
            const response = await fetch("/api/changeDescription2", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id, description: value }),
            });
    
            if (!response.ok) {
                throw new Error("Failed to update description");
            }
            const data = await response.json();
            setTitleValue(data.description); // Update the state with the new description
            setIsEditing(false); // Close the editor
            router.refresh();
        } catch (error) {
            console.error("Error updating description:", error);
        }
    }

    const handleJobListingDelete = async (id: string) => {
      try {
        const response = await fetch(`/api/deleteJobListing?id=${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });
        if(!response.ok){
          throw new Error("Failed to delete jobLising");
        }
        setJobListings((prevJobListings) => 
          prevJobListings.filter((job) => job.id !== id)
        );

        return toast.success("Job Listing Deleted!");

      } catch (error) {
          return console.error("Error deleting job listing", error);
      }
    }

    
    return (
      <div className="md:col-span-8 flex flex-col gap-12 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <h2 className="text-gray-900 text-3xl font-bold mb-4">About Us</h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
            {/*Discover our journey and learn how we provide exceptional services to our clients. With a rich history and a focus on quality, we strive to deliver excellence every day.*/}
            {description}
            </p>
            <div className="flex justify-end mt-4">
            {isEditing ? (
                <div className="w-full">
                  <InputChange id={"title"} label="Description Paragraph 2" onChange={(e) => setDescriptionValue(e.target.value)}/>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition ml-2"
                    onClick={() => handleParagraph1Change(descriptionValue)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-600 transition ml-2"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Paragraph 1
                </button>
              )}
            </div>
            <p className="text-base text-gray-700 leading-relaxed">
              {title}
            </p>
            <div className="flex justify-end mt-4">
              {isEditing2 ? (
                <div className="w-full">
                  <InputChange id={"title"} label="Description Paragraph 2" onChange={(e) => setTitleValue(e.target.value)}/>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition ml-2"
                    onClick={() => handleParagraph2Change(titleValue)}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-500 text-white px-4 py-2 rounded shadow-md hover:bg-gray-600 transition ml-2"
                    onClick={() => setIsEditing2(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition"
                  onClick={() => setIsEditing2(true)}
                >
                  Edit Paragraph 2
                </button>
              )}
            </div>
        </div>
        {/*Desktop Address */}
        <div className="hidden lg:flex flex-col bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm w-1/3">
          <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
          <div className="text-base text-gray-700 space-y-2">
            {/*<p>Cross Guns</p>
            <p>Castletown</p>
            <p>Navan</p>
            <p>Meath</p>*/}
            <p>{street}</p>
            <p>{town}</p>
            <p>{city}</p>
            <p>{county}</p>
            <p>{country}</p>
          </div>
      </div>
    </div>

    <div className="flex flex-col mt-6 lg:hidden">
      <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
      <div className="text-base text-gray-700 space-y-2">
          <p>{street}</p>
          <p>{town}</p>
          <p>{city}</p>
          <p>{county}</p>
          <p>{country}</p>
      </div>
    </div>

    <div className="relative">
      <h1 className="text-gray-900 text-3xl font-bold mb-4">My job listings</h1>
      <div className="flex flex-row">
        <ul className="list-none p-0">
          {jobListings.map((job) => {
            return (
              <li key={job.id} className="relative pb-4 text-base text-gray-700">
                <div className="text-gray-800 text-xl">{job.jobTitle}</div>
                <p>{job.description}</p>
                <div className="">
                  <button onClick={() => handleJobListingDelete(job.id)} className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition">
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="absolute bottom-4 right-4">
        <button onClick={() => router.push('/create-job-listing')} className="bg-red-500 text-white px-4 py-2 rounded shadow-md hover:bg-red-600 transition">
          Add job listing
        </button>
      </div>  
    </div>


    <div className="flex flex-col w-full mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex items-center">
          <span className="text-base font-medium text-gray-700 w-24">Phone:</span>
          <span className="text-base text-gray-600">{phone}</span>
        </div>
        <div className="flex items-center">
          <span className="text-base font-medium text-gray-700 w-24">Email:</span>
          <span className="text-base text-gray-600">{email}</span>
        </div>
      </div>
    </div>
  </div>
    )
}

export default ServiceInfo