"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Intro1, Intro2, Intro3 } from "@/constant/image";

const Page = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      image: Intro1,
      title: "Group Chatting",
      description:
        "Collaborate effortlessly with multiple people in a single conversation, sharing messages, files, and media.",
    },
    {
      image: Intro2,
      title: "Video Call",
      description:
        "Collaborate effortlessly with multiple people in a single conversation, sharing messages, files, and media.",
    },
    {
      image: Intro3,
      title: "Profile",
      description:
        "Collaborate effortlessly with multiple people in a single conversation, sharing messages, files, and media.",
    },
  ];

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setActiveIndex(
      (prevIndex) => (prevIndex - 1 + slides.length) % slides.length
    );
  };

  return (
    <div
      className="relative bg-blue-500 rounded-b-xl overflow-hidden"
      style={{ height: "500px", width: "1000px" }}
    >
      <div className="relative h-full w-full flex items-center justify-center">
        <Image
          src={slides[activeIndex].image}
          alt={slides[activeIndex].title}
          width={400}
          height={400}
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between p-4">
        <button
          className="bg-blue-300 rounded-full p-2"
          onClick={handlePrev}
          style={{ opacity: activeIndex === 0 ? 0.5 : 1 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          className="bg-blue-300 rounded-full p-2"
          onClick={handleNext}
          style={{ opacity: activeIndex === slides.length - 1 ? 0.5 : 1 }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div className="absolute bottom-20 left-0 w-full text-center">
        <h2 className="text-white text-2xl font-bold mb-2">
          {slides[activeIndex].title}
        </h2>
        <p className="text-white mb-4">{slides[activeIndex].description}</p>
      </div>

      <div className="absolute bottom-4 left-0 w-full flex items-center justify-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          Get Started
        </button>
      </div>

      <div className="absolute bottom-[-100px] left-0 w-full flex items-center justify-center pb-4">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === activeIndex ? "bg-blue-600" : "bg-gray-400"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Page;
