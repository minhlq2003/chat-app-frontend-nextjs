"use client";

import { noUserImage, pencil } from "@/constant/image";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface FriendSuggestion {
  id: number;
  name: string;
  phone?: string;
  avatar: string;
  type: "recent" | "suggested";
}

const suggestions: FriendSuggestion[] = [];

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AddGroupModal({ onClose }: { onClose: () => void }) {
  interface FriendSuggestion {
    userId: string;
    name: string;
    phone?: string;
    email?: string;
    imageUrl?: string;
    friend?: boolean;
    friendRequestSent?: boolean;
  }
  const [phone, setPhone] = useState("");
  const [searchResults, setSearchResults] = useState<FriendSuggestion[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [sentUsers, setSentUsers] = useState<string[]>([]);
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const userId = user.id;
    setUserId(userId);
  }, [userId]);
  useEffect(() => {
    if (!userId) return;

    fetch(`${apiBaseUrl}/contact/list?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("Contacts fetched successfully:", data.data);
        setContacts(data.data || []);
      })
      .catch((err) => {
        console.error("Error fetching contact:", err);
        setContacts([]);
      });
  }, [userId]); // <-- Run only when userId changes

  // Search contact by phone with debounce
  useEffect(() => {
    if (!userId) return;

    const delayDebounce = setTimeout(() => {
      if (phone.trim()) {
        fetch(`${apiBaseUrl}/contact/find?phone=${phone}&userId=${userId}`)
          .then((res) => res.json())
          .then((data) => {
            setSearchResults(data.data || []);
          })
          .catch((err) => {
            console.error("Error searching contact:", err);
            setSearchResults([]);
          });
      } else {
        setSearchResults([]); // Clear when input is empty
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone, userId]); // <-- Watch phone and userId for search

  const addContact = async (userId: string, contactId: string) => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/contact/add?userId=${userId}&contactId=${contactId}`,
        {
          method: "POST",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add contact");
      }

      return data; // contains success message or result
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  };

  const handleAddContact = async (userId: string, contactId: string) => {
    try {
      const result = await addContact(userId, contactId);
      if (result.success) {
        setSentUsers((prev) => [...prev, contactId]);
        console.log("Friend request sent!");
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  type Contact = {
    contactId: string;
    name: string;
    status: string;
    email: string;
    phone: string;
    imageUrl: string;
    location: string;
  };

  const [contacts, setContacts] = useState<Contact[]>([]);
const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      alert("Image selected: " + file.name);
      /* try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.imageUrl;

          setTemporaryUser((prev) => ({
            ...(prev || {
              id: -1,
              name: "",
              password: "",
              phone: "",
              image: null,
              location: null,
              birthday: null,
              email: "",
            }),
            image: imageUrl,
          }));
        } else {
          console.error("Image upload failed:", await response.json());
          alert("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
        alert("An error occurred while uploading the image.");
      } */
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[500px] h-[70vh] rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">Add Group</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          
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

        <div className="flex items-center justify-between w-full p-4 border-b border-white/10">
          <input type="text" placeholder="Enter group name" className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40" />
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
                <button className="min-w-[90px] text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition">
                  Add Group
                </button>
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
        </div>
      </div>
    </div>
  );
}
