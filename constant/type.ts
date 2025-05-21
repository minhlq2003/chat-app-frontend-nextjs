import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { StaticImageData } from "next/image";

export interface InputFieldProps {
  isEditable?: boolean;
  storageKey?: string;
  image?: StaticImageData;
  icon?: IconProp;
  type: string;
  placeholder?: string;
  password?: boolean;
  error?: string;
  errorClassname?: string;
  value?: string;
  textClassname?: string;
  onFocus?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconClassName?:string
}

export interface FormLoginData {
  phone: string;
  password: string;
}
export interface FormSignUpData {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface FormSignUpErrors {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface FormSuccessErrors {
  name: string;
  phone: string;
  password: string;
  birthday: string;
}

export interface IconButtonProps {
  icon: StaticImageData;
  iconWidth: number;
  iconHeight: number;
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
  pathname?: string;
}

export interface ChatItemProps {
  Status: string;
  Type: string;
  id: number;
  image: StaticImageData;
  name: string;
  message: string;
  time: string;
  unread: number;
  pin: boolean;
  type?: string;
  chatId?: string; // Added chatId property
}

export interface ChatListProps {
  chatList: ChatItemProps[];
  filterType?: string;
  pin?: boolean;
}

export interface ProfileInfoItemProps {
  icon: StaticImageData;
  text: string;
  altText: string;
  textStyle?: string;
  className?: string;
  onClick?: () => void;
}

export interface TemporaryUserProps {
  id: number;
  name: string;
  password: string;
  phone: string;
  image: null | string | StaticImageData;
  location: null | string;
  birthday: null | Date;
  email: string;
  gender?: string;
  work?: string;
}

export interface Friend {
  contactId: string;
  imageUrl: string;
  location: string | "No location set";
  id: number;
  name: string;
  status: string;
  phone: string;
  avatar: string;
}

export interface MessagePayLoad {
  messageId?: number;
  userId?: number;
  type?: string;
  timestamp?: string;
  content?: string;
  attachmentUrl?: string | null;
  deleteReason?: string | null;
  senderName?: string;
  senderImage?: string;
  reactions?: string[];
  senderId?: string;
  replyTo?: number;
  caption?: string;
}

export interface Message {
  messageId?: number;
  userId?: number;
  type?: string;
  timestamp?: string;
  content?: string;
  attachmentUrl?: string | null;
  deleteReason?: string | null;
  senderName?: string;
  senderImage?: string;
  reactions?: string[];
  senderId?: string;
  replyTo?: Message;
  caption?: string;
}

export interface GroupChat {
  Status: string;
  ChatID: string;
  chatId: string;
  chatName: string;
  imageUrl?: string;
  Type?: string;
  members: {
    userId: number;
    name: string;
    imageUrl?: string;
    phone?: string;
    email?: string;
    location?: string;
  }[];
  latestMessage?: {
    content: string;
    timestamp: string;
    senderName: string;
  };
}

export interface MembersGroupChat {
  userId: number;
  role: string;
  name: string;
  imageUrl?: string;
}
