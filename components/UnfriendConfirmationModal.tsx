"use client";

import React from "react";
import { toast } from "sonner";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export default function UnfriendConfirmationModal({
  onClose,
  friendName,
  userId,
  contactId,
  onSuccess,
}: {
  onClose: () => void;
  friendName: string;
  userId: string | null;
  contactId: string;
  onSuccess: () => void;
}) {
  const handleUnfriend = async () => {
    try {
      if (!userId) {
        toast.error("User not authenticated");
        onClose();
        return;
      }

      const response = await fetch(
        `${apiBaseUrl}/contact/unfriend?userId=${userId}&contactId=${contactId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        toast.success(`Successfully unfriended ${friendName}`);
        onSuccess(); // Refresh the friends list
      } else {
        toast.error(`Failed to unfriend: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error unfriending contact:", error);
      toast.error("An error occurred while unfriending");
    } finally {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white text-black w-[400px] h-[20vh] rounded-lg shadow-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-between h-full p-4">
          <h2 className="text-xl font-bold mb-4">Confirmation</h2>
          <p className="mb-4">Are you sure you want to unfriend this contact?</p>
          <div className="flex items-center gap-10">
            <button
              className="text-black bg-gray-400 px-4 py-1 hover:bg-gray-500 rounded"
              onClick={onClose}
            >
              No
            </button>
            <button
              className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
              onClick={handleUnfriend}
            >
              Yes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}