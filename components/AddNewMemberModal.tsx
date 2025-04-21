"use client";

import { noUserImage } from "@/constant/image";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox, notification } from "antd";
import { log } from "node:console";

interface FriendSuggestion {
  contactId: string;
  userId: string;
  name: string;
  phone?: string;
  email?: string;
  imageUrl?: string;
  friend?: boolean;
  friendRequestSent?: boolean;
}

type Contact = {
  contactId: string;
  name: string;
  status: string;
  email: string;
  phone: string;
  imageUrl: string;
  location: string;
};

interface temporaryGroupProps {
  name: string;
  image: string | null;
  members: string[] | null;
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AddNewMemberModal({
  onClose,
  selectedUser,
  selectedChatInfo,
}: {
  onClose: () => void;
  selectedUser?: string;
  selectedChatInfo: any;
}) {
  const [phone, setPhone] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSuggestion[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    selectedUser ? [selectedUser] : []
  );
  const [temporaryGroup, setTemporaryGroup] = useState<temporaryGroupProps>({
    name: "",
    image: null,
    members: selectedUser ? [selectedUser] : [],
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const groupMemberIds = selectedChatInfo.members.map((m: any) => m.userId);
  // For notifications
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => {
    api[type]({
      message:
        type === "success"
          ? "Success"
          : type === "error"
          ? "Error"
          : "Notification",
      description: message,
      placement: "topRight",
      duration: 3,
    });
  };

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const userId = user.id;
    setUserId(userId);
  }, []);

  useEffect(() => {
    setTemporaryGroup({ ...temporaryGroup, members: selectedUsers });
  }, [selectedUsers]);

  useEffect(() => {
    console.log(temporaryGroup);
  }, [temporaryGroup]);

  useEffect(() => {
    if (!userId) return;

    fetch(`${apiBaseUrl}/contact/list?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        const filteredContacts = data.data.filter((contact: any) => {
          return !groupMemberIds.includes(Number(contact.contactId));
        });
        setContacts(filteredContacts || []);
        setSearchResults(filteredContacts || []);
      })
      .catch(() => setContacts([]));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const delayDebounce = setTimeout(() => {
      if (phone.trim()) {
        fetch(`${apiBaseUrl}/contact/find?phone=${phone}&userId=${userId}`)
          .then((res) => res.json())
          .then((data) => {
            const filteredContacts = data.data.filter((contact: any) => {
              return !groupMemberIds.includes(Number(contact.userId));
            });
            setSearchResults(filteredContacts);
          })
          .catch(() => setSearchResults([]));
      } else {
        const filteredContacts = contacts.filter((contact: any) => {
          return !groupMemberIds.includes(Number(contact.contactId));
        });
        console.log("Filtered Contacts:", filteredContacts);
        setSearchResults(filteredContacts);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone]);


  const handleAddNewMember = async () => {
    if (!userId) {
      showNotification("User ID not found. Please log in again.", "error");
      return;
    }

    if (!temporaryGroup.members || temporaryGroup.members.length < 1) {
      showNotification(
        "Please select at least 1 members for the group",
        "warning"
      );
      return;
    }
    selectedUsers.forEach(async (user) => {
      const requestBody = {
        chatId: selectedChatInfo.ChatID,
        userId: userId,
        newMemberId: user,
        role: "member",
      };

      const response = await fetch(`${apiBaseUrl}/group/member/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        showNotification("Group created successfully!", "success");
        onClose();
      } else {
        showNotification(
          `Failed to create group: ${data.message || "Unknown error"}`,
          "error"
        );
      }
    });
  };

  const toggleSelectUser = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedUsers.includes(id);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Include the notification context holder */}
      {contextHolder}

      <div
        className="bg-white text-black w-[500px] h-[50vh] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">Add new member</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        {/* Selected Avatars */}
        {selectedUsers.length > 0 ? (
          <div className="flex gap-2 px-4 overflow-x-auto min-h-[45px]">
            {contacts
              .filter((c) => selectedUsers.includes(c.contactId))
              .map((user) => (
                <img
                  key={user.contactId}
                  src={
                    user.imageUrl ||
                    `https://ui-avatars.com/api/?name=${user.name}`
                  }
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[45px] text-sm text-black/50">
            Please select at least 2 friends
          </div>
        )}
        {/* Phone input */}
        <div className="flex items-center gap-2 p-4 border-b border-black/10">
          <div className="bg-black/10 px-2 py-2 rounded text-sm">VN (+84)</div>
          <input
            type="text"
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40"
          />
        </div>

        {/* Friends List with Checkboxes */}
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-black mt-4">Friends Lists</p>
          <div className="max-h-[160px] overflow-y-auto">
            {searchResults.map((user) => (
              <div
                key={user.userId || user.contactId}
                className="flex items-center justify-between gap-3 p-2 hover:bg-gray-100 rounded"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.imageUrl ||
                      `https://ui-avatars.com/api/?name=${user.name}`
                    }
                    className="w-10 h-10 rounded-full object-cover"
                    alt={user.name}
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    {user.phone && (
                      <p className="text-xs text-black/50">{user.phone}</p>
                    )}
                  </div>
                </div>
                <Checkbox
                  checked={isSelected(user.userId || user.contactId)}
                  onChange={() =>
                    toggleSelectUser(user.userId || user.contactId)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
          >
            Cancel
          </button>
          <button
            disabled={selectedUsers.length < 1}
            onClick={handleAddNewMember}
            className={`px-4 py-1 rounded ${
              selectedUsers.length >= 1
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add members
          </button>
        </div>
      </div>
    </div>
  );
}
