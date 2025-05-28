"use client";

import React, { useEffect, useState } from "react";
import { Checkbox } from "antd";
import { toast } from "sonner";
import { noUserImage } from "@/constant/image";
import { StaticImageData } from "next/image";

interface ForwardMessageModalProps {
  onClose: () => void;
  wsRef: React.RefObject<WebSocket | null>;
  message: any;
  sender: {
    id: number;
    name: string;
    image: string | StaticImageData;
  };
}

interface ChatItem {
  id: string;
  name: string;
  imageUrl: string;
  type: "private" | "group";
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function ForwardMessageModal({
  onClose,
  wsRef,
  message,
  sender,
}: ForwardMessageModalProps) {
  const [chatList, setChatList] = useState<ChatItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/chat/me?userId=${sender.id}`);
        const data = await res.json();

        if (!data.success) {
          toast.error("Failed to load chat list");
          return;
        }

        const formatted: ChatItem[] = (data.data || [])
          .filter((chat: any) => chat.Status !== "disbanded")
          .map((chat: any) => ({
            id: chat.ChatID,
            name: chat.chatName || "Chat",
            imageUrl:
              chat.imageUrl ||
              `https://www.gravatar.com/avatar/EMAIL_MD5?d=https://ui-avatars.com/api/?name=${chat.chatName}`,
            type: chat.Type || "private",
          }));

        setChatList(formatted);
      } catch (err) {
        toast.error("Error fetching chat list.");
        console.error(err);
      }
    };

    fetchChatList();
  }, [sender.id]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleForward = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error("WebSocket not connected.");
      return;
    }

    if (!message || selectedIds.length === 0) {
      toast.error("Please select at least one chat to forward.");
      return;
    }

    selectedIds.forEach((chatId) => {
      const forwardPayload = {
        type: "sendChat",
        chatId,

        messagePayload: {
          type: message.type || "text",
          content: message.content,
          attachmentUrl: message.attachmentUrl || null,
          timestamp: new Date().toLocaleTimeString(),
          senderId: sender.id,
          senderImage: sender.image,
          senderName: sender.name,
          isForward: true,
        },
      };

      console.log("Forwarding message to chatId:", chatId, forwardPayload);

      wsRef.current?.send(JSON.stringify(forwardPayload));
    });

    toast.success("Message forwarded!");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[500px] rounded-lg shadow-lg max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Forward Message</h2>
          <button onClick={onClose} className="text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {chatList.map((chat) => (
            <div
              key={chat.id}
              className="flex justify-between items-center py-2 hover:bg-gray-100 rounded px-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={chat.imageUrl || noUserImage.src}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={chat.name}
                />
                <div>
                  <p className="font-medium">{chat.name}</p>
                </div>
              </div>
              <Checkbox
                checked={selectedIds.includes(chat.id)}
                onChange={() => toggleSelect(chat.id)}
              />
            </div>
          ))}
        </div>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600 mb-1">Message to forward:</p>
          <div className="p-3 border rounded bg-gray-50 text-sm text-black break-words">
            {message.attachmentUrl ? (
              <div className="flex flex-col gap-2">
                {["jpg", "jpeg", "png", "gif", "webp"].includes(
                  message.attachmentUrl.split(".").pop()?.toLowerCase()
                ) ? (
                  <img
                    src={message.attachmentUrl}
                    alt="attachment"
                    className="w-40 rounded"
                  />
                ) : (
                  <a
                    href={message.attachmentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {message.attachmentUrl.split("/").pop()}
                  </a>
                )}
                {message.content && <p>{message.content}</p>}
              </div>
            ) : (
              <p>{message.content}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-1 bg-gray-300 text-black rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            disabled={selectedIds.length === 0}
            onClick={handleForward}
            className={`px-4 py-1 rounded ${
              selectedIds.length > 0
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Forward
          </button>
        </div>
      </div>
    </div>
  );
}
