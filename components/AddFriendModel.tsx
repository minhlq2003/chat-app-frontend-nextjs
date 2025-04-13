"use client";

import React from "react";

interface FriendSuggestion {
  id: number;
  name: string;
  phone?: string;
  avatar: string;
  type: "recent" | "suggested";
}

const suggestions: FriendSuggestion[] = [
  {
    id: 1,
    name: "Híu Fan",
    phone: "(+84) 0932 320 105",
    avatar: "/avatar1.jpg",
    type: "recent",
  },
  {
    id: 2,
    name: "Tán Phát",
    phone: "(+84) 0335 696 383",
    avatar: "/avatar2.jpg",
    type: "recent",
  },
  { id: 3, name: "Híu Fan", avatar: "/avatar3.jpg", type: "suggested" },
  { id: 4, name: "Tán Phát", avatar: "/avatar4.jpg", type: "suggested" },
  { id: 5, name: "Hủ Tiến", avatar: "/avatar1.jpg", type: "suggested" },
];

export default function AddFriendModal({ onClose }: { onClose: () => void }) {
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
          <h2 className="font-semibold">Thêm bạn</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        {/* Phone input */}
        <div className="flex items-center gap-2 p-4 border-b border-black/10">
          <div className="bg-black/10 px-2 py-2 rounded text-sm">VN (+84)</div>
          <input
            type="text"
            placeholder="Số điện thoại"
            className="bg-transparent border p-2 rounded-md outline-none flex-1 text-sm placeholder-black/40"
          />
        </div>

        {/* Recent results */}
        <div className="p-4 flex flex-col gap-3">
          <p className="text-sm text-black">Kết quả gần nhất</p>
          {suggestions
            .filter((s) => s.type === "recent")
            .map((user) => (
              <div key={user.id} className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium">{user.name}</p>
                  {user.phone && (
                    <p className="text-xs text-white/50">{user.phone}</p>
                  )}
                </div>
              </div>
            ))}

          {/* Suggested friends */}
          <p className="text-sm text-black mt-4">Có thể bạn quen</p>
          {suggestions
            .filter((s) => s.type === "suggested")
            .map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-white/50">Từ gợi ý kết bạn</p>
                  </div>
                </div>
                <button className="text-sm border border-blue-500 text-blue-500 px-3 py-1 rounded hover:bg-blue-500 hover:text-white transition">
                  Kết bạn
                </button>
              </div>
            ))}

          <p className="text-sm text-blue-400 text-center mt-2 cursor-pointer hover:underline">
            Xem thêm
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-white/10">
          <button
            onClick={onClose}
            className="text-white px-4 py-1 hover:bg-white/10 rounded"
          >
            Hủy
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded">
            Tìm kiếm
          </button>
        </div>
      </div>
    </div>
  );
}
