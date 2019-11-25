export type DeviceOrientation = 'portrait' | 'landscape';
export type DevicePlatform = 'desktop' | 'ios' | 'android';
export interface Device {
  width: number;
  height: number;
  name: string;
  orientation: DeviceOrientation;
  platform: DevicePlatform;
}
