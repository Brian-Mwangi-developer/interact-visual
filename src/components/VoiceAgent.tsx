"use client";

import { vapi } from "@/lib/vapi/vapiClient";
import { AlertCircle, Bot, Mic, MicOff, PhoneOff } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const FloatingVoiceAssistant = ({ assistantId }: { assistantId: string }) => {
    const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "finished">("idle");
    const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
    const [isMicMuted, setIsMicMuted] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);
    const [hasMicPermission, setHasMicPermission] = useState(false);
    const [showPermissionWarning, setShowPermissionWarning] = useState(false);

    // Check mic permission status
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const permissionStatus = await navigator.permissions.query({
                    name: 'microphone' as PermissionName
                });
                setHasMicPermission(permissionStatus.state === 'granted');

                permissionStatus.onchange = () => {
                    const newStatus = permissionStatus.state === 'granted';
                    setHasMicPermission(newStatus);
                    if (newStatus && callStatus === 'connecting') {
                        startCall();
                    }
                };
            } catch (error) {
                console.log("Permission API not supported, will request directly",error);
                
            }
        };

        checkPermission();
    }, [callStatus]);

    const requestMicPermission = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            setHasMicPermission(true);
            setShowPermissionWarning(false);
            return true;
        } catch (error) {
            console.error("Microphone access denied:", error);
            setShowPermissionWarning(true);
            toast.error("Microphone access is required for voice assistant");
            return false;
        }
    };

    const startCall = async () => {
        try {
            await vapi.start(assistantId);
        } catch (error) {
            console.error("Failed to start call:", error);
            setCallStatus("idle");
            toast.error("Failed to connect to assistant");
        }
    };

    const toggleCall = async () => {
        if (callStatus === "active") {
            await vapi.stop();
            return;
        }

        if (!hasMicPermission) {
            setCallStatus("connecting");
            const granted = await requestMicPermission();
            if (!granted) {
                setCallStatus("idle");
                return;
            }
        }

        startCall();
    };

    const toggleMic = () => {
        if (callStatus === "active") {
            vapi.setMuted(!isMicMuted);
            setIsMicMuted(!isMicMuted);
        }
    };

    // Event listeners setup
    useEffect(() => {
        const onCallStart = () => setCallStatus("active");
        const onCallEnd = () => setCallStatus("finished");
        const onSpeechStart = () => setAssistantIsSpeaking(true);
        const onSpeechEnd = () => setAssistantIsSpeaking(false);
        const onTranscript = (t: string) => setTranscript(t);

        vapi.on("call-start", onCallStart);
        vapi.on("call-end", onCallEnd);
        vapi.on("speech-start", onSpeechStart);
        vapi.on("speech-end", onSpeechEnd);
        vapi.on("transcript", onTranscript);

        return () => {
            vapi.off("call-start", onCallStart);
            vapi.off("call-end", onCallEnd);
            vapi.off("speech-start", onSpeechStart);
            vapi.off("speech-end", onSpeechEnd);
            vapi.off("transcript", onTranscript);
        };
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 transition-all duration-300">
            {isExpanded ? (
                <div className="bg-white rounded-xl shadow-xl w-80 overflow-hidden border border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${callStatus === "active" ? "bg-green-500" :
                                callStatus === "connecting" ? "bg-yellow-500" :
                                    callStatus === "finished" ? "bg-red-500" : "bg-gray-500"
                                }`} />
                            <div className="font-medium text-indigo-700">
                                {callStatus === "active" ? "Active" :
                                    callStatus === "connecting" ? "Connecting..." :
                                        callStatus === "finished" ? "Call Ended" : "Ready"}
                            </div>
                        </div>
                        <button
                            onClick={() => setIsExpanded(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                    </div>

                    {/* Permission warning */}
                    {showPermissionWarning && (
                        <div className="p-3 bg-yellow-50 text-yellow-800 text-sm border-b border-yellow-200 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p>Microphone access is required</p>
                                <button
                                    onClick={requestMicPermission}
                                    className="text-yellow-700 underline mt-1"
                                >
                                    Click to grant permission
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Transcript area */}
                    <div className="p-4 h-40 overflow-y-auto bg-gray-50 text-sm">
                        {transcript || (
                            <div className="text-gray-500 italic h-full flex items-center justify-center text-center">
                                {!hasMicPermission
                                    ? "Grant microphone access to start talking"
                                    : callStatus === "active"
                                        ? "Say something to interact..."
                                        : "Start a conversation with the assistant"}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="p-3 bg-white border-t flex justify-between">
                        <button
                            onClick={toggleMic}
                            className={`p-2 rounded-full ${isMicMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                                }`}
                            disabled={callStatus !== "active" || !hasMicPermission}
                        >
                            {isMicMuted ? <MicOff size={18} /> : <Mic size={18} />}
                        </button>

                        <button
                            onClick={toggleCall}
                            className={`p-3 rounded-full flex items-center justify-center ${callStatus === "active"
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : hasMicPermission
                                    ? "bg-indigo-500 text-white hover:bg-indigo-600"
                                    : "bg-gray-400 text-white cursor-not-allowed"
                                }`}
                            disabled={!hasMicPermission && callStatus !== "active"}
                        >
                            {callStatus === "active" ? (
                                <PhoneOff size={18} />
                            ) : (
                                <>
                                    {hasMicPermission ? (
                                        <Bot size={18} />
                                    ) : (
                                        <MicOff size={18} />
                                    )}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-end gap-3">
                    {callStatus === "active" && assistantIsSpeaking && (
                        <div className="bg-white rounded-full p-2 shadow-lg animate-pulse">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                    )}

                    <button
                        onClick={() => setIsExpanded(true)}
                        className={`p-4 rounded-full shadow-lg transform transition-all ${!hasMicPermission ? "bg-gray-400 cursor-not-allowed" :
                            callStatus === "active"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : "bg-indigo-500 hover:bg-indigo-600 text-white"
                            }`}
                    >
                        {!hasMicPermission ? (
                            <MicOff size={24} className="opacity-70" />
                        ) : callStatus === "active" ? (
                            <div className="relative">
                                <Mic size={24} />
                                {assistantIsSpeaking && (
                                    <>
                                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                                        <div className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-50 delay-300" />
                                    </>
                                )}
                            </div>
                        ) : (
                            <Bot size={24} />
                        )}
                    </button>
                </div>
            )}

            {/* Connecting overlay */}
            {callStatus === "connecting" && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
};