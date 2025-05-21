"use client";

import { noUserImage } from "@/constant/image";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox, notification } from "antd";
import { toast } from "sonner";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function ConfirmationModel({
  onClose,
  selectedUser,
  selectedChatInfo,
}: {
  onClose: () => void;
  selectedUser?: string;
  selectedChatInfo: any;
}) {
  const [userId, setUserId] = useState<string | null>(null);

  const handleNoOption = () => {
    toast.error("No");
  };
  const handleYesOption = () => {
    toast.success("Yes");
  };
  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[400px] h-[20vh] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-between h-full p-4">
          <h2 className="text-xl font-bold mb-4">Confirmation</h2>
          <p className="mb-4">Are you sure you want to leave this group?</p>
          <div className="flex items-center gap-10">
            <button
              className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
              onClick={handleNoOption}
            >
              No
            </button>
            <button
              className={`px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"

            }`}
              onClick={handleYesOption}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
