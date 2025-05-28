"use client";
import React, { useEffect, useState } from "react";
import { KeyIcon, PhoneIcon } from "@/constant/image";
import { logout } from "@/lib/actions/auth";
import InputField from "@/components/InputField";
import { Button } from "@nextui-org/button";
import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import { FormSuccessErrors, TemporaryUserProps } from "@/constant/type";
import { toast } from "sonner";
import { faCheck, faEnvelope, faKey } from "@fortawesome/free-solid-svg-icons";
const Page = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const { type } = useParams();
  const isForgot = type === "forgotpassword";
  const [user, setUser] = useState<TemporaryUserProps>();
  const [errors, setErrors] = useState<FormSuccessErrors>({
    name: "",
    phone: "",
    password: "",
    birthday: "",
    email: "",
  });
  const [step, setStep] = useState<"form" | "reset">("form");
  const [serverOtp, setServerOtp] = useState("");
  const [otp, setOtp] = useState("");
  const [isSend, setIsSend] = useState(false);

  useEffect(() => {
    const temUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(temUser);
  }, []);
  const [form, setForm] = useState({
    phone: user?.phone || "",
    email: user?.email || "",
    oldPassword: "",
    newPassword: "",
  });

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [user]);
  const sendOtpEmail = async (email: string) => {
    const res = await fetch("/api/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(t("OTP sent to your email"));
      setServerOtp(data.otp);
    } else {
      toast.error(t("Failed to send OTP"));
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      phone: "",
      password: "",
      birthday: "",
      email: "",
    };

    if (!user?.phone) {
      newErrors.phone = "Phone number is required.";
    } else {
      const digitsOnly = user.phone.replace(/\D/g, "");
      if (digitsOnly.length < 10 || !digitsOnly.startsWith("0")) {
        newErrors.phone =
          "Phone must start with 0 and have at least 10 digits.";
      }
    }

    if (user?.password !== undefined) {
      const password = form.newPassword || "";
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])(?!.*\s).{9,}$/;

      if (!passwordRegex.test(password)) {
        newErrors.password =
          "Password must be >8 characters, include 1 uppercase, 1 number, and 1 special character.";
      }
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((err) => err === "");
  };

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const getUserInfo = async (type: string, value: any) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/account?${type}=${value}`
    );
    if (!res.ok) {
      throw new Error("Failed to fetch user info");
    }
    const [data] = await res.json();
    if (!data) return {};
    return data;
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/resetpassword`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, newPassword }),
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch user info");
    }
  };

  const handleCheck = async (email: string) => {
    if (!email) {
      toast.error("Email is required. ");
      return;
    }
    let result = await getUserInfo("email", email);

    if (Object.keys(result).length > 0) {
      await sendOtpEmail(email);
      setIsSend(!isSend);
    } else {
      toast.error(t("There is no account associated with this email!"));
    }
  };

  const handleVerifyOtp = async () => {
    if (otp === serverOtp.toString()) {
      toast.success(t("OTP verified successfully"));
      setStep("reset");
    } else {
      toast.error(t("Invalid OTP"));
    }
  };

  const handleSubmit = async () => {
    if (isForgot) {
      if (validateForm()) {
        if(form.newPassword !== form.oldPassword ){
          toast.error("Confirm password does not match new password")
          return;
        }
        const newUser = {
          ...user,
          //phone: user.phone,
          password: form.newPassword,
        };
        let data = await getUserInfo("phone", newUser.phone);
        if (data) {
          const result = await resetPassword(data.id, form.newPassword)
          toast.success("Password reset successfully")
        }
        router.push("/signin");
      }
    } else {
      if (validateForm()) {
        const newUser = {
          ...user,
          //phone: user.phone,
          password: form.newPassword,
        };
        let data = await getUserInfo("phone", newUser.phone);
        if (!data) {
          toast.error("Phone number not found");
          return;
        }
        if (data.password !== form.oldPassword) {
          toast.error("Old password is incorrect");
          return;
        }
        if (data.password === form.newPassword) {
          toast.error("New password must be different from old password");
          return;
        }
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/changepass`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phone: newUser.phone,
              oldpassword: form.oldPassword,
              newpassword: form.newPassword,
            }),
          }
        );
        if (!res.ok) {
          toast.error("Failed to update password");
          return;
        }
        toast.success("Password changed!");
        localStorage.removeItem("user");
        logout();
      }
    }
  };
  useEffect(() => {}, []);
  return (
    <div className="py-10 flex flex-col items-center gap-24 h-screen mx-auto">
      {isForgot ? (
        <h1 className="uppercase font-semibold text-4xl pt-14">
          {t("Forgot Password")}
        </h1>
      ) : (
        <h1 className="uppercase font-semibold text-4xl pt-14">
          {t("Change Password")}
        </h1>
      )}
      <div className="relative py-5">
        <div className="bg-customPurple w-[1000px] h-[430px] rounded-3xl absolute z-10">
          <div className="flex flex-col px-28 pt-20 gap-10 ">
            {isForgot ? (
              step === "form" ? (
                <>
                  <div className="w-full flex gap-2">
                    <InputField
                      value={form.email}
                      type="text"
                      iconClassName="text-white"
                      icon={faEnvelope}
                      placeholder={t("Enter your phone number")}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                    <button
                      onClick={() => handleCheck(form.email ?? "")}
                      className="bg-white h-[40px] px-10 py-2 rounded-md"
                    >
                      Check
                    </button>
                  </div>
                  {isSend && (
                    <>
                      <InputField
                        value={otp}
                        type="text"
                        iconClassName="text-white"
                        icon={faCheck}
                        placeholder={t("Enter your otp")}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <button
                        onClick={handleVerifyOtp}
                        className="bg-white h-[60px] px-10 py-2 rounded-md text-xl"
                      >
                        Verify
                      </button>
                    </>
                  )}
                </>
              ) : (
                <>
                  <InputField
                    type="password"
                    icon={faKey}
                    iconClassName="text-white"
                    placeholder={t("Enter your new password")}
                    onChange={(e) =>
                      handleChange("oldPassword", e.target.value)
                    }
                    error={errors.password}
                    password
                  />
                  <InputField
                    type="password"
                    icon={faKey}
                    iconClassName="text-white"
                    placeholder={t("Confirm your new password")}
                    onChange={(e) =>
                      handleChange("newPassword", e.target.value)
                    }
                    //error={}
                    password
                  />
                  <Button
                    className="bg-white text-3xl h-[70px] mt-10"
                    onPress={() => handleSubmit()}
                  >
                    {t("Confirm")}
                  </Button>
                </>
              )
            ) : (
              <>
                <InputField
                  type="password"
                  icon={faKey}
                  iconClassName="text-white"
                  placeholder={t("Enter your password")}
                  onChange={(e) => handleChange("oldPassword", e.target.value)}
                />
                <InputField
                  type="password"
                  icon={faKey}
                  iconClassName="text-white"
                  placeholder={t("Enter your new password")}
                  onChange={(e) => handleChange("newPassword", e.target.value)}
                  password
                />
                <Button
                  className="bg-white text-3xl h-[70px] mt-10"
                  onPress={() => handleSubmit()}
                >
                  {t("Confirm")}
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="bg-customPurple/50 w-[1000px] h-[430px] rounded-3xl ml-14 mt-14"></div>
      </div>
    </div>
  );
};

export default Page;
