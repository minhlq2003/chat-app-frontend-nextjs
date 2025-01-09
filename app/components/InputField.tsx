// InputField.tsx
import Image from "next/image";
import { InputFieldProps } from "../constant/type";

export default function InputField({
  image,
  placeholder,
  password = false,
  error,
  onFocus,
  onChange,
}: InputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-5">
        <Image src={image} className="size-9" alt="icon" />
        <input
          type={password ? "password" : "text"}
          placeholder={placeholder}
          className={`peer w-full bg-transparent border-b-2 text-2xl text-gray-100 outline-none focus:border-yellow`}
          onFocus={onFocus}
          onChange={onChange}
        />
      </div>
      <span
        className={`text-yellow text-sm h-4 transition-opacity duration-300 ml-[52px] ${
          error ? "opacity-100" : "opacity-0"
        }`}
      >
        {error || " "}
      </span>
    </div>
  );
}
