"use client";
import Image from "next/image";
import { InputFieldProps } from "../constant/type";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { EyeIcon, EyeSlash } from "@/constant/image";

export default function InputField({
  image,
  placeholder,
  type,
  error,
  errorClassname,
  value,
  textClassname,
  onFocus,
  onChange,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-5 relative">
        <Image src={image} className="size-9" alt="icon" />
        <input
          type={inputType}
          placeholder={placeholder}
          className={twMerge(
            `peer w-full bg-transparent border-b-2 text-2xl text-gray-100 outline-none focus:border-customYellow`,
            textClassname
          )}
          onFocus={onFocus}
          onChange={onChange}
          value={value}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Image src={EyeSlash} alt="Eye Slash" width={100} height={100} className="w-6 h-6 " />
            ) : (
              <Image src={EyeIcon} alt="Eye" width={100} height={100} className="w-6 h-6 " />
            )}
          </button>
        )}
      </div>
      <span
        className={twMerge(`text-customYellow text-sm h-4 transition-opacity duration-300 ml-[52px] ${
          error ? "opacity-100" : "opacity-0"
        }`, errorClassname)}
      >
        {error || " "}
      </span>
    </div>
  );
}
