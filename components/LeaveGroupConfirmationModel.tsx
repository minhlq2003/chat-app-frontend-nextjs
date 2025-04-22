"use client";

import React, { Dispatch, useEffect } from "react";
import { toast } from "sonner";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function LeaveGroupConfirmationModel({
  onClose,
  selectedUser,
  chatFunc,
  selectedChatInfo,
  listChatFunc,
}: {
  onClose: () => void;
  selectedUser?: string | null;
  chatFunc: Dispatch<any>;
  listChatFunc: (userId: string | null | undefined) => Promise<void>;
  selectedChatInfo: any;
}) {
  useEffect(() => {
    console.log(selectedChatInfo);
    console.log(selectedUser);
  }, []);

  const handleSelection = async (answer: boolean) => {
    onClose();
    let reqBody = {
      chatId: selectedChatInfo.ChatID,
      userId: selectedUser,
    };
    if (!answer) {
    } else {
      let data;
      try {
        const response = await fetch(`${apiBaseUrl}/group/disband`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });
        data = await response.json();

        if (data.success) {
          toast.success("Group disband successfully.");
          await listChatFunc(selectedUser);
          chatFunc(null);
        } else {
          let response = data.message;
          toast.error("Group delete failed: " + response);
        }
      } catch (error) {
        console.log(error);
      }
    }
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
          <h2 className="text-xl font-bold mb-4 text-red-600">Warning</h2>
          <p className="mb-4 font-bold warn text-red-600">
            Are you sure you want to disband this group? This action cannot be
            undone.
          </p>
          <div className="flex items-center gap-10">
            <button
              className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
              onClick={() => {
                handleSelection(false);
              }}
            >
              No
            </button>
            <button
              className={`px-4 py-1 rounded bg-white border border-red-600 text-red-600 hover:bg-red-600 hover:text-white`}
              onClick={() => {
                handleSelection(true);
              }}
            >
              Disband
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
