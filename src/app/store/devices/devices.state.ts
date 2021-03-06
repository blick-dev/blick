import {
  RemoveOrderDevice,
  AddOrderDevice
} from './../appearance/appearance.action';
import { State, Store, Selector, Action, StateContext } from '@ngxs/store';
import {
  AddDeviceAction,
  RemoveDeviceAction,
  ToggleOrientation,
  ToggleDeviceOrientation,
  UpdateDeviceAction,
  NavigateURL,
  FocusDevice,
  ClearFocus,
  DragDevice,
  ClearDrag,
  ZenDevice,
  ClearZen
} from './devices.action';
import { Device, DeviceOrientation } from './devices.types';
import { patch, updateItem } from '@ngxs/store/operators';
import { Router, ActivatedRoute } from '@angular/router';

export interface DevicesStateModel {
  devices: Device[];
  orientation: DeviceOrientation;
  url: string;
  focus: Device;
  drag: Device;
  zen: Device;
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
    focus: null,
    drag: null,
    zen: null,
    url: 'https://fivethree-team.github.io/ionic-4-components/',
    orientation: 'portrait',
    devices: [
      {
        name: 'Pixel 3XL',
        height: 823,
        width: 411,
        orientation: 'portrait',
        platform: 'android'
      },
      {
        name: 'iPhone X',
        height: 812,
        width: 375,
        orientation: 'portrait',
        platform: 'ios'
      },
      {
        name: 'Macbook Pro',
        height: 1080,
        width: 1920,
        orientation: 'portrait',
        platform: 'ios'
      },
      {
        name: 'Common Chrome',
        height: 768,
        width: 1366,
        orientation: 'portrait',
        platform: 'desktop'
      }
    ]
  }
})
export class DevicesState {
  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  @Selector()
  static devices(state: DevicesStateModel) {
    return state.devices;
  }
  @Selector()
  static focus(state: DevicesStateModel) {
    return state.focus;
  }
  @Selector()
  static drag(state: DevicesStateModel) {
    return state.drag;
  }
  @Selector()
  static zen(state: DevicesStateModel) {
    return state.zen;
  }

  @Selector()
  static nondrag(state: DevicesStateModel) {
    return !state.drag
      ? []
      : state.devices.filter(
          device => !state.drag || device.name !== state.drag.name
        );
  }

  @Selector()
  static orientation(state: DevicesStateModel) {
    return state.orientation;
  }
  @Selector()
  static url(state: DevicesStateModel) {
    return state.url;
  }

  @Action(AddDeviceAction)
  add(ctx: StateContext<DevicesStateModel>, action: AddDeviceAction) {
    action.payload.name = this.findName(
      ctx.getState().devices,
      action.payload.name
    );
    ctx.patchState({
      devices: [action.payload, ...ctx.getState().devices]
    });
    return ctx.dispatch(new AddOrderDevice(action.payload));
  }

  private findName(devices, name) {
    let addition = '';
    let i = 0;
    while (devices.some(d => d.name === name + addition)) {
      i++;
      addition = ` (${i})`;
    }
    return name + addition;
  }

  @Action(UpdateDeviceAction)
  update(ctx: StateContext<DevicesStateModel>, action: UpdateDeviceAction) {
    if (action.payload.old.name !== action.payload.updated.name) {
      action.payload.updated.name = this.findName(
        ctx.getState().devices,
        action.payload.updated.name
      );
    }

    ctx.setState(
      patch({
        devices: updateItem<Device>(
          d => d.name === action.payload.old.name,
          patch(action.payload.updated)
        )
      })
    );
  }

  @Action(RemoveDeviceAction)
  remove(ctx: StateContext<DevicesStateModel>, action: RemoveDeviceAction) {
    ctx.patchState({
      devices: [...ctx.getState().devices.filter(d => d.name !== action.device)]
    });
    return ctx.dispatch(new RemoveOrderDevice(action.device));
  }

  @Action(ToggleOrientation)
  toggleOrientation(
    ctx: StateContext<DevicesStateModel>,
    action: ToggleOrientation
  ) {
    const orientation = action.orientation
      ? action.orientation
      : ctx.getState().orientation === 'portrait'
      ? 'landscape'
      : 'portrait';
    const devices = JSON.parse(JSON.stringify(ctx.getState().devices));
    ctx.patchState({
      orientation,
      devices: devices.map(device => {
        device.orientation = orientation;
        return device;
      })
    });
  }

  @Action(ToggleDeviceOrientation)
  toggleDeviceOrientation(
    ctx: StateContext<DevicesStateModel>,
    action: ToggleDeviceOrientation
  ) {
    const device = ctx.getState().devices.find(d => d.name === action.device);
    const orientation = action.orientation
      ? action.orientation
      : device.orientation === 'portrait'
      ? 'landscape'
      : 'portrait';

    ctx.setState(
      patch({
        devices: updateItem<Device>(
          d => d.name === action.device,
          patch({ orientation })
        )
      })
    );
  }

  @Action(NavigateURL)
  navigate(ctx: StateContext<DevicesStateModel>, action: NavigateURL) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { url: action.url },
      queryParamsHandling: 'merge'
    });
    ctx.patchState({ url: action.url });
  }

  @Action(FocusDevice)
  focus(ctx: StateContext<DevicesStateModel>, action: FocusDevice) {
    ctx.patchState({
      focus: action.device
    });
  }
  @Action(ZenDevice)
  zen(ctx: StateContext<DevicesStateModel>, action: ZenDevice) {
    ctx.patchState({
      zen: action.device
    });
  }
  @Action(ClearFocus)
  clearFocus(ctx: StateContext<DevicesStateModel>) {
    ctx.patchState({
      focus: null
    });
  }
  @Action(ClearZen)
  clearZen(ctx: StateContext<DevicesStateModel>) {
    ctx.patchState({
      zen: null
    });
  }
  @Action(DragDevice)
  drag(ctx: StateContext<DevicesStateModel>, action: DragDevice) {
    ctx.patchState({
      drag: action.device,
      focus: null
    });
  }
  @Action(ClearDrag)
  clearDrag(ctx: StateContext<DevicesStateModel>) {
    const drag = ctx.getState().drag;
    ctx.patchState({
      drag: null
    });
  }
}
