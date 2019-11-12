export type DeviceOrientation = 'portrait' | 'landscape';
export type DevicePlatform = 'chrome' | 'safari' | 'ios' | 'android';
export interface Device {
  width: number;
  height: number;
  name: string;
  orientation: DeviceOrientation;
  platform: DevicePlatform;
}

export class AddDeviceAction {
  static readonly type = '[Devices] AddDeviceAction]';
  constructor(public readonly payload: Device) {}
}

export class RemoveDeviceAction {
  static readonly type = '[Devices] RemoveDeviceAction]';
  constructor(public readonly device: string) {}
}
