import Image from "next/image";
import { ProfileInfoItemProps } from "../constant/type";
import { twMerge } from "tailwind-merge";

const UserInfoItem = ({
  icon,
  text,
  altText,
  textStyle = "text-base",
  className,
  onClick = () => {},
}: ProfileInfoItemProps) => (
  <div className={twMerge("flex items-center gap-2", className)} onClick={onClick}>
    <Image src={icon} width={24} height={24} alt={altText} />
    <p className={textStyle}>{text}</p>
  </div>
);

export default UserInfoItem;
