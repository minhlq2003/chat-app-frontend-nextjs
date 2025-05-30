"use client";

import React, { Dispatch, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function ConfirmationModel({
  onClose,
  selectedUser,
  chatFunc,
  selectedChatInfo,
  listChatFunc,
  requestObject,
  getChatFunc,
}: {
  onClose: () => void;
  selectedUser?: string | null;
  chatFunc: Dispatch<any> | null;
  listChatFunc: (userId: string | null | undefined) => Promise<void> | null;
  selectedChatInfo: any;
  requestObject: any;
  getChatFunc: (chatId: string) => Promise<void> | null;
}) {
  const {t} = useTranslation("common")
  useEffect(() => {
    console.log(selectedChatInfo);
    console.log(selectedUser);
    console.log(requestObject);
  }, []);

  const handleSelection = async (answer: boolean) => {
    onClose();
    let reqBody = {
      chatId: selectedChatInfo.ChatID,
      userId: selectedUser,
    };
    let operation = "/leave";
    if (requestObject && requestObject.object) {
      reqBody = requestObject.object;
      operation = requestObject.operation;
    }
    if (!answer) {
    } else {
      let data;
      try {
        const response = await fetch(`${apiBaseUrl}/group${operation}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });
        data = await response.json();

        if (data.success) {
          toast.success("Operation successfully.");
          if (listChatFunc && !(requestObject && requestObject.object)) {
            await listChatFunc(selectedUser);
            if(getChatFunc && selectedUser) {
            await getChatFunc(selectedUser);
            }
          }
          if (chatFunc !== null) {
            if (requestObject.object) {
              getChatFunc(selectedChatInfo.ChatID);
            } else {
              chatFunc(null);
            }
          }
          requestObject = {
            nodata: true,
          };
        } else {
          let response = data.message;
          toast.error("Operation failed: " + response);
          requestObject = {
            nodata: true,
          };
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[400px] h-[20vh] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-between h-full p-4">
          <h2 className="text-xl font-bold mb-4">{t("Alert")}</h2>
          <p className="mb-4">{t("Are you sure to do this action?")}</p>
          <div className="flex items-center gap-10">
            <button
              className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
              onClick={() => {
                handleSelection(false);
              }}
            >
              {("No")}
            </button>
            <button
              className={`px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"

            }`}
              onClick={() => {
                handleSelection(true);
              }}
            >
              {("Yes")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
