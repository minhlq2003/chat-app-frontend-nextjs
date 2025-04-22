import Image from "next/image";
import React from "react";
import IconButton from "./IconButton";
import {
  CallIcon,
  EmojiIcon,
  FileSendIcon,
  MicroIcon,
  PinIcon,
  SearchIcon,
  SendIcon,
} from "@/constant/image";
import { faFile, faFileWord } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Input } from "@nextui-org/react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";

const SingleChat = ({
  selectedChatInfo,
  chatList,
  messageContainerRef,
  selectedUser,
  messages,
  userId,
  messageMenuId,
  setMessageMenuId,
  setSelectedImage,
  dropdownRef,
  messagesEndRef,
  selectedImage,
  attachmentPreview,
  removeAttachmentPreview,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  setShowEmojiPicker,
  showEmojiPicker,
  handleEmojiClick,
  handleFileSelect,
  handleFileInputChange,
  fileInputRef,
  renderMessage,
}: {
  selectedChatInfo: any;
  chatList: any;
  messageContainerRef: React.RefObject<HTMLDivElement | null>;
  selectedUser: number | null;
  messages: any[];
  userId: string | null;
  messageMenuId: string | object | boolean | null;
  setMessageMenuId: React.Dispatch<
    React.SetStateAction<string | object | boolean | null>
  >;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  selectedImage: string | null;
  attachmentPreview: string | null;
  removeAttachmentPreview: () => void;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: () => void;
  setShowEmojiPicker: React.Dispatch<React.SetStateAction<boolean>>;
  showEmojiPicker: boolean;
  onEmojiClick: (emojiData: EmojiClickData) => void;
  handleEmojiClick: (emojiData: EmojiClickData) => void;
  handleFileSelect: () => void;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  renderMessage: (msg: any, isOwn: boolean) => React.ReactNode;
}) => {
  return (
    <div>
      {selectedChatInfo ? (
        <div className="flex flex-col justify-between h-screen">
          <div>
            <div className="flex items-center justify-between border-b-2 p-4">
              <div className="flex items-center gap-10">
                <Image
                  src={selectedChatInfo.imageUrl || `https://cnm-chatapp-bucket.s3.ap-southeast-1.amazonaws.com/ud3x-1745220840806-no-avatar.png`}
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
                    chatList.find((chat: any) => chat.id === selectedUser)?.pin
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
              ref={messageContainerRef}
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
                        {renderMessage(msg, isOwn)}
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

                        if (["doc", "docx"].includes(fileExtension as string)) {
                          fileIcon = faFileWord;
                          bgColor = "bg-blue-100";
                          iconColor = "text-blue-500";
                        } else if (["pdf"].includes(fileExtension as string)) {
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
  );
};

export default SingleChat;
