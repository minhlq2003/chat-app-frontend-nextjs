"use client";

import Image from "next/image";
import React from "react";
import { Button } from "@nextui-org/react";
import { useTranslation } from "react-i18next";

interface ChangeGroupImageModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (imageUrl: string) => void;
  imageUrl: string;
}

export default function ChangeGroupImageModal({
  open,
  onClose,
  onSubmit,
  imageUrl,
}: ChangeGroupImageModalProps) {
  const {t} = useTranslation("common")
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[400px] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-semibold">{t("Update Group Image")}</h2>
          <button onClick={onClose} className="text-black text-xl">
            &times;
          </button>
        </div>

        <div className="p-4 flex flex-col items-center">
          <p className="text-center mb-4">
            {t("Do you want to update the group image?")}
          </p>
          <div className="relative w-[200px] h-[200px] mb-4">
            <Image
              src={imageUrl}
              alt="New group image"
              fill
              className="rounded-lg object-cover"
            />
          </div>
          <div className="flex justify-end gap-3 w-full mt-4">
            <Button
              color="danger"
              variant="light"
              onClick={onClose}
              className="px-4"
            >
              {t("Cancel")}
            </Button>
            <Button
              color="primary"
              onClick={() => onSubmit(imageUrl)}
              className="px-4"
            >
              {t("Update Image")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}