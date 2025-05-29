// app/contact/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { Friend } from "@/constant/type";
import {
  faMessage,
  faPhone,
  faTrash,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import UnfriendConfirmationModal from "@/components/UnfriendConfirmationModal";

const groupFriendsByLetter = (friends: Friend[]) => {
  const sorted = [...friends].sort((a, b) => a.name.localeCompare(b.name));
  const grouped: { [key: string]: Friend[] } = {};
  sorted.forEach((friend) => {
    const firstLetter = friend.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) grouped[firstLetter] = [];
    grouped[firstLetter].push(friend);
  });
  return grouped;
};

export default function ContactPage() {
  const [friendsList, setFriendsList] = React.useState<Friend[]>([]);
  const { t } = useTranslation("common");
  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const filteredFriends = friendsList.filter(
    (friend) =>
      friend.name.toLowerCase().includes(search.toLowerCase()) ||
      friend.phone.includes(search)
  );
  const groupedFriends = groupFriendsByLetter(
    [...filteredFriends].sort((a, b) =>
      sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
    )
  );
  const sortedLetters = Object.keys(groupedFriends).sort((a, b) =>
    sortAsc ? a.localeCompare(b) : b.localeCompare(a)
  );
  const router = useRouter();
  const [userId, setUserId] = React.useState<string | null>(null);

  const handleChatClick = async (friendId: string) => {
    try {
      if (!userId) return;

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(
        `${apiBaseUrl}/chat/private?userIdA=${userId}&userIdB=${friendId}`
      );

      const data = await response.json();

      if (data.success) {
        router.push(`/?chatId=${data.data.chatId}`);
      } else {
        console.error("Failed to get or create private chat");
      }
    } catch (error) {
      console.error("Error getting or creating private chat:", error);
    }
  };

  const handleUnfriendClick = (friend: Friend) => {
    setSelectedFriend(friend);
    setShowUnfriendModal(true);
  };

  const fetchFriendsList = async (userId: string) => {
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(
        `${apiBaseUrl}/contact/list?userId=${userId}`
      );
      const data = await response.json();

      if (data.success) {
        setFriendsList(data.data);
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

    fetchFriendsList(userId || "");
  }, [router]);

  return (
    <>
      <h1 className="font-bold text-[32px]">{t("Friends List")}</h1>
      <div className="flex items-center mb-4 mt-2 gap-2">
        <Input
          placeholder={t("Search username, phone,...")}
          className="flex-1"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="solid" onPress={() => setSortAsc(!sortAsc)}>
          {sortAsc ? "A-Z" : "Z-A"}
        </Button>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-150px)] pr-2">
        {sortedLetters.length === 0 ? (
          <p className="text-gray-500 text-xl text-center mt-10">
            {t("No friends found.")}
          </p>
        ) : (
          sortedLetters.map((letter) => (
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
                      src={
                        friend.imageUrl ||
                        "https://cnm-chatapp-bucket.s3.ap-southeast-1.amazonaws.com/ud3x-1745220840806-no-avatar.png"
                      }
                      alt={friend.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold">{friend.name}</p>
                      <p className="text-sm text-gray-500">
                        {friend.location ?? "No location set"}
                      </p>
                      <p className="text-sm text-gray-400">({friend.phone})</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleChatClick(friend.contactId)}
                    >
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
                      variant="ghost"
                      onClick={() => handleUnfriendClick(friend)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {showUnfriendModal && selectedFriend && (
        <UnfriendConfirmationModal
          onClose={() => setShowUnfriendModal(false)}
          friendName={selectedFriend.name}
          userId={userId}
          contactId={selectedFriend.contactId}
          onSuccess={() => fetchFriendsList(userId || "")}
        />
      )}
    </>
  );
}
