"use client";

import React, { useEffect, useRef, useState, Dispatch } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faLink } from "@fortawesome/free-solid-svg-icons";
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { MembersGroupChat } from "@/constant/type";

const roleLabel = {
  owner: "Trưởng nhóm",
  admin: "Phó nhóm",
  member: "",
};

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return { icon: faFilePdf, color: "bg-red-200 text-red-500" };
    case "doc":
    case "docx":
      return { icon: faFileWord, color: "bg-blue-200 text-blue-500" };
    case "xls":
    case "xlsx":
      return { icon: faFileExcel, color: "bg-green-200 text-green-500" };
    default:
      return { icon: faFileAlt, color: "bg-gray-200 text-gray-500" };
  }
}

export default function RenderMedia({
  data,
  members,
  currentUserId,
  isConfirmation,
  currentChat,
  requestObject,
}: {
  data: any;
  members: MembersGroupChat[];
  currentUserId: number;
  isConfirmation: Dispatch<any>;
  currentChat: any;
  requestObject: Dispatch<any>;
}) {
  const { imageList, linkList, fileList } = data;

  const [memberAction, setMemberAction] = useState<number | null>(null);
  const yourRole = members.find((m) => m.userId === currentUserId)?.role;
  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleActionClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    setMemberAction((prev) => (prev === userId ? null : userId));
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setMemberAction(null);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const listLink = linkList.map((msg: any) => ({
    id: msg.messageId,
    title: msg.content.slice(0, 30),
    url:
      msg.content.match(/https?:\/\/[\w\-._~:/?#\[\]@!$&'()*+,;=.]+/)?.[0] ||
      "#",
    thumbnail: msg.senderImage,
    date: new Date(msg.timestamp).toLocaleDateString("en-GB"),
  }));

  const getFileType = (url: string) =>
    url.split(".").pop()?.toLowerCase() || "unknown";

  const files = fileList.map((msg: any) => ({
    url: msg.attachmentUrl,
    name: msg.attachmentUrl?.split("/").pop() || "Unknown file",
    size: "5mb",
    type: getFileType(msg.attachmentUrl!),
  }));

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        title: "text-xl",
        content: "max-h-60 overflow-y-auto",
      }}
    >
      {currentChat.Type === "group" ? (
        <AccordionItem key="1" aria-label="Members" title="Members">
          <ul className="flex flex-col gap-3 max-h-[270px] ">
            {members.map((member) => (
              <li
                key={member.userId}
                className="flex items-center justify-between gap-3 group relative"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.imageUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-white"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {member.userId === currentUserId ? "Bạn" : member.name}
                    </span>
                    {member.role && (
                      <span className="text-sm text-gray-400">
                        {roleLabel[member.role as keyof typeof roleLabel]}
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative">
                  {(member.userId === currentUserId ||
                    yourRole === "owner" ||
                    yourRole === "admin") && (
                    <button
                      onClick={(e) => handleActionClick(e, member.userId)}
                      className={`${
                        memberAction === member.userId
                          ? "group-hover:hidden"
                          : "group-hover:flex"
                      } bottom-0 w-8 h-8 rounded-full hover:bg-gray-200 hidden items-center justify-center z-10`}
                    >
                      <span className="text-xs">●●●</span>
                    </button>
                  )}

                  {memberAction === member.userId && (
                    <div
                      ref={menuRef}
                      className="absolute bottom-0 z-[90] right-0 bg-white rounded shadow-lg w-48 text-black"
                    >
                      {member.userId === currentUserId ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            isConfirmation(true);
                            console.log("Leave Group clicked");
                          }}
                          className="block w-full text-left text-red-600 hover:bg-gray-100 px-4 py-2"
                        >
                          Leave Group
                        </button>
                      ) : (
                        <>
                          {yourRole === "owner" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestObject({
                                  operation: "/member/role",
                                  object: {
                                    chatId: currentChat.ChatID,
                                    userId: currentUserId,
                                    memberToChangeId: member.userId,
                                    newRole: "admin",
                                  },
                                });
                                isConfirmation(true);
                                console.log("Set Admin role clicked");
                              }}
                              className="block w-full text-left hover:bg-gray-100 px-4 py-2"
                            >
                              Promote to Admin
                            </button>
                          )}
                          {member.role !== "owner" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                requestObject({
                                  operation: "/member/remove",
                                  object: {
                                    chatId: currentChat.ChatID,
                                    userId: currentUserId,
                                    memberToRemoveId: member.userId,
                                  },
                                });
                                isConfirmation(true);
                                console.log("Remove From Group clicked");
                              }}
                              className="block w-full text-left text-red-600 hover:bg-gray-100 px-4 py-2"
                            >
                              Remove From Group
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}
      <AccordionItem key="2" aria-label="Image" title="Image">
        <div className="grid grid-cols-3 gap-2">
          {imageList.map((img: any, index: number) => (
            <img
              key={index}
              src={img.attachmentUrl}
              alt={`image-${index}`}
              className="rounded-lg w-full object-cover aspect-square"
            />
          ))}
        </div>
      </AccordionItem>

      <AccordionItem key="3" aria-label="Link" title="Link">
        <div className="space-y-4">
          {listLink.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faLink} />
                <a
                  href={item.url}
                  className="text-blue-600 hover:underline text-sm"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.url}
                </a>
              </div>
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem key="4" aria-label="File" title="File">
        <div className="flex flex-col gap-2">
          {files.map((file: any, idx: any) => {
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
                      className="text-white"
                    />
                  </div>
                  <p className="text-sm font-medium break-all text-black">
                    {file.name}
                  </p>
                </div>
                <a
                  href={file.url}
                  className="bg-indigo-100 p-2 rounded-full text-indigo-500 hover:bg-indigo-200 cursor-pointer"
                >
                  <FontAwesomeIcon icon={faDownload} />
                </a>
              </div>
            );
          })}
        </div>
      </AccordionItem>
    </Accordion>
  );
}
