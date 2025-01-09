import Image, { StaticImageData } from "next/image";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface IconButtonProps {
  icon: StaticImageData;
  iconWidth: number;
  iconHeight: number;
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  href?:string;
  pathname?:string
}

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
        "w-[100px] h-[100px] rounded-full flex items-center justify-center bg-purple/10",
        className
      )}
    >
      <Image
        src={icon}
        alt={iconName}
        width={iconWidth}
        height={iconHeight}

      />
    </div>
  );
}
