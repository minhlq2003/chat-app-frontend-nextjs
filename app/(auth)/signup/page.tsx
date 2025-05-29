"use client";
import React, { Suspense, useState } from "react";
import {
  googleIcon,
  facebookIcon,
} from "@/constant/image";
import Image from "next/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import Link from "next/link";
import { FormSignUpData, FormSignUpErrors } from "@/constant/type";
import { useRouter } from "next/navigation";
import { loginWithGoogle } from "@/lib/actions/auth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { faKey, faPhone, faUser } from "@fortawesome/free-solid-svg-icons";
const Page = () => {
  const { t } = useTranslation("common");
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
    if (!formData.name || !formData.name.trim()) {
      newErrors.name = (t("Name is required."));
    } else if (
      !formData.name
        .trim()
        .split(" ")
        .every((word) => word.length > 0 && word[0] === word[0].toUpperCase())
    ) {
      newErrors.name = (t("Each word must start with a capital letter."));
    }

    if (!formData.phone) {
      newErrors.phone = (t("Phone number is required."));
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || !digitsOnly.startsWith("0")) {
        newErrors.phone =
          (t("Phone must start with 0 and have at least 10 digits."));
      }
    }
    if (formData.password !== undefined) {
      const password = formData.password || "";
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>?])(?!.*\s).{9,}$/;
      if (!passwordRegex.test(password)) {
        newErrors.password =
          (t("Password must be >8 characters, include 1 uppercase, 1 number, and 1 special character."));
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = (t("Passwords do not match."));
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const router = useRouter();

  const handleSubmit = async () => {
    if (validateForm()) {
      const userData = {
        name: formData.name,
        password: formData.password,
        phone: formData.phone,
        image: "",
        location: "",
        birthday: null,
        email: null,
      };
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });
        if (response.ok) {
          const data = await response.json();
          const id = data.id;
          router.push(`/signup/success?id=${id}`);
        } else {
          const errorData = await response.json();
          console.error("Signup failed:", errorData);
          toast.error("Signup failed: "+ errorData.message)
        }
      } catch (error) {
        console.error("Error during signup:", error);
      }

    }
  };

  return (
    <Suspense>
      <div className="py-10 flex flex-col items-center justify-center h-screen mx-auto">
      <h1 className="uppercase font-semibold text-4xl pt-14">{t("Sign up")}</h1>
      <div className="relative py-5">
        <div className="bg-customPurple w-[1000px] h-[730px] rounded-3xl absolute z-10 ">
          <div className="flex flex-col px-28 pt-20 gap-8 ">
            <InputField
              type="text"
              icon={faUser}
              placeholder={t("Enter your name")}
              error={errors.name}
              onChange={(e) => handleChange("name", e.target.value)}
              iconClassName="text-white"
            />
            <InputField
              type="text"
              icon={faPhone}
              placeholder={t("Enter your phone number")}
              error={errors.phone}
              onFocus={() => setErrors((prev) => ({ ...prev, phone: "" }))}
              onChange={(e) => handleChange("phone", e.target.value)}
              iconClassName="text-white"
            />
            <InputField
              type="password"
              icon={faKey}
              placeholder={t("Enter your password")}
              password
              error={errors.password}
              onFocus={() =>
                  setErrors((prev) => ({ ...prev, password: "" }))
              }
              onChange={(e) => handleChange("password", e.target.value)}
              iconClassName="text-white"
            />
            <InputField
              type="password"
              icon={faKey}
              placeholder={t("Confirm your password")}
              password
              error={errors.confirmPassword}
              onFocus={() =>
                setErrors((prev) => ({ ...prev, confirmPassword: "" }))
              }
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              iconClassName="text-white"
            />
          </div>
          <p className="text-xl text-right text-white mr-28 mt-2">
            {t("Already have an account ?")}{" "}
            <Link href="/signin">
              <span className="font-semibold hover:text-customYellow">
                {t("Sign in")}
              </span>
            </Link>
          </p>
          <Button
            className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10"
            onPress={handleSubmit}
          >
            {t("Sign up")}
          </Button>
          <div className="flex items-center justify-center gap-2 mt-5">
            <span className="w-[200px] border-t-2 border-white"></span>
            <p className="text-white text-2xl">{t("or you can")}</p>
            <span className="w-[200px] border-t-2 border-white"></span>
          </div>
          <div className="flex items-center justify-center gap-10 mt-5">
            <Button className="h-20 bg-[#1877F2]">
              <Image
                src={facebookIcon}
                alt="Facebook Icon"
                width={40}
                height={40}
              />
            </Button>
            <Button className="h-20 bg-white" onPress={()=>loginWithGoogle()}>
              <Image
                src={googleIcon}
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
    </Suspense>
  );
};

export default Page;
