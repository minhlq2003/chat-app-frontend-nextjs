// app/contact/page.tsx
"use client";

import React, { useEffect } from "react";
import { Button, Input } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { GroupChat } from "@/constant/type";
import {
  faMessage,
  faPhone,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { mockGroupChats } from "@/constant/data";

export default function Page() {
  const { t } = useTranslation("common");
  const [groupChats, setGroupChats] = React.useState<GroupChat[]>([]);
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/introduction");
      return;
    }
    setGroupChats(mockGroupChats);
  }, [router]);

  return (
    <>
      <h1 className="font-bold text-[32px]">{t("Your Group")}</h1>
      <div className="flex items-center mb-4 mt-2 gap-2">
        <Input placeholder="Search group name..." className="flex-1" />
        <Button variant="solid">A-Z</Button>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
        {groupChats.map((chat) => (
          <div
            key={chat.chatId}
            className="flex items-center justify-between p-4 hover:bg-customPurple/10 rounded-lg transition"
          >
            <div className="flex items-center gap-4">
              <img
                src={
                  chat.imageUrl ||
                  `https://ui-avatars.com/api/?name=${chat.chatName}`
                }
                alt={chat.chatName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold">{chat.chatName}</p>
                <p className="text-sm text-gray-500 line-clamp-1 max-w-[300px]">
                  {chat.members.length} {t("members")}
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-center text-sm text-gray-400">
              {chat.latestMessage?.timestamp
                ? new Date(chat.latestMessage.timestamp).toLocaleString()
                : "No time"}
              <Button size="sm" variant="ghost">
                <FontAwesomeIcon icon={faMessage} />
              </Button>
              <Button size="sm" variant="ghost">
                <FontAwesomeIcon icon={faVideo} />
              </Button>
              <Button size="sm" variant="ghost">
                <FontAwesomeIcon icon={faPhone} />
              </Button>
              <Button size="sm" variant="ghost" color="danger">
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
