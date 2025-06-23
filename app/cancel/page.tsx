import Link from 'next/link'
import React from 'react'

const page = () => {
  return (
    <div className='flex flex-col items-center justify-center'>
        <Link
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200"
        >
            Return To Home
        </Link>
    </div>
  )
}

export default page