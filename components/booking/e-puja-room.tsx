"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@/navigation";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useLocalParticipant,
  useRemoteParticipants,
  useTracks,
  useRoomContext,
} from "@livekit/components-react";
import { RoomOptions, Track, VideoPresets } from "livekit-client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Sparkles,
  Scroll,
  AlertTriangle,
  Music,
  User,
  Crown,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getEPujaToken } from "@/lib/api/bookings";
import { useAuthStore } from "@/store/useAuthStore";
import type { SankalpDetails } from "@/types";

/**
 * HIGH-FIDELITY AUDIO CONFIGURATION (MUSIC/CEREMONY MODE)
 * Disables aggressive browser WebRTC noise suppression, echo cancellation,
 * and auto-gain control so Shankha (conch), Ghanta (bells), and quiet Vedic
 * mantras are not filtered out or distorted.
 */
export const E_PUJA_ROOM_OPTIONS: RoomOptions = {
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: {
    resolution: VideoPresets.h720.resolution,
  },
  audioCaptureDefaults: {
    autoGainControl: false,  // Prevents AGC from compressing quiet chants or loud bells
    echoCancellation: false, // Prevents conch sound (Shankha) from being muted as echo
    noiseSuppression: false, // Prevents bell ringing (Ghanta) from being filtered out as noise
  },
  publishDefaults: {
    audioPreset: {
      maxBitrate: 128_000,   // High bitrate for audio music fidelity
    },
    dtx: false,              // Disable Discontinuous Transmission (prevents clipping subtle mantras)
  },
};

interface EPujaRoomProps {
  bookingId: string;
}

export function EPujaRoom({ bookingId }: EPujaRoomProps) {
  const router = Router();
  const { role: storeRole } = useAuthStore();

  const tokenQuery = useQuery({
    queryKey: ["e-puja-token", bookingId],
    queryFn: () => getEPujaToken(bookingId),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const livekitUrl =
    tokenQuery.data?.livekit_url ||
    process.env.NEXT_PUBLIC_LIVEKIT_URL ||
    "wss://epuja-demo.livekit.cloud";

  if (tokenQuery.isLoading) {
    return <EPujaSkeletonLoader />;
  }

  if (tokenQuery.isError || !tokenQuery.data?.token) {
    const errorMsg =
      tokenQuery.error instanceof Error
        ? tokenQuery.error.message
        : "Could not generate E-Puja access token.";

    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <Card className="max-w-md border-destructive/20 bg-destructive/5 backdrop-blur-xl">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-8" />
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Unable to Join E-Puja Ceremony
            </h2>
            <p className="text-sm text-muted-foreground">{errorMsg}</p>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() =>
                  router.push(storeRole === "purohit" ? "/purohit" : "/user")
                }
              >
                Return to Dashboard
              </Button>
              <Button onClick={() => tokenQuery.refetch()}>Try Again</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { token, sankalp_details, role } = tokenQuery.data;
  const isPurohit = role === "purohit" || storeRole === "purohit";

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-b from-slate-950 via-amber-950/20 to-slate-950 p-2 sm:p-4 text-white">
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={livekitUrl}
        options={E_PUJA_ROOM_OPTIONS}
        connect={true}
        data-lk-theme="default"
        onDisconnected={() => {
          toast.info("Left E-Puja video room");
          router.push(isPurohit ? "/purohit" : "/user");
        }}
        onError={(err) => {
          toast.error("Video Room Error", { description: err.message });
        }}
        className="relative flex h-[calc(100vh-6rem)] w-full flex-col overflow-hidden rounded-3xl border border-amber-500/20 bg-slate-950/80 shadow-2xl backdrop-blur-2xl"
      >
        <EPujaStage
          bookingId={bookingId}
          sankalpDetails={sankalp_details}
          isPurohit={isPurohit}
        />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}

// Custom hook helper for Next.js navigation inside client component
function Router() {
  return useRouter();
}

/**
 * Loading Skeleton with Saffron/Amber Theme
 */
function EPujaSkeletonLoader() {
  return (
    <div className="flex min-h-[80vh] w-full flex-col items-center justify-center p-6 space-y-6">
      <div className="relative flex size-20 items-center justify-center rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-500 animate-pulse">
        <Sparkles className="size-10 animate-spin" />
      </div>
      <div className="text-center space-y-2 max-w-sm">
        <h3 className="text-2xl font-bold tracking-tight text-amber-500">
          Connecting to Sacred E-Puja Room...
        </h3>
        <p className="text-sm text-muted-foreground">
          Establishing high-fidelity audio stream for Shankha & Ghanta sounds.
        </p>
      </div>
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="h-4 w-full rounded-full bg-amber-500/10" />
        <Skeleton className="h-4 w-3/4 mx-auto rounded-full bg-amber-500/10" />
      </div>
    </div>
  );
}

interface EPujaStageProps {
  bookingId: string;
  sankalpDetails?: SankalpDetails | null;
  isPurohit: boolean;
}

/**
 * 1-ON-1 STAGE LAYOUT WITH DIGITAL SANKALP & MUSIC-MODE CONTROLS
 */
function EPujaStage({ bookingId, sankalpDetails, isPurohit }: EPujaStageProps) {
  const room = useRoomContext();
  const router = useRouter();
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();

  const [showSankalp, setShowSankalp] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // Fetch camera and mic tracks
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.Microphone, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  const remoteParticipant = remoteParticipants[0];

  const remoteCameraTrack = useMemo(() => {
    return tracks.find(
      (t) =>
        t.participant.identity !== localParticipant.identity &&
        t.source === Track.Source.Camera
    );
  }, [tracks, localParticipant.identity]);

  const localCameraTrack = useMemo(() => {
    return tracks.find(
      (t) =>
        t.participant.identity === localParticipant.identity &&
        t.source === Track.Source.Camera
    );
  }, [tracks, localParticipant.identity]);

  const toggleMic = async () => {
    const nextState = !isMicOn;
    await localParticipant.setMicrophoneEnabled(nextState);
    setIsMicOn(nextState);
    toast(nextState ? "Microphone Unmuted" : "Microphone Muted", {
      icon: nextState ? <Mic className="size-4 text-emerald-400" /> : <MicOff className="size-4 text-rose-400" />,
    });
  };

  const toggleVideo = async () => {
    const nextState = !isVideoOn;
    await localParticipant.setCameraEnabled(nextState);
    setIsVideoOn(nextState);
    toast(nextState ? "Camera Turned On" : "Camera Turned Off", {
      icon: nextState ? <VideoIcon className="size-4 text-emerald-400" /> : <VideoOff className="size-4 text-rose-400" />,
    });
  };

  const endPujaCall = async () => {
    room.disconnect();
    toast.success("E-Puja Ceremony Concluded");
    router.push(isPurohit ? "/purohit" : "/user");
  };

  return (
    <div className="relative flex flex-1 w-full h-full overflow-hidden bg-slate-950">
      {/* Top Header Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto bg-black/60 backdrop-blur-xl border border-amber-500/30 px-4 py-2 rounded-2xl shadow-xl">
          <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span>E-Puja Virtual Room</span>
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 text-[10px] py-0">
                1-on-1 Live
              </Badge>
            </h1>
            <p className="text-[11px] text-amber-200/70">
              Ceremony ID: <span className="font-mono">{bookingId.slice(-6)}</span>
            </p>
          </div>
        </div>

        {/* High-Fidelity Audio Mode Badge */}
        <div className="pointer-events-auto hidden md:flex items-center gap-2 bg-amber-500/10 backdrop-blur-xl border border-amber-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-amber-300">
          <Music className="size-3.5 text-amber-400 animate-pulse" />
          <span>High-Fidelity Music Mode Enabled</span>
        </div>
      </div>

      {/* Main Video View: Remote Participant (or waiting state) */}
      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
        {remoteCameraTrack && remoteCameraTrack.publication?.isSubscribed && !remoteCameraTrack.publication.isMuted ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <VideoTrack
              trackRef={remoteCameraTrack}
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Remote Name Overlay */}
            <div className="absolute bottom-20 left-6 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-white">
              {isPurohit ? <User className="size-3.5 text-blue-400" /> : <Crown className="size-3.5 text-amber-400" />}
              <span>{remoteParticipant?.name || (isPurohit ? "Yajman" : "Purohit")}</span>
              {remoteParticipant?.isSpeaking && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 animate-pulse">
                  <Volume2 className="size-3" /> Speaking
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
            <div className="relative flex size-28 items-center justify-center rounded-full bg-gradient-to-tr from-amber-600/30 to-orange-500/20 border-2 border-amber-500/40 text-amber-400 shadow-2xl">
              {isPurohit ? <User className="size-14 text-amber-300" /> : <Crown className="size-14 text-amber-400" />}
              <span className="absolute inset-0 rounded-full border border-amber-500/30 animate-ping opacity-30" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight text-white">
                {remoteParticipant ? remoteParticipant.name : `Waiting for ${isPurohit ? "Yajman" : "Purohit"} to join...`}
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                {remoteParticipant
                  ? "Camera is currently turned off by participant."
                  : "The ceremony will start automatically as soon as the other participant connects."}
              </p>
            </div>
          </div>
        )}

        {/* Local Participant Picture-in-Picture (PiP) Window */}
        <motion.div
          drag
          dragConstraints={{ top: 20, left: 20, right: 20, bottom: 100 }}
          className="absolute top-20 right-6 z-20 h-40 w-56 sm:h-48 sm:w-64 overflow-hidden rounded-2xl border border-amber-500/40 bg-black/80 shadow-2xl backdrop-blur-xl cursor-grab active:cursor-grabbing"
        >
          {localCameraTrack && isVideoOn && localCameraTrack.publication?.track ? (
            <VideoTrack
              trackRef={localCameraTrack}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-slate-900 text-muted-foreground p-2 text-center">
              <User className="size-8 text-amber-400/60 mb-1" />
              <span className="text-[11px] font-medium text-slate-300">You (Camera Off)</span>
            </div>
          )}
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-semibold text-white">
            <span>You ({isPurohit ? "Purohit" : "Yajman"})</span>
            {!isMicOn && <MicOff className="size-3 text-rose-400" />}
          </div>
        </motion.div>
      </div>

      {/* Floating Digital Sankalp Teleprompter Panel */}
      <AnimatePresence>
        {sankalpDetails && showSankalp && (
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed top-20 left-6 z-30 max-w-sm w-[90vw] sm:w-80 rounded-3xl border border-amber-500/30 bg-slate-950/85 p-5 shadow-2xl backdrop-blur-2xl text-white space-y-4"
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Scroll className="size-5 text-amber-400" />
                <h3 className="font-bold text-sm tracking-tight text-amber-300">
                  Digital Sankalp (সঙ্কোচ সঙ্কল্প)
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 rounded-full text-slate-400 hover:text-white"
                onClick={() => setShowSankalp(false)}
              >
                ✕
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex flex-col space-y-1 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  Yajman Name (সঙ্কল্প কর্তা)
                </span>
                <span className="font-medium text-sm text-white">
                  {sankalpDetails.yajman_name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col space-y-0.5 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-semibold text-amber-400/80 uppercase">
                    Gotra (গোত্র)
                  </span>
                  <span className="font-medium text-white">
                    {sankalpDetails.gotra}
                  </span>
                </div>

                <div className="flex flex-col space-y-0.5 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-[10px] font-semibold text-amber-400/80 uppercase">
                    Nakshatra (নক্ষত্র)
                  </span>
                  <span className="font-medium text-white">
                    {sankalpDetails.nakshatra || "Not specified"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-1 bg-slate-900/80 p-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-semibold text-amber-400/80 uppercase">
                  Sankalp Purpose (সঙ্কল্প হেতু)
                </span>
                <p className="text-xs leading-relaxed text-slate-200">
                  {sankalpDetails.purpose}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Control Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 p-3 rounded-full bg-slate-950/80 backdrop-blur-2xl border border-amber-500/30 shadow-2xl">
        {/* Toggle Mic */}
        <Button
          variant={isMicOn ? "secondary" : "destructive"}
          size="icon"
          className="size-12 rounded-full transition-transform active:scale-95 shadow-md"
          onClick={toggleMic}
          title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
          {isMicOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
        </Button>

        {/* Toggle Video */}
        <Button
          variant={isVideoOn ? "secondary" : "destructive"}
          size="icon"
          className="size-12 rounded-full transition-transform active:scale-95 shadow-md"
          onClick={toggleVideo}
          title={isVideoOn ? "Turn Off Camera" : "Turn On Camera"}
        >
          {isVideoOn ? <VideoIcon className="size-5" /> : <VideoOff className="size-5" />}
        </Button>

        {/* Toggle Digital Sankalp Panel */}
        {sankalpDetails && (
          <Button
            variant={showSankalp ? "default" : "outline"}
            size="icon"
            className={`size-12 rounded-full transition-all shadow-md ${
              showSankalp
                ? "bg-amber-500 text-slate-950 hover:bg-amber-400"
                : "border-amber-500/40 text-amber-400 hover:bg-amber-500/20"
            }`}
            onClick={() => setShowSankalp(!showSankalp)}
            title="Toggle Digital Sankalp Teleprompter"
          >
            <Scroll className="size-5" />
          </Button>
        )}

        {/* End Puja / Leave Call Button */}
        <Button
          variant="destructive"
          className="h-12 rounded-full px-6 font-bold text-sm bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white shadow-lg shadow-red-950/50 transition-all active:scale-95 flex items-center gap-2"
          onClick={endPujaCall}
        >
          <PhoneOff className="size-4" />
          <span>End Puja</span>
        </Button>
      </div>
    </div>
  );
}
