import {
  AppearanceStateModel,
  AppearanceState
} from './appearance/appearance.state';
import { DevicesStateModel, DevicesState } from './devices/devices.state';
import { UndoStateModel, UndoState } from './undo/undo.state';

export interface AppState {
  undo: UndoStateModel;
  appearance: AppearanceStateModel;
  devices: DevicesStateModel;
}

export const states = [UndoState, AppearanceState, DevicesState];
