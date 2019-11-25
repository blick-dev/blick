import { Theme } from './appearance.types';
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
