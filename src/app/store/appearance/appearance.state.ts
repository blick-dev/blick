import { AppearanceStateModel } from './appearance.state';
import { UpdateTheme, UpdateZoom, UpdatePadding } from './appearance.action';
import { Store, State, Action, StateContext, Selector } from '@ngxs/store';
import { Theme } from './appearance.types';

export interface AppearanceStateModel {
  theme: Theme;
  zoom: number;
  padding: number;
}

@State<AppearanceStateModel>({
  name: 'appearance',
  defaults: {
    theme: '',
    zoom: 60,
    padding: 32
  }
})
export class AppearanceState {
  constructor(private store: Store) {}

  @Selector()
  static theme(state: AppearanceStateModel) {
    return state.theme;
  }

  @Selector()
  static zoom(state: AppearanceStateModel) {
    return state.zoom;
  }
  @Selector()
  static padding(state: AppearanceStateModel) {
    return state.padding;
  }

  @Action(UpdateTheme)
  updateTheme(ctx: StateContext<AppearanceStateModel>, action: UpdateTheme) {
    return ctx.patchState({ theme: action.theme });
  }
  @Action(UpdateZoom)
  updateZoom(ctx: StateContext<AppearanceStateModel>, action: UpdateZoom) {
    return ctx.patchState({ zoom: action.zoom });
  }

  @Action(UpdatePadding)
  updatePadding(
    ctx: StateContext<AppearanceStateModel>,
    action: UpdatePadding
  ) {
    return ctx.patchState({ padding: action.padding });
  }
}
