import { Device, DeviceOrientation, DevicePlatform } from './devices.types';

export interface AddDevicePayload {
  width: number;
  height: number;
  name: string;
  orientation: DeviceOrientation;
  platform: DevicePlatform;
}
export class AddDeviceAction {
  static readonly type = '[Devices] AddDeviceAction]';
  constructor(public readonly payload: AddDevicePayload) {}
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
export class FocusDevice {
  static readonly type = '[Devices] FocusDevice]';
  constructor(public readonly device: Device) {}
}
export class ZenDevice {
  static readonly type = '[Devices] ZenDevice]';
  constructor(public readonly device: Device) {}
}
export class ClearFocus {
  static readonly type = '[Devices] ClearFocus]';
  constructor() {}
}
export class ClearZen {
  static readonly type = '[Devices] ClearZen]';
  constructor() {}
}
export class DragDevice {
  static readonly type = '[Devices] DragDevice]';
  constructor(public readonly device: Device) {}
}
export class ClearDrag {
  static readonly type = '[Devices] ClearDrag]';
  constructor() {}
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
export class NavigateURL {
  static readonly type = '[Devices] NavigateURL]';
  constructor(public readonly url: string) {}
}
