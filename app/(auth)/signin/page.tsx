"use client";
import React, {useEffect, useState} from "react";
import { GoogleIcon, FacebookIcon, KeyIcon, PhoneIcon } from "@/constant/image";
import Image from "next/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { loginWithGoogle } from "@/lib/actions/auth";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {FormLoginData} from "@/constant/type";
const Page = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [formData, setFormData] = useState<FormLoginData>({
    phone: "",
    password: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      router.replace("/");
    }
  }, []);
  const handleLogin = async () => {
    const { phone, password } = formData;
    if (!phone || !password) {
      alert("Please fill in all fields.");
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if(!data.email) {
          return router.replace("/signup/success?id=" + data.id);
        }
        localStorage.setItem("user", JSON.stringify(data));
        router.replace("/");
      } else {
        const data = await res.json();
        alert("Error: "+data.message);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  }
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
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <InputField
              type="password"
              image={KeyIcon}
              placeholder={t("Enter your password")}
              onChange={(e) => handleChange("password", e.target.value)}
              password
            />
          </div>
          <p className="text-xl text-right text-white mr-28 mt-2">
            <Link href="/password/forgotpassword">
              <span className=" hover:text-customYellow">
              {t("Forgot your password ?")}
              </span>
            </Link>
          </p>
          <p className="text-xl text-right text-white mr-28 mt-2">
            {t("Don't have an account ?")}{" "}
            <Link href="/signup">
              <span className="font-semibold hover:text-customYellow">
                {t("Sign up")}
              </span>
            </Link>
          </p>
          <Button className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10"
                  onPress={handleLogin}>
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
