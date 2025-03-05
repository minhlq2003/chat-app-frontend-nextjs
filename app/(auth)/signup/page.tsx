"use client";
import React, { useState } from "react";
import {
  GoogleIcon,
  FacebookIcon,
  KeyIcon,
  PhoneIcon,
  UserIcon,
} from "@/constant/image";
import Image from "next/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { FormSignUpData, FormSignUpErrors } from "@/constant/type";
import { usePathname, useRouter } from "next/navigation";
const page = () => {
  const [formData, setFormData] = useState<FormSignUpData>({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormSignUpErrors>({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [field]: "",
    }));
  };

  const validateForm = () => {
    const newErrors: FormSignUpErrors = {
      name: "",
      phone: "",
      password: "",
      confirmPassword: "",
    };

    if (formData.phone !== "123456789") {
      newErrors.phone = "Phone number is incorrect.";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const router = useRouter();

  const handleSubmit = () => {
    if (validateForm()) {
      const userData = {
        id: 1,
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        image: "",
        location: "",
        birthday: null,
      };
      localStorage.setItem("temporaryuser", JSON.stringify(userData));
      router.push(`/signup/success`);
    }
  };

  return (
    <div className="py-10 flex flex-col items-center justify-center h-screen mx-auto">
      <h1 className="uppercase font-semibold text-4xl pt-14">Sign up</h1>
      <div className="relative py-5">
        <div className="bg-customPurple w-[1000px] h-[730px] rounded-3xl absolute z-10 ">
          <div className="flex flex-col px-28 pt-20 gap-8 ">
            <InputField
              type="text"
              image={UserIcon}
              placeholder="Enter your name"
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <InputField
              type="text"
              image={PhoneIcon}
              placeholder="Enter your phone number"
              error={errors.phone}
              onFocus={() => setErrors((prev) => ({ ...prev, phone: "" }))}
              onChange={(e) => handleChange("phone", e.target.value)}
            />
            <InputField
              type="password"
              image={KeyIcon}
              placeholder="Enter your password"
              password
              onChange={(e) => handleChange("password", e.target.value)}
            />
            <InputField
              type="password"
              image={KeyIcon}
              placeholder="Confirm your password"
              password
              error={errors.confirmPassword}
              onFocus={() =>
                setErrors((prev) => ({ ...prev, confirmPassword: "" }))
              }
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
            />
          </div>
          <p className="text-xl text-right text-white mr-28 mt-2">
            Already have an account ?{" "}
            <Link href="/signin">
              <span className="font-semibold hover:text-customYellow">
                Signin
              </span>
            </Link>
          </p>
          <Button
            className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10"
            onPress={handleSubmit}
          >
            Sign up
          </Button>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="w-[200px] border-t-2 border-white"></span>
            <p className="text-white text-2xl">or you can</p>
            <span className="w-[200px] border-t-2 border-white"></span>
          </div>
          <div className="flex items-center justify-center gap-10 mt-5">
            <Button className="h-20 bg-[#1877F2]">
              <Image
                src={FacebookIcon}
                alt="Facebook Icon"
                width={40}
                height={40}
              />
            </Button>
            <Button className="h-20 bg-white">
              <Image
                src={GoogleIcon}
                alt="Google Icon"
                width={40}
                height={50}
              />
            </Button>
          </div>
        </div>
        <div className="bg-customPurple/50 w-[1000px] h-[730px] rounded-3xl ml-14 mt-14"></div>
      </div>
    </div>
  );
};

export default page;
