import React from "react";
import ChatItem from "./ChatItem";
import { ChatListProps } from "../constant/type";

export default function ChatList({
  chatList,
  filterType,
  pin,
  onSelectUser,
}: ChatListProps & { onSelectUser: (id: number, chatId: string) => void }) {
  if (!chatList || chatList.length === 0) {
    return <div className="px-4">No chats available</div>;
  }

  const filteredList = chatList
    .filter((item) => {
      if (pin) {
        return item.pin;
      }
      if (!pin && item.pin) {
        return false;
      }
      if (filterType === "unread") {
        return item.unread > 0;
      }
      if (filterType === "group") {
        return item.type === "group";
      }
      return true;
    })
    .sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return 0;
    });

  return (
    <div className="px-4">
      {filteredList.map((item, index) => (
        <ChatItem
          id={item.id}
          key={index}
          image={item.image}
          name={item.name}
          message={item.message}
          time={item.time}
          unread={item.unread}
          pin={item.pin}
          onClick={() => onSelectUser(item.id, item.chatId || "")}
          Type={item.type || ""}
          Status="online"
        />
      ))}
    </div>
  );
}
