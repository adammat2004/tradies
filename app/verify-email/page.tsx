'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const VerifyEmailPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    if(!searchParams) return null;
    const token = searchParams.get('token');
    
    useEffect(() => {
        if (token) {
            fetch(`/api/getUserByEmailToken?token=${token}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.user) {
                        setUser(data.user);
                    } else {
                        setError(data.message || 'Invalid token');
                    }
                })
                .catch(() => {
                    setError('Something went wrong while validating the token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setError('No token provided');
            setLoading(false);
        }
    }, [token]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="text-2xl font-semibold text-green-600 mb-4">Email Successfully Verified</div>
            <button 
                className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
                onClick={() => router.push('/')}
            >
                Home
            </button>
        </div>
    ) 
};

export default VerifyEmailPage;