// app/contact/layout.tsx
"use client";

import {
  faAddressBook,
  faBell,
  faUserFriends,
  faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Input } from "@nextui-org/react";
import Image from "next/image";
import { SearchIcon } from "@/constant/image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import AddFriendModal from "@/components/AddFriendModel";

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation("common");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-9 gap-2 h-screen">
      {/* Sidebar */}
      <div className="col-span-2 p-4 border-1 bg-white rounded-xl max-h-screen overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[32px]">{t("Option")}</h1>
          </div>

          <div className="py-2 flex items-center">
            <Input
              labelPlacement="outside"
              placeholder="Search message, people"
              type="text"
              startContent={
                <Image src={SearchIcon} width={24} height={24} alt="Search" />
              }
            />
            <Button
              className="bg-transparent px-0 min-w-[40px]"
              onPress={() => setIsModalOpen(true)}
            >
              <FontAwesomeIcon icon={faUserPlus} />
            </Button>
          </div>
        </div>

        <div className="py-5 flex flex-col gap-4">
          <a href="/contact" className="flex">
            <FontAwesomeIcon
              icon={faAddressBook}
              className="h-[25px] w-[25px] pr-2"
            />
            <p className="font-medium text-[20px] ml-2">{t("Friend List")}</p>
          </a>
          <div className="flex">
            <FontAwesomeIcon
              icon={faUserFriends}
              className="h-[25px] w-[25px] pr-2"
            />
            <p className="font-medium text-[20px] ml-2">{t("Your Group")}</p>
          </div>
          <a href="/contact/friend-requests" className="flex">
            <FontAwesomeIcon
              icon={faUserPlus}
              className="h-[25px] w-[25px] pr-2"
            />
            <p className="font-medium text-[20px] ml-2">
              {t("Friend Requests")}
            </p>
          </a>
          <div className="flex">
            <FontAwesomeIcon icon={faBell} className="h-[25px] w-[25px] pr-2" />
            <p className="font-medium text-[20px] ml-2">{t("Notification")}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-7 p-4 bg-white rounded-xl">{children}</div>

      {isModalOpen && <AddFriendModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
