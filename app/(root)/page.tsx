// app/page.tsx
"use client";

import Link from "next/link";
import {
  BlockIcon,
  CalendarIcon,
  CallIcon,
  EmojiIcon,
  FileSendIcon,
  LocationIcon,
  MicroIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  WorkIcon,
} from "@/constant/image";
import Image, { StaticImageData } from "next/image";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Input,
} from "@nextui-org/react";
import ChatList from "@/components/ChatList";
import { chatHistoryData, chatListData, profileData } from "@/constant/data";
import { useState } from "react";
import IconButton from "@/components/IconButton";
import UserInfoItem from "@/components/ProfileInfoItem";
import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation("common");
  const [type, setType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  const changeButtonStyle = (currentType: string) => {
    if (type === currentType) {
      return "bg-customPurple text-white";
    }
    return "bg-customPurple/20 text-black";
  };

  const handleUserSelect = (id: number) => {
    setSelectedUser(id);
  };

  const selectedChat = chatHistoryData.find((chat) =>
    chat.participants.some((p) => p.userId === selectedUser)
  );

  const getProfileData = (userId: number | null) => {
    if (userId !== null && profileData.id === userId) {
      return profileData;
    }
    return null;
  };

  const userInfo = getProfileData(selectedUser);
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  return (
    <div className="grid grid-cols-9 gap-2 h-screen">
      <div className="col-span-2 border-1 bg-white rounded-xl max-h-screen overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-10 px-4 bg-white">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[32px]">{t("Messages")}</h1>
            <div className="bg-customPurple rounded-full w-[30px] h-[30px] flex items-center justify-center">
              <p className="text-white text-[16px]">10</p>
            </div>
          </div>
          <div className="py-2">
            <Input
              labelPlacement="outside"
              placeholder="Search message, people"
              type="text"
              startContent={
                <Image src={SearchIcon} width={24} height={24} alt="Search" />
              }
            />
          </div>
          <div className="flex items-center justify-between py-4 max-w-[250px] ">
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("all")}`}
              onPress={() => setType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("unread")}`}
              onPress={() => setType("unread")}
            >
              Unread
            </Button>
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("group")}`}
              onPress={() => setType("group")}
            >
              Group
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <p className="text-base">{t("Pinned Messages")}</p>
        </div>
        <ChatList chatList={chatListData} pin onSelectUser={handleUserSelect} />
        <div className="px-4 py-2">
          <p className="text-base">{t("Messages")}</p>
        </div>
        <ChatList
          chatList={chatListData}
          filterType={type}
          onSelectUser={handleUserSelect}
        />
      </div>
      <div className="col-span-5 h-screen bg-white rounded-xl">
        {selectedChat ? (
          <div className="flex flex-col justify-between h-screen">
            <div>
              <div className="flex items-center justify-between border-b-2 p-4">
                <div className="flex items-center gap-10">
                  <Image
                    src={selectedChat.participants[0].image as StaticImageData}
                    width={64}
                    height={64}
                    alt="Participant 01"
                  />
                  <h1 className="text-2xl text-black">
                    {
                      selectedChat.participants.find(
                        (p) => p.userId !== "admin"
                      )?.username
                    }
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <IconButton
                    icon={CallIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Call"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50 `}
                  />
                  <IconButton
                    icon={PinIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Pin"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50 ${
                      chatListData.find((chat) => chat.id === selectedUser)?.pin
                        ? "bg-customPurple/50"
                        : ""
                    }`}
                  />
                  <IconButton
                    icon={SearchIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Search"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50`}
                  />
                </div>
              </div>
              <div className="space-y-4 pt-10 px-2">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.messageId}
                    className={`flex ${
                      msg.senderId === "admin" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <p
                      className={`${
                        msg.senderId === "admin"
                          ? "bg-customPurple text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                          : "bg-customPurple/20 text-black rounded-tl-lg rounded-tr-lg rounded-br-lg"
                      } p-2 max-w-[70%]`}
                    >
                      {msg.content}
                      <span
                        className={`
                      ${
                        msg.senderId === "admin"
                          ? "text-white/80 justify-end"
                          : "text-black/50"
                      }
                      text-sm flex`}
                      >
                        {msg.timestamp}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t-2 p-4">
              <Input
                placeholder="Type messages"
                type="text"
                className="flex-1"
                size="lg"
                endContent={
                  <div className="flex items-center gap-3 pr-5">
                    <Image src={EmojiIcon} width={20} height={20} alt="Emoji" />
                    <Image
                      src={FileSendIcon}
                      width={20}
                      height={20}
                      alt="File"
                    />
                    <Image src={MicroIcon} width={20} height={20} alt="Micro" />
                    <Image src={SendIcon} width={20} height={20} alt="Send" />
                  </div>
                }
              />
            </div>
          </div>
        ) : (
          <p className="flex justify-center items-center pt-[40%] text-gray-500">
            Select a chat to view messages.
          </p>
        )}
      </div>
      <div className="col-span-2 w-full h-screen ">
        {selectedChat && (
          <div className="">
            <div className="px-2">
              <Card className="h-[413px] w-full bg-white rounded-xl p-2">
                <h1 className="text-2xl font-medium">Info</h1>
                <div className="flex flex-col items-center gap-3 justify-center">
                  <Image
                    src={selectedChat.participants[0].image as StaticImageData}
                    width={64}
                    height={64}
                    alt="Participant 01"
                  />
                  <h1 className="text-2xl">
                    {
                      selectedChat.participants.find(
                        (p) => p.userId !== "admin"
                      )?.username
                    }
                  </h1>
                </div>
                {userInfo && (
                  <div className="px-4 py-8 flex flex-col gap-3">
                    <UserInfoItem
                      icon={WorkIcon}
                      text={userInfo.work}
                      altText="Work"
                    />
                    <UserInfoItem
                      icon={CallIcon}
                      text={userInfo.phone}
                      altText="Phone"
                    />
                    <UserInfoItem
                      icon={CalendarIcon}
                      text={userInfo.birthday}
                      altText="Birthday"
                    />
                    <UserInfoItem
                      icon={LocationIcon}
                      text={userInfo.location}
                      altText="Location"
                    />
                    <UserInfoItem
                      icon={PlusIcon}
                      text="Create group"
                      altText="Create group"
                    />
                    <UserInfoItem
                      icon={BlockIcon}
                      text="Block"
                      altText="Block"
                      textStyle="text-base text-red-600"
                    />
                  </div>
                )}
              </Card>
            </div>
            <div className="mt-2">
              <Accordion
                variant="splitted"
                itemClasses={{
                  title: "text-xl",
                  content: "max-h-60 overflow-y-auto ",
                }}
              >
                <AccordionItem key="1" aria-label="Image" title="Image">
                  {defaultContent}
                </AccordionItem>
                <AccordionItem key="2" aria-label="Link" title="Link">
                  {defaultContent}
                </AccordionItem>
                <AccordionItem key="3" aria-label="File" title="File">
                  {defaultContent}
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
        <Link href="/auth/login">Login</Link>
      </div>
    </div>
  );
}

export default Home;
