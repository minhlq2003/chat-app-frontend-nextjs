"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import Peer from "simple-peer";

interface CallState {
  isReceivingCall: boolean;
  isCalling: boolean;
  isCallAccepted: boolean;
  isCallRejected: boolean;
  isCallEnded: boolean;
  callType: "audio" | "video" | null;
  callerId: string | null;
  receiverId: string | null;
  callId: string | null;
  callerName: string | null;
  callerImage: string | null;
  receiverName: string | null;
  receiverImage: string | null;
  incomingSignal?: any;
}

interface UseWebRTCProps {
  userId: string | null;
  userName: string | null;
  userImage: string | null;
}

const useWebRTC = ({ userId, userName, userImage }: UseWebRTCProps) => {
  const [callState, setCallState] = useState<CallState>({
    isReceivingCall: false,
    isCalling: false,
    isCallAccepted: false,
    isCallRejected: false,
    isCallEnded: false,
    callType: null,
    callerId: null,
    receiverId: null,
    callId: null,
    callerName: null,
    callerImage: null,
    receiverName: null,
    receiverImage: null,
  });

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  // Connect to signaling server
  useEffect(() => {
    if (!userId) return;

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    socketRef.current = io(apiBaseUrl);

    // Register user with the signaling server
    socketRef.current.emit("register", userId);
    console.log(`Registered user ${userId} with signaling server`);

    // Handle incoming call
    socketRef.current.on("incoming-call", (data) => {
      console.log("Incoming call received:", data);
      // Make sure all caller information is properly stored in callState
      setCallState((prev) => ({
        ...prev,
        isReceivingCall: true,
        callType: data.callType,
        callerId: data.callerId,
        callerName: data.callerName,
        callerImage: data.callerImage,
        callId: data.callId,
        incomingSignal: data.signal,
      }));
    });

    // Handle call acceptance
    socketRef.current.on("call-accepted", (data) => {
      const { callId, signal } = data;
      console.log("Call accepted signal received:", { callId, signal });

      setCallState((prev) => ({
        ...prev,
        isCallAccepted: true
      }));

      setConnectionState("connecting");

      // Set remote description
      if (peerRef.current) {
        peerRef.current.signal(signal);
        console.log("Applied remote signal to peer connection");
      }
    });

    // Handle call rejection
    socketRef.current.on("call-rejected", ({ callId }) => {
      console.log("Call rejected:", callId);
      setCallState((prev) => ({
        ...prev,
        isCallRejected: true,
        isCalling: false,
      }));

      cleanupCall();
    });

    // Handle ICE candidate
    socketRef.current.on("ice-candidate", ({ callId, candidate }) => {
      console.log("Received ICE candidate for call:", callId);
      if (peerRef.current) {
        peerRef.current.signal({ type: "candidate", candidate });
        console.log("Applied ICE candidate to peer connection");
      } else {
        console.log("Cannot apply ICE candidate - no peer connection");
      }
    });

    // Handle call ended
    socketRef.current.on("call-ended", ({ callId }) => {
      console.log("Call ended:", callId);
      setCallState((prev) => ({
        ...prev,
        isCallEnded: true,
        isCallAccepted: false,
        isCalling: false,
        isReceivingCall: false,
      }));

      cleanupCall();
    });

    // Handle call response (e.g., user not online)
    socketRef.current.on("call-response", ({ status, message }) => {
      console.log("Call response:", status, message);
      if (status === "failed") {
        setCallState((prev) => ({
          ...prev,
          isCallEnded: true,
          isCalling: false,
        }));

        cleanupCall();
      }
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log("Socket disconnected on cleanup");
      }
      cleanupCall();
    };
  }, [userId]);

  // Initialize call
  const initiateCall = useCallback(
    async (
      receiverId: string,
      receiverName: string,
      receiverImage: string,
      callType: "audio" | "video",
    ) => {
      try {
        if (!userId || !socketRef.current) {
          throw new Error("User not initialized or socket not connected");
        }

        console.log("Initiating call to:", receiverId, "of type:", callType);

        // Get user media based on call type
        const constraints = {
          audio: true,
          video: callType === "video",
        };

        // Get local media stream
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("getUserMedia is not supported in this browser");
          throw new Error("WebRTC is not supported in this browser");
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setLocalStream(stream);
        console.log("Local media stream obtained");

        // Generate a unique call ID
        const callId = "call-" + Math.random().toString(36).substr(2, 9);
        console.log("Generated call ID:", callId);

        // Create peer connection (as initiator)
        peerRef.current = new Peer({
          initiator: true,
          trickle: true,
          stream,
        });

        // Handle peer signals
        peerRef.current.on("signal", (signal) => {
          console.log("Generated offer signal");
          // Send call request to signaling server
          socketRef.current?.emit("call-user", {
            callerId: userId,
            callerName: userName,
            callerImage: userImage,
            receiverId: receiverId.toString(),
            callType,
            callId,
            signal,
          });
        });

        // Handle ICE candidates
        peerRef.current.on("ice", (candidate) => {
          console.log("Generated ICE candidate for receiver");
          socketRef.current?.emit("ice-candidate", {
            userId: receiverId, // The recipient of this ICE candidate
            callId,
            candidate,
          });
        });

        // Handle peer stream
        peerRef.current.on("stream", (stream) => {
          console.log("Received remote stream");
          setRemoteStream(stream);
        });

        // Handle peer connection state changes
        peerRef.current.on("connect", () => {
          console.log("WebRTC peer connection established");
          setConnectionState("connected");
        });

        peerRef.current.on("close", () => {
          console.log("WebRTC peer connection closed");
          setConnectionState("disconnected");
        });

        peerRef.current.on("error", (err) => {
          console.error("Peer connection error:", err);
          setConnectionState("failed");
        });

        // Update call state
        setCallState((prev) => ({
          ...prev,
          isCalling: true,
          callType,
          receiverId,
          receiverName,
          receiverImage,
          callId,
        }));

        // Also make an API call to store call information
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
        fetch(`${apiBaseUrl}/call/initiate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            callerId: userId,
            receiverId,
            callType,
          }),
        });

        return callId;
      } catch (error) {
        console.error("Error initiating call:", error);
        return null;
      }
    },
    [userId, userName, userImage]
  );

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    try {
      if (!socketRef.current) {
        throw new Error("Socket not connected");
      }

      const { callType, callerId, callId, incomingSignal } = callState;

      if (!callType || !callerId || !callId || !incomingSignal) {
        throw new Error("Missing call information");
      }

      console.log("Accepting call from:", callerId, "with signal:", incomingSignal);

      // Get user media based on call type
      const constraints = {
        audio: true,
        video: callType === "video",
      };

      // Get local media stream
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia is not supported in this browser");
        throw new Error("WebRTC is not supported in this browser");
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      console.log("Local media stream obtained for accept call");

      // Create peer connection (not as initiator)
      peerRef.current = new Peer({
        initiator: false,
        trickle: true,
        stream,
      });

      // Handle peer signals
      peerRef.current.on("signal", (signal) => {
        console.log("Generated answer signal:", signal);
        // Send answer to signaling server
        socketRef.current?.emit("accept-call", {
          callId,
          callerId,
          receiverId: userId, // Add this to ensure proper routing
          signal,
        });
      });

      // Handle ICE candidates
      peerRef.current.on("ice", (candidate) => {
        console.log("Generated ICE candidate for caller");
        socketRef.current?.emit("ice-candidate", {
          userId: callerId, // The recipient of this ICE candidate
          callId,
          candidate,
        });
      });

      // Handle peer stream
      peerRef.current.on("stream", (stream) => {
        console.log("Received remote stream on accept");
        setRemoteStream(stream);
      });

      // Handle peer connection state changes
      peerRef.current.on("connect", () => {
        console.log("WebRTC peer connection established successfully");
        setConnectionState("connected");
      });

      peerRef.current.on("close", () => {
        console.log("WebRTC peer connection closed");
        setConnectionState("disconnected");
      });

      peerRef.current.on("error", (err) => {
        console.error("Peer connection error:", err);
        setConnectionState("failed");
      });

      // Signal the peer with the incoming offer
      console.log("Applying incoming signal to establish connection");
      peerRef.current.signal(incomingSignal);

      // Update call state
      setCallState((prev) => ({
        ...prev,
        isCallAccepted: true,
        isReceivingCall: false,
      }));

      setConnectionState("connecting");
    } catch (error) {
      console.error("Error accepting call:", error);
    }
  }, [callState, userId]); // Add userId to dependency array

  // Reject incoming call
  const rejectCall = useCallback(() => {
    if (!socketRef.current) return;

    const { callId, callerId } = callState;

    if (!callId || !callerId) return;

    console.log("Rejecting call:", callId, "from:", callerId);
    // Send rejection to signaling server
    socketRef.current.emit("reject-call", {
      callId,
      callerId,
    });

    // Update call state
    setCallState((prev) => ({
      ...prev,
      isCallRejected: true,
      isReceivingCall: false,
    }));
  }, [callState]);

  // End call
  const endCall = useCallback(() => {
    if (!socketRef.current) return;

    const { callId, callerId, receiverId } = callState;
    const otherUserId = callerId || receiverId;

    if (!callId || !otherUserId) return;

    console.log("Ending call:", callId, "with user:", otherUserId);
    // Notify the other user
    socketRef.current.emit("end-call", {
      callId,
      userId: otherUserId,
    });

    // Update call state
    setCallState((prev) => ({
      ...prev,
      isCallEnded: true,
      isCallAccepted: false,
      isCalling: false,
      isReceivingCall: false,
    }));

    cleanupCall();
  }, [callState]);

  // Cleanup call resources
  const cleanupCall = useCallback(() => {
    console.log("Cleaning up call resources");
    // Close peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Stop local media stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Clear remote stream
    setRemoteStream(null);
    setConnectionState(null);
  }, [localStream]);

  // Reset call state
  const resetCallState = useCallback(() => {
    console.log("Resetting call state");
    setCallState({
      isReceivingCall: false,
      isCalling: false,
      isCallAccepted: false,
      isCallRejected: false,
      isCallEnded: false,
      callType: null,
      callerId: null,
      receiverId: null,
      callId: null,
      callerName: null,
      callerImage: null,
      receiverName: null,
      receiverImage: null,
    });
    cleanupCall();
  }, [cleanupCall]);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  return {
    callState,
    localStream,
    remoteStream,
    connectionState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    resetCallState,
    toggleAudio,
    toggleVideo,
  };
};

export default useWebRTC;