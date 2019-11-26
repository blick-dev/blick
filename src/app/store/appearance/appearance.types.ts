import { Device } from '@store/devices/devices.types';

export type Theme = 'dark' | 'light' | '';
export interface DeviceOrder {
  order: number;
  device: string;
}
export interface WidthSettings {
  width: number;
  align: DeviceAlignment;
}
export type DeviceAlignment = 'horizontal' | 'vertical' | 'custom';

export interface DevicePosition {
  device: Device;
  rows: Device[][];
}
