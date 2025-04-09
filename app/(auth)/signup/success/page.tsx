"use client";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { FormSuccessErrors, TemporaryUserProps } from "@/constant/type";
import Image from "next/image";
import { useSearchParams } from 'next/navigation'
import {
  BlackKey,
  BlackUser,
  CalendarIcon,
  LocationIcon,
  noUserImage,
  pencil,
  WhitePhone,
} from "@/constant/image";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { getSessionUser } from "@/lib/actions/auth";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

const Page = () => {
  const { t } = useTranslation("common");
  const [temporaryUser, setTemporaryUser] = useState<TemporaryUserProps>();
  const [isGoogleLogin, setIsGoogleLogin] = useState(false);
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [errors, setErrors] = useState<FormSuccessErrors>({
    name: "",
    phone: "",
    password: "",
    birthday: "",
  });
  const router = useRouter();
  useEffect(() => {
    const fetchAndStoreGoogleUser = async () => {
      const session = await getSessionUser();
      if (session && session.email && session.image) {
        setIsGoogleLogin(true);
        const userData = await getUserInfo("email", session.email);
        if(userData.email) {
          localStorage.setItem("user", JSON.stringify(userData));
          return router.replace("/");
        }
        const tempUser: TemporaryUserProps = {
          id: -1,
          name: session.name || "",
          password: "",
          phone: "",
          image: session.image || null,
          location: null,
          birthday: null,
          email: session.email,
        };
        setTemporaryUser(tempUser);
      } else {
        const storedUser = await getUserInfo("id", id);
        setTemporaryUser(storedUser);
      }
    };
    fetchAndStoreGoogleUser();
    const getUserInfo = async(type: string, value: any) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/account?${type}=${value}`);
      if(!res.ok) {
        throw new Error ('Failed to fetch user info');
      }
      const [data] = await res.json()
      if(!data) return {}
      return data;
    }

  }, []);

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      password: "",
      birthday: "",
    };

    if (!temporaryUser?.name || !temporaryUser.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (
      !temporaryUser.name
        .trim()
        .split(" ")
        .every((word) => word.length > 0 && word[0] === word[0].toUpperCase())
    ) {
      newErrors.name = "Each word must start with a capital letter.";
    }

    if (!temporaryUser?.phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      const digitsOnly = temporaryUser.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || !digitsOnly.startsWith("0")) {
        newErrors.phone =
          "Phone must start with 0 and have at least 10 digits.";
      }
    }

    if (!temporaryUser?.birthday) {
      newErrors.birthday = "Birthday is required.";
    }

    if (temporaryUser?.password !== undefined) {
      const password = temporaryUser.password || "";
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

  const handleComplete = async () => {
    if (!temporaryUser) return;

    if (!validateForm()) return;
    try {
      if(temporaryUser.email === '') {
        temporaryUser.email = "exampleemail@example.com"
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(temporaryUser),
      });
      if (response.ok) {
        let responseData = await response.json();
        localStorage.removeItem("temporaryuser");
        localStorage.setItem("user", JSON.stringify(responseData));
        router.push("/");
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        alert("Update failed: " + errorData.message);
      }
    } catch (error) {
      console.error("Error during update:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.imageUrl;

          setTemporaryUser((prev) => ({
            ...(prev || {
              id: -1,
              name: "",
              password: "",
              phone: "",
              image: null,
              location: null,
              birthday: null,
              email: "",
            }),
            image: imageUrl,
          }));
        } else {
          console.error("Image upload failed:", await response.json());
          alert("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
        alert("An error occurred while uploading the image.");
      }
    }
  };
  return (
    <Suspense>
      <div className="flex flex-col max-w-[1200px] h-screen gap-20 mx-auto ">
        <div className="relative">
          <div className="absolute z-0 bg-customPurple w-full h-36 flex items-center justify-center rounded-br-2xl rounded-bl-2xl">
            <div className="flex gap-5 items-center justify-center">
              <h1 className="text-white text-xl font-bold">
                {t("Welcome")} {temporaryUser?.name}
              </h1>
              <div className="relative">
                <Image
                  width={120}
                  height={120}
                  src={temporaryUser?.image || noUserImage}
                  alt="User Image"
                  className="size-[100px] rounded-full"
                />

                <div
                  className="absolute left-20 right-0 top-5 bottom-0 w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Image width={20} height={20} src={pencil} alt="Edit" />
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
          <div className="-z-10 bg-customPurple/50 w-full h-44 rounded-br-2xl rounded-bl-2xl"></div>
        </div>
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-center">
            {t("Complete Your Profile")}
          </h1>
          <div className="flex flex-col gap-5 w-[1000px] mx-auto">
            <InputField
              image={BlackUser}
              type="text"
              value={temporaryUser?.name || ""}
              textClassname="text-black"
              error={errors.name}
              errorClassname="text-red-600"
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
              error={errors.phone}
              errorClassname="text-red-600"
              placeholder={t("Enter your phone number")}
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  phone: e.target.value,
                } as TemporaryUserProps)
              }
            />
            {isGoogleLogin && (
              <InputField
                type="password"
                image={BlackKey}
                placeholder={t("Enter your password")}
                value={temporaryUser?.password || ""}
                textClassname="text-black"
                error={errors.password}
                errorClassname="text-red-600"
                password
                onChange={(e) =>
                  setTemporaryUser({
                    ...temporaryUser,
                    password: e.target.value,
                  } as TemporaryUserProps)
                }
              />
            )}
            <InputField
              image={CalendarIcon}
              type="date"
              placeholder={t("Enter your birthday")}
              textClassname="text-black"
              error={errors.birthday}
              errorClassname="text-red-600"
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
              placeholder={t("Enter your address")}
              textClassname="text-black"
              onChange={(e) =>
                setTemporaryUser({
                  ...temporaryUser,
                  location: e.target.value,
                } as TemporaryUserProps)
              }
            />
            <Button
              className="bg-customPurple text-white text-xl w-[300px] h-[50px] mx-auto"
              onPress={() => handleComplete()}
            >
              {t("Done")}
            </Button>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Page;
