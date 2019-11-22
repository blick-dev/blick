import { AppearanceStateModel } from './appearance.state';
import { UpdateTheme } from './appearance.action';
import { Store, State, Action, StateContext, Selector } from '@ngxs/store';
import { Theme } from './appearance.types';

export interface AppearanceStateModel {
  theme: Theme;
}

@State<AppearanceStateModel>({
  name: 'appearance',
  defaults: {
    theme: ''
  }
})
export class AppearanceState {
  constructor(private store: Store) {}

  @Selector()
  static theme(state: AppearanceStateModel) {
    return state.theme;
  }

  @Action(UpdateTheme)
  updateTheme(ctx: StateContext<AppearanceStateModel>, action: UpdateTheme) {
    return ctx.patchState({ theme: action.theme });
  }
}
