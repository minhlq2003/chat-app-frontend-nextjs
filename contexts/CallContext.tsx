"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import useWebRTC from "@/hooks/useWebRTC";
import CallInterface from "@/components/CallInterface";

interface CallContextType {
  initiateCall: (
    receiverId: string,
    receiverName: string,
    receiverImage: string,
    callType: "audio" | "video",
    callerId: string,
    callerName: string,
    callerImage: string,
  ) => Promise<string | null>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: React.ReactNode;
  userId: string | null;
  userName: string | null;
  userImage: string | null;
}

export const CallProvider: React.FC<CallProviderProps> = ({
                                                            children,
                                                            userId,
                                                            userName,
                                                            userImage,
                                                          }) => {
  const {
    callState,
    localStream,
    remoteStream,
    connectionState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    resetCallState,
  } = useWebRTC({ userId, userName, userImage });

  // Handle call UI visibility
  const [showCallUI, setShowCallUI] = useState(false);

  useEffect(() => {
    // Show call UI when receiving a call or making a call
    if (callState.isReceivingCall || callState.isCalling) {
      setShowCallUI(true);
    } else if (callState.isCallEnded || callState.isCallRejected) {
      // Hide call UI after a short delay when call ends
      const timer = setTimeout(() => {
        setShowCallUI(false);
        resetCallState();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [
    callState.isReceivingCall,
    callState.isCalling,
    callState.isCallEnded,
    callState.isCallRejected,
    resetCallState,
  ]);

  // Handle initiating a call
  const handleInitiateCall = async (
    receiverId: string,
    receiverName: string,
    receiverImage: string,
    callType: "audio" | "video",
    callerId: string,
    callerName: string,
    callerImage: string,
  ) => {
    return initiateCall(receiverId, receiverName, receiverImage, callType, callerId, callerName, callerImage);
  };
  console.log(callState)
  return (
    <CallContext.Provider value={{
      initiateCall: handleInitiateCall,
      acceptCall,
      rejectCall,
      endCall
    }}>
      {children}

      {/* Call UI */}
      {showCallUI && (
        <CallInterface
          isIncoming={callState.isReceivingCall}
          callType={callState.callType || "audio"}
          caller={{
            id: callState.callerId || "",
            name: callState.callerName || "Unknown",
            image: callState.callerImage || "https://www.gravatar.com/avatar/EMAIL_MD5?d=https://ui-avatars.com/api/?name=Unknown",
          }}
          receiver={{
            id: callState.receiverId || "",
            name: callState.receiverName || "Unknown",
            image: callState.receiverImage || "https://www.gravatar.com/avatar/EMAIL_MD5?d=https://ui-avatars.com/api/?name=Unknown",
          }}
          onAccept={acceptCall}
          onReject={rejectCall}
          onEnd={endCall}
          localStream={localStream}
          remoteStream={remoteStream}
          connectionState={connectionState || undefined}
        />
      )}
    </CallContext.Provider>
  );
};

