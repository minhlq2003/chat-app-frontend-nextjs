"use client";

import { noUserImage } from "@/constant/image";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox } from "antd";

interface FriendSuggestion {
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

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AddGroupModal({
  onClose,
  selectedUser,
}: {
  onClose: () => void;
  selectedUser?: string;
}) {
  const [phone, setPhone] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSuggestion[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(
    selectedUser ? [selectedUser] : []
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const userId = user.id;
    setUserId(userId);
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`${apiBaseUrl}/contact/list?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.data || []);
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
            setSearchResults(data.data || []);
          })
          .catch(() => setSearchResults([]));
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone, userId]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert("Image selected: " + file.name);
    }
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
      <div
        className="bg-white text-black w-[500px] h-[70vh] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">Create Group</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        {/* Group Avatar Upload */}
        <div className="relative flex items-center justify-center p-4">
          <div onClick={handleImageClick}>
            <Image
              width={120}
              height={120}
              src={noUserImage}
              alt="User Image"
              className="size-[100px] rounded-full"
            />
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        {/* Group Name Input */}
        <div className="flex items-center justify-between w-full p-4 border-b border-white/10">
          <input
            type="text"
            placeholder="Enter group name"
            className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40"
          />
        </div>

        {/* Selected Avatars */}
        <div className="flex gap-2 px-4 overflow-x-auto">
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
            {contacts.map((user) => (
              <div
                key={user.contactId}
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
                  checked={isSelected(user.contactId)}
                  onChange={() => toggleSelectUser(user.contactId)}
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
            disabled={selectedUsers.length < 2}
            className={`px-4 py-1 rounded ${
              selectedUsers.length >= 2
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
}
