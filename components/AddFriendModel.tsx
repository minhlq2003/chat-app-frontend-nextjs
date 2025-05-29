"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function AddFriendModal({ onClose }: { onClose: () => void }) {
  interface FriendSuggestion {
    userId: string;
    name: string;
    phone?: string;
    email?: string;
    imageUrl?: string;
    friend?: boolean;
    friendRequestSent?: boolean;
  }
  const { t } = useTranslation("common");
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
    const delayDebounce = setTimeout(() => {
      if (phone.trim()) {
        fetch(`${apiBaseUrl}/contact/find?phone=${phone}&userId=${userId}`)
          .then((res) => res.json())
          .then((data) => {
            setSearchResults(data.data || []);
          })
          .catch((err) => {
            console.error("Error fetching contact:", err);
            setSearchResults([]);
          });
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [phone]);

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

      return data;
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
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[500px] h-[50vh] rounded-lg shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold">{t("Add Friends")}</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        <div className="flex items-center gap-2 p-4 border-b border-black/10">
          <div className="bg-black/10 px-2 py-2 rounded text-sm">VN (+84)</div>
          <input
            type="text"
            placeholder={t("Phone number")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40"
          />
        </div>

        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm  text-black">{t("Results")}</p>
          <div className="max-h-[170px] overflow-y-auto">
            {phone.trim().length === 0 || searchResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-sm text-gray-500 p-4">
                <p>
                  {t(
                    "No friends found. Perhaps you should try a different number?"
                  )}
                </p>
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.userId}
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
                  <div>
                    {user.friend ? (
                      <button className="min-w-[90px] text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition">
                        {t("Message")}
                      </button>
                    ) : sentUsers.includes(user.userId) ? (
                      <button
                        className="min-w-[90px] text-sm border border-gray-400 text-gray-400 px-3 py-1 rounded cursor-not-allowed"
                        disabled
                      >
                        {t("Sent")}
                      </button>
                    ) : (
                      <div>
                        {user.friendRequestSent ? (
                          <button
                            className="min-w-[90px] text-sm border border-gray-400 text-gray-400 px-3 py-1 rounded cursor-not-allowed"
                            disabled
                          >
                            {t("Sent")}
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (userId) handleAddContact(userId, user.userId);
                              else console.error("User ID is null");
                              toast.success("Friend request sent!");
                            }}
                            className="min-w-[90px] text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition"
                          >
                            {t("Add")}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
          >
            {t("Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
