import React from 'react';

const ContactPage: React.FC = () => {
  const email = 'info@tradeez.ie';  // Replace with your email
  const phoneNumber = '+353 083 825 2607';  // Replace with your phone number

  return (
    <div className="pt-20 flex justify-center items-start min-h-screen bg-white">
      <div className="bg-gray-100 rounded-lg shadow-xl p-8 w-11/12 max-w-3xl">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Contact Us</h1>
        <p className="text-lg text-gray-600 text-center mb-8">
          If you have any questions or inquiries, feel free to reach out to us via the following methods:
        </p>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Email:</h2>
          <p className="text-lg text-blue-600">
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-gray-800">Phone Number:</h2>
          <p className="text-lg text-blue-600">
            <a href={`tel:${phoneNumber}`}>{phoneNumber}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
