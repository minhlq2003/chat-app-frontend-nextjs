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
  href?:string;
  pathname?:string
}

