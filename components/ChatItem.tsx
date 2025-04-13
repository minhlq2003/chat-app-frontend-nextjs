import React from "react";
import { PinIcon } from "../constant/image";
import Image from "next/image";
import { ChatItemProps } from "@/constant/type";

export default function ChatItem({
                                   image,
                                   name,
                                   message,
                                   time,
                                   unread,
                                   pin,
                                   onClick,
                                 }: ChatItemProps & { onClick: () => void }) {
  return (
    <div
      className="flex flex-row w-full gap-2 bg-transparent p-2 hover:bg-customPurple/20 rounded-lg transition-colors duration-200 cursor-pointer"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
    >
      <Image src={image} alt="People 01" width={48} height={48} className="w-[48px] h-[48px] rounded-full" />
      <div className="flex flex-row justify-between w-full">
        <div className="">
          <p className="text-sm font-medium text-black">{name}</p>
          <p className="text-[12px] text-black/50 line-clamp-1">{message}</p>
        </div>
        <div className="flex flex-col items-end justify-start">
          <div className="flex">
            {pin && <Image src={PinIcon} width={18} height={18} alt="Pin" />}
            <p className="text-[12px] text-black/50">{time}</p>
          </div>
          {unread > 0 && (
            <div className="bg-customPurple rounded-full w-[16px] h-[16px] flex items-center justify-center">
              <p className="text-white text-[12px] ">{unread}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}