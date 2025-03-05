"use client";
import React, { Suspense, useEffect, useState } from "react";
import { TemporaryUserProps } from "@/constant/type";
import Image from "next/image";
import {
  BlackUser,
  CalendarIcon,
  LocationIcon,
  noUserImage,
  pencil,
  WhitePhone,
} from "@/constant/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";

const Page = () => {
  const [temporaryUser, setTemporaryUser] = useState<TemporaryUserProps>();

  useEffect(() => {
    const temUser = JSON.parse(localStorage.getItem("temporaryuser") || "{}");
    setTemporaryUser(temUser);
  }, []);
  return (
    <Suspense>
      <div className="flex flex-col max-w-[1200px] h-screen gap-20 mx-auto">
        <div className="relative">
          <div className="absolute z-0 bg-customPurple w-full h-36 flex items-center justify-center rounded-br-2xl rounded-bl-2xl">
            <div className="flex gap-5 items-center justify-center">
              <h1 className="text-white text-xl font-bold">
                Welcome {temporaryUser?.name}
              </h1>
              <div className="relative">
                <Image
                  width={120}
                  height={120}
                  src={noUserImage}
                  alt="User Image"
                  className=""
                />
                <div className="absolute left-20 right-0 top-5 bottom-0 w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer">
                  <Image width={20} height={20} src={pencil} alt="Edit" />
                </div>
              </div>
            </div>
          </div>
          <div className="-z-10 bg-customPurple/50 w-full h-44 rounded-br-2xl rounded-bl-2xl"></div>
        </div>
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-center">Your Profile</h1>
          <div className="flex flex-col gap-5 w-[1000px] mx-auto">
            <InputField
              image={BlackUser}
              type="text"
              value={temporaryUser?.name || ""}
              textClassname="text-black"
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  name: e.target.value,
                } as TemporaryUserProps)
              }
            />
            <InputField
              image={WhitePhone}
              type="text"
              value={temporaryUser?.phone || ""}
              textClassname="text-black"
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  phone: e.target.value,
                } as TemporaryUserProps)
              }
            />
            <InputField
              image={CalendarIcon}
              type="date"
              placeholder="Enter your birthday"
              textClassname="text-black"
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  birthday: new Date(e.target.value),
                } as TemporaryUserProps)
              }
            />
            <InputField
              image={LocationIcon}
              type="text"
              placeholder="Enter your address"
              textClassname="text-black"
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  location: e.target.value,
                } as TemporaryUserProps)
              }
            />
            <Button className="bg-customPurple text-white text-xl w-[300px] h-[50px] mx-auto">
              Done
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Page;
