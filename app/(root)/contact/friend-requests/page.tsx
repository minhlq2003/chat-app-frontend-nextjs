"use client";

import { friendRequests } from "@/constant/data";
import React from "react";

const Page = () => {
  return (
    <div className="bg-white text-black p-6 space-y-6 min-h-screen">
      <h2 className="text-xl font-semibold">Lời mời kết bạn</h2>

      {/* Received */}
      <div>
        <h3 className="text-lg font-medium mb-3">
          Lời mời đã nhận ({friendRequests.received.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {friendRequests.received.map((f) => (
            <div key={f.id} className="bg-gray-100 rounded-lg p-4 shadow">
              <div className="flex items-start space-x-3">
                <img
                  src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={f.name}
                />
                <div className="flex-1">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-sm text-gray-500">
                    {f.date} - {f.source}
                  </div>
                  <div className="mt-2 text-sm">{f.message}</div>
                  <div className="mt-3 flex space-x-2">
                    <button className="px-3 py-1 text-sm border rounded hover:bg-gray-200">
                      Từ chối
                    </button>
                    <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
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
          Lời mời đã gửi ({friendRequests.sent.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {friendRequests.sent.map((f) => (
            <div
              key={f.id}
              className="bg-gray-100 rounded-lg p-4 shadow flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={f.avatar || `https://ui-avatars.com/api/?name=${f.name}`}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={f.name}
                />
                <div>
                  <div className="font-medium">{f.name}</div>
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
      <div>
        <h3 className="text-lg font-medium mb-3">
          Gợi ý kết bạn ({friendRequests.suggestions.length})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {friendRequests.suggestions.map((f) => (
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
      </div>
    </div>
  );
};

export default Page;
