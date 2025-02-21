'use client'

//import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();

    return (
        <div onClick={() => (router.push('/'))} className="text-5xl hover:cursor-pointer"><h1 className="font-serif">Tradeez</h1></div>
    )
}

export default Logo;