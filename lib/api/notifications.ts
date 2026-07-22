import { api } from "@/lib/api/axios";

export async function updateDeviceToken(fcmDeviceToken: string) {
  const { data } = await api.patch<{ message: string }>(
    "/notifications/me/device-token",
    { fcm_device_token: fcmDeviceToken }
  );
  return data;
}
