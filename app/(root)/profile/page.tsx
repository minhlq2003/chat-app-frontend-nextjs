'use client'
import { TemporaryUserProps } from '@/constant/type';
import React, { useEffect, useState } from 'react'

const page = () => {
  const [user, setUser] = useState<TemporaryUserProps>(); 
  useEffect(() => {
    const temUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(temUser);
  }, []);
  console.log("User", user);
  
  return (
    <div>Profile</div>
  )
}

export default page