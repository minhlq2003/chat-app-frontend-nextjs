"use client";

import React, { useEffect, useState } from "react";
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

const Page = () => {
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
  }, []); // Remove userId from dependencies to avoid infinite loop

  // Fetch friend requests and sent requests when userId changes
  useEffect(() => {
    if (userId) {
      fetchFriendRequests();
      fetchSentFriendRequests();
    }
  }, [userId]); // This will run whenever userId changes

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
        // Remove the accepted request from the list to update UI
        setListRequests(prevRequests =>
          prevRequests.filter(request => request.senderId !== senderId)
  );

        // Optionally show a success message
        alert("Friend request accepted successfully!");
      } else {
        // Handle error
        alert("Failed to accept friend request: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert("An error occurred while accepting the friend request");
    }
  }

  return (
    <div className="bg-white text-black p-6 space-y-6 min-h-screen">
      <h2 className="text-xl font-semibold">Lời mời kết bạn</h2>

      {/* Received */}
      <div>
        <h3 className="text-lg font-medium mb-3">
          Lời mời đã nhận ({listRequests.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
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
                    {f.createdAt ? f.createdAt.split("T")[0] : "Unknown date"} - From phone number
                  </div>
                  <div className="mt-2 text-sm">Xin chào, mình tên là {f.senderName}. Kết bạn với mình nhé!</div>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
                      Từ chối
                    </button>
                    <button onClick={()=> handleAccept(f.senderId)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                      Đồng ý
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sent */}
      <div>
        <h3 className="text-lg font-medium mb-3">
          Lời mời đã gửi ({listSentRequests.length})
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
                    Bạn đã gửi lời mời
                  </div>
                </div>
              </div>
              <button className="text-sm border px-3 py-1 rounded hover:bg-gray-200">
                Thu hồi lời mời
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {/*<div>
        <h3 className="text-lg font-medium mb-3">
          Gợi ý kết bạn ({listRequests.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {listRequests.map((f) => (
            <div
              key={f.id}
              className="bg-gray-100 rounded-lg p-4 shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${f.name}`}
                  className="w-10 h-10 rounded-full"
                  alt={f.name}
                />
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-gray-500">
                    {f.commonGroups} nhóm chung
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
                  Bỏ qua
                </button>
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  Kết bạn
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>*/}
    </div>
  );
};

export default Page;
