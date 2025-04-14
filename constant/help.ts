import {
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFile,
} from "@fortawesome/free-solid-svg-icons";

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
