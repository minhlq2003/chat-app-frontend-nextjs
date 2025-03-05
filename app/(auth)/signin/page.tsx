import React from "react";
import {
  GoogleIcon,
  FacebookIcon,
  KeyIcon,
  PhoneIcon,
} from "@/app/constant/image";
import Image from "next/image";
import InputField from "@/app/components/InputField";
import { Button } from "@nextui-org/button";
import Link from "next/link";
const page = () => {
  return (
    <div className="py-10 flex flex-col items-center justify-center h-screen mx-auto">
      <h1 className="uppercase font-semibold text-4xl pt-14">Login</h1>
      <div className="relative py-5">
        <div className="bg-custompurple w-[1000px] h-[730px] rounded-3xl absolute z-10 ">
          <div className="flex flex-col px-28 pt-20 gap-10 ">
            <InputField
              type="text"
              image={PhoneIcon}
              placeholder="Enter your phone number"
            />
            <InputField
              type="password"
              image={KeyIcon}
              placeholder="Enter your password"
              password
            />
          </div>
          <p className="text-xl text-right text-white mr-28 mt-2">
            Don't have account ?{" "}
            <Link href="/signup">
              <span className="font-semibold hover:text-customyellow">
                Sign up
              </span>
            </Link>
          </p>
          <Button className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10">
            Login
          </Button>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="w-[200px] border-t-2 border-white"></span>
            <p className="text-white text-2xl">or you can</p>
            <span className="w-[200px] border-t-2 border-white"></span>
          </div>
          <Button className="text-3xl w-[550px] h-[70px] ml-52 mt-10 bg-[#1877F2]">
            <Image
              src={FacebookIcon}
              alt="Facebook Icon"
              width={50}
              height={50}
              className="mr-5"
            />
            <p className="mr-32 text-white">Continue with facebook</p>
          </Button>
          <Button className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10">
            <Image
              src={GoogleIcon}
              alt="Google Icon"
              width={50}
              height={50}
              className="mr-5"
            />
            <p className="mr-40">Continue with google</p>
          </Button>
        </div>
        <div className="bg-custompurple/50 w-[1000px] h-[730px] rounded-3xl ml-14 mt-14"></div>
      </div>
    </div>
  );
};

export default page;
