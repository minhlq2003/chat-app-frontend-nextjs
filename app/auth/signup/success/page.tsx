"use client"
import React from 'react'
import { useSearchParams } from 'next/navigation';

const page = () => {
  const searchParams = useSearchParams();
  const name = searchParams.get('name');
  const phone = searchParams.get('phone');
  return (
      <div className="py-10 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Sign Up Successful!</h1>
        <p className="mt-4">Name: {name}</p>
        <p>Phone: {phone}</p>
      </div>
  )
}

export default page