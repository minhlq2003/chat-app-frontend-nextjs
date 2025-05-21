"use client";
import Image from "next/image";
import { InputFieldProps } from "../constant/type";
import { twMerge } from "tailwind-merge";
import { useState } from "react";
import { EyeIcon, EyeSlash, pencil } from "@/constant/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function InputField({
  isEditable,
  image,
  icon,
  placeholder,
  type,
  error,
  errorClassname,
  value,
  textClassname,
  onFocus,
  storageKey,
  onChange,
  iconClassName
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(true);
  const [localValue, setLocalValue] = useState(value || "");
  const isPassword = type === "password";

  const inputType = isPassword && showPassword ? "text" : type;

  const handleEditClick = () => {
    if (isEditing) {
      // Bấm lần 2: lưu
      if (storageKey) {
        try {
          const userData = JSON.parse(localStorage.getItem("user") || "{}");
          userData[storageKey] = localValue;
          localStorage.setItem("user", JSON.stringify(userData));
        } catch (err) {
          console.error("Lỗi lưu user:", err);
        }
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange?.(e);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-5 relative">
        {icon ? (
          <FontAwesomeIcon className={twMerge("size-9", iconClassName)} icon={icon} />
        ) : (
          <Image src={image || ""} className="size-9" alt="icon" />
        )}
        <input
          disabled={!isEditing}
          type={inputType}
          placeholder={placeholder}
          className={twMerge(
            `peer w-full bg-transparent ${
              isEditing ? "border-b-2 shadow-md" : ""
            } text-2xl text-gray-100 outline-none focus:border-customPurple pr-[50px]`,
            textClassname
          )}
          onFocus={onFocus}
          onChange={handleChange}
          value={value}
          max={type === "date" ? new Date().toISOString().split("T")[0] : undefined} // Add max attribute for date type
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <FontAwesomeIcon icon={faEye} className="size-5 text-white"/>
            ) : (
              <FontAwesomeIcon icon={faEyeSlash} className="size-5 text-white"/>
            )}
          </button>
        )}

        {isEditable && (
          <div
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={handleEditClick}
          >
            {!isEditing ? (
              <Image src={pencil} alt="pencil" className="size-7" />
            ) : (
              <FontAwesomeIcon icon={faCheck} className="size-7" />
            )}
          </div>
        )}
      </div>
      <span
        className={twMerge(
          `text-customYellow text-sm h-4 transition-opacity duration-300 ml-[52px] ${
            error ? "opacity-100" : "opacity-0"
          }`,
          errorClassname
        )}
      >
        {error || " "}
      </span>
    </div>
  );
}
