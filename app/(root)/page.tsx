// app/page.tsx
"use client";

import Link from "next/link";
import {
  BlockIcon,
  CalendarIcon,
  CallIcon,
  LocationIcon,
  PlusIcon,
  SearchIcon,
  WorkIcon,
} from "@/constant/image";
import Image, { StaticImageData } from "next/image";
import { Button, Card, Input } from "@nextui-org/react";
import ChatList from "@/components/ChatList";
import React, { useEffect, useState, useRef } from "react";
import UserInfoItem from "@/components/ProfileInfoItem";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { extractLists, getFileIcon } from "@/constant/help";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
  faEdit,
  faFile,
  faFileWord,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import RenderMedia from "@/components/RenderMedia";
import SingleChat from "@/components/SingleChat";
import GroupChat from "@/components/GroupChat";
import AddGroupModal from "@/components/AddGroupModel";
import {
  ChatItemProps,
  MembersGroupChat,
  Message,
  TemporaryUserProps,
} from "@/constant/type";
import { noUserImage } from "@/constant/image";
import AddNewMemberModal from "@/components/AddNewMemberModal";
import { toast } from "sonner";
import LeaveGroupConfirmationModel from "@/components/LeaveGroupConfirmationModel";
import ConfirmationModel from "@/components/ConfirmationModel";
import ChangeGroupNameModal from "@/components/ChangeGroupNameModal";
function Home() {
  const { t } = useTranslation("common");
  const [type, setType] = useState("all");
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [chatList, setChatList] = useState<any[]>([]);
  const [selectedChatInfo, setSelectedChatInfo] = useState<any>(null);
  const [memberRole, setMemberRole] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [user, setUser] = useState<TemporaryUserProps>();
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const [attachmentCaption, setAttachmentCaption] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewMemberModalOpen, setIsNewMemberModalOpen] = useState(false);
  const [isConfirmation, setisConfirmation] = useState(false);
  const [isDisbandConfirmation, setisDisbandConfirmation] = useState(false);
  const [isOpenModalChangeGroupName, setIsOpenModalChangeGroupName] =
    useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;
  const [listMembers, setListMembers] = useState<MembersGroupChat[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reqObj, setReqObj] = useState<any>({
    nodata: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [searchResult, setSearchResult] = useState<Message[]>([]);
  const handleFileSelect = () => {
    // Trigger the file input click event
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const [replyMessage, setReplyMessage] = useState<Message | null>(null);
  const [forwardMessage, setForwardMessage] = useState<Message | null>(null);
  const handleChangeGroupName = async (newName: string) => {
    try {
      if (!selectedChatInfo || !userId) {
        toast.error("Missing chat information or user ID");
        return;
      }

      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";
      const response = await fetch(`${apiBaseUrl}/group/rename`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId: selectedChatInfo.ChatID,
          userId: userId,
          newName: newName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Group name changed successfully");
        setSelectedChatInfo((prev: any) => ({
          ...prev,
          chatName: newName,
        }));

        setChatList((prev) =>
          prev.map((chat) => {
            if (chat.chatId === selectedChatInfo.ChatID) {
              return {
                ...chat,
                name: newName,
              };
            }
            return chat;
          })
        );
      } else {
        toast.error(data.message || "Failed to change group name");
      }
    } catch (error) {
      console.error("Error changing group name:", error);
      toast.error("An error occurred while changing the group name");
    } finally {
      setIsOpenModalChangeGroupName(false);
    }
  };

  const loadMoreMessages = () => {
    if (!chatRef.current) return;

    const previousScrollHeight = chatRef.current.scrollHeight;

    const nextPage = page + 1;
    const start = Math.max(allMessages.length - nextPage * PAGE_SIZE, 0);
    const end = allMessages.length - page * PAGE_SIZE;

    const newMessages = allMessages.slice(start, end);

    // Temporarily add messages without scrolling
    setMessages((prev) => [...newMessages, ...prev]);
    setPage(nextPage);

    // After messages are rendered, adjust scroll
    setTimeout(() => {
      requestAnimationFrame(() => {
        if (chatRef.current) {
          const newScrollHeight = chatRef.current.scrollHeight;
          chatRef.current.scrollTop = newScrollHeight - previousScrollHeight;
        }
      });
    }, 0); // wait for the DOM to update
  };
  const chatRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const onScroll = () => {
      if (
        chatRef.current?.scrollTop === 0 &&
        page * PAGE_SIZE < allMessages.length
      ) {
        loadMoreMessages();
      }
    };

    chatRef.current?.addEventListener("scroll", onScroll);
    return () => chatRef.current?.removeEventListener("scroll", onScroll);
  }, [page, allMessages]);

  const handleFileInputChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      toast.error("No file selected.");
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
          setAttachmentPreview(fileUrl);
          if (fileInputRef.current) fileInputRef.current.value = "";
        } else {
          console.error("Image upload failed:", await response.json());
          toast.error("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
        toast.error("An error occurred while uploading the image.");
      }
    }
  };

  const handleSendMessage = () => {
    if (attachmentPreview) {
      sendAttachment(attachmentPreview, attachmentCaption || inputMessage);
      setAttachmentPreview(null);
      setAttachmentCaption("");
      setInputMessage("");
      setReplyMessage(null);
    } else if (inputMessage.trim()) {
      sendMessage();
      setReplyMessage(null);
    }
  };

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

  const playNotificationSound = () => {
    console.log("Attempting to play notification sound");
    if (notificationSoundRef.current) {
      notificationSoundRef.current.volume = 0.15; // Set volume to 50%
      notificationSoundRef.current.currentTime = 0; // Reset to start
      notificationSoundRef.current.play().catch((err) => {
        console.error("Error playing notification sound:", err);
      });
    } else {
      console.log("Audio reference is not available");
    }
  };
  // Add this function to your component
  // Fix the handleChatScroll function to properly reset unread counts
  const handleChatScroll = () => {
    const container = messageContainerRef.current;
    if (!container || !selectedChatInfo) return;

    // Check if scrolled to bottom (with a small threshold)
    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      20;

    if (isAtBottom) {
      // Reset unread count for this chat
      setChatList((prev) =>
        prev.map((chat) => {
          if (chat.chatId === selectedChatInfo.ChatID && chat.unread > 0) {
            console.log(
              "Resetting unread count for chat:",
              selectedChatInfo.ChatID
            );
            return { ...chat, unread: 0 };
          }
          return chat;
        })
      );
    }
  };
  let params = useSearchParams();
  useEffect(() => {
    const temUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(temUser);
  }, []);

  // Add this useEffect to set up the scroll listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleChatScroll);

      return () => {
        container.removeEventListener("scroll", handleChatScroll);
      };
    }
  }, [selectedChatInfo]); // Depend on selectedChatInfo to re-add listener when chat changes

  // Add this useEffect to set up the scroll listener
  useEffect(() => {
    const container = messageContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleChatScroll);

      return () => {
        container.removeEventListener("scroll", handleChatScroll);
      };
    }
  }, [selectedChatInfo]); // Depend on selectedChatInfo to re-add listener when chat changes
  useEffect(() => {
    const container = messageContainerRef.current;

    const handleScroll = () => {
      console.log("scroll");

      if (container && container.scrollTop === 30) {
        console.log("scroll to top");

        loadMoreMessages();
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
            if (!selectedChatInfo) {
              console.log("No selected chat yet, updating unread counts");
              setChatList((prev) =>
                prev.map((chat) => {
                  if (chat.chatId === data.chatId) {
                    return {
                      ...chat,
                      message: data.message.content,
                      time: new Date(
                        data.message.timestamp || Date.now()
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                      unread: (chat.unread || 0) + 1,
                    };
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
        const formattedChatList = data.data
          .filter(function (chat: ChatItemProps) {
            return chat.Status !== "disbanded";
          })
          .map((chat: any) => ({
            id: parseInt(chat.otherUserId) || Math.floor(Math.random() * 1000),
            image: chat.imageUrl || noUserImage, // Provide a default image path
            name: chat.chatName || "Chat",
            message: chat.lastMessage
              ? chat.lastMessage.content === ""
                ? chat.lastMessage.type
                  ? `Sent a ${chat.lastMessage.type}`
                  : "Click to view messages"
                : chat.lastMessage?.content
              : chat.lastMessage?.content ||
                "No messages yet" ||
                "Click to view messages", // Placeholder message
            time:
              chat.lastMessage && chat.lastMessage.timestamp
                ? new Date(chat.lastMessage.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : new Date(chat.CreatedDate).toLocaleTimeString([], {
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
          if (data.data.Type === "group") {
            setListMembers(data.data.members);
            data.data.members.forEach((member: any) => {
              if (member.userId === Number(userId)) {
                setMemberRole(member.role);
                console.log(memberRole);
              }
            });
          }
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
          const messageCount = 50;
          const messagesResponse = await fetch(
            `${apiBaseUrl}/chat/${chatId}/history/${messageCount}?userId=${userId}`
          );
          const messagesData = await messagesResponse.json();

          console.log("Fetched messages data:", messagesData);

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
              ...msg,
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
            /*setMessages(formattedMessages.reverse());*/
            console.log("Formatted messages:", formattedMessages);

            const reversed = formattedMessages.reverse(); // Oldest first
            setAllMessages(reversed);
            setMessages(reversed.slice(-PAGE_SIZE)); // Initial page (latest 10)
            setPage(1);
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
        senderImage: user?.image || "https://ui-avatars.com/api/?name=John+Doe",
        senderName: user?.name || "No User",
        replyTo: replyMessage?.messageId || null,
      },
    };
    console.log("Sending message:", messageObj);

    setChatList((prev) =>
      prev.map((chat) => {
        if (chat.chatId === messageObj.chatId) {
          console.log("update");
          return {
            ...chat,
            message: messageObj.messagePayload.content,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return chat;
      })
    );
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
                senderImage:
                  user?.image || "https://ui-avatars.com/api/?name=John+Doe",
                senderName: user?.name || "No User",
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
              replyTo: replyMessage || undefined,
            };

            setMessages((prev) => {
              const updatedMessages = [...prev, newMessage];
              setTimeout(scrollToBottom, 100);
              return updatedMessages;
            });
          } else {
            toast.error("Failed to reconnect. Please try again.");
            setInputMessage(pendingMessage);
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
        senderImage: user?.image || "https://ui-avatars.com/api/?name=John+Doe",
        senderName: user?.name || "No User",
      },
    };
    setChatList((prev) =>
      prev.map((chat) => {
        if (chat.chatId === messageObj.chatId) {
          console.log("update");
          return {
            ...chat,
            message: messageObj.messagePayload.content,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        }
        return chat;
      })
    );
    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageObj));
    } else {
      console.error("WebSocket not connected, attachment not sent");
      toast.error("Connection lost. Please refresh the page and try again.");
    }
  };

  const getProfileData = (userId: number | null) => {
    if (selectedChatInfo) {
      if (selectedChatInfo.Type === "private") {
        if (selectedChatInfo && selectedChatInfo.members) {
          const member = selectedChatInfo.members.find(
            (m: any) => m.userId === userId
          );
          if (member) {
            selectedChatInfo.imageUrl = member.imageUrl;
            selectedChatInfo.chatName = member.name;
            return {
              id: member.userId,
              work: "University Student",
              phone: member.phone || "No phone",
              birthday: "Not available", // Not provided in API
              location: member.location || "No location",
              email: member.email || "No email",
            };
          }
        }
      } else if (selectedChatInfo.Type === "group") {
        return {
          id: "999999999",
          work: "Work Here",
          phone: "No phone",
          birthday: "Not available",
          location: "No location",
          email: "No email",
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
              if (
                data.message.userId !== userId ||
                data.message.senderId !== userId
              ) {
                playNotificationSound();
              }
              // Check if this message belongs to the currently selected chat
              if (data.chatId === selectedChatInfo.ChatID) {
                console.log(
                  "Message is for current chat:",
                  selectedChatInfo.ChatID
                );
                // Add message to the chat
                console.log("Adding message to chat:", data.message);

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
                  replyTo: data.message.replyTo || undefined,
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
                setChatList((prev) =>
                  prev.map((chat) => {
                    if (chat.chatId === data.chatId) {
                      return {
                        ...chat,
                        message: data.message.content,
                        time: new Date(
                          data.message.timestamp || Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                      };
                    }
                    return chat;
                  })
                );
              } else {
                console.log("Message is for a different chat");
                // Update unread count for chat in the list
                setChatList((prev) =>
                  prev.map((chat) => {
                    if (chat.chatId === data.chatId) {
                      return {
                        ...chat,
                        message: data.message.content,
                        time: new Date(
                          data.message.timestamp || Date.now()
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        }),
                        unread: (chat.unread || 0) + 1,
                      };
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
      let foundChat = params.get("chatId");
      if (foundChat) {
        let userSelect = "11111111";
        if (!foundChat.includes("group")) {
          userSelect = foundChat
            .split("-")
            .filter((id) => Number(id) !== userId)[0];
        }
        handleUserSelect(Number(userSelect), foundChat);
      }

      // Initialize WebSocket only once
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        wsRef.current = initializeWebSocket(userId);
      }

      // Fetch chat list
      fetchChatList(userId);
      setInterval(() => {
        fetchChatList(userId);
      }, 3000);

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
      //scrollToBottom();
    }
  }, [messages]);

  const userInfo = getProfileData(selectedUser);
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  const renderMessage = (msg: Message, isOwn: boolean) => {
    if (!msg) return null;

    const fileUrl = msg.attachmentUrl || "";
    const fileExtension = fileUrl.split(".").pop()?.toLowerCase() || "";
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
    const videoExtensions = ["mp4", "avi", "mov", "wmv", "flv", "mkv"];

    const renderReplyTo = () =>
      msg.replyTo && (
        <div
          className={`${
            isOwn ? "bg-blue-500" : "bg-gray-400"
          } p-2 rounded-sm border-l-[5px] border-[#4e4e4e] mb-2`}
        >
          <p className="text-sm font-medium">{msg.replyTo.senderName}</p>
          <p className="text-[13px] opacity-80">{msg.replyTo.content}</p>
        </div>
      );

    const renderReactions = () =>
      msg.reactions && msg.reactions.length > 0 ? (
        <div className="flex mt-1 gap-1">
          {msg.reactions.map((reaction: any, index: number) => (
            <span key={index} className="text-sm bg-gray-100 rounded-full px-2">
              {reaction.emoji}
            </span>
          ))}
        </div>
      ) : null;

    let mainContent: React.ReactNode = null;

    if (msg.type === "attachment" && msg.attachmentUrl) {
      if (imageExtensions.includes(fileExtension)) {
        mainContent = (
          <div className="flex flex-col">
            <Image
              src={fileUrl}
              alt="Image"
              width={200}
              height={150}
              className="rounded-lg mb-1"
            />
            {msg.content && <p className="mt-1">{msg.content}</p>}
          </div>
        );
      } else if (videoExtensions.includes(fileExtension)) {
        mainContent = (
          <div className="flex flex-col">
            <video
              src={fileUrl}
              controls
              muted
              className="rounded-lg mb-1"
              width={200}
              height={150}
            />
            {msg.content && <p className="mt-1">{msg.content}</p>}
          </div>
        );
      } else {
        const fileName = fileUrl.split("/").pop() || "File";
        let fileIcon = faFile;
        let bgColor = "bg-blue-100";
        let iconColor = "text-blue-500";

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

        mainContent = (
          <div className="flex flex-col">
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded-lg w-full">
              <div className="flex items-center gap-3">
                <div
                  className={`${bgColor} w-10 h-10 flex items-center justify-center rounded-lg`}
                >
                  <FontAwesomeIcon
                    icon={fileIcon}
                    className={iconColor}
                    size="lg"
                  />
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium max-w-[400px] line-clamp-2">
                    {fileName}
                  </p>
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
          </div>
        );
      }
    } else if (msg.type === "image") {
      mainContent = (
        <div className="flex flex-col">
          <Image
            src={msg.content || msg.attachmentUrl || ""}
            alt="Image"
            width={200}
            height={150}
            className="rounded-lg mb-1"
          />
          {msg.caption && <p>{msg.caption}</p>}
        </div>
      );
    } else {
      const content = msg.content || "";
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

      mainContent = (
        <p>
          {delim.map((text, idx) => {
            if (!text.isURL) return text.content;
            return (
              <Link
                className={`${
                  isOwn ? "text-white" : "text-blue-500"
                } underline`}
                href={text.content}
                target="_blank"
                key={`text-content-${idx}`}
              >
                {text.content}
              </Link>
            );
          })}
        </p>
      );
    }

    return (
      <div>
        {renderReplyTo()}
        {mainContent}
        {renderReactions()}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setSearchResult([]);
        setShowSearch(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const searchPeople = async (searhTerm: string, userId: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    if (!searchTerm.trim()) return;
    try {
      const response = await fetch(
        `${apiBaseUrl}/chat/search?userId=${userId}&query=${searhTerm}`
      );
      const data = await response.json();
      if (data) {
        setSearchResult(data.data);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };
  useEffect(() => {
    if (!userId) return;

    if (searchTerm.trim()) {
      searchPeople(searchTerm, userId);
    } else {
      setSearchResult([]);
    }
  }, [searchTerm, userId]);

  return (
    <div className="grid grid-cols-9 gap-2 h-screen">
      <div className="col-span-2 border-1 bg-white rounded-xl max-h-screen overflow-y-auto scrollbar-hide">
        <div ref={searchRef} className="sticky top-0 z-10 px-4 bg-white">
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-[32px]">{t("Messages")}</h1>
            <div className="bg-customPurple rounded-full w-[30px] h-[30px] flex items-center justify-center">
              <p className="text-white text-[16px]">{chatList.length}</p>
            </div>
          </div>

          <div className="py-2 ">
            <Input
              labelPlacement="outside"
              placeholder="Search message, people"
              type="text"
              startContent={
                <Image src={SearchIcon} width={24} height={24} alt="Search" />
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSearch(true)}
            />
          </div>
          {showSearch && (
            <div className="px-4 w-full h-screen bg-white absolute top-24 right-0 z-50 overflow-auto">
              <h1 className="pl-4 pt-4 text-lg font-bold text-black">All</h1>
              {(searchTerm.trim() ? searchResult : chatList).map(
                (item, index) => {
                  const isSearchResult = !!searchTerm.trim();
                  const userId = isSearchResult ? item.otherUserId : item.id;
                  const chatId = item.chatId || item.ChatID;
                  return (
                    <div
                      key={index}
                      className="flex flex-row items-center w-full gap-2 bg-transparent p-2 hover:bg-customPurple/20 rounded-lg transition-colors duration-200 cursor-pointer"
                      onClick={() => handleUserSelect(userId, chatId)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          () => handleUserSelect(item.id, item.chatId || "");
                        }
                      }}
                    >
                      <Image
                        src={item.image || item.imageUrl || noUserImage}
                        alt="People 01"
                        width={48}
                        height={48}
                        className="w-[48px] h-[48px] rounded-full flex-shrink-0"
                      />
                      <div className="flex flex-row justify-between w-full min-w-0">
                        <p className="text-sm font-medium text-black truncate">
                          {item.name || item.chatName}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

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
        {selectedChatInfo && selectedChatInfo.Type === "private" ? (
          <SingleChat
            selectedChatInfo={selectedChatInfo}
            chatList={chatList}
            messageContainerRef={chatRef}
            selectedUser={selectedUser}
            messages={messages}
            userId={userId}
            messageMenuId={messageMenuId}
            setMessageMenuId={setMessageMenuId}
            setSelectedImage={setSelectedImage}
            dropdownRef={dropdownRef}
            messagesEndRef={messagesEndRef}
            selectedImage={selectedImage}
            attachmentPreview={attachmentPreview}
            removeAttachmentPreview={removeAttachmentPreview}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            setShowEmojiPicker={setShowEmojiPicker}
            showEmojiPicker={showEmojiPicker}
            handleEmojiClick={handleEmojiClick}
            handleFileSelect={handleFileSelect}
            handleFileInputChange={handleFileInputChange}
            fileInputRef={fileInputRef}
            renderMessage={renderMessage}
            onEmojiClick={handleEmojiClick}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            setForwardMessage={setForwardMessage}
            forwardMessage={forwardMessage}
          />
        ) : (
          <GroupChat
            selectedChatInfo={selectedChatInfo}
            chatList={chatList}
            messageContainerRef={chatRef}
            selectedUser={selectedUser}
            messages={messages}
            userId={userId}
            messageMenuId={messageMenuId}
            setMessageMenuId={setMessageMenuId}
            setSelectedImage={setSelectedImage}
            dropdownRef={dropdownRef}
            messagesEndRef={messagesEndRef}
            selectedImage={selectedImage}
            attachmentPreview={attachmentPreview}
            removeAttachmentPreview={removeAttachmentPreview}
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            handleSendMessage={handleSendMessage}
            setShowEmojiPicker={setShowEmojiPicker}
            showEmojiPicker={showEmojiPicker}
            handleEmojiClick={handleEmojiClick}
            handleFileSelect={handleFileSelect}
            handleFileInputChange={handleFileInputChange}
            fileInputRef={fileInputRef}
            renderMessage={renderMessage}
            onEmojiClick={handleEmojiClick}
            replyMessage={replyMessage}
            setReplyMessage={setReplyMessage}
            setForwardMessage={setForwardMessage}
            forwardMessage={forwardMessage}
          />
        )}
        {/*        */}
      </div>
      <div className="col-span-2 w-full h-screen ">
        {selectedChatInfo && (
          <div className="">
            <div className="px-2">
              <Card className="h-[413px] w-full bg-white rounded-xl p-2 mb-2">
                <div className="flex flex-col items-center gap-3 justify-center mt-4">
                  <Image
                    src={selectedChatInfo.imageUrl || noUserImage}
                    width={64}
                    height={64}
                    alt="Participant"
                    className="w-[64px] h-[64px] rounded-full"
                  />
                  <h1 className="text-2xl">
                    {selectedChatInfo.chatName || "Chat"}
                  </h1>
                </div>
                {userInfo && (
                  <>
                    {selectedChatInfo?.Type === "group" ? (
                      <>
                        <div className="px-4 py-8 flex flex-col gap-3">
                          <div
                            className={`cursor-pointer hover:text-blue-600 transition-colors flex items-center gap-2`}
                            onClick={() => setIsOpenModalChangeGroupName(true)}
                          >
                            <FontAwesomeIcon
                              icon={faEdit}
                              className="w-5 h-5 pl-1"
                            />
                            <p className={``}>Change group name</p>
                          </div>
                          <UserInfoItem
                            icon={PlusIcon}
                            text="Add new member"
                            altText="Add new member"
                            className="cursor-pointer hover:text-blue-600 transition-colors"
                            onClick={() => setIsNewMemberModalOpen(true)}
                          />

                          {memberRole !== "owner" && (
                            <div
                              className={`cursor-pointer text-base text-red-600 flex items-center gap-2`}
                              onClick={() => setisConfirmation(true)}
                            >
                              <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className="w-5 h-5 pl-1"
                              />
                              <p className={``}>Leave group</p>
                            </div>
                          )}
                          {memberRole === "owner" && (
                            <UserInfoItem
                              icon={BlockIcon}
                              text="Disband group"
                              altText="Disband group"
                              textStyle="text-base text-red-600"
                              className="cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => setisDisbandConfirmation(true)}
                            />
                          )}
                        </div>
                      </>
                    ) : (
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
                          className="cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => setIsModalOpen(true)}
                        />
                        <UserInfoItem
                          icon={BlockIcon}
                          text="Block"
                          altText="Block"
                          textStyle="text-base text-red-600"
                        />
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>

            <RenderMedia
              isConfirmation={setisConfirmation}
              currentUserId={Number(userId)}
              members={listMembers}
              currentChat={selectedChatInfo}
              requestObject={setReqObj}
              data={extractLists(messages)}
            />
          </div>
        )}
      </div>
      {isModalOpen && (
        <AddGroupModal
          selectedUser={userInfo?.id.toString()}
          onClose={() => setIsModalOpen(false)}
        />
      )}
      {isNewMemberModalOpen && (
        <AddNewMemberModal
          selectedChatInfo={selectedChatInfo}
          getChatFunc={fetchChatInfo}
          selectedUser={""}
          onClose={() => setIsNewMemberModalOpen(false)}
        />
      )}
      {isConfirmation && (
        <ConfirmationModel
          listChatFunc={() => fetchChatList(userId || "")}
          chatFunc={setSelectedChatInfo}
          getChatFunc={fetchChatInfo}
          selectedChatInfo={selectedChatInfo}
          selectedUser={userId}
          onClose={() => setisConfirmation(false)}
          requestObject={reqObj}
        />
      )}
      {isDisbandConfirmation && (
        <LeaveGroupConfirmationModel
          listChatFunc={() => fetchChatList(userId || "")}
          chatFunc={setSelectedChatInfo}
          selectedChatInfo={selectedChatInfo}
          selectedUser={userId}
          onClose={() => setisDisbandConfirmation(false)}
        />
      )}
      <audio ref={notificationSoundRef} src="/noti.mp3" preload="auto" />
      <ChangeGroupNameModal
        currentName={selectedChatInfo?.ChatName}
        open={isOpenModalChangeGroupName}
        onClose={() => setIsOpenModalChangeGroupName(false)}
        onSubmit={handleChangeGroupName}
      />
    </div>
  );
}

export default Home;
