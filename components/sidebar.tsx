"use client";
import Link from "next/link";
import { LogoIcon, SettingIcon } from "../constant/image";
import IconButton from "./IconButton";
import { SidebarIconData } from "../constant/data";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { logout } from "@/lib/actions/auth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faGear,
  faIdBadge,
  faMessage,
} from "@fortawesome/free-solid-svg-icons";
const Sidebar = () => {
  const { t, i18n } = useTranslation("common");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLang =
    searchParams.get("lang") || localStorage.getItem("lang") || "en";
  const changeLanguage = (newLang: string) => {
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);

    const params = new URLSearchParams(searchParams);
    params.set("lang", newLang);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    localStorage.setItem("lang", currentLang);
    i18n.changeLanguage(currentLang);
  }, [currentLang]);
  const SidebarIconData = [
    {
      icon: faMessage,
      iconName: "Chat",
      iconWidth: 24,
      iconHeigh: 24,
      href: "/",
    },
    {
      icon: faAddressBook,
      iconName: "Contact",
      iconWidth: 24,
      iconHeigh: 24,
      href: "/contact",
    },
    {
      icon: faIdBadge,
      iconName: "Profile",
      iconWidth: 24,
      iconHeigh: 24,
      href: "/profile",
    },
  ];
  return (
    <div className="flex flex-col items-center justify-between py-5 h-screen bg-white rounded-xl">
      <Link
        href="/"
        className="w-[120px] h-[120px] flex items-center justify-center rounded-full bg-customPurple/10"
      >
        <FontAwesomeIcon
          icon={faMessage}
          width={60}
          height={60}
          className="size-10 text-customPurple"
        />
      </Link>
      <div className="flex flex-col gap-3">
        {SidebarIconData.map((item, index) => (
          <Link
            href={item.href}
            key={index}
            className={`w-[46px] h-[46px] flex items-center justify-center rounded-full bg-customPurple/10 hover:bg-customPurple/50 ${
              pathname === item.href ? "bg-customPurple/50" : ""
            }`}
          >
            <FontAwesomeIcon
              icon={item.icon}
              width={24}
              height={24}
              className="size-5"
            />
          </Link>
        ))}
      </div>
      <Dropdown placement="bottom-end">
        <DropdownTrigger>
          <div className="w-[46px] h-[46px] flex items-center justify-center rounded-full bg-customPurple/10 hover:bg-customPurple/50">
            <FontAwesomeIcon
              icon={faGear}
              width={24}
              height={24}
              className="size-5"
            />
          </div>
        </DropdownTrigger>
        <DropdownMenu>
          <DropdownItem key="vi">
            <div onClick={() => changeLanguage("vi")}>{t("Vietnamese")}</div>
          </DropdownItem>
          <DropdownItem key="en">
            <div onClick={() => changeLanguage("en")}>{t("English")}</div>
          </DropdownItem>
          <DropdownItem key="dark">Darkmode</DropdownItem>
          <DropdownItem key="light">Lightmode</DropdownItem>
          <DropdownItem
            key="change_account"
            className="text-red-600"
            color="danger"
            onPress={() => router.push("/password/changepassword")}
          >
            {t("Change Password")}
          </DropdownItem>
          <DropdownItem
            key="logout"
            className="text-red-600"
            color="danger"
            onPress={() => {
              localStorage.removeItem("user");
              logout();
            }}
          >
            {t("Logout")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
