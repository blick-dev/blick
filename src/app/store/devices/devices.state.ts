import { State, Store, Selector, Action, StateContext } from '@ngxs/store';
import { AddDeviceAction, Device, RemoveDeviceAction } from './devices.action';

export interface DevicesStateModel {
  devices: Device[];
}

@State<DevicesStateModel>({
  name: 'devices',
  defaults: {
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
        platform: 'safari'
      },
      {
        name: 'Common Chrome',
        height: 768,
        width: 1366,
        orientation: 'portrait',
        platform: 'chrome'
      }
    ]
  }
})
export class DevicesState {
  constructor(private store: Store) {}

  @Selector()
  static devices(state: DevicesStateModel) {
    return state.devices;
  }

  @Action(AddDeviceAction)
  add(ctx: StateContext<DevicesStateModel>, action: AddDeviceAction) {
    ctx.patchState({ devices: [...ctx.getState().devices, action.payload] });
  }

  @Action(RemoveDeviceAction)
  remove(ctx: StateContext<DevicesStateModel>, action: RemoveDeviceAction) {
    ctx.patchState({
      devices: [...ctx.getState().devices.filter(d => d.name !== action.device)]
    });
  }
}
