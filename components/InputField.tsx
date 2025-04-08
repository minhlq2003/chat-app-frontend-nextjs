// InputField.tsx
import Image from "next/image";
import { InputFieldProps } from "../constant/type";
import { twMerge } from "tailwind-merge";

export default function InputField({
  image,
  placeholder,
  type,
  error,
  value,
  textClassname,
  onFocus,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-5">
        <Image src={image} className="size-9" alt="icon" />
        <input
          type={type}
          placeholder={placeholder}
          className={twMerge(`peer w-full bg-transparent border-b-2 text-2xl text-gray-100 outline-none focus:border-customYellow`, textClassname)}
          onFocus={onFocus}
          onChange={onChange}
          value={value}
        />
      </div>
      <span
        className={`text-customYellow text-sm h-4 transition-opacity duration-300 ml-[52px] ${
          error ? "opacity-100" : "opacity-0"
        }`}
      >
        {error || " "}
      </span>
    </div>
  );
}
