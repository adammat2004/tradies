import { MetadataRoute } from "next";

interface Listing{
    id: string;
    updatedAt: string;
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap>{
    const response = await fetch(`https://tradeez.ie/api/getListings`);
    //const response = await fetch(`http://localhost:3000/api/getListings`);
    const listings: Listing[] = await response.json();
    const listingUrls: MetadataRoute.Sitemap = listings.map(({id, updatedAt}) => ({
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/listings/${id}`,
        lastModified: updatedAt
    }))
    return [
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/`
        },
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/jobs`
        },
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/favorites`
        },
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/services`
        },
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email`
        },
        {
            url: `${process.env.NEXT_PUBLIC_BASE_URL}/resetPasswordForm`
        },
        ...listingUrls,
    ]
}   