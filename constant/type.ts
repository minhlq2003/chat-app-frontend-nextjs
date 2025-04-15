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
  id: number;
  name: string;
  status: string;
  phone: string;
  avatar: string;
}

export interface Message {
  messageId?: number;
  userId?: number;
  type?: string;
  timestamp?: Date;
  content?: string;
  attachmentUrl?: string | null;
  deleteReason?: string | null;
  senderName?: string;
  senderImage?: string;
  reactions?: string[];
}
