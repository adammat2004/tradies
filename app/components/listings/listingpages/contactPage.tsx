'use client'

import { useState } from 'react';

interface ContactPageProps {
  companyEmail: string;
  companyPhone: string;
}  
export default function ContactPage({ companyEmail, companyPhone }: ContactPageProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    projectDescription: '',
    addressLine1: '',
    addressLine2: '',
    town: '',
    county: '',
    eircode: '',
    companyEmail: companyEmail,
    companyPhone: companyPhone
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  // Handle input change
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Example: Sending data to an API route
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setResponseMessage('Your message has been sent successfully!');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          projectDescription: '',
          addressLine1: '',
          addressLine2: '',
          town: '',
          county: '',
          eircode: '',
          companyEmail: companyEmail,
          companyPhone: companyPhone
        });
      } else {
        setResponseMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setResponseMessage('Error submitting the form. Please try again later.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex justify-center pt-68">
      <div className="w-full max-w-3xl p-8 bg-gray-100 rounded-xl shadow-lg">
        <div className="mb-8 text-center">
          <p className="text-xl font-serif text-gray-600">
            We would be happy to connect with you and discuss your project!
          </p>
          <p className="text-xl text-gray-600 font-serif mb-6">
            Please provide your contact information and give us some details about your project, and we will reach out.
          </p>
          <div>
            <p className="text-xl text-gray-600 font-serif mb-2">Phone: <strong className='text-teal-800'>{companyPhone}</strong></p>
            <p className="text-xl text-gray-600 font-serif mb-2">Email: <strong className='text-teal-800'>{companyEmail}</strong></p>
          </div>
        </div>
        {/* Response Message */}
        {responseMessage && (
          <div className="mb-6 p-4 text-center text-white bg-green-500 rounded-md">{responseMessage}</div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Form Fields */}
          <div className="mb-6">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={formData.projectDescription}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">Address Line 1</label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">Address Line 2</label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleChange}
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="town" className="block text-sm font-medium text-gray-700 mb-2">Town</label>
            <input
              type="text"
              id="town"
              name="town"
              value={formData.town}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">County</label>
            <input
              type="text"
              id="county"
              name="county"
              value={formData.county}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="eircode" className="block text-sm font-medium text-gray-700 mb-2">Eircode</label>
            <input
              type="text"
              id="eircode"
              name="eircode"
              value={formData.eircode}
              onChange={handleChange}
              required
              className="w-full p-4 border bg-white border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355E3B] focus:border-[#355E3B] text-lg"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-[#355E3B] text-white font-semibold rounded-md hover:bg-[#2d4d34] disabled:bg-gray-400 text-lg"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
}