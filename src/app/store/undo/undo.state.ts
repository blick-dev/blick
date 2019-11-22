import { RegisterUndoAction, Undo, InitUndoState, Redo } from './undo.action';
import { State, StateContext, Action, Store, Selector } from '@ngxs/store';

export interface History {
  undoLabel: string;
  redoLabel: string;
}
export interface UndoStateModel {
  max: number;
  past: History[];
  present: History;
  future: History[];
}

@State<UndoStateModel>({
  name: 'undo',
  defaults: {
    max: 20,
    past: [],
    present: null,
    future: []
  }
})
export class UndoState {
  constructor(private store: Store) {}

  @Selector()
  static canUndo(state: UndoStateModel) {
    return state.past.length > 0;
  }

  @Selector()
  static undoLabel(state: UndoStateModel) {
    return state.present.undoLabel || 'Keine Änderungen';
  }

  @Selector()
  static redoLabel(state: UndoStateModel) {
    return state.future.length > 0
      ? state.future[0].redoLabel
      : 'Keine Änderungen';
  }

  @Selector()
  static canRedo(state: UndoStateModel) {
    return state.future.length > 0;
  }

  // @Action(RegisterUndoAction)
  // register(ctx: StateContext<UndoStateModel>, action: RegisterUndoAction) {
  //   const queries = this.store.selectSnapshot(QueriesState.state);
  //   const columns = this.store.selectSnapshot(ColumnsState.state);
  //   const table = this.store.selectSnapshot(TableState.state);
  //   const current = ctx.getState().present;
  //   const max = ctx.getState().max * -1;
  //   const tPayload: SetTableStatePayload = {
  //     sortDirection: table.sortDirection,
  //     sort: table.sort,
  //     size: table.size
  //   };
  //   ctx.patchState({
  //     present: {
  //       columns: columns,
  //       queries: queries,
  //       undoLabel: action.payload.undoLabel,
  //       redoLabel: action.payload.redoLabel,
  //       table: tPayload
  //     },
  //     past: [...ctx.getState().past, current].filter(s => !!s).slice(max),
  //     future: []
  //   });
  // }
  // @Action(ClearUndoState)
  // clear(ctx: StateContext<UndoStateModel>) {
  //   ctx.patchState({ undo: [] });
  // }
  // @Action(Undo)
  // undo(ctx: StateContext<UndoStateModel>) {
  //   const past = ctx.getState().past;
  //   const present = ctx.getState().present;
  //   const future = ctx.getState().future;
  //   const previous = past[past.length - 1];
  //   const newPast = past.slice(0, past.length - 1);
  //   ctx.dispatch([
  //     new SetColumnState(previous.columns),
  //     new SetQueriesState(previous.queries),
  //     new SetTableState(previous.table)
  //   ]);
  //   ctx.patchState({
  //     past: newPast,
  //     present: previous,
  //     future: [present, ...future]
  //   });
  // }

  // @Action(Redo)
  // redo(ctx: StateContext<UndoStateModel>) {
  //   const future = ctx.getState().future;
  //   const past = ctx.getState().past;
  //   const present = ctx.getState().present;
  //   const next = future[0];
  //   const newFuture = future.slice(1);
  //   ctx.dispatch([
  //     new SetColumnState(next.columns),
  //     new SetQueriesState(next.queries),
  //     new SetTableState(next.table)
  //   ]);
  //   ctx.patchState({
  //     past: [...past, present],
  //     present: next,
  //     future: newFuture
  //   });
  // }

  // @Action(InitUndoState)
  // init(ctx: StateContext<UndoStateModel>) {
  //   const queries = this.store.selectSnapshot(QueriesState.state);
  //   const columns = this.store.selectSnapshot(ColumnsState.state);
  //   const table = this.store.selectSnapshot(TableState.state);
  //   const tPayload: SetTableStatePayload = {
  //     sortDirection: table.sortDirection,
  //     sort: table.sort,
  //     size: table.size
  //   };
  //   ctx.patchState({
  //     past: [],
  //     present: {
  //       columns: columns,
  //       queries: queries,
  //       redoLabel: "Wiederholen",
  //       undoLabel: "Rückgängig machen",
  //       table: tPayload
  //     },
  //     future: []
  //   });
  // }
}
