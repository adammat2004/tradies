import { useRouter } from 'next/navigation';
import React from 'react'

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

const AboutPage: React.FC<AboutPageProps> = ({
  paragraph1,
  paragraph2,
  category,
  id  
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = React.useState(false);
  const [par1Value, setPar1Value] = React.useState(paragraph1);
  const [par2value, setPar2Value] = React.useState(paragraph2);
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
      setPar1Value(data.description); // Update the state with the new description
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
      setPar2Value(data.description); // Update the state with the new description
      setIsEditing(false); // Close the editor
      router.refresh();
    } catch (error) {
        console.error("Error updating description:", error);
    }
  }
  return (
    <section className="border border-gray-200 max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12 mt-8 animate-fadeIn">
      <div className="border-l-4 border-gray-600 pl-4 mb-6">
        <p className="text-gray-600 text-lg leading-relaxed">{paragraph1}</p>
      </div>
      <div className="border-l-4 border-gray-400 pl-4">
        <p className="text-gray-600 text-lg leading-relaxed">{paragraph2}</p>
      </div>
      <div className="mt-10 max-w-xl mx-auto bg-gradient-to-r from-white via-gray-50 to-white rounded-lg shadow-lg border-l-8 border-rose-500 p-6">
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
      </div>
    </section>
  )
}

export default AboutPage
