'use client';

import ChangePasswordForm from '@/app/components/changePasswordForm';
import ResetPasswordForm from '@/app/components/resetPasswordForm';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const ResetPasswordPage = () => {
    const searchParams = useSearchParams();
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    if(!searchParams) return null;
    const token = searchParams.get('token');
    
    useEffect(() => {
        if (token) {
            fetch(`/api/getUserByToken?token=${token}`)
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

    return user ? <ChangePasswordForm resetPasswordToken={token!} /> : <ResetPasswordForm />;
};

export default ResetPasswordPage;
