import {
  ChatIcon,
  ContactIcon,
  imgTest,
  People01,
  People02,
  People03,
  ProfileIcon,
} from "./image";
import { Friend } from "./type";

export const SidebarIconData = [
  {
    icon: ChatIcon,
    iconName: "Chat",
    iconWidth: 24,
    iconHeigh: 24,
    href: "/",
  },
  {
    icon: ContactIcon,
    iconName: "Contact",
    iconWidth: 24,
    iconHeigh: 24,
    href: "/contact",
  },
  {
    icon: ProfileIcon,
    iconName: "Profile",
    iconWidth: 24,
    iconHeigh: 24,
    href: "/profile",
  },
];


export const imageData = [
  {
    date: "2024-12-01",
    images: [imgTest, imgTest, imgTest, imgTest, imgTest, imgTest],
  },
  {
    date: "2024-11-01",
    images: [imgTest, imgTest, imgTest, imgTest, imgTest, imgTest],
  },
];

export const fileList = [
  {
    name: "a.pdf",
    size: "5mb",
    type: "pdf",
  },
  {
    name: "a.docx",
    size: "200mb",
    type: "word",
  },
  {
    name: "a.xxl",
    size: "5mb",
    type: "excel",
  },
  {
    name: "b.pdf",
    size: "5mb",
    type: "pdf",
  },
  {
    name: "b.file",
    size: "5mb",
    type: "file",
  },
];

export const listLink = [
  {
    id: 1,
    title: "Animation video",
    url: "http://..........",
    date: "12/02",
    thumbnail: "https://i.imgur.com/YhIhK7I.png",
  },
  {
    id: 2,
    title: "Animation video",
    url: "http://..........",
    date: "12/02",
    thumbnail: "https://i.imgur.com/YhIhK7I.png",
  },
];

export const friendRequests = {
  received: [
    {
      id: 1,
      name: "Thọ Simon",
      date: "25/03",
      source: "Từ nhóm trò chuyện",
      avatar: "https://i.pravatar.cc/150?img=3",
      message:
        "Hi, my name is Thọ Simon. We know each other through common group. Please accept my request!",
    },
    {
      id: 2,
      name: "Hồng Tiến",
      date: "24/03",
      source: "Từ danh thiếp",
      avatar: "",
      message:
        "Xin chào, mình là Hồng Tiến. Mình biết bạn qua Hồ Như Nguyên giới thiệu.",
    },
    {
      id: 3,
      name: "Bảo Anh",
      date: "06/03",
      source: "Từ số điện thoại",
      avatar: "https://i.pravatar.cc/150?img=4",
      message: "Xin chào, mình là Bảo Anh. Kết bạn với mình nhé!",
    },
  ],
  sent: [
    {
      id: 4,
      name: "Ngọc",
      date: "Gửi lời mời",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
  ],
  suggestions: [
    { id: 5, name: "Trịnh Ngọc Thái", commonGroups: 11 },
    { id: 6, name: "Nguyễn Văn", commonGroups: 2 },
    { id: 7, name: "Minh Triệu", commonGroups: 9 },
    { id: 8, name: "Võ Minh Thịnh", commonGroups: 6 },
    { id: 9, name: "Long", commonGroups: 4 },
    { id: 10, name: "Hoàng Huy", commonGroups: 2 },
    { id: 11, name: "Thành Lương", commonGroups: 4 },
    { id: 12, name: "Trịnh Ngô", commonGroups: 2 },
    { id: 13, name: "Pp", commonGroups: 2 },
  ],
};
