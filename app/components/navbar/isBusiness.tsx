'use client'

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const IsBusiness = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const isMainPage = pathname === '/';
    const router = useRouter();

    if(!searchParams){
        return null;
    }
    const initialIsBusiness = searchParams.has('isbusiness') 
        ? searchParams.get('isbusiness') === 'true'
        : null;

    const [isBusiness, setIsBusiness] = useState(initialIsBusiness);

    useEffect(() => {
        if (!isMainPage) return;

        const newUrl = new URL(window.location.href);

        if (isBusiness !== null) {
            newUrl.searchParams.set('isbusiness', isBusiness.toString());
        } else {
            newUrl.searchParams.delete('isbusiness');
        }

        window.history.replaceState({}, '', newUrl.toString());
    }, [isBusiness, isMainPage]);

    useEffect(() => {
        router.refresh();
    }, [searchParams]);

    if (!isMainPage) return null;

    return (
        <div className="flex justify-center items-center sm:gap-20 my-4">
            <button 
                onClick={() => setIsBusiness(isBusiness === true ? null : true)} 
                className={`px-8 py-3 sm:px-12 sm:py-4 border-4 border-rose-500 rounded-full 
                    transition-all duration-300 text-gray-800 font-semibold text-lg sm:text-xl
                    ${isBusiness === true ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-rose-100'}`}
            >
                Business
            </button>
            <button 
                onClick={() => setIsBusiness(isBusiness === false ? null : false)} 
                className={`px-8 py-3 sm:px-12 sm:py-4 border-4 border-rose-500 rounded-full 
                    transition-all duration-300 text-gray-800 font-semibold text-lg sm:text-xl
                    ${isBusiness === false ? 'bg-rose-500 text-white shadow-lg scale-105' : 'bg-white hover:bg-rose-100'}`}
            >
                Tradesman
            </button>
        </div>
    );
};

export default IsBusiness;
