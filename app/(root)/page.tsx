// app/page.tsx
"use client";

import Link from "next/link";
import {
  BlockIcon,
  CalendarIcon,
  CallIcon,
  EmojiIcon,
  FileSendIcon,
  LocationIcon,
  MicroIcon,
  PinIcon,
  PlusIcon,
  SearchIcon,
  SendIcon,
  WorkIcon,
} from "@/constant/image";
import Image, { StaticImageData } from "next/image";
import {
  Accordion,
  AccordionItem,
  Button,
  Card,
  Input,
} from "@nextui-org/react";
import ChatList from "@/components/ChatList";
import { chatHistoryData, chatListData, profileData } from "@/constant/data";
import { useEffect, useState, useRef } from "react";
import IconButton from "@/components/IconButton";
import UserInfoItem from "@/components/ProfileInfoItem";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";

function Home() {
  const { t } = useTranslation("common");
  const [type, setType] = useState("all");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [chatList, setChatList] = useState(chatListData);
  const [selectedChatInfo, setSelectedChatInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const changeButtonStyle = (currentType: string) => {
    if (type === currentType) {
      return "bg-customPurple text-white";
    }
    return "bg-customPurple/20 text-black";
  };

  // Initialize WebSocket connection
  const initializeWebSocket = (userId: string) => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if it exists
    if (wsRef.current) {
      console.log("Closing existing WebSocket connection before creating a new one");

      // Clear the ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only attempt to close if the connection is open or connecting
      if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
        wsRef.current.onclose = null; // Remove the onclose handler to prevent reconnection loop
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    const wsUrl = `ws://${process.env.NEXT_PUBLIC_API_BASE_URL?.replace("http://", "") || 'localhost:3000'}/ws`;
    console.log(`Initializing WebSocket connection to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");

      // Send join message
      ws.send(JSON.stringify({
        type: "joinSocket",
        userID: userId
      }));

      // Setup ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "ping"
          }));
          console.log("Ping sent to keep connection alive");
        }
      }, 30000); // Send ping every 30 seconds instead of 5 seconds
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle different message types
        switch (data.type) {
          case "ok":
            console.log(`Operation ${data.originalType} successful`);
            break;

          case "error":
            console.error(`Error in operation ${data.originalType}: ${data.message}`);
            break;

          case "receiveChat":
            if (data.chatId === selectedChatInfo?.ChatID) {
              // Add message to the chat
              setMessages(prev => [...prev, {
                messageId: data.message.messageId,
                senderId: data.message.senderId,
                content: data.message.content,
                timestamp: new Date(data.message.timestamp).toLocaleTimeString(),
                type: data.message.type,
                attachmentUrl: data.message.attachmentUrl
              }]);
            }
            break;

          case "pong":
            console.log("Received pong from server");
            break;

          default:
            console.log("Unhandled message type:", data.type);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);

      // Clear ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only attempt to reconnect if this is still the current WebSocket and component is mounted
      if (wsRef.current === ws && userId) {
        console.log("Attempting to reconnect in 5 seconds...");

        // Store the timeout reference so we can cancel it if needed
        reconnectTimeoutRef.current = setTimeout(() => {
          if (document.visibilityState !== 'hidden') {
            console.log("Reconnecting WebSocket...");
            initializeWebSocket(userId);
          } else {
            console.log("Page is not visible, delaying reconnection");

            // Add event listener for when page becomes visible again
            const handleVisibilityChange = () => {
              if (document.visibilityState !== 'hidden') {
                console.log("Page became visible, reconnecting WebSocket");
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                initializeWebSocket(userId);
              }
            };

            document.addEventListener('visibilitychange', handleVisibilityChange);
          }
        }, 5000);
      }
    };

    return ws;
  };

  // Fetch chat list from API
  const fetchChatList = async (userId: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'localhost:3000';
      const response = await fetch(`${apiBaseUrl}/chat/me?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // Transform API data to match our component's expected format
        const formattedChatList = data.data.map((chat: any) => ({
          id: parseInt(chat.otherUserId) || Math.floor(Math.random() * 1000),
          image: chat.imageUrl || "/default-avatar.png", // Provide a default image path
          name: chat.chatName || "Chat",
          message: "Click to view messages", // Placeholder message
          time: new Date(chat.CreatedDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: 0,
          pin: false,
          type: chat.Type || "private",
          chatId: chat.ChatID
        }));

        setChatList(formattedChatList);
      } else {
        console.error("Failed to fetch chat list");
      }
    } catch (error) {
      console.error("Error fetching chat list:", error);
    }
  };

  // Fetch chat info and messages
  const fetchChatInfo = async (chatId: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'localhost:3000';
      const response = await fetch(`${apiBaseUrl}/chat/${chatId}/info`);
      const data = await response.json();

      if (data.success) {
        setSelectedChatInfo(data.data);

        // Join chat room via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            type: "joinChat",
            chatId: chatId
          }));
          console.log("Sent joinChat packet for chatId:", chatId);
        } else {
          console.warn("WebSocket not connected, couldn't send joinChat packet");
          // Try to reconnect if WebSocket is closed
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log("WebSocket is closed, attempting to reconnect...");
            if (userId) {
              wsRef.current = initializeWebSocket(userId);

              // Wait for connection to establish before sending joinChat
              setTimeout(() => {
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                  wsRef.current.send(JSON.stringify({
                    type: "joinChat",
                    chatId: chatId
                  }));
                  console.log("Sent joinChat packet after reconnection");
                }
              }, 1000);
            }
          }
        }

        // Set initial messages (if available)
        if (data.data.latestMessage) {
          setMessages([{
            messageId: data.data.latestMessage.messageId || Date.now(),
            senderId: data.data.latestMessage.senderId,
            content: data.data.latestMessage.content,
            timestamp: new Date(data.data.latestMessage.timestamp).toLocaleTimeString(),
            type: data.data.latestMessage.type || "text",
            attachmentUrl: data.data.latestMessage.attachmentUrl
          }]);
        } else {
          // Set empty messages array
          setMessages([]);
        }
      } else {
        console.error("Failed to fetch chat info");
      }
    } catch (error) {
      console.error("Error fetching chat info:", error);
    }
  };

  const handleUserSelect = (id: number, chatId: string) => {
    setSelectedUser(id);
    console.log("Selected user:", id, "chatId:", chatId);
    if (chatId) {
      fetchChatInfo(chatId);
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !selectedChatInfo) return;

    // Create message object according to the specified format
    const messageObj = {
      type: "sendChat",
      chatId: selectedChatInfo.ChatID,
      messagePayload: {
        type: "text",
        content: inputMessage
      }
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
      console.log("Message sent via WebSocket:", messageObj);

      // Add to local messages (optimistic update)
      setMessages(prev => [...prev, {
        messageId: Date.now(), // Temporary ID until server confirms
        senderId: userId,
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: "text"
      }]);

      // Clear input
      setInputMessage("");
    } else {
      console.error("WebSocket not connected, attempting to reconnect...");

      // Try to reconnect and send message after reconnection
      if (userId) {
        wsRef.current = initializeWebSocket(userId);

        // Store message to send after reconnection
        const pendingMessage = inputMessage;
        setInputMessage("");

        // Wait for connection to establish before sending
        setTimeout(() => {
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && selectedChatInfo) {
            const reconnectMessageObj = {
              type: "sendChat",
              chatId: selectedChatInfo.ChatID,
              messagePayload: {
                type: "text",
                content: pendingMessage
              }
            };

            wsRef.current.send(JSON.stringify(reconnectMessageObj));
            console.log("Message sent after reconnection:", reconnectMessageObj);

            // Add to local messages
            setMessages(prev => [...prev, {
              messageId: Date.now(),
              senderId: userId,
              content: pendingMessage,
              timestamp: new Date().toLocaleTimeString(),
              type: "text"
            }]);
          } else {
            alert("Failed to reconnect. Please try again.");
            setInputMessage(pendingMessage); // Restore the message input
          }
        }, 1000);
      }
    }
  };

  const sendAttachment = (attachmentUrl: string, caption: string = "") => {
    if (!selectedChatInfo) return;

    // Create attachment message object
    const messageObj = {
      type: "sendChat",
      chatId: selectedChatInfo.ChatID,
      messagePayload: {
        type: "attachment",
        content: caption,
        attachmentUrl: attachmentUrl
      }
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));

      // Add to local messages (optimistic update)
      setMessages(prev => [...prev, {
        messageId: Date.now(),
        senderId: userId,
        content: caption,
        timestamp: new Date().toLocaleTimeString(),
        type: "attachment",
        attachmentUrl: attachmentUrl
      }]);
    } else {
      console.error("WebSocket not connected, attachment not sent");
      alert("Connection lost. Please refresh the page and try again.");
    }
  };

  const getProfileData = (userId: number | null) => {
    if (selectedChatInfo && selectedChatInfo.members) {
      const member = selectedChatInfo.members.find((m: any) => m.userId === userId);
      if (member) {
        return {
          id: member.userId,
          work: "Work information", // Not provided in API
          phone: member.phone || "No phone",
          birthday: "Not available", // Not provided in API
          location: member.location || "No location",
          email: member.email || "No email"
        };
      }
    }

    if (userId !== null && profileData.id === userId) {
      return profileData;
    }
    return null;
  };

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        router.replace("/introduction");
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user.id;
      setUserId(userId);

      // Initialize WebSocket only once
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        wsRef.current = initializeWebSocket(userId);
      }

      // Fetch chat list
      fetchChatList(userId);

      // Add visibility change handler for reconnection when tab becomes active
      const handleVisibilityChange = () => {
        if (document.visibilityState !== 'hidden') {
          console.log("Page became visible, checking WebSocket connection");
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not connected, reconnecting...");
            wsRef.current = initializeWebSocket(userId);
          }
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup function
      return () => {
        console.log("Component unmounting, cleaning up WebSocket");
        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }

        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }

        if (wsRef.current) {
          wsRef.current.onclose = null; // Remove the onclose handler to prevent reconnection after unmount
          wsRef.current.close();
          wsRef.current = null;
        }
      };
    } catch (error) {
      console.error("Error initializing:", error);
      router.replace("/introduction");
    }
  }, [router]); // Only depend on router to prevent re-initialization

  const userInfo = getProfileData(selectedUser);
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  // Render message based on type
  const renderMessage = (msg: any) => {
    if (msg.type === "attachment" && msg.attachmentUrl) {
      return (
        <div className="flex flex-col">
          <Image
            src={msg.attachmentUrl}
            alt="Attachment"
            width={200}
            height={150}
            className="rounded-lg mb-1"
          />
          {msg.content && <p>{msg.content}</p>}
        </div>
      );
    }
    return msg.content;
  };

  return (
    <div className="grid grid-cols-9 gap-2 h-screen">
      <div className="col-span-2 border-1 bg-white rounded-xl max-h-screen overflow-y-auto scrollbar-hide">
        <div className="sticky top-0 z-10 px-4 bg-white">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[32px]">{t("Messages")}</h1>
            <div className="bg-customPurple rounded-full w-[30px] h-[30px] flex items-center justify-center">
              <p className="text-white text-[16px]">10</p>
            </div>
          </div>

          <div className="py-2">
            <Input
              labelPlacement="outside"
              placeholder="Search message, people"
              type="text"
              startContent={
                <Image src={SearchIcon} width={24} height={24} alt="Search" />
              }
            />
          </div>
          <div className="flex items-center justify-between py-4 max-w-[250px] ">
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("all")}`}
              onPress={() => setType("all")}
            >
              {t("All")}
            </Button>
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("unread")}`}
              onPress={() => setType("unread")}
            >
              {t("Unread")}
            </Button>
            <Button
              size="sm"
              className={`w-[70px] ${changeButtonStyle("group")}`}
              onPress={() => setType("group")}
            >
              {t("Group")}
            </Button>
          </div>
        </div>
        <div className="px-4 py-2">
          <p className="text-base">{t("Pinned Messages")}</p>
        </div>
        <ChatList chatList={chatList} pin onSelectUser={handleUserSelect} />
        <div className="px-4 py-2">
          <p className="text-base">{t("Messages")}</p>
        </div>
        <ChatList
          chatList={chatList}
          filterType={type}
          onSelectUser={handleUserSelect}
        />
      </div>
      <div className="col-span-5 h-screen bg-white rounded-xl">
        {selectedChatInfo ? (
          <div className="flex flex-col justify-between h-screen">
            <div>
              <div className="flex items-center justify-between border-b-2 p-4">
                <div className="flex items-center gap-10">
                  <Image
                    src={selectedChatInfo.imageUrl || "/default-avatar.png"}
                    width={64}
                    height={64}
                    alt="Participant"
                  />
                  <h1 className="text-2xl text-black">
                    {selectedChatInfo.chatName || "Chat"}
                  </h1>
                </div>
                <div className="flex items-center justify-center gap-5">
                  <IconButton
                    icon={CallIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Call"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50 `}
                  />
                  <IconButton
                    icon={PinIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Pin"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50 ${
                      chatList.find((chat) => chat.id === selectedUser)?.pin
                        ? "bg-customPurple/50"
                        : ""
                    }`}
                  />
                  <IconButton
                    icon={SearchIcon}
                    iconWidth={25}
                    iconHeight={25}
                    iconName="Search"
                    className={`w-[46px] h-[46px] hover:bg-customPurple/50`}
                  />
                </div>
              </div>
              <div className="space-y-4 pt-10 px-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.messageId}
                      className={`flex ${
                        msg.senderId === userId ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`${
                          msg.senderId === userId
                            ? "bg-customPurple text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                            : "bg-customPurple/20 text-black rounded-tl-lg rounded-tr-lg rounded-br-lg"
                        } p-2 max-w-[70%]`}
                      >
                        {renderMessage(msg)}
                        <span
                          className={`
                        ${
                            msg.senderId === userId
                              ? "text-white/80 justify-end"
                              : "text-black/50"
                          }
                        text-sm flex`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">No messages yet. Start a conversation!</p>
                )}
              </div>
            </div>
            <div className="border-t-2 p-4">
              <Input
                placeholder="Type messages"
                type="text"
                className="flex-1"
                size="lg"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    sendMessage();
                  }
                }}
                endContent={
                  <div className="flex items-center gap-3 pr-5">
                    <Image src={EmojiIcon} width={20} height={20} alt="Emoji" className="cursor-pointer" />
                    <Image
                      src={FileSendIcon}
                      width={20}
                      height={20}
                      alt="File"
                      className="cursor-pointer"
                      onClick={() => {
                        // This is a placeholder - you'd need to implement file upload
                        alert("File upload functionality would be implemented here");
                      }}
                    />
                    <Image src={MicroIcon} width={20} height={20} alt="Micro" className="cursor-pointer" />
                    <Image
                      src={SendIcon}
                      width={20}
                      height={20}
                      alt="Send"
                      className="cursor-pointer"
                      onClick={sendMessage}
                    />
                  </div>
                }
              />
            </div>
          </div>
        ) : (
          <p className="flex justify-center items-center pt-[40%] text-gray-500">
            Select a chat to view messages.
          </p>
        )}
      </div>
      <div className="col-span-2 w-full h-screen ">
        {selectedChatInfo && (
          <div className="">
            <div className="px-2">
              <Card className="h-[413px] w-full bg-white rounded-xl p-2">
                <h1 className="text-2xl font-medium">Info</h1>
                <div className="flex flex-col items-center gap-3 justify-center">
                  <Image
                    src={selectedChatInfo.imageUrl || "/default-avatar.png"}
                    width={64}
                    height={64}
                    alt="Participant"
                  />
                  <h1 className="text-2xl">
                    {selectedChatInfo.chatName || "Chat"}
                  </h1>
                </div>
                {userInfo && (
                  <div className="px-4 py-8 flex flex-col gap-3">
                    <UserInfoItem
                      icon={WorkIcon}
                      text={userInfo.work || "Not available"}
                      altText="Work"
                    />
                    <UserInfoItem
                      icon={CallIcon}
                      text={userInfo.phone || "Not available"}
                      altText="Phone"
                    />
                    <UserInfoItem
                      icon={CalendarIcon}
                      text={userInfo.birthday || "Not available"}
                      altText="Birthday"
                    />
                    <UserInfoItem
                      icon={LocationIcon}
                      text={userInfo.location || "Not available"}
                      altText="Location"
                    />
                    <UserInfoItem
                      icon={PlusIcon}
                      text="Create group"
                      altText="Create group"
                    />
                    <UserInfoItem
                      icon={BlockIcon}
                      text="Block"
                      altText="Block"
                      textStyle="text-base text-red-600"
                    />
                  </div>
                )}
              </Card>
            </div>
            <div className="mt-2">
              <Accordion
                variant="splitted"
                itemClasses={{
                  title: "text-xl",
                  content: "max-h-60 overflow-y-auto ",
                }}
              >
                <AccordionItem key="1" aria-label="Image" title="Image">
                  {defaultContent}
                </AccordionItem>
                <AccordionItem key="2" aria-label="Link" title="Link">
                  {defaultContent}
                </AccordionItem>
                <AccordionItem key="3" aria-label="File" title="File">
                  {defaultContent}
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        )}
        <Link href="/signin">Login</Link>
      </div>
    </div>
  );
}

export default Home;