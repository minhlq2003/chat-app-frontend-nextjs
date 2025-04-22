"use client";

import { noUserImage } from "@/constant/image";
import Image from "next/image";
import React, {Dispatch, useEffect, useRef, useState} from "react";
import { Checkbox, notification } from "antd";
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
    console.log(selectedChatInfo)
    console.log(selectedUser)

  }, [])

  const handleSelection = async (answer: boolean) => {
    onClose();
    let reqBody = {
      chatId: selectedChatInfo.ChatID,
      userId: selectedUser,
    }
    if(!answer) {
    } else {
      let data ;
      try {
        const response = await fetch(`${apiBaseUrl}/group/disband`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(reqBody)
        });
        data = await response.json();


        if (data.success) {
          toast.success('Group deleted successfully.');
          await listChatFunc(selectedUser);
          chatFunc(null)
        } else {
          let response = data.message
          toast.error('Group delete failed: '+response);
        }

        } catch (error) {
        console.log(error)
      }
    }
  }
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
          <p className="mb-4 font-bold warn">Are you suuuuuuuure you want to disband this group???</p>
          <div className="flex items-center gap-10">
            <button
              className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
              onClick={() => {handleSelection(false)}}
            >
              No
            </button>
            <button
              className={`px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"

            }`}
              onClick={() => {handleSelection(true)}}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}