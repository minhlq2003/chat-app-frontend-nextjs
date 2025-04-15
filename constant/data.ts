import {
  ChatIcon,
  ContactIcon,
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

export const listFriends: Friend[] = [
  {
    id: 1,
    name: "Andian Guy",
    status: "Hello, I'm Indian Guy",
    phone: "09010000",
    avatar: "/avatar1.jpg",
  },
  {
    id: 2,
    name: "Ahite Guy",
    status: "Hi, I'm a designer",
    phone: "09010000",
    avatar: "/avatar2.jpg",
  },
  {
    id: 3,
    name: "Black Guy",
    status: "If you want to have fun, add friend me",
    phone: "09010000",
    avatar: "/avatar3.jpg",
  },
  {
    id: 4,
    name: "Charlie Guy",
    status: "Let's go",
    phone: "09010000",
    avatar: "/avatar4.jpg",
  },
  {
    id: 5,
    name: "Bella Friend",
    status: "B for bestie",
    phone: "09010000",
    avatar: "/avatar5.jpg",
  },
  {
    id: 6,
    name: "Diana King",
    status: "Enjoying life one step at a time",
    phone: "09010001",
    avatar: "/avatar6.jpg",
  },
  {
    id: 7,
    name: "Ethan Cool",
    status: "Code. Sleep. Repeat.",
    phone: "09010002",
    avatar: "/avatar7.jpg",
  },
  {
    id: 8,
    name: "Fiona Smile",
    status: "Happiness is the key",
    phone: "09010003",
    avatar: "/avatar8.jpg",
  },
  {
    id: 9,
    name: "George Hill",
    status: "Adventure lover",
    phone: "09010004",
    avatar: "/avatar9.jpg",
  },
  {
    id: 10,
    name: "Hanna Brave",
    status: "Dream big",
    phone: "09010005",
    avatar: "/avatar10.jpg",
  },
  {
    id: 11,
    name: "Ivy Grace",
    status: "Stay kind",
    phone: "09010006",
    avatar: "/avatar11.jpg",
  },
  {
    id: 12,
    name: "Jack Rock",
    status: "Guitar is my soul",
    phone: "09010007",
    avatar: "/avatar12.jpg",
  },
  {
    id: 13,
    name: "Karen Nice",
    status: "Let’s connect!",
    phone: "09010008",
    avatar: "/avatar13.jpg",
  },
  {
    id: 14,
    name: "Liam Star",
    status: "On top of the world",
    phone: "09010009",
    avatar: "/avatar14.jpg",
  },
  {
    id: 15,
    name: "Mia Light",
    status: "Peaceful mind",
    phone: "09010010",
    avatar: "/avatar15.jpg",
  },
];

export const groupedFriends = {
  A: listFriends,
  B: listFriends,
  C: listFriends,
};
