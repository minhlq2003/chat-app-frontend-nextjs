"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Intro1, Intro2, Intro3 } from "@/constant/image";
import { Navigation, Pagination } from "swiper/modules";
import "../../../styles/swiper.css";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const Page = () => {
  const {t} = useTranslation("common") 
  const router = useRouter();
  const slides = [
    {
      image: Intro1,
      title: (t("Group Chatting")),
      description:
        (t("Collaborate effortlessly with multiple people in a single conversation, sharing messages, files, and media.")),
    },
    {
      image: Intro2,
      title: (t("Video Call")),
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

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      router.replace("/");
    }
  }, []);

  return (
    <div className="relative rounded-b-xl overflow-hidden h-full  mt-[50px] introduction">
      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true }}
        className="h-[700px] w-[1400px] bg-[#5457ff]"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="flex items-center justify-center  "
          >
            <div className="flex justify-center items-center">
              <Image
                src={slide.image}
                alt={slide.title}
                width={600}
                height={600}
              />
              <div className="absolute bottom-10 left-0 w-full text-center">
                <h2 className="text-white text-4xl font-bold mb-2">
                  {slide.title}
                </h2>
                <p className="text-white text-xl mb-4">{slide.description}</p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="relative mt-10 w-full flex items-center justify-center">
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg">
          <a href="/signup">{t("Get Started")}</a>
        </button>
      </div>
    </div>
  );
};

export default Page;
