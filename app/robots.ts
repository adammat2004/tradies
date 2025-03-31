import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: [
                    "/",
                    "/jobs",
                    "/contact",
                    "/create-job-listing/",
                    "/create-post/"
                ],
                disallow: [
                    "/verify-email",
                    "/resetPasswordForm",
                    "/favorites",
                    "/services",
                ]
            }
        ],
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
    };
}
