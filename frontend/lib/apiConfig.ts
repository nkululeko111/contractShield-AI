import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * API base including `/api`.
 *
 * Mobile (Expo Go / dev client):
 * - Set `EXPO_PUBLIC_API_URL` (e.g. http://192.168.1.10:5000) when your backend is on another machine
 *   or Expo does not expose a LAN host.
 * - Android emulator: Metro often reports localhost; the host machine is reachable at 10.0.2.2.
 * - iOS simulator: localhost usually works for a server on the same Mac.
 * - Physical devices: Expo’s `hostUri` is typically your PC’s LAN IP — use that for port 5000.
 */
export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim()) {
    return `${fromEnv.replace(/\/$/, '')}/api`;
  }

  const manifest = Constants.manifest as
    | { debuggerHost?: string; hostUri?: string }
    | null
    | undefined;
  let host =
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    manifest?.debuggerHost?.split(':')[0] ??
    manifest?.hostUri?.split(':')[0];

  const isLoopback =
    !host || host === 'localhost' || host === '127.0.0.1';

  if (isLoopback) {
    if (Platform.OS === 'android') {
      // Emulator (and some dev setups): backend on host machine
      host = '10.0.2.2';
    } else {
      // iOS simulator, web, etc.
      host = 'localhost';
    }
  }

  return `http://${host}:5000/api`;
}
