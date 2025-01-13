import React from "react";
import { People01, PinIcon } from "../constant/image";
import Image from "next/image";
import { ChatItemProps } from "../constant/type";

export default function ChatItem({
  image,
  name,
  message,
  time,
  unread,
  pin,
  onClick,
}: ChatItemProps & {onClick: () => void}) {
  return (
    <div className="flex flex-row w-full gap-2 bg-transparent p-2 hover:bg-purple/20"
    onClick={onClick}    
    >
      <Image src={image} alt="People 01" className="w-[48px] h-[48px]" />
      <div className="flex flex-row justify-between w-full">
        <div className="">
          <p className="text-sm">{name}</p>
          <p className="text-[12px] text-black/50">{message}</p>
        </div>
        <div className="flex flex-col items-end justify-start">
          <div className="flex">
            {pin && <Image src={PinIcon} width={18} height={18} alt="Pin" />}
            <p className="text-[12px] text-black/50">{time}</p>
          </div>
          {unread > 0 && (
            <div className="bg-purple rounded-full w-[16px] h-[16px] flex items-center justify-center">
              <p className="text-white text-[12px] ">{unread}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
