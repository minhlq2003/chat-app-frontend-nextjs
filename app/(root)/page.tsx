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
import { fileList, imageData, listLink } from "@/constant/data";
import { useEffect, useState, useRef } from "react";
import IconButton from "@/components/IconButton";
import UserInfoItem from "@/components/ProfileInfoItem";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { getFileIcon } from "@/constant/help";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";

function Home() {
  const { t } = useTranslation("common");
  const [type, setType] = useState("all");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChatInfo, setSelectedChatInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Store the original WebSocket message handler
  const originalMessageHandlerRef = useRef<
    ((event: MessageEvent) => void) | null
  >(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageCount, setMessageCount] = useState(20);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
  };

  const changeButtonStyle = (currentType: string) => {
    if (type === currentType) {
      return "bg-customPurple text-white";
    }
    return "bg-customPurple/20 text-black";
  };

  const loadMoreMessage = () => {
    const newCount = messageCount + 20;
    setMessageCount(newCount);
  };

  useEffect(() => {
    const container = messageContainerRef.current;

    const handleScroll = () => {
      console.log("scroll");

      if (container && container.scrollTop === 30) {
        console.log("scroll to top");

        loadMoreMessage();
      }
    };

    container?.addEventListener("scroll", handleScroll);

    return () => {
      container?.removeEventListener("scroll", handleScroll);
    };
  }, [messageCount]);

  const initializeWebSocket = (userId: string) => {
    // Clear any existing reconnection timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    // Close existing connection if it exists
    if (wsRef.current) {
      console.log(
        "Closing existing WebSocket connection before creating a new one"
      );

      // Clear the ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }

      // Only attempt to close if the connection is open or connecting
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.onclose = null; // Remove the onclose handler to prevent reconnection loop
        wsRef.current.close();
      }
      wsRef.current = null;
    }

    const wsUrl = `ws://${
      process.env.NEXT_PUBLIC_API_BASE_URL?.replace("http://", "") ||
      "localhost:3000"
    }/ws`;
    console.log(`Initializing WebSocket connection to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");

      // Send join message
      ws.send(
        JSON.stringify({
          type: "joinSocket",
          userID: userId,
        })
      );

      // Setup ping interval
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: "ping",
            })
          );
          console.log("Ping sent to keep connection alive");
        }
      }, 30000); // Send ping every 30 seconds instead of 5 seconds
    };

    // Define the base message handler
    const messageHandler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("WebSocket message received:", data);

        // Handle different message types
        switch (data.type) {
          case "ok":
            console.log(`Operation ${data.originalType} successful`);
            break;

          case "error":
            console.error(
              `Error in operation ${data.originalType}: ${data.message}`
            );
            break;

          case "receiveChat":
            console.log("Received chat message:", data);
            // We'll handle this in the selectedChatInfo-specific handler
            // This is just a fallback
            if (!selectedChatInfo) {
              console.log("No selected chat yet, updating unread counts");
              // Update unread count for chat in the list
              setChatList((prev) =>
                prev.map((chat) => {
                  if (chat.chatId === data.chatId) {
                    return { ...chat, unread: (chat.unread || 0) + 1 };
                  }
                  return chat;
                })
              );
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

    // Store the original handler for reference
    originalMessageHandlerRef.current = messageHandler;
    ws.onmessage = messageHandler;

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
          if (document.visibilityState !== "hidden") {
            console.log("Reconnecting WebSocket...");
            initializeWebSocket(userId);
          } else {
            console.log("Page is not visible, delaying reconnection");

            // Add event listener for when page becomes visible again
            const handleVisibilityChange = () => {
              if (document.visibilityState !== "hidden") {
                console.log("Page became visible, reconnecting WebSocket");
                document.removeEventListener(
                  "visibilitychange",
                  handleVisibilityChange
                );
                initializeWebSocket(userId);
              }
            };

            document.addEventListener(
              "visibilitychange",
              handleVisibilityChange
            );
          }
        }, 5000);
      }
    };

    return ws;
  };

  const scrollToBottom = () => {
    console.log("Scrolling to bottom");
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatList = async (userId: string) => {
    try {
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(`${apiBaseUrl}/chat/me?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        // Transform API data to match our component's expected format
        const formattedChatList = data.data.map((chat: any) => ({
          id: parseInt(chat.otherUserId) || Math.floor(Math.random() * 1000),
          image: chat.imageUrl || "/default-avatar.png", // Provide a default image path
          name: chat.chatName || "Chat",
          message: "Click to view messages", // Placeholder message
          time: new Date(chat.CreatedDate).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unread: 0,
          pin: false,
          type: chat.Type || "private",
          chatId: chat.ChatID,
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
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(`${apiBaseUrl}/chat/${chatId}/info`);
      const data = await response.json();

      if (data.success) {
        setSelectedChatInfo(data.data);

        // Join chat room via WebSocket
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              type: "joinChat",
              chatId: chatId,
            })
          );
          console.log("Sent joinChat packet for chatId:", chatId);
        } else {
          console.warn(
            "WebSocket not connected, couldn't send joinChat packet"
          );
          // Try to reconnect if WebSocket is closed
          if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
            console.log("WebSocket is closed, attempting to reconnect...");
            if (userId) {
              wsRef.current = initializeWebSocket(userId);

              // Wait for connection to establish before sending joinChat
              setTimeout(() => {
                if (
                  wsRef.current &&
                  wsRef.current.readyState === WebSocket.OPEN
                ) {
                  wsRef.current.send(
                    JSON.stringify({
                      type: "joinChat",
                      chatId: chatId,
                    })
                  );
                  console.log("Sent joinChat packet after reconnection");
                }
              }, 1000);
            }
          }
        }

        // Fetch previous messages using the correct endpoint
        try {
          // Get 20 previous messages (you can adjust this number)
          const messagesResponse = await fetch(
            `${apiBaseUrl}/chat/${chatId}/history/${messageCount}`
          );
          const messagesData = await messagesResponse.json();

          if (messagesData.success && Array.isArray(messagesData.data)) {
            // Format and set messages
            const formattedMessages = messagesData.data.map((msg: any) => ({
              messageId: msg.messageId,
              senderId: msg.userId, // Note: backend uses userId instead of senderId
              content: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleTimeString(),
              type: msg.type || "text",
              attachmentUrl: msg.attachmentUrl,
              senderName: msg.senderName,
              senderImage: msg.senderImage,
              reactions: msg.reactions || [],
            }));

            // Reverse the array to show oldest messages first
            setMessages(formattedMessages.reverse());
            console.log("Loaded previous messages:", formattedMessages.length);
            setTimeout(scrollToBottom, 100);
          } else {
            console.warn("No message history found or empty response");
            setMessages([]);
          }
        } catch (error) {
          console.error("Error fetching message history:", error);
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
        content: inputMessage,
      },
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
      console.log("Message sent via WebSocket:", messageObj);

      // Add to local messages (optimistic update)
      const newMessage = {
        messageId: Date.now(), // Temporary ID until server confirms
        senderId: userId,
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString(),
        type: "text",
      };

      setMessages((prev) => {
        const updatedMessages = [...prev, newMessage];
        // Schedule scroll to bottom after state update
        setTimeout(scrollToBottom, 100);
        return updatedMessages;
      });

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
          if (
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN &&
            selectedChatInfo
          ) {
            const reconnectMessageObj = {
              type: "sendChat",
              chatId: selectedChatInfo.ChatID,
              messagePayload: {
                type: "text",
                content: pendingMessage,
              },
            };

            wsRef.current.send(JSON.stringify(reconnectMessageObj));
            console.log(
              "Message sent after reconnection:",
              reconnectMessageObj
            );

            // Add to local messages
            const newMessage = {
              messageId: Date.now(),
              senderId: userId,
              content: pendingMessage,
              timestamp: new Date().toLocaleTimeString(),
              type: "text",
            };

            setMessages((prev) => {
              const updatedMessages = [...prev, newMessage];
              // Schedule scroll to bottom after state update
              setTimeout(scrollToBottom, 100);
              return updatedMessages;
            });
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
        attachmentUrl: attachmentUrl,
      },
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));

      // Add to local messages (optimistic update)
      setMessages((prev) => [
        ...prev,
        {
          messageId: Date.now(),
          senderId: userId,
          content: caption,
          timestamp: new Date().toLocaleTimeString(),
          type: "attachment",
          attachmentUrl: attachmentUrl,
        },
      ]);
    } else {
      console.error("WebSocket not connected, attachment not sent");
      alert("Connection lost. Please refresh the page and try again.");
    }
  };

  const getProfileData = (userId: number | null) => {
    if (selectedChatInfo && selectedChatInfo.members) {
      const member = selectedChatInfo.members.find(
        (m: any) => m.userId === userId
      );
      if (member) {
        return {
          id: member.userId,
          work: "Work information", // Not provided in API
          phone: member.phone || "No phone",
          birthday: "Not available", // Not provided in API
          location: member.location || "No location",
          email: member.email || "No email",
        };
      }
    }

    /*if (userId !== null && profileData.id === userId) {
      return profileData;
    }*/
    return null;
  };

  // This effect updates the WebSocket message handler when selectedChatInfo changes
  useEffect(() => {
    if (wsRef.current && selectedChatInfo) {
      console.log(
        "Updating WebSocket handler for chat:",
        selectedChatInfo.ChatID
      );

      // Create a new message handler that has access to the current selectedChatInfo
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket message received with updated handler:", data);

          // Handle different message types
          switch (data.type) {
            case "ok":
              console.log(`Operation ${data.originalType} successful`);
              break;

            case "error":
              console.error(
                `Error in operation ${data.originalType}: ${data.message}`
              );
              break;

            case "receiveChat":
              console.log("Received chat message:", data);
              // Check if this message belongs to the currently selected chat
              if (data.chatId === selectedChatInfo.ChatID) {
                console.log(
                  "Message is for current chat:",
                  selectedChatInfo.ChatID
                );
                // Add message to the chat
                const newMessage = {
                  messageId: data.message.messageId || Date.now(),
                  senderId: data.message.userId || data.message.senderId,
                  content: data.message.content,
                  timestamp: new Date(
                    data.message.timestamp || Date.now()
                  ).toLocaleTimeString(),
                  type: data.message.type || "text",
                  attachmentUrl: data.message.attachmentUrl,
                  senderName: data.message.senderName,
                  senderImage: data.message.senderImage,
                  reactions: data.message.reactions || [],
                };

                console.log("Adding new message to chat:", newMessage);

                // Update messages state with the new message
                setMessages((prevMessages) => {
                  console.log("Previous messages:", prevMessages.length);
                  const newMessages = [...prevMessages, newMessage];
                  console.log("New messages array:", newMessages.length);

                  // Schedule scroll to bottom after state update
                  setTimeout(() => {
                    console.log("Scrolling to bottom after receiving message");
                    scrollToBottom();
                  }, 100);

                  return newMessages;
                });
              } else {
                console.log("Message is for a different chat");
                // Update unread count for chat in the list
                setChatList((prev) =>
                  prev.map((chat) => {
                    if (chat.chatId === data.chatId) {
                      return { ...chat, unread: (chat.unread || 0) + 1 };
                    }
                    return chat;
                  })
                );
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
    }
  }, [selectedChatInfo]);

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
        if (document.visibilityState !== "hidden") {
          console.log("Page became visible, checking WebSocket connection");
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.log("WebSocket not connected, reconnecting...");
            wsRef.current = initializeWebSocket(userId);
          }
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Cleanup function
      return () => {
        console.log("Component unmounting, cleaning up WebSocket");
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

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

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const userInfo = getProfileData(selectedUser);
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  // Render message based on type
  const renderMessage = (msg: any) => {
    if (!msg) return null;

    switch (msg.type) {
      case "attachment":
        return (
          <div className="flex flex-col">
            {msg.attachmentUrl && (
              <Image
                src={msg.attachmentUrl}
                alt="Attachment"
                width={200}
                height={150}
                className="rounded-lg mb-1"
              />
            )}
            {msg.content && <p>{msg.content}</p>}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex mt-1 gap-1">
                {msg.reactions.map((reaction: any, index: number) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 rounded-full px-2"
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      case "image":
        return (
          <div className="flex flex-col">
            <Image
              src={msg.content || msg.attachmentUrl}
              alt="Image"
              width={200}
              height={150}
              className="rounded-lg mb-1"
            />
            {msg.caption && <p>{msg.caption}</p>}
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex mt-1 gap-1">
                {msg.reactions.map((reaction: any, index: number) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 rounded-full px-2"
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div>
            <p>{msg.content}</p>
            {msg.reactions && msg.reactions.length > 0 && (
              <div className="flex mt-1 gap-1">
                {msg.reactions.map((reaction: any, index: number) => (
                  <span
                    key={index}
                    className="text-sm bg-gray-100 rounded-full px-2"
                  >
                    {reaction.emoji}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
    }
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
                    className="rounded-full"
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
              <div
                className="space-y-4 pt-10 px-2 max-h-[calc(100vh-200px)] overflow-y-auto"
                style={{ height: "calc(100vh - 200px)" }}
                ref={messageContainerRef}
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={msg.messageId}
                      ref={index === 0 ? firstMessageRef : null}
                      className={`flex ${
                        msg.senderId === userId
                          ? "justify-end"
                          : "justify-start"
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
                  <p className="text-center text-gray-500">
                    No messages yet. Start a conversation!
                  </p>
                )}
                <div ref={messagesEndRef} />
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
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
                endContent={
                  <div className="flex items-center gap-3 pr-5">
                    <div className="relative">
                      <Image
                        src={EmojiIcon}
                        width={20}
                        height={20}
                        alt="Emoji"
                        className="cursor-pointer w-[40px] h-[40px]"
                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                      />
                      {showEmojiPicker && (
                        <div className="absolute bottom-10 left-0 z-50">
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>
                    <Image
                      src={FileSendIcon}
                      width={20}
                      height={20}
                      alt="File"
                      className="cursor-pointer"
                      onClick={() => {
                        // This is a placeholder - you'd need to implement file upload
                        alert(
                          "File upload functionality would be implemented here"
                        );
                      }}
                    />
                    <Image
                      src={MicroIcon}
                      width={20}
                      height={20}
                      alt="Micro"
                      className="cursor-pointer"
                    />
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
                    className="rounded-full"
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
                  <div className="space-y-6">
                    {imageData
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((entry) => (
                        <div key={entry.date}>
                          <p className="text-gray-500 font-semibold mb-2">
                            {new Date(entry.date).toLocaleDateString("en-GB")}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {entry.images.map((img, index) => (
                              <img
                                key={index}
                                src={img.src}
                                alt={`image-${index}`}
                                className="rounded-lg w-full object-cover aspect-square"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </AccordionItem>
                <AccordionItem key="2" aria-label="Link" title="Link">
                  <div className="space-y-4">
                    {listLink.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div>
                            <div className="font-medium">{item.title}</div>
                            <a
                              href={item.url}
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {item.url}
                            </a>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">{item.date}</div>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
                <AccordionItem key="3" aria-label="File" title="File">
                  <div className="flex flex-col">
                    {fileList.map((file, idx) => {
                      const { icon, color } = getFileIcon(file.type);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-2 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 flex items-center justify-center rounded-lg ${color}`}
                            >
                              <FontAwesomeIcon
                                icon={icon}
                                size="lg"
                                className={`${color} `}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-black">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {file.size}
                              </p>
                            </div>
                          </div>
                          <div className="bg-indigo-100 p-2 rounded-full text-indigo-500 hover:bg-indigo-200 cursor-pointer">
                            <FontAwesomeIcon icon={faDownload} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
