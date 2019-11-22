import { Theme } from './appearance.types';
export class UpdateTheme {
  static readonly type = '[Appearance] UpdateTheme]';
  constructor(public readonly theme: Theme) {}
}
