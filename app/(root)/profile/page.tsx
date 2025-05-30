"use client";
import InputField from "@/components/InputField";
import {
  BlackUser,
  CalendarIcon,
  LocationIcon,
  noUserImage,
  pencil,
  WhitePhone,
} from "@/constant/image";
import { FormSuccessErrors, TemporaryUserProps } from "@/constant/type";
import Image from "next/image";
import React, { Suspense, use, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { faEnvelope, faVenusMars } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const Page = () => {
  const { t } = useTranslation("common");
  const [user, setUser] = useState<TemporaryUserProps>();
  const router = useRouter();
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.ok) {
        let responseData = await response.json();
        localStorage.removeItem("temporaryuser");
        localStorage.setItem("user", JSON.stringify(responseData));
        toast.success("Update successfully!")
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        toast.error("Update failed: " + errorData.message);
      }
    } catch (error) {
      console.error("Error during update:", error);
      toast.error("An error occurred. Please try again.");
    }
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
          setUser((prev) => ({
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
          handleComplete();
        } else {
          console.error("Image upload failed:", await response.json());
          toast.error("Failed to upload image. Please try again.");
        }

      } catch (error) {
        console.error("Error during image upload:", error);
        toast.error("An error occurred while uploading the image.");
      }
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (!user) {
      router.replace("/introduction");
    }
  }, []);

  function formatDateToInputValue(date: string | Date | undefined): string {
    if (!date) return "";
    const parsedDate = new Date(date);
    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  return (
    <Suspense>
      <div className="flex flex-col max-w-[1200px] h-screen gap-20 mx-auto ">
        <div className="relative top-[40px]">
          <div className="absolute z-0 bg-customPurple w-full h-[200px] flex items-center justify-center rounded-xl">
            <div className="flex gap-5 items-center justify-center">
              <div className="relative">
                <Image
                  width={120}
                  height={120}
                  src={user?.image || noUserImage}
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

          <div className="-z-10 relative right-[-33px] top-[-33px] bg-customPurple/50 w-full h-[200px] rounded-xl"></div>
        </div>
        <div className="flex flex-col gap-10">
          <h1 className="text-3xl font-bold text-center">{user?.name}</h1>
          <div className="flex flex-col gap-5 w-[1000px] mx-auto">
            <InputField
              image={BlackUser}
              type="text"
              value={user?.name || ""}
              textClassname="text-black"
              error={errors.name}
              errorClassname="text-red-600"
              onChange={(e) =>
                setUser({
                  ...user,
                  name: e.target.value,
                } as TemporaryUserProps)
              }
              storageKey="name"
              isEditable={true}
            />
            <InputField
              image={WhitePhone}
              type="text"
              value={user?.phone || ""}
              textClassname="text-black"
              error={errors.phone}
              errorClassname="text-red-600"
              placeholder={t("Enter your phone number")}
              onChange={(e) =>
                setUser({
                  ...user,
                  phone: e.target.value,
                } as TemporaryUserProps)
              }
              isEditable={true}
              storageKey="phone"
            />

            <InputField
              icon={faEnvelope}
              type="email"
              value={user?.email || ""}
              textClassname="text-black"
              error={errors.email}
              errorClassname="text-red-600"
              placeholder={t("Enter your email")}
              onChange={(e) =>
                setUser({
                  ...user,
                  email: e.target.value,
                } as TemporaryUserProps)
              }
              isEditable={true}
              storageKey="email"
            />

            <InputField
              image={CalendarIcon}
              type="date"
              value={formatDateToInputValue(user?.birthday || "")}
              placeholder={t("Enter your birthday")}
              textClassname="text-black"
              error={errors.birthday}
              errorClassname="text-red-600"
              onChange={(e) =>
                setUser({
                  ...user,
                  birthday: new Date(e.target.value),
                } as TemporaryUserProps)
              }
              isEditable={true}
              storageKey="birthday"
            />

            <InputField
              image={LocationIcon}
              type="text"
              placeholder={t("Enter your address")}
              textClassname="text-black"
              value={user?.location || ""}
              onChange={(e) =>
                setUser({
                  ...user,
                  location: e.target.value,
                } as TemporaryUserProps)
              }
              isEditable={true}
              storageKey="location"
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default Page;
