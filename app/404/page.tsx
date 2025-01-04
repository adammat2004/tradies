// app/404.tsx (Custom 404 page)
'use client'

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const NotFound = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <NotFoundComponent />
        </Suspense>
    );
};

const NotFoundComponent = () => {
    const params = useSearchParams();
    const category = params?.get('category');

    return (
        <div>
            <h1>Page Not Found</h1>
            <p>Category: {category}</p>
        </div>
    );
};

export default NotFound;
