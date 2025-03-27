"use client";
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

interface ChangePasswordFormProps {
    resetPasswordToken: string;
}

const ChangePasswordForm = ({resetPasswordToken}: ChangePasswordFormProps) => {
    const router = useRouter();
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");

    const [message, setMessage] = useState<string>("");

    const handleSubmit = async () => {
        if (!password || !confirmPassword) {
            setMessage("Please enter password");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match");
            return;
        }
        
        try {
            const response = await fetch(`/api/updatePassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resetPasswordToken, password })
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                setMessage(data.message || "Something went wrong");
                return;
            }
    
            setMessage(data.message);
            router.push('/'); 
        } catch (error) {
            console.error("Error:", error);
            setMessage("Something went wrong while updating password");
        }
    };
    

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Change Password</h1>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                onClick={handleSubmit}
                className="w-full p-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400"
            >
                Change Password
            </button>
            {message && <p className="text-sm text-red-500 mt-4">{message}</p>}
        </div>
    )
}

export default ChangePasswordForm