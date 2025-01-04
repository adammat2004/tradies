'use client'

import { useEffect, Suspense } from "react";
import { useRouter } from "next/router";

const NotFoundPage: React.FC = () => {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push('/');
        }, 5000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className="not-found-container">
                <h1>Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <p>You will be redirected to the homepage shortly.</p>
                <button onClick={() => router.push('/')} className="redirect-button">
                    Go to Homepage
                </button>

                <style jsx>{`
                    .not-found-container {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100vh;
                        text-align: center;
                    }
                    h1 {
                        font-size: 3rem;
                        margin-bottom: 1rem;
                    }
                    p {
                        font-size: 1.25rem;
                        margin-bottom: 1rem;
                    }
                    .redirect-button {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background-color: #0070f3;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    .redirect-button:hover {
                        background-color: #005bb5;
                    }
                `}</style>
            </div>
        </Suspense>
    );
};

export default NotFoundPage;