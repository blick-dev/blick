import { Device, DeviceOrientation } from './devices.types';

export class AddDeviceAction {
  static readonly type = '[Devices] AddDeviceAction]';
  constructor(public readonly payload: Device) {}
}

export interface UpdateDevicePayload {
  old: Device;
  updated: Device;
}
export class UpdateDeviceAction {
  static readonly type = '[Devices] UpdateDeviceAction]';
  constructor(public readonly payload: UpdateDevicePayload) {}
}

export class RemoveDeviceAction {
  static readonly type = '[Devices] RemoveDeviceAction]';
  constructor(public readonly device: string) {}
}
export class ToggleOrientation {
  static readonly type = '[Devices] ToggleOrientation]';
  constructor(public readonly orientation?: DeviceOrientation) {}
}
export class ToggleDeviceOrientation {
  static readonly type = '[Devices] ToggleDeviceOrientation]';
  constructor(
    public readonly device: string,
    public readonly orientation?: DeviceOrientation
  ) {}
}
