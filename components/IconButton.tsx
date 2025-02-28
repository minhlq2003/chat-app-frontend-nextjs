import Image from "next/image";
import React from "react";
import { twMerge } from "tailwind-merge";
import { IconButtonProps } from "../constant/type";

export default function IconButton({
  icon,
  iconWidth,
  iconHeight,
  iconName,
  className,
}: IconButtonProps) {
  return (
    <div
      className={twMerge(
        "w-[100px] h-[100px] rounded-full flex items-center justify-center bg-customPurple/10",
        className
      )}
    >
      <Image src={icon} alt={iconName} width={iconWidth} height={iconHeight} />
    </div>
  );
}
