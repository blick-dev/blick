import { Device } from './../devices/devices.types';
import { AppearanceStateModel } from './appearance.state';
import {
  UpdateTheme,
  UpdateZoom,
  UpdatePadding,
  SwapAction,
  AddOrderDevice,
  RemoveOrderDevice
} from './appearance.action';
import {
  Store,
  State,
  Action,
  StateContext,
  Selector,
  createSelector
} from '@ngxs/store';
import { Theme, DeviceOrder } from './appearance.types';
import { patch, updateItem } from '@ngxs/store/operators';

export interface AppearanceStateModel {
  theme: Theme;
  zoom: number;
  padding: number;
  order: DeviceOrder[];
}

@State<AppearanceStateModel>({
  name: 'appearance',
  defaults: {
    theme: '',
    zoom: 60,
    padding: 32,
    order: [
      {
        device: 'Pixel 3XL',
        order: 0
      },
      {
        device: 'iPhone X',
        order: 1
      },
      {
        device: 'Macbook Pro',
        order: 2
      },
      {
        device: 'Common Chrome',
        order: 3
      }
    ]
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

  static order(device: Device) {
    return createSelector([AppearanceState], (state: AppearanceStateModel) => {
      return state.order.find(d => d.device === device.name).order;
    });
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

  @Action(AddOrderDevice)
  addOrderDevice(
    ctx: StateContext<AppearanceStateModel>,
    action: AddOrderDevice
  ) {
    const newOrder = JSON.parse(JSON.stringify(ctx.getState().order)).map(d => {
      d.order = d.order + 1;
      return d;
    });
    return ctx.patchState({
      order: [{ device: action.device.name, order: 0 }, ...newOrder]
    });
  }

  @Action(RemoveOrderDevice)
  removeOrderDevice(
    ctx: StateContext<AppearanceStateModel>,
    action: RemoveOrderDevice
  ) {
    const device = ctx.getState().order.find(d => d.device === action.device);
    const newOrder = JSON.parse(JSON.stringify(ctx.getState().order))
      .filter(d => d.order > device.order)
      .map(d => {
        d.order = d.order - 1;
        return d;
      });
    ctx.patchState({
      order: [
        ...ctx
          .getState()
          .order.filter(
            d => d.device !== action.device && d.order < device.order
          ),
        ...newOrder
      ]
    });
  }

  @Action(SwapAction)
  swap(ctx: StateContext<AppearanceStateModel>, action: SwapAction) {
    const state = ctx.getState();
    const drag = state.order.find(d => d.device === action.drag.name).order;
    const overlayed = state.order
      .filter(d => action.overlayed.some(o => o.name === d.device))
      .sort((a, b) => a.order - b.order);
    const furthest = overlayed.sort(
      (a, b) => a.order - drag - (b.order - drag)
    );

    ctx.setState(
      patch({
        order: updateItem<DeviceOrder>(
          d => d.device === action.drag.name,
          patch({ order: furthest[0].order })
        )
      })
    );

    ctx.setState(
      patch({
        order: updateItem<DeviceOrder>(
          d => d.device === furthest[furthest.length - 1].device,
          patch({ order: drag })
        )
      })
    );
    furthest
      .reverse()
      .slice(1)
      .forEach((o, i) => {
        ctx.setState(
          patch({
            order: updateItem<DeviceOrder>(
              d => d.device === o.device,
              patch({ order: furthest[i].order })
            )
          })
        );
      });
  }
}
