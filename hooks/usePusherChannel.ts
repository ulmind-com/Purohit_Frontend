"use client";

import { useEffect, useRef } from "react";
import Pusher, { type Channel } from "pusher-js";

import { PUSHER_CLUSTER, PUSHER_KEY } from "@/lib/constants";

let sharedPusherClient: Pusher | null = null;

/** One Pusher connection per browser tab, shared across every channel hook instance. */
function getPusherClient(): Pusher | null {
  if (!PUSHER_KEY) return null;
  if (!sharedPusherClient) {
    sharedPusherClient = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
  }
  return sharedPusherClient;
}

/**
 * Subscribes to a Pusher channel/event for the lifetime of the component.
 *
 * Backend contract (see `app/services/notification_service.py` and
 * `app/api/routes/bookings.py`):
 *   - Purohits listen on `purohit_{purohit_id}` for `new_booking_request`
 *   - Yajmans listen on `user_{user_id}` for `booking_accepted`
 *
 * Note: each Purohit gets their OWN channel (not a single shared broadcast
 * channel) — the backend fans a request out to every eligible Purohit
 * individually inside `notify_nearby_purohits()`.
 */
export function usePusherChannel<T>(
  channelName: string | null | undefined,
  eventName: string,
  onEvent: (data: T) => void
) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    if (!channelName) return;

    const client = getPusherClient();
    if (!client) {
      console.warn(
        "[usePusherChannel] NEXT_PUBLIC_PUSHER_KEY is not set — realtime updates are disabled."
      );
      return;
    }

    const channel: Channel = client.subscribe(channelName);
    const handler = (data: T) => callbackRef.current(data);
    channel.bind(eventName, handler);

    return () => {
      channel.unbind(eventName, handler);
      client.unsubscribe(channelName);
    };
  }, [channelName, eventName]);
}

export function useConnectionState(onChange: (state: string) => void) {
  useEffect(() => {
    const client = getPusherClient();
    if (!client) return;
    const handler = (states: { current: string }) => onChange(states.current);
    client.connection.bind("state_change", handler);
    return () => {
      client.connection.unbind("state_change", handler);
    };
  }, [onChange]);
}
