'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // for app directory (Next.js 13+)

const NotFound = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the home page after 1 second
    const timeoutId = setTimeout(() => {
      router.push('/'); // Redirect to the home page
    }, 1000);

    // Cleanup timeout on component unmount
    return () => clearTimeout(timeoutId);
  }, [router]);

  return (
    <div>
      <h1>Page Not Found</h1>
      <p>You are being redirected to the homepage...</p>
    </div>
  );
};

export default NotFound;
