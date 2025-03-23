"use client";

import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();

    return (
        <div 
            onClick={() => router.push('/')} 
            className="hidden sm:block sm:text-5xl sm:hover:cursor-pointer"
        >
            <h1 className="font-serif">Tradeez</h1>
        </div>
    );
}

export default Logo;
