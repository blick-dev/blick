import {
  NavigateURL,
  ClearFocus,
  ClearZen
} from './../store/devices/devices.action';
import {
  UpdateTheme,
  UpdateZoom
} from './../store/appearance/appearance.action';
import { DevicesState } from './../store/devices/devices.state';
import { Component, OnDestroy } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, takeUntil, tap, first } from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { ActivatedRoute } from '@angular/router';
import { Device, DeviceOrientation } from '@store/devices/devices.types';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import {
  AddDeviceAction,
  ToggleOrientation
} from '@store/devices/devices.action';
import { Theme } from '@store/appearance/appearance.types';
import { AppearanceState } from '@store/appearance/appearance.state';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy {
  @Select(DevicesState.url)
  url$: Observable<string>;
  @Select(DevicesState.devices)
  devices: Observable<Device[]>;
  @Select(DevicesState.orientation)
  orientation: Observable<DeviceOrientation>;

  @Select(AppearanceState.theme)
  theme: Observable<Theme>;
  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(DevicesState.zen)
  zen: Device;

  onDestroy$ = new Subject();

  constructor(private activeRoute: ActivatedRoute) {
    this.url$
      .pipe(
        first(),
        tap(url => this.navigate(url))
      )
      .subscribe();

    this.activeRoute.queryParams
      .pipe(
        filter(params => !!params.url),
        tap(params => this.navigate(params.url)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  clear() {
    if (this.zen) {
      return this.clearZen();
    }

    return this.clearFocus();
  }

  @Dispatch()
  addDevice = () =>
    new AddDeviceAction({
      name: 'Device',
      width: 411,
      height: 823,
      orientation: 'portrait',
      platform: 'android'
    });

  @Dispatch()
  toggleOrientation = () => new ToggleOrientation();
  @Dispatch()
  setTheme = (theme: Theme) => new UpdateTheme(theme);

  @Dispatch()
  navigate = (url: string) => new NavigateURL(url);

  @Dispatch()
  clearFocus = () => new ClearFocus();

  @Dispatch()
  setZoom = (zoom: number) => new UpdateZoom(zoom);

  @Dispatch()
  clearZen = () => new ClearZen();
}
