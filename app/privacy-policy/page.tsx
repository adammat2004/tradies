import React from "react";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="privacy-policy px-4 py-8 max-w-3xl mx-auto text-gray-800">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-4">Last updated: June 7, 2025</p>

      <p>
        This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
      </p>
      <p>
        We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
      </p>

      <h2 className="text-2xl font-semibold mt-6">Interpretation and Definitions</h2>
      <h3 className="text-xl font-medium mt-4">Interpretation</h3>
      <p>
        The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
      </p>

      <h3 className="text-xl font-medium mt-4">Definitions</h3>
      <p>For the purposes of this Privacy Policy:</p>
      <ul className="list-disc list-inside space-y-2">
        <li><strong>Account</strong> means a unique account created for You to access our Service or parts of our Service.</li>
        <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party...</li>
        <li><strong>Company</strong> refers to Tradeez Limited, Cross Guns, Castletown, Meath, Ireland.</li>
        <li><strong>Cookies</strong> are small files that are placed on Your device by a website...</li>
        <li><strong>Country</strong> refers to: Ireland</li>
        <li><strong>Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.</li>
        <li><strong>Personal Data</strong> is any information that relates to an identified or identifiable individual.</li>
        <li><strong>Service</strong> refers to the Website.</li>
        <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company...</li>
        <li><strong>Usage Data</strong> refers to data collected automatically...</li>
        <li><strong>Website</strong> refers to Tradeez, accessible from{" "}
          <a href="https://www.tradeez.ie" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
            https://www.tradeez.ie
          </a>
        </li>
        <li><strong>You</strong> means the individual accessing or using the Service...</li>
      </ul>

      {/* -- Continue using the same pattern for other sections -- */}

      <h2 className="text-2xl font-semibold mt-6">Collecting and Using Your Personal Data</h2>
      <h3 className="text-xl font-medium mt-4">Types of Data Collected</h3>
      <h4 className="text-lg font-semibold mt-2">Personal Data</h4>
      <p>While using Our Service, We may ask You to provide Us with certain personally identifiable information...</p>
      <ul className="list-disc list-inside space-y-2">
        <li>Email address</li>
        <li>First name and last name</li>
        <li>Phone number</li>
        <li>Address, State, Province, ZIP/Postal code, City</li>
        <li>Usage Data</li>
      </ul>

      {/* -- Continue adding the rest of the content similarly... -- */}

      <h2 className="text-2xl font-semibold mt-6">Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, You can contact us:</p>
      <ul className="list-disc list-inside">
        <li>By email: <a href="mailto:info@tradeez.ie" className="text-blue-600 underline">info@tradeez.ie</a></li>
      </ul>
    </div>
  );
};

export default PrivacyPolicy;
