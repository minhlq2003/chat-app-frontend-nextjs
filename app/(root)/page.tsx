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
import React, { useEffect, useState, useRef } from "react";
import IconButton from "@/components/IconButton";
import UserInfoItem from "@/components/ProfileInfoItem";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { extractLists, getFileIcon } from "@/constant/help";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faFile,
  faFileWord,
} from "@fortawesome/free-solid-svg-icons";
import RenderMedia from "@/components/RenderMedia";

function Home() {
  const { t } = useTranslation("common");
  const [type, setType] = useState("all");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChatInfo, setSelectedChatInfo] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const [attachmentCaption, setAttachmentCaption] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const originalMessageHandlerRef = useRef<
    ((event: MessageEvent) => void) | null
  >(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageCount, setMessageCount] = useState(20);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);

  //upload operation
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    // Trigger the file input click event
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      alert("No file selected.");
      return;
    }
    if (file) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (response.ok) {
          const data = await response.json();
          const fileUrl = data.imageUrl;
          // Set the attachment preview instead of showing an alert
          setAttachmentPreview(fileUrl);
          // Reset input value to allow selecting the same file again
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          console.error("Image upload failed:", await response.json());
          alert("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
        alert("An error occurred while uploading the image.");
      }
    }
  };

  const handleSendMessage = () => {
    if (attachmentPreview) {
      sendAttachment(attachmentPreview, attachmentCaption || inputMessage);
      setAttachmentPreview(null);
      setAttachmentCaption("");
      setInputMessage("");
    } else if (inputMessage.trim()) {
      sendMessage();
    }
  };

  // Add this function to remove the attachment preview
  const removeAttachmentPreview = () => {
    setAttachmentPreview(null);
    setAttachmentCaption("");
  };

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
      console.log("WebSocket error:", error);
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
          const messageCount = 20;
          const messagesResponse = await fetch(
            `${apiBaseUrl}/chat/${chatId}/history/${messageCount}`
          );
          const messagesData = await messagesResponse.json();

          if (messagesData.success && Array.isArray(messagesData.data)) {
            let filteredMessages = messagesData.data
              .filter(
                (element: { deleteReason: string; userId: string }) =>
                  !(
                    element.deleteReason === "remove" &&
                    element.userId === userId
                  )
              ) // Remove elements with deleteReason 'remove'
              .map((element: { deleteReason: string; content: string }) => {
                if (element.deleteReason === "unsent") {
                  element.content = "This message was unsent";
                }
                return element; // Return the modified element
              });

            // Format and set messages
            const formattedMessages = filteredMessages.map((msg: any) => ({
              messageId: msg.messageId,
              senderId: msg.userId, // Note: backend uses userId instead of senderId
              content: msg.content,
              timestamp: new Date(msg.timestamp).toLocaleTimeString(),
              type:
                (msg.deleteReason === "unsent" ? "text" : msg.type) || "text",
              attachmentUrl: msg.attachmentUrl,
              senderName: msg.senderName,
              deleteReason: msg.deleteReason,
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
    const messageObj = {
      type: "sendChat",
      chatId: selectedChatInfo.ChatID,
      messagePayload: {
        type: "text",
        content: inputMessage,
        timestamp: new Date().toLocaleTimeString(),
        senderId: userId,
      },
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
      console.log("Message sent via WebSocket:", messageObj);
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
                timestamp: new Date().toLocaleTimeString(),
                senderId: userId,
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
        timestamp: new Date().toLocaleTimeString(),
        senderId: userId,
      },
    };

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
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
        selectedChatInfo.imageUrl = member.imageUrl;
        selectedChatInfo.chatName = member.name;
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

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [messageMenuId, setMessageMenuId] = useState<
    string | object | boolean | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setMessageMenuId(null); // Close menu if click outside
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (
      messageMenuId &&
      typeof messageMenuId === "object" &&
      "id" in messageMenuId &&
      "type" in messageMenuId
    ) {
      const { id, type } = messageMenuId as {
        id: string | number;
        type: string;
      };
      console.log(messageMenuId);
      if (type === "remove" || type === "unsent") {
        const deleteType = type === "remove" ? "remove" : "unsent";
        const apiBaseUrl =
          process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";

        // @ts-ignore
        if (messageMenuId.inBrowser) {
          console.log("in browser true");
          if (deleteType === "remove") {
            // Remove the message from the array completely
            setMessages((prevMessages) =>
              prevMessages.filter((msg) => msg.messageId !== id)
            );
          } else {
            // Only change content for unsent messages
            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.messageId === id
                  ? {
                      ...msg,
                      type: "text",
                      attachmentUrl: null,
                      content: "This message was unsent",
                      isDeleted: true,
                    }
                  : msg
              )
            );
          }
          setMessageMenuId(null);
        } else {
          fetch(
            `${apiBaseUrl}/chat/deleteMsg?messageId=${id}&deleteType=${deleteType}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          )
            .then((response) => response.json())
            .then((data) => {
              if (data.success) {
                console.log(
                  `Message ${
                    deleteType === "remove" ? "removed" : "unsent"
                  } successfully:`,
                  data.message
                );
                if (deleteType === "remove") {
                  // Remove the message from the array completely
                  setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.messageId !== id)
                  );
                } else {
                  // Only change content for unsent messages
                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.messageId === id
                        ? {
                            ...msg,
                            content: "This message was unsent",
                            isDeleted: true,
                          }
                        : msg
                    )
                  );
                }
              } else {
                console.error(`Failed to ${deleteType} message:`, data.message);
              }
              // Reset messageMenuId after operation
              setMessageMenuId(null);
            })
            .catch((error) => {
              console.error(
                `Error ${
                  deleteType === "remove" ? "removing" : "unsending"
                } message:`,
                error
              );
              setMessageMenuId(null);
            });
        }
      }
    }
  }, [messageMenuId]);

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
              switch (data.originalType) {
                case "sendChat": {
                  //console.log(data.messagePayload)
                  if (data.messagePayload) {
                    setMessages((prev) => {
                      const updatedMessages = [...prev, data.messagePayload];
                      // Schedule scroll to bottom after state update
                      setTimeout(scrollToBottom, 100);
                      return updatedMessages;
                    });
                  }
                  break;
                }
              }
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
            case "changeMessageType": {
              if (data.deleteType !== "remove") {
                setMessageMenuId({
                  id: Number(data.msgId),
                  type: data.deleteType,
                  inBrowser: true,
                });
              }
              break;
            }

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
  // Render message based on type
  const renderMessage = (msg: any) => {
    if (!msg) return null;

    // Determine file type from URL if it's an attachment
    if (msg.type === "attachment" && msg.attachmentUrl) {
      const fileUrl = msg.attachmentUrl;
      const fileExtension = fileUrl.split(".").pop()?.toLowerCase();
      const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

      // Check if it's an image file
      if (imageExtensions.includes(fileExtension)) {
        // Render as image
        return (
          <div className="flex flex-col">
            <Image
              src={msg.attachmentUrl}
              alt="Image"
              width={200}
              height={150}
              className="rounded-lg mb-1"
            />
            {msg.content && <p className="mt-1">{msg.content}</p>}
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
      } else {
        // Extract filename from URL
        const fileName = fileUrl.split("/").pop() || "File";

        // Determine file icon based on extension
        let fileIcon = faFile;
        let bgColor = "bg-blue-100";
        let iconColor = "text-blue-500";

        // Set specific icons based on file type
        if (["doc", "docx"].includes(fileExtension)) {
          fileIcon = faFileWord;
          bgColor = "bg-blue-100";
          iconColor = "text-blue-500";
        } else if (["pdf"].includes(fileExtension)) {
          fileIcon = faFile;
          bgColor = "bg-red-100";
          iconColor = "text-red-500";
        } else if (["xls", "xlsx"].includes(fileExtension)) {
          fileIcon = faFile;
          bgColor = "bg-green-100";
          iconColor = "text-green-500";
        }

        // Render as file attachment
        return (
          <div className="flex flex-col">
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <div
                  className={`${bgColor} w-10 h-10 flex items-center justify-center rounded-lg`}
                >
                  <FontAwesomeIcon
                    icon={fileIcon}
                    className={`${iconColor}`}
                    size="lg"
                  />
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium">{fileName}</p>
                  <p className="text-xs opacity-70">Click to download</p>
                </div>
              </div>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                download
                className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <FontAwesomeIcon icon={faDownload} className="text-white" />
              </a>
            </div>
            {msg.content && <p className="mt-2">{msg.content}</p>}
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
    } else if (msg.type === "image") {
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
    } else {
      let content: string = msg.content;
      const urlRegex = new RegExp(
        /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*))/g
      );
      const regex = new RegExp(`${urlRegex.source}`, "g");
      const delim = content.split(regex).map((string) => {
        return {
          content: string ?? "",
          isURL: urlRegex.test(string),
        };
      });

      return (
        <div>
          <p>
            {delim.map((text, idx) => {
              if (!text.isURL) return text.content;
              return (
                <Link
                  className="text-blue-500 hover:underline"
                  href={text.content}
                  target={"_blank"}
                  key={`text-content-${idx}`}
                >
                  {text.content}
                </Link>
              );
            })}
          </p>
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
              >
                {messages.length > 0 ? (
                  messages.map((msg) => {
                    const isOwn = msg.senderId === userId;
                    const type = msg.deleteReason === "unsent";
                    const imageUrl = msg.attachmentUrl;

                    const isOpen = messageMenuId === msg.messageId;
                    return (
                      <div
                        key={msg.messageId}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        } `}
                      >
                        {/* Message */}
                        <div
                          className={`${
                            isOwn
                              ? "bg-customPurple text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                              : "bg-customPurple/20 text-black rounded-tl-lg rounded-tr-lg rounded-br-lg"
                          } p-2 max-w-[70%] relative group`}
                          onClick={() => {
                            setSelectedImage(imageUrl);
                            console.log(imageUrl);
                          }}
                        >
                          {/* Dots button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click
                              if (type) {
                                setMessageMenuId(null);
                              } else {
                                setMessageMenuId(isOpen ? null : msg.messageId);
                              }
                              /*setMessageMenuId(isOpen ? null : msg.messageId);*/
                            }}
                            className={`absolute bottom-0 w-8 h-8 rounded-full hover:bg-gray-200 hidden group-hover:flex items-center justify-center z-10
                              ${
                                isOwn
                                  ? "-left-8 bg-customPurple/20 text-black"
                                  : "-right-8 bg-customPurple/20 text-black"
                              }`}
                          >
                            <span className="text-xs">●●●</span>
                          </button>
                          {/* Dropdown */}
                          {isOpen && (
                            <div
                              ref={dropdownRef}
                              className={`absolute bottom-0 z-20 bg-white rounded shadow-lg w-48 p-2 text-black ${
                                isOwn ? "-left-48" : "-right-48"
                              }`}
                            >
                              {isOwn ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      console.log("Reply to", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "reply",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      console.log("Forward", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "forward",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Forward
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      console.log("Remove", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "remove",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Remove
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      console.log("Undo", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "unsent",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Undo
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      console.log("Reply to", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "reply",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Reply
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      console.log("Forward", msg.messageId);
                                      e.stopPropagation();
                                      setMessageMenuId({
                                        id: msg.messageId,
                                        type: "forward",
                                      });
                                    }}
                                    className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                                  >
                                    Forward
                                  </button>
                                </>
                              )}
                            </div>
                          )}
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
                    );
                  })
                ) : (
                  <p className="text-center text-gray-500">
                    No messages yet. Start a conversation!
                  </p>
                )}
                <div ref={messagesEndRef} />
                {selectedImage && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                    onClick={() => setSelectedImage(null)}
                    style={{ marginTop: "0px" }}
                  >
                    <div className="relative max-w-[90%] max-h-[90%]">
                      <Image
                        src={selectedImage}
                        alt="Full Image"
                        width={800}
                        height={600}
                        className="rounded-lg"
                        style={{ objectFit: "contain" }}
                      />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute top-2 right-2 text-white text-xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="border-t-2 p-4 relative">
              {attachmentPreview && (
                <div className="absolute bottom-full left-0 right-0 p-3 bg-gray-100 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {(() => {
                        // Determine if it's an image or file based on extension
                        const fileUrl = attachmentPreview;
                        const fileExtension: string | undefined = fileUrl
                          .split(".")
                          .pop()
                          ?.toLowerCase();
                        const imageExtensions: string[] = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "webp",
                        ];

                        if (imageExtensions.includes(fileExtension as string)) {
                          // Image preview
                          return (
                            <Image
                              src={attachmentPreview}
                              width={150}
                              height={100}
                              alt="Attachment preview"
                              className="rounded-md object-cover h-[100px]"
                            />
                          );
                        } else {
                          // File preview
                          const fileName = fileUrl.split("/").pop() || "File";

                          // Determine file icon based on extension
                          let fileIcon = faFile;
                          let bgColor = "bg-blue-100";
                          let iconColor = "text-blue-500";

                          if (
                            ["doc", "docx"].includes(fileExtension as string)
                          ) {
                            fileIcon = faFileWord;
                            bgColor = "bg-blue-100";
                            iconColor = "text-blue-500";
                          } else if (
                            ["pdf"].includes(fileExtension as string)
                          ) {
                            fileIcon = faFile;
                            bgColor = "bg-red-100";
                            iconColor = "text-red-500";
                          } else if (
                            ["xls", "xlsx"].includes(fileExtension as string)
                          ) {
                            fileIcon = faFile;
                            bgColor = "bg-green-100";
                            iconColor = "text-green-500";
                          }

                          return (
                            <div className="flex items-center bg-gray-800 p-3 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`${bgColor} w-10 h-10 flex items-center justify-center rounded-lg`}
                                >
                                  <FontAwesomeIcon
                                    icon={fileIcon}
                                    className={`${iconColor}`}
                                    size="lg"
                                  />
                                </div>
                                <div className="text-white">
                                  <p className="text-sm font-medium">
                                    {fileName}
                                  </p>
                                  <p className="text-xs opacity-70">
                                    Ready to send
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                    <button
                      onClick={removeAttachmentPreview}
                      className="text-gray-500 hover:text-red-500 p-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              <Input
                placeholder={
                  attachmentPreview ? "Add a caption..." : "Type messages"
                }
                type="text"
                className="flex-1"
                size="lg"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
                endContent={
                  <div className="flex items-center gap-3 pr-5">
                    <div className="relative flex-none w-[25px] h-[25px]">
                      <Image
                        src={EmojiIcon}
                        width={20}
                        height={20}
                        alt="Emoji"
                        className="cursor-pointer w-[25px] h-[25px]"
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
                      onClick={handleFileSelect}
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileInputChange}
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
                      onClick={handleSendMessage}
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
              <RenderMedia data={extractLists(messages)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
