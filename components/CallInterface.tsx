"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhone,
  faPhoneSlash,
} from "@fortawesome/free-solid-svg-icons";
import { CallIcon } from "@/constant/image";

interface CallInterfaceProps {
  isIncoming: boolean;
  callType: "audio" | "video";
  caller: {
    id: string;
    name: string;
    image: string;
  };
  receiver: {
    id: string;
    name: string;
    image: string;
  };
  onAccept?: () => void;
  onReject?: () => void;
  onEnd?: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
  connectionState?: string;
}

const CallInterface: React.FC<CallInterfaceProps> = ({
                                                       isIncoming,
                                                       callType,
                                                       caller,
                                                       receiver,
                                                       onAccept,
                                                       onReject,
                                                       onEnd,
                                                       localStream,
                                                       remoteStream,
                                                       connectionState,
                                                     }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState<string>(
    isIncoming ? "Incoming call..." : "Calling..."
  );
  const [callDuration, setCallDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null
  );

  // Set up local and remote video streams
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [localStream, remoteStream]);

  // Update call status based on connection state
  useEffect(() => {
    console.log("Connection state changed to:", connectionState);

    if (connectionState === "connected") {
      console.log("Call connected successfully!");
      setCallStatus("Connected");
      // Start call timer
      const interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (connectionState === "connecting") {
      console.log("Call is connecting...");
      setCallStatus("Connecting...");
    } else if (connectionState === "disconnected" || connectionState === "failed") {
      console.log("Call ended or failed:", connectionState);
      setCallStatus("Call ended");
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [connectionState]);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center">
      <div className="w-full h-full max-w-4xl flex flex-col">
        {/* Call header */}
        <div className="p-4 text-white text-center">
          <h2 className="text-xl font-semibold">
            {isIncoming
              ? `Incoming ${callType} call from ${caller.name}`
              : `${callType === "video" ? "Video" : "Audio"} call with ${
                receiver.name
              }`}
          </h2>
          <p className="text-gray-300">
            {connectionState === "connected"
              ? formatDuration(callDuration)
              : callStatus}
          </p>
        </div>

        {/* Video container */}
        <div className="flex-1 relative">
          {callType === "video" ? (
            <>
              {/* Remote video (full screen) */}
              <div className="absolute inset-0">
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${
                    !remoteStream ? "hidden" : ""
                  }`}
                />
                {!remoteStream && (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image
                      src={isIncoming ? caller.image : receiver.image}
                      alt="User"
                      width={150}
                      height={150}
                      className="rounded-full"
                    />
                  </div>
                )}
              </div>

              {/* Local video (picture-in-picture) */}
              <div className="absolute bottom-4 right-4 w-1/4 aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faVideoSlash}
                      className="text-white text-2xl"
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            // Audio call UI
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-customPurple">
                  <Image
                    src={isIncoming ? caller.image : receiver.image}
                    alt="User"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isIncoming ? caller.name : receiver.name}
                </h3>
                <p className="text-gray-300 text-lg">
                  {connectionState === "connected"
                    ? formatDuration(callDuration)
                    : callStatus}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Call controls */}
        <div className="p-6 flex justify-center space-x-6">
          {isIncoming && !connectionState ? (
            // Incoming call controls
            <>
              <button
                onClick={onReject}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faPhoneSlash}
                  className="text-white text-2xl"
                />
              </button>
              <button
                onClick={onAccept}
                className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-white text-2xl"
                />
              </button>
            </>
          ) : (
            // Active call controls
            <>
              <button
                onClick={toggleAudio}
                className={`w-14 h-14 rounded-full ${
                  isMuted ? "bg-red-500" : "bg-gray-700"
                } flex items-center justify-center`}
              >
                <FontAwesomeIcon
                  icon={isMuted ? faMicrophoneSlash : faMicrophone}
                  className="text-white text-xl"
                />
              </button>

              {callType === "video" && (
                <button
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full ${
                    isVideoOff ? "bg-red-500" : "bg-gray-700"
                  } flex items-center justify-center`}
                >
                  <FontAwesomeIcon
                    icon={isVideoOff ? faVideoSlash : faVideo}
                    className="text-white text-xl"
                  />
                </button>
              )}

              <button
                onClick={onEnd}
                className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faPhoneSlash}
                  className="text-white text-2xl"
                />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallInterface;