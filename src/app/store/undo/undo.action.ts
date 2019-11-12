export interface RegisterUndoActionPayload {
  undoLabel: string;
  redoLabel: string;
}

export class RegisterUndoAction {
  static readonly type = '[Undo] RegisterUndoAction]';
  constructor(public readonly payload: RegisterUndoActionPayload) {}
}

export class Undo {
  static readonly type = '[Undo] Undo]';
}
export class InitUndoState {
  static readonly type = '[Undo] InitUndoState]';
}

export class Redo {
  static readonly type = '[Undo] Redo]';
}
