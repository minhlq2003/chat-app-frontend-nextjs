"use client";

import React, { useEffect, useState } from "react";
import { notification } from 'antd';
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Page = () => {
  const {t} = useTranslation("common")
  const [listRequests, setListRequests] = useState<friendRequest[]>([]);
  const [listSentRequests, setListSentRequests] = useState<sentFriendRequest[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  interface friendRequest {
    requestId: string;
    senderId: string;
    senderName?: string;
    senderEmail?: string;
    senderPhone?: string;
    senderImage?: string;
    status?: string;
    createdAt?: string;
  }
  interface sentFriendRequest {
    requestId: number;
    receiverId: number;
    receiverName?: string;
    receiverEmail?: string;
    receiverPhone?: string;
    receiverImage?: string;
    status?: string;
    createdAt?: string;
  }

  // Get user ID from localStorage on component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const user = JSON.parse(userStr || "{}");
    const userId = user.id;
    setUserId(userId);
  }, []);

  // Fetch friend requests and sent requests when userId changes
  useEffect(() => {
    if (userId) {
      fetchFriendRequests();
      fetchSentFriendRequests();
    }
  }, [userId]);

  async function fetchFriendRequests() {
    fetch(`${apiBaseUrl}/contact/requests?userId=${userId}`).then(response => response.json()).then(data => {
      if (data.success) {
        setListRequests(data.data);
      }
    })
  }

    async function fetchSentFriendRequests() {
      fetch(`${apiBaseUrl}/contact/sent?userId=${userId}`).then(response => response.json()).then(data => {
        if (data.success) {
          setListSentRequests(data.data);
        }
      })
    }

  async function handleDeny(senderId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/contact/deny?userId=${userId}&senderId=${senderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setListRequests(prevRequests =>
          prevRequests.filter(request => request.senderId !== senderId)
        );
        toast.success(t("Friend request deny successfully!"))
      } else {
        toast.error(t(`Failed to deny friend request: `) + `${data.message}`)
      }
    } catch (error) {
      console.error("Error denying friend request:", error);
      toast.error("An error occurred while denying the friend request")
    }
  }

    async function handleAccept(senderId: string) {
    try {
      const response = await fetch(`${apiBaseUrl}/contact/accept?userId=${userId}&senderId=${senderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setListRequests(prevRequests =>
          prevRequests.filter(request => request.senderId !== senderId)
        );
        toast.success(t("Friend request accepted successfully!"))
      } else {
        toast.error(t(`Failed to accept friend request: `) + `${data.message}`)
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      toast.error("An error occurred while accepting the friend request")
    }
  }

  return (
    <div className="bg-white text-black p-6 space-y-6">

      <h2 className="text-xl font-semibold">{t("Friend Requests")}</h2>
      <div>
        <h3 className="text-lg font-medium mb-3">
          {t("Received Requests")} ({listRequests.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {listRequests.length === 0 ? (
            <p className="text-black text-xl">{t("You have no friend requests")}</p>
          ):(
            <>
            {listRequests.map((f, index) => (
            <div key={f.requestId} className="bg-gray-100 rounded-lg p-4 shadow">
              <div className="flex items-start space-x-3">
                <img
                  src={f.senderImage || `https://ui-avatars.com/api/?name=${f.senderName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={f.senderName}
                />
                <div className="flex-1">
                  <div className="font-medium">{f.senderName}</div>
                  <div className="text-sm text-gray-500">
                    {f.createdAt ? f.createdAt.split("T")[0] : "Unknown date"} - {t("From phone number")}
                  </div>
                  <div className="mt-2 text-sm">{t("Hi there, i'm")} {f.senderName}. {t("Wanna be friends?")}</div>
                  <div className="mt-3 flex space-x-2">
                    <button onClick={()=> handleDeny(f.senderId)} className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
                      {t("Deny")}
                    </button>
                    <button onClick={()=> handleAccept(f.senderId)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      {t("Accept")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
            </>
          )}
          
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-3">
          {t("Sent Requests")} ({listSentRequests.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {listSentRequests.map((f, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-lg p-4 shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={f.receiverImage || `https://ui-avatars.com/api/?name=${f.receiverName}`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={f.receiverName}
                />
                <div>
                  <div className="font-medium">{f.receiverName}</div>
                  <div className="text-sm text-gray-500">
                    {t("Request sent")}
                  </div>
                </div>
              </div>
              <button className="text-sm border px-3 py-1 rounded hover:bg-gray-200">
                {t("Revoke request")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Page;
