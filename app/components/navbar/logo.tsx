'use client'

//import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();

    return (
        <div onClick={() => (router.push('/'))} className="text-5xl hover:cursor-pointer"><h1 className="font-serif">Tradies</h1></div>
        /*<Image 
        onClick={() => router.push('/')}
        alt='Tradies'
        className="hidden md:block cursor-pointer"
        height='100'
        width='100'
        src='/images/logo.png'/>*/
    )
}

export default Logo;