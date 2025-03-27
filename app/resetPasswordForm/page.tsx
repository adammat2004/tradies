"use client";

import { useState } from "react";

const ResetPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false); // Track loading state

    const handleSubmit = async () => {
        if (!email) {
            setMessage("Please enter your email.");
            return;
        }

        setLoading(true);
        setMessage(""); // Clear previous messages

        try {
            const response = await fetch("/api/resetPassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            setMessage(data.message || "Check your email for further instructions.");
        } catch (error) {
            setMessage("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xs mx-auto text-center">
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Enter your email</h1>
            <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full p-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? "Processing..." : "Reset Password"}
            </button>
            {message && <p className="text-sm text-red-500 mt-2">{message}</p>}
        </div>
    );
};

export default ResetPasswordForm;
