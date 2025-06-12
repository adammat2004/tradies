'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
import toast from "react-hot-toast";
  
interface Quote {
    id: string;
    userId: string;
  
    // Customer Info
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  
    // Company Info
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    companyAddress: string;
    companyCity: string;
    companyPostalCode: string;
    companyCounty: string;
  
    status: string;
    total: number;
  
    createdAt: string; // or Date, depending on how you're handling dates
    updatedAt: string; // or Date
}
  

const page = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    useEffect(() => {
        const fetchQuotes = async () => {
            const res = await fetch("/api/myquotes");
            if(!res.ok){
                setLoading(false);
                return;
            }
            const data = await res.json();
            setQuotes(data);
            setLoading(false);
        }
        fetchQuotes();
    }, []);
    const handleDelete = async (id: string) => {
        const confirmed = confirm("Are you sure you want to delete this quote?");
        if (!confirmed) {
            return; // User canceled
        }

        try {
            const response = await fetch(`/api/delete-quote?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            });

            if (!response.ok) {
            throw new Error("Failed to delete quote");
            }

            setQuotes((prevQuotes) =>
            prevQuotes.filter((quote) => quote.id !== id)
            );

            return toast.success("Quote deleted!");
        } catch (error) {
            console.error("Failed to delete quote:", error);
            return toast.error("Failed to delete quote");
        }
    };


    if(loading){
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
        )
    }
    if(!quotes || quotes.length === 0){
        return (
            <div className="font-serif text-2xl text-rose-500 text-center">No Quotes Found</div>
        )
    }
    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Quotes</h1>
            <p className="text-lg text-gray-600 mb-6">
                Here are your recent quotes. Click a quote to view more details.
            </p>

            <div className="space-y-4">
                {quotes.map((quote) => (
                <div
                    key={quote.id}
                    onClick={() => router.push(`/my-quotes/${quote.id}`)}
                    className="relative group cursor-pointer p-6 bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition duration-300"
                >
                    <p className="text-gray-900 font-semibold text-xl">
                    {quote.customerName}
                    </p>

                    {/* Delete Button */}
                    <button
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent routing when clicking delete
                        handleDelete(quote.id);
                    }}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors duration-200"
                    aria-label="Delete Quote"
                    >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                    </button>
                </div>
                ))}
            </div>
        </div>
    )
}

export default page