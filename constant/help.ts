import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import { Message } from "./type";

export const getFileIcon = (type: string) => {
  switch (type) {
    case "pdf":
      return { icon: faFilePdf, color: "text-[#c13011] bg-[#c13011]" };
    case "word":
      return { icon: faFileWord, color: "text-blue-400 bg-blue-100" };
    case "excel":
      return { icon: faFileExcel, color: "text-[#4e9847] bg-[#4e9847]" };
    default:
      return { icon: faFile, color: "text-gray-400" };
  }
};

type Lists = {
  imageList: Message[];
  fileList: Message[];
  linkList: Message[];
};

export function extractLists(messages: Message[]): Lists {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const fileExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".xls",
    ".xlsx",
    ".zip",
    ".rar",
    ".txt",
    ".bin",
    ".cmd",
    ".exe",
  ];

  const imageList: Message[] = [];
  const fileList: Message[] = [];
  const linkList: Message[] = [];

  for (const msg of messages) {
    const url = msg.attachmentUrl?.toLowerCase() || "";

    if (url && imageExtensions.some((ext) => url.endsWith(ext))) {
      imageList.push(msg);
    } else if (url && fileExtensions.some((ext) => url.endsWith(ext))) {
      fileList.push(msg);
    }

    if (
      msg.type === "text" &&
      /(https?:\/\/[^\s]+)/gi.test(msg.content || "")
    ) {
      linkList.push(msg);
    }
  }

  return { imageList, fileList, linkList };
}
