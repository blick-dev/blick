import { HeightPipe } from '@pipes/height.pipe';
import { WidthPipe } from '@pipes/width.pipe';
import { DevicesStateModel } from './../devices/devices.state';
import { DevicesState } from '@store/devices/devices.state';
import { Platform } from '@ionic/angular';
import { Device } from './../devices/devices.types';
import { AppearanceStateModel } from './appearance.state';
import {
  UpdateTheme,
  UpdateZoom,
  UpdatePadding,
  SwapAction,
  AddOrderDevice,
  RemoveOrderDevice,
  UpdateWidthSettings,
  UpdateFitSetting
} from './appearance.action';
import {
  State,
  Action,
  StateContext,
  Selector,
  createSelector,
  Store
} from '@ngxs/store';
import { Theme, DeviceOrder, DeviceAlignment } from './appearance.types';
import { patch, updateItem } from '@ngxs/store/operators';
import { Injector } from '@angular/core';

export interface AppearanceStateModel {
  theme: Theme;
  zoom: number;
  padding: number;
  order: DeviceOrder[];
  width: number;
  align: DeviceAlignment;
  fit: boolean;
}

@State<AppearanceStateModel>({
  name: 'appearance',
  defaults: {
    theme: '',
    zoom: 60,
    padding: 32,
    width: 0,
    align: 'horizontal',
    fit: true,
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
  private static platform: Platform;
  private static widthPipe: WidthPipe;
  private static heightPipe: HeightPipe;
  private static store: Store;
  constructor(private injector: Injector) {
    AppearanceState.platform = this.injector.get<Platform>(Platform);
    AppearanceState.widthPipe = this.injector.get<WidthPipe>(WidthPipe);
    AppearanceState.store = this.injector.get<Store>(Store);
    AppearanceState.heightPipe = this.injector.get<HeightPipe>(HeightPipe);
  }

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

  static width() {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        switch (appearance.align) {
          case 'custom':
            return appearance.width;
          case 'vertical':
            return (
              AppearanceState.platform.width() *
              (appearance.fit ? 1 / (appearance.zoom / 100) : 1)
            );
          case 'horizontal':
            return devices.devices
              .map(
                d => AppearanceState.widthPipe.transform(d) + appearance.padding
              )
              .reduce((p, c) => p + c + appearance.padding / 2);
        }
      }
    );
  }
  static height() {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const orderedDevices = appearance.order.sort(
          (a, b) => b.order - a.order
        );
        if (orderedDevices.length === 0) {
          return 0;
        }
        const last = devices.devices.find(
          d => d.name === orderedDevices[0].device
        );
        const rows = AppearanceState.store.selectSnapshot(
          AppearanceState.rows(last)
        );
        const height = rows
          .map(row =>
            Math.max.apply(
              Math,
              row.map(function(o) {
                return (
                  AppearanceState.heightPipe.transform(o, 56) +
                  appearance.padding
                );
              })
            )
          )
          .reduce((a, b) => a + b, 0);
        return height + appearance.padding;
      }
    );
  }
  static maxWidth() {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        return devices.devices
          .map(d => AppearanceState.widthPipe.transform(d) + appearance.padding)
          .reduce((p, c) => p + c);
      }
    );
  }

  static top(device: Device) {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const rows = AppearanceState.store.selectSnapshot(
          AppearanceState.rows(device)
        );
        const rowMax = rows.map(row =>
          Math.max.apply(
            Math,
            row.map(o => AppearanceState.heightPipe.transform(o, 56))
          )
        );
        const top = rowMax
          .slice(0, rowMax.length - 1)
          .reduce((a, b) => a + b, 0);

        return top + rows.length * appearance.padding;
      }
    );
  }
  static left(device: Device) {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const rows = AppearanceState.store.selectSnapshot(
          AppearanceState.rows(device)
        );
        const row = rows[rows.length - 1];
        const before = row.slice(0, row.length - 1);
        const width = before
          .map(b => this.widthPipe.transform(b))
          .reduce((a, b) => a + b, 0);
        const padding = (before.length + 1) * appearance.padding;
        return width + padding;
      }
    );
  }

  static zenleft(device: Device) {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const factor =
          1 /
          (AppearanceState.store.selectSnapshot(AppearanceState.zoom) / 100);
        const width = AppearanceState.platform.width();
        return Math.max(0, 0.5 * width - 0.5 * device.width);
      }
    );
  }
  static zentop(device: Device) {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const factor =
          1 /
          (AppearanceState.store.selectSnapshot(AppearanceState.zoom) / 100);
        const height = AppearanceState.platform.height();
        return Math.max(0, 0.5 * height - 0.5 * device.height - 112);
      }
    );
  }

  static rows(device: Device) {
    return createSelector(
      [AppearanceState, DevicesState],
      (appearance: AppearanceStateModel, devices: DevicesStateModel) => {
        const order = AppearanceState.store.selectSnapshot(
          AppearanceState.order(device)
        );
        const before = AppearanceState.store.selectSnapshot(
          AppearanceState.before(order)
        );

        const rows: Device[][] = [];
        before.push(device);
        before.forEach((b, i) => {
          const bef = before.slice(0, i + 1);
          const width = bef
            .map(
              b => AppearanceState.widthPipe.transform(b) + appearance.padding
            )
            .reduce((a, b) => a + b, 0);
          const devicesWidth = AppearanceState.store.selectSnapshot(
            AppearanceState.width()
          );
          const row = Math.floor(width / devicesWidth);
          if (rows[row]) {
            rows[row].push(b);
          } else {
            rows.push([b]);
          }
        });
        return rows;
      }
    );
  }

  static before(order: number) {
    return createSelector(
      [DevicesState, AppearanceState],
      (devices: DevicesStateModel, appearance: AppearanceStateModel) => {
        const orders = appearance.order.filter(d => d.order < order);
        return (
          devices.devices
            .filter(d => orders.some(o => o.device === d.name))
            .sort(
              (a, b) =>
                orders.find(o => o.device === a.name).order -
                orders.find(o => o.device === b.name).order
            ) || []
        );
      }
    );
  }

  @Selector([AppearanceState])
  static minWidth() {
    return (
      AppearanceState.platform.width() *
      (AppearanceState.store.selectSnapshot(AppearanceState.fit)
        ? 1 / (AppearanceState.store.selectSnapshot(AppearanceState.zoom) / 100)
        : 1)
    );
  }

  @Selector()
  static align(state: AppearanceStateModel) {
    return state.align;
  }
  @Selector()
  static fit(state: AppearanceStateModel) {
    return state.fit;
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
  @Action(UpdateFitSetting)
  updateFit(ctx: StateContext<AppearanceStateModel>, action: UpdateFitSetting) {
    return ctx.patchState({ fit: action.fit });
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

  @Action(UpdateWidthSettings)
  updateWidthSettings(
    ctx: StateContext<AppearanceStateModel>,
    action: UpdateWidthSettings
  ) {
    return ctx.patchState({
      width: action.settings.width,
      align: action.settings.align
    });
  }
}
