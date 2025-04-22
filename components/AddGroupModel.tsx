"use client";

import { noUserImage } from "@/constant/image";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox, notification } from "antd";
import { toast } from "sonner";

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
  userId: string;
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
  const [temporaryGroup, setTemporaryGroup] = useState<temporaryGroupProps>({
    name: "",
    image: null,
    members: (selectedUser) ? [selectedUser]:  [],
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // For notifications
  const [api, contextHolder] = notification.useNotification();

  const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    api[type]({
      message: type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notification',
      description: message,
      placement: 'topRight',
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
    setTemporaryGroup({...temporaryGroup, members: selectedUsers})
  }, [selectedUsers]);

  useEffect(() => {
    console.log(temporaryGroup)
  }, [temporaryGroup]);

  useEffect(() => {
    if (!userId) return;

    fetch(`${apiBaseUrl}/contact/list?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setContacts(data.data || []);
        setSearchResults(data.data || []);

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
        setSearchResults(contacts);
        }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleCreateGroup = async () => {
    try {
      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      if (!temporaryGroup.name.trim()) {
        toast.error("Please enter a group name");
        return;
      }

      if (!temporaryGroup.members || temporaryGroup.members.length < 2) {
        toast.error("Please select at least 2 members for the group");
        return;
      }

      const requestBody = {
        name: temporaryGroup.name,
        image: temporaryGroup.image || "",
        ownerId: userId,
        initialMembers: temporaryGroup.members
  };

      const response = await fetch(`${apiBaseUrl}/group/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Group created successfully!");
        onClose(); // Close the modal on success
      } else {
        toast.error(`Failed to create group: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error creating group:", error);
      showNotification("An error occurred while creating the group", "error");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.imageUrl;
          setTemporaryGroup({
            ...temporaryGroup,
            image: imageUrl,
          })
        } else {
          console.error("Image upload failed:", await response.json());
          alert("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
        alert("An error occurred while uploading the image.");
      }
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
        className="bg-white text-black w-[500px] h-[75vh] rounded-lg shadow-lg overflow-hidden"
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
              src={temporaryGroup?.image || noUserImage}
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
            onChange={(e) =>{setTemporaryGroup({...temporaryGroup, name: e.target.value})}}
            placeholder="Enter group name"
            className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40"
          />
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
                  onChange={() => toggleSelectUser(user.userId || user.contactId)}
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
            onClick={handleCreateGroup}
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
