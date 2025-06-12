'use client'

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"
  
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
    }, [])
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
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Quotes</h1>
            <p className="text-lg text-gray-600 mb-6">Here are your recent quotes. Click to view more details.</p>

            <div className="space-y-4">
                {quotes.map((quote) => (
                <div
                    key={quote.id}
                    onClick={() => router.push(`/my-quotes/${quote.id}`)}
                    className="cursor-pointer p-5 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200"
                >
                    <p className="text-gray-800 font-medium text-lg">{quote.customerName}</p>
                </div>
                ))}
            </div>
        </div>
    )
}

export default page