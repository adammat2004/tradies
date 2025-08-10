import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'
import { useState } from 'react';
import { Textarea } from '../../ui/Textarea';
import {categories} from '../../navbar/categories';
import CategoryInput from '../../Inputs/categoryInput';
import toast from 'react-hot-toast';

interface AboutPageProps {
  paragraph1: string;
  paragraph2: string;
  category: {
    icon: React.ElementType;
    label: string;
    description: string;
  }[];
  id: string;
}
interface Category {
  icon: React.ElementType;
  label: string;
  description: string;
}

const AboutPage: React.FC<AboutPageProps> = ({
  paragraph1,
  paragraph2,
  category,
  id  
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditing2, setIsEditing2] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [par1Value, setPar1Value] = useState(paragraph1);
  const [par2value, setPar2Value] = useState(paragraph2);
  const [categoryValue, setCategoryValue] = useState(category);
  const handleParagraph1Change = async (value: string) => {
    try {
      const response = await fetch("/api/changeDescription2", {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, description: value }),
      });

      if (!response.ok) {
          throw new Error("Failed to update description");
      }

      const data = await response.json();
      setPar1Value(data.description); // Update the state with the new description
      setIsEditing(false); // Close the editor
      router.refresh();
    } catch (error) {
        console.error("Error updating description:", error);
    }
  }
  const handleParagraph2Change = async (value: string) => {
    try {
      const response = await fetch("/api/changeDescription", {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, description: value }),
      });

      if (!response.ok) {
          throw new Error("Failed to update description");
      }
      const data = await response.json();
      setPar2Value(data.title); // Update the state with the new description
      setIsEditing2(false); // Close the editor
      router.refresh();
    } catch (error) {
        console.error("Error updating description:", error);
    }
  }

  const handleCategoryChange = async (newCategories: string[], categoryValues: Category[]) => {
    try {
      const response = await fetch("/api/changeCategory", {
          method: "PATCH",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: id, categories: newCategories }),
      });

      if (!response.ok) {
          throw new Error("Failed to update categories");
      }

      const data = await response.json();
      setCategoryValue(categoryValues); // Update the state with the new categories
      setIsEditingCategory(false); // Close the editor
      router.refresh();
    } catch (error) {
        console.error("Error updating categories:", error);
    }
  }

  const createPortalSession = async (listingId: string) => {
    try {
      const response = await fetch('/api/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create portal session');
      }

      const data = await response.json();
      window.location.href = data.url; // Redirect to the Stripe portal
    } catch (error) {
      toast.error('Service unavaiable. Please try again later.');
      //toast.error('Failed to create portal session. Please try again later.');
    }
  }
  return (
    <section className="relative min-h-screen border border-gray-200 max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 mt-8 animate-fadeIn">
      <div className="border-l-4 border-gray-600 pl-4 mb-6">
        <p className="text-gray-600 text-lg leading-relaxed">{paragraph1}</p>
        {isEditing ? (
          <div>
            <Textarea
              value={par1Value}
              onChange={(e) => setPar1Value(e.target.value)}
              className="mt-2"
              placeholder="Edit Paragraph 1"
            />
            <button
              onClick={() => handleParagraph1Change(par1Value)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button onClick={() => setIsEditing(false)} className="ml-2 text-gray-500 hover:underline"> 
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:underline mt-2"
          >
            Edit Paragraph 1
          </button>
        )}
      </div>
      <div className="border-l-4 border-gray-400 pl-4">
        <p className="text-gray-600 text-lg leading-relaxed">{paragraph2}</p>
        {isEditing2 ? (
          <div>
            <Textarea
              value={par2value}
              onChange={(e) => setPar2Value(e.target.value)}
              className="mt-2"
              placeholder="Edit Paragraph 2"
            />
            <button
              onClick={() => handleParagraph2Change(par2value)}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button onClick={() => setIsEditing2(false)} className="ml-2 text-gray-500 hover:underline"> 
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing2(true)}
            className="text-blue-500 hover:underline mt-2"
          >
            Edit Paragraph 2
          </button>
        )}
      </div>
      <div className="relative mt-10 max-w-xl mx-auto bg-gradient-to-r from-white via-gray-50 to-white rounded-lg shadow-lg border-l-8 border-rose-500 p-6">
        <h1 className="font-serif text-3xl font-bold text-rose-500 mb-6 tracking-wide">
          Our Services
        </h1>
        <div className="space-y-5">
          {category.map((cat) => (
            <div
              key={cat.label}
              className="flex items-center gap-4 p-3 rounded-md cursor-pointer transition 
                        hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <cat.icon className="w-7 h-7 text-gray-700 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-gray-900">{cat.label}</h2>
            </div>
          ))}
        </div>
        {isEditingCategory ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
              {categories.map((item: any) => (
                <div key={item.label} className="col-span-1">
                  <CategoryInput
                    onClick={() => {
                      if (categoryValue.some((cat) => cat.label === item.label)) {
                        setCategoryValue(categoryValue.filter((c) => c.label !== item.label));
                      } else {
                        setCategoryValue([...categoryValue, item]);
                      }
                    }}
                    selected={categoryValue?.includes(item)}
                    label={item.label}
                    icon={item.icon}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const labels = categoryValue.map((category) => category.label);
                handleCategoryChange(labels , categoryValue)
              }}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button onClick={() => setIsEditingCategory(false)} className="ml-2 text-gray-500 hover:underline"> 
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => setIsEditingCategory(true)} className="absolute right-5 bottom-5 text-blue-500 hover:underline">
            Edit Categories
          </button>
        )}
      </div>
      {/*<div className="mt-8 text-center">
        <button
          onClick={() => createPortalSession(id)}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Manage Subscription
        </button>
      </div>*/}
    </section>
  )
}

export default AboutPage
