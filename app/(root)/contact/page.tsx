"use client";

import AddFriendModal from "@/components/AddFriendModel";
import ChatList from "@/components/ChatList";
import { groupedFriends, listFriends } from "@/constant/data";
import { SearchIcon } from "@/constant/image";
import { Friend } from "@/constant/type";
import {
  faAddressBook,
  faBell,
  faMessage,
  faPeopleRoof,
  faPerson,
  faPhone,
  faTrash,
  faUserFriends,
  faUserPlus,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button, Card, Input } from "@nextui-org/react";
import Image from "next/image";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const groupFriendsByLetter = (friends: Friend[]) => {
  const sorted = [...friends].sort((a, b) => a.name.localeCompare(b.name));
  const grouped: { [key: string]: Friend[] } = {};

  sorted.forEach((friend) => {
    const firstLetter = friend.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(friend);
  });

  return grouped;
};

export default function ContactPage() {
  const { t } = useTranslation("common");
  const groupedFriends = groupFriendsByLetter(listFriends);
  const sortedLetters = Object.keys(groupedFriends).sort();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-9 gap-2 h-screen">
      {/* Sidebar */}
      <div className="col-span-2 p-4 border-1 bg-white rounded-xl max-h-screen overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-10 bg-white">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[32px]">{t("Option")}</h1>
          </div>

          <div className="py-2 flex ju">
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
        <div className=" py-5 flex flex-col gap-4">
          <div className="flex">
            <FontAwesomeIcon
              icon={faAddressBook}
              className="h-[25px] w-[25px] pr-2"
            />
            <p className="font-medium text-[20px] ml-2">{t("Friend List")}</p>
          </div>
          <div className="flex">
            <FontAwesomeIcon
              icon={faUserFriends}
              className="h-[25px] w-[25px] pr-2"
            />
            <p className="font-medium text-[20px] ml-2">{t("Your Group")}</p>
          </div>
          <div className="flex">
            <FontAwesomeIcon icon={faBell} className="h-[25px] w-[25px] pr-2" />
            <p className="font-medium text-[20px] ml-2">{t("Notification")}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-7 p-4 bg-white rounded-xl">
        <h1 className="font-bold text-[32px]">{t("Friends List")}</h1>
        <div className="flex items-center mb-4 mt-2 gap-2">
          <Input placeholder="Search username, phone,..." className="flex-1" />
          <Button variant="solid">A-Z</Button>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
          {sortedLetters.map((letter) => (
            <div key={letter} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">
                {letter}
              </h2>
              {groupedFriends[letter].map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 hover:bg-customPurple/10"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.status}</p>
                      <p className="text-sm text-gray-400">({friend.phone})</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" variant="ghost">
                      <FontAwesomeIcon icon={faMessage} />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <FontAwesomeIcon icon={faVideo} />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <FontAwesomeIcon icon={faPhone} />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      {isModalOpen && <AddFriendModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
}
