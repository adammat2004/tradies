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
    const [quotes, setQuotes] = useState<Quote[]>([]);
    useEffect(() => {
        const fetchQuotes = async () => {
            const res = await fetch("/api/myquotes");
            if(!res.ok){
                throw new Error("Failed to fetch quotes")
            }
            const data = await res.json();
            setQuotes(data);
        }
        fetchQuotes();
    }, [])
    if(quotes.length === 0){
        return (
            <div className="font-serif text-2xl text-rose-500 text-center">No Quotes Found</div>
        )
    }
    return (
        <div>
            <h1 className="text-2xl font-bold">My Quotes</h1>
            <p className="text-gray-500">Here are your quotes</p>
            <div className="flex flex-col gap-4 mt-4">
                {quotes.map((quote) => (
                    <div key={quote.id} onClick={() => router.push(`/my-quotes/${quote.id}`)} className="p-4 border rounded-lg shadow-md">
                        <p>{quote.customerName}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default page