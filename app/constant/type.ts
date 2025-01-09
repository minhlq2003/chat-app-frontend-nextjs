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
/* export const defaultFormSignUpData: FormSignUpData = {
  name: "",
  phone: "",
  password: "",
  confirmPassword: "",
}; */

export interface FormSignUpErrors {
  name: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

/* export const defaultFormSignUpErrors: FormSignUpErrors = {
  name: "",
  phone: "",
  password: "",
  confirmPassword: "",
}; */
