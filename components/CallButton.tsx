"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CallIcon } from "@/constant/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone, faVideo, faPhoneVolume } from "@fortawesome/free-solid-svg-icons";

interface CallButtonProps {
  onCallInitiated: (callType: "audio" | "video") => void;
  className?: string;
}

const CallButton: React.FC<CallButtonProps> = ({ onCallInitiated, className = "" }) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleAudioCall = () => {
    onCallInitiated("audio");
    setShowOptions(false);
  };

  const handleVideoCall = () => {
    onCallInitiated("video");
    setShowOptions(false);
  };

  return (
    <div className="relative">
      <div
        onClick={() => setShowOptions(!showOptions)}
        className={`cursor-pointer ${className}`}
      >
        <FontAwesomeIcon icon={faPhoneVolume} className="text-customPurple" />
      </div>

      {showOptions && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg z-50 w-40 py-2">
          <button
            onClick={handleAudioCall}
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faPhone} className="text-customPurple" />
            <span>Audio Call</span>
          </button>
          <button
            onClick={handleVideoCall}
            className="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            <FontAwesomeIcon icon={faVideo} className="text-customPurple" />
            <span>Video Call</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CallButton;