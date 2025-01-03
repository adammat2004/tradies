'use client'

import { SafeUser } from "@/app/types"
import React from "react";
import { IconType } from "react-icons";

interface ListingInfoProps {
    user: SafeUser;
    description: string;
    category: {
        icon: IconType;
        label: string;
        description: string;
    } | undefined;
}

const ListingInfo: React.FC<ListingInfoProps> = ({
    user,
    description,
    category
}) => {
    return (
        <div className="md:col-span-8 flex flex-col gap-12 p-6 bg-white rounded-lg shadow-lg">
  <div className="flex flex-col gap-6 lg:flex-row">
    <div className="flex-1">
      <h2 className="text-gray-900 text-3xl font-bold mb-4">About Us</h2>
      <p className="text-base text-gray-700 mb-4 leading-relaxed">
        Discover our journey and learn how we provide exceptional services to our clients. With a rich history and a focus on quality, we strive to deliver excellence every day.
      </p>
      <p className="text-base text-gray-700 leading-relaxed">
        To divide the screen into two sections using Tailwind CSS and Flexbox, you can use a flex layout with Tailwind's utility classes for layout, spacing, and alignment. Here’s a simple example of how to achieve this:
      </p>
    </div>
    <div className="hidden lg:flex flex-col bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-sm w-1/3">
      <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
      <div className="text-base text-gray-700 space-y-2">
        <p>Cross Guns</p>
        <p>Castletown</p>
        <p>Navan</p>
        <p>Meath</p>
      </div>
    </div>
  </div>

  <div className="flex flex-col mt-6 lg:hidden">
    <h3 className="text-gray-900 text-xl font-semibold mb-4">Address</h3>
    <div className="text-base text-gray-700 space-y-2">
      <p>Cross Guns</p>
      <p>Castletown</p>
      <p>Navan</p>
      <p>Meath</p>
    </div>
  </div>

  <div className="flex flex-col w-full mt-12">
    <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex items-center">
        <span className="text-base font-medium text-gray-700 w-24">Phone:</span>
        <span className="text-base text-gray-600">123456789</span>
      </div>
      <div className="flex items-center">
        <span className="text-base font-medium text-gray-700 w-24">Mobile:</span>
        <span className="text-base text-gray-600">0838252607</span>
      </div>
      <div className="flex items-center">
        <span className="text-base font-medium text-gray-700 w-24">Email:</span>
        <span className="text-base text-gray-600">joematthews401@gmail.com</span>
      </div>
    </div>
  </div>
</div>
    )
}

export default ListingInfo