"use client";
import React, { useEffect } from "react";
import { GoogleIcon, FacebookIcon, KeyIcon, PhoneIcon } from "@/constant/image";
import Image from "next/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { loginWithGoogle } from "@/lib/actions/auth";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
const Page = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      router.replace("/");
    }
  }, []);
  return (
    <div className="py-10 flex flex-col items-center justify-center h-screen mx-auto">
      <h1 className="uppercase font-semibold text-4xl pt-14">{t("Login")}</h1>
      <div className="relative py-5">
        <div className="bg-customPurple w-[1000px] h-[730px] rounded-3xl absolute z-10 ">
          <div className="flex flex-col px-28 pt-20 gap-10 ">
            <InputField
              type="text"
              image={PhoneIcon}
              placeholder={t("Enter your phone number")}
            />
            <InputField
              type="password"
              image={KeyIcon}
              placeholder={t("Enter your password")}
              password
            />
          </div>
          <p className="text-xl text-right text-white mr-28 mt-2">
            {t("Don't have an account ?")}{" "}
            <Link href="/signup">
              <span className="font-semibold hover:text-customYellow">
                {t("Sign up")}
              </span>
            </Link>
          </p>
          <Button className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10">
            {t("Login")}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="w-[200px] border-t-2 border-white"></span>
            <p className="text-white text-2xl">{t("or you can")}</p>
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
            <p className="mr-32 text-white">{t("Continue with Facebook")}</p>
          </Button>
          <Button
            className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10"
            onPress={() => loginWithGoogle()}
          >
            <Image
              src={GoogleIcon}
              alt="Google Icon"
              width={50}
              height={50}
              className="mr-5"
            />
            <p className="mr-40">{t("Continue with Google")}</p>
          </Button>
        </div>
        <div className="bg-customPurple/50 w-[1000px] h-[730px] rounded-3xl ml-14 mt-14"></div>
      </div>
    </div>
  );
};

export default Page;
