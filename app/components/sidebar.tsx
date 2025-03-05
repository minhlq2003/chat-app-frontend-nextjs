"use client";
import Link from "next/link";
import { LogoIcon, SettingIcon } from "../constant/image";
import IconButton from "./IconButton";
import { SidebarIconData } from "../constant/data";
import { usePathname } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex flex-col items-center justify-between py-5 h-screen bg-white rounded-xl">
      <Link href="/">
        <IconButton
          icon={LogoIcon}
          iconName="Logo"
          iconWidth={60}
          iconHeight={60}
        />
      </Link>
      <div className="flex flex-col gap-3">
        {SidebarIconData.map((item) => (
          <Link href={item.href} key={item.iconName}>
            <IconButton
              icon={item.icon}
              iconName={item.iconName}
              iconHeight={item.iconHeigh}
              iconWidth={item.iconWidth}
              href={item.href}
              className={`w-[46px] h-[46px] hover:bg-custompurple/50 ${
                pathname === item.href ? "bg-custompurple/50" : ""
              }`}
            />
          </Link>
        ))}
      </div>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <div>
            <IconButton
              icon={SettingIcon}
              iconName="Setting"
              iconHeight={24}
              iconWidth={24}
              className="w-[46px] h-[46px] hover:bg-custompurple/50"
            />
          </div>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key="vi">Tieng Viet</DropdownItem>
          <DropdownItem key="en">English</DropdownItem>
          <DropdownItem key="dark">
            Darkmode
          </DropdownItem>
          <DropdownItem key="light">
            Lightmode
          </DropdownItem>
          <DropdownItem
            key="change_account"
            className="text-red-600"
            color="danger"
          >
            Change Account
          </DropdownItem>
          <DropdownItem key="logout" className="text-red-600" color="danger">
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
