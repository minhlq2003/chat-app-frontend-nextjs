import { StaticImageData } from "next/image";

export interface InputFieldProps {
  image: StaticImageData;
  placeholder: string;
  password?: boolean;
  error?: string;
  onFocus?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
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