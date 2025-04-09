"use client";
import React, { useEffect, useState } from "react";
import { GoogleIcon, FacebookIcon, KeyIcon, PhoneIcon } from "@/constant/image";
import Image from "next/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { FormSuccessErrors, TemporaryUserProps } from "@/constant/type";
const Page = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { type } = useParams();
  const isForgot = type === "forgotpassword";
  const [user, setUser] = useState<TemporaryUserProps>();
  const [errors, setErrors] = useState<FormSuccessErrors>({
    name: "",
    phone: "",
    password: "",
    birthday: "",
  });
  useEffect(() => {
    const temUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(temUser);
  }, []);
  const [form, setForm] = useState({
    phone: user?.phone,
    oldPassword: "",
    newPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      password: "",
      birthday: "",
    };

    if (!user?.phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      const digitsOnly = user.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || !digitsOnly.startsWith("0")) {
        newErrors.phone =
          "Phone must start with 0 and have at least 10 digits.";
      }
    }

    if (user?.password !== undefined) {
      const password = user.password || "";
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{9,}$/;

      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be >8 characters, include 1 uppercase, 1 number, and 1 special character.";
      }
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === "");
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (isForgot) {
        if(validateForm()){

        }
    } else {
        if(validateForm()){

        }
    }
  };
  useEffect(() => {}, []);
  return (
    <div className="py-10 flex flex-col items-center justify-center h-screen mx-auto">
      {isForgot ? (
        <h1 className="uppercase font-semibold text-4xl pt-14">
          {t("Forgot Password")}
        </h1>
      ) : (
        <h1 className="uppercase font-semibold text-4xl pt-14">
          {t("Change Password")}
        </h1>
      )}
      <div className="relative py-5">
        <div className="bg-customPurple w-[1000px] h-[730px] rounded-3xl absolute z-10">
          <div className="flex flex-col px-28 pt-20 gap-10 ">
            {isForgot ? (
              <InputField
                value={user?.phone}
                type="text"
                image={PhoneIcon}
                placeholder={t("Enter your phone number")}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            ) : (
              <InputField
                type="text"
                image={KeyIcon}
                placeholder={t("Enter your password")}
                onChange={(e) => handleChange("oldPassword", e.target.value)}
              />
            )}
            <InputField
              type="password"
              image={KeyIcon}
              placeholder={t("Enter your new password")}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              password
            />
          </div>

          <Button className="bg-white text-3xl w-[550px] h-[70px] ml-52 mt-10" onPress={()=>handleSubmit()}>
            {t("Confirm")}
          </Button>
        </div>
        <div className="bg-customPurple/50 w-[1000px] h-[730px] rounded-3xl ml-14 mt-14"></div>
      </div>
    </div>
  );
};

export default Page;
