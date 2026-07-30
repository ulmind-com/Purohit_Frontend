import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

// Make sure to configure your environment variables
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "79ee57c57e494a3f458c";
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2";

let pusherInstance: Pusher | null = null;

export const getPusherClient = () => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
    });
  }
  return pusherInstance;
};

export const usePusherChannel = (
  channelName: string,
  eventName: string,
  callback: (data: any) => void
) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(channelName);

    const handleEvent = (data: any) => {
      savedCallback.current(data);
    };

    channel.bind(eventName, handleEvent);

    return () => {
      channel.unbind(eventName, handleEvent);
      pusher.unsubscribe(channelName);
    };
  }, [channelName, eventName]);
};
