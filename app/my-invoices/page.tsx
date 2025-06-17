'use client'
import React from 'react'

const page = () => {
  return (
    <div>
      <button onClick={async () => {
        try {
          const response = await fetch('/api/create-checkout-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              // Add any necessary data here
            }),
          });

          if (!response.ok) {
            throw new Error('Network response was not ok');
          }

          const data = await response.json();
          window.location.href = data.url; // Redirect to the checkout page
        } catch (error) {
          console.error('Error creating checkout session:', error);
        }
      }}>
        Create checkout session
      </button>
    </div>
  )
}

export default page