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

const Sidebar = () => {
  const { t, i18n } = useTranslation("common");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLang =
    searchParams.get("lang") || localStorage.getItem("lang") || "en";
/*  console.log("i18n language:", i18n.language);
  console.log("i18n namespace:", i18n.options.ns);
  console.log("i18n resources:", i18n.options.resources);*/

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
              className={`w-[46px] h-[46px] hover:bg-customPurple/50 ${
                pathname === item.href ? "bg-customPurple/50" : ""
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
              className="w-[46px] h-[46px] hover:bg-customPurple/50"
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
            onPress={()=>router.push('/password/changepassword')}
          >
            {t("Change Password")}
          </DropdownItem>
            <DropdownItem key="logout" className="text-red-600" color="danger" onPress={() => {
                localStorage.removeItem("user");
                logout()
            }}>
            {t("Logout")}
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default Sidebar;
