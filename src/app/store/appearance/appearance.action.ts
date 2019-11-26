import { Theme, WidthSettings } from './appearance.types';
import { Device } from '@store/devices/devices.types';
export class UpdateTheme {
  static readonly type = '[Appearance] UpdateTheme]';
  constructor(public readonly theme: Theme) {}
}
export class UpdateZoom {
  static readonly type = '[Appearance] UpdateZoom]';
  constructor(public readonly zoom: number) {}
}
export class UpdatePadding {
  static readonly type = '[Appearance] UpdatePadding]';
  constructor(public readonly padding: number) {}
}

export class SwapAction {
  static readonly type = '[Appearance] SwapAction]';
  constructor(
    public readonly drag: Device,
    public readonly overlayed: Device[]
  ) {}
}
export class AddOrderDevice {
  static readonly type = '[Appearance] AddOrderDevice]';
  constructor(public readonly device: Device) {}
}
export class RemoveOrderDevice {
  static readonly type = '[Appearance] RemoveOrderDevice]';
  constructor(public readonly device: string) {}
}
export class UpdateWidthSettings {
  static readonly type = '[Appearance] UpdateWidthSettings]';
  constructor(public readonly settings: WidthSettings) {}
}
