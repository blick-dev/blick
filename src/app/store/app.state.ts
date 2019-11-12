import { DevicesStateModel, DevicesState } from './devices/devices.state';
import { UndoStateModel, UndoState } from './undo/undo.state';

export interface AppState {
  undo: UndoStateModel;
  devices: DevicesStateModel;
}

export const states = [UndoState, DevicesState];
