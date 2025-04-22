// app/contact/page.tsx
"use client";

import React, {useEffect, useState} from "react";
import { Button, Input } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { GroupChat } from "@/constant/type";
import {
  faArrowRightFromBracket,
  faMessage,
  faPhone,
  faRightFromBracket,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { noUserImage } from "@/constant/image";
import ConfirmationModel from "@/components/ConfirmationModel";

const groupFriendsByLetter = (friends: GroupChat[]) => {
  const sorted = [...friends].sort((a, b) =>
    a.chatName.localeCompare(b.chatName)
  );
  const grouped: { [key: string]: GroupChat[] } = {};
  sorted.forEach((friend) => {
    const firstLetter = friend.chatName.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(friend);
  });
  return grouped;
};

export default function Page() {
  const { t } = useTranslation("common");
  const [groupChats, setGroupChats] = React.useState<GroupChat[]>([]);
  const [isConfirmation, setisConfirmation] = useState(false);
  const [selectedChat, setSelectedChat] = useState<GroupChat | null>(null);
  const router = useRouter();
  const groupedFriends = groupFriendsByLetter(groupChats);
  const sortedLetters = Object.keys(groupedFriends).sort();
  const [userId, setUserId] = React.useState<string | null>(null);
  const handleChatClick = async (friendId: string) => {
      if (!userId) return;
      router.push(`/?chatId=${friendId}`);
  };
  const fetchGroupList = async (userId: string) => {
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(`${apiBaseUrl}/chat/me?userId=${userId}`);
      const data = await response.json();
      if (data.success) {
        let groupChats: GroupChat[] = data.data.filter(
          (chat: GroupChat) => chat.Type === "group" && chat.Status !== "disbanded"
        );
        setGroupChats(groupChats);
      } else {
        console.error("Failed to fetch chat list");
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
    }
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/introduction");
      return;
    }
    const user = JSON.parse(userStr);
    const userId = user.id;
    setUserId(userId);

    setGroupChats([]);
    fetchGroupList(userId || "");
  }, [router]);
function handleDeleteChat(chat: GroupChat) {
  setSelectedChat(chat);
  setisConfirmation(true);
}
  return (
    <>
      <h1 className="font-bold text-[32px]">{t("Your Group")}</h1>
      <div className="flex items-center mb-4 mt-2 gap-2">
        <Input placeholder="Search group name..." className="flex-1" />
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
                    src={friend.imageUrl || noUserImage.src}
                    alt={friend.chatName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">{friend.chatName}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button size="sm" variant="ghost" onClick={() => handleChatClick(friend.ChatID)}>
                    <FontAwesomeIcon icon={faMessage} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <FontAwesomeIcon icon={faVideo} />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <FontAwesomeIcon icon={faPhone} />
                  </Button>
                  <Button
                    size="sm"
                    className="text-red-600 bg-white border-2 border-red-600 hover:bg-red-600 hover:text-white"
                    onClick={() => handleDeleteChat(friend)}
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} />
                  </Button>
                </div>
              </div>

            ))}

          </div>
        ))}
        {isConfirmation && (<ConfirmationModel
          listChatFunc={() => fetchGroupList(userId || "")}
          chatFunc={null}
          selectedChatInfo={selectedChat}
          selectedUser={userId}
          onClose={() => setisConfirmation(false)}
        />)}
      </div>
    </>
  );
}
