"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faLink } from "@fortawesome/free-solid-svg-icons";
import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { url } from "inspector";

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

export default function RenderMedia({ data }: { data: any }) {
  const { imageList, linkList, fileList } = data;

  const listLink = linkList.map((msg: { messageId: any; content: { slice: (arg0: number, arg1: number) => any; match: (arg0: RegExp) => any[]; }; senderImage: any; timestamp: string | number | Date; }) => ({
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

  const files = fileList.map((msg: { attachmentUrl: string; }) => ({
    url: msg.attachmentUrl,
    name: msg.attachmentUrl?.split("/").pop() || "Unknown file",
    size: "5mb",
    type: getFileType(msg.attachmentUrl!),
  }));

  //console.log("Files", files);

  return (
    <Accordion
      variant="splitted"
      itemClasses={{
        title: "text-xl",
        content: "max-h-60 overflow-y-auto ",
      }}
    >
      <AccordionItem key="1" aria-label="Image" title="Image">
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

      <AccordionItem key="2" aria-label="Link" title="Link">
        <div className="space-y-4">
          {listLink.map((item: { id: React.Key | null | undefined; url: string | undefined; }) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faLink} />
                <div>
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
            </div>
          ))}
        </div>
      </AccordionItem>

      <AccordionItem key="3" aria-label="File" title="File">
        <div className="flex flex-col gap-2">
          {files.map((file: { type: string; name: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | Iterable<React.ReactNode> | null | undefined; url: string | undefined; }, idx: React.Key | null | undefined) => {
            //console.log("File", file);

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
                  <div>
                    <p className="text-sm font-medium text-black">
                      {file.name}
                    </p>
                  </div>
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
