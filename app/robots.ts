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
                    "/favorites",
                    "/create-a-quote",
                    "/my-quotes",
                ],
                disallow: [
                    "/verify-email",
                    "/resetPasswordForm",
                    "/services",
                    "/create-job-listing/",
                    "/create-post/",
                ]
            }
        ],
        sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`
    };
}
