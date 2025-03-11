import Image from "next/image";
import { ProfileInfoItemProps } from "../constant/type";

const UserInfoItem = ({
  icon,
  text,
  altText,
  textStyle = "text-base",
}: ProfileInfoItemProps) => (
  <div className="flex items-center gap-2">
    <Image src={icon} width={24} height={24} alt={altText} />
    <p className={textStyle}>{text}</p>
  </div>
);

export default UserInfoItem;
