import { Platform } from '@ionic/angular';
import {
  Component,
  OnInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  HostBinding,
  ElementRef,
  OnDestroy,
  HostListener
} from '@angular/core';
import { zip, Observable, Subject } from 'rxjs';
import { map, flatMap, takeUntil, filter } from 'rxjs/operators';
import { DeviceComponent } from '../device/device.component';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import { DeviceDragDropDirective } from '@components/device/device-dragdrop.directive';
import { DevicesState } from '@store/devices/devices.state';
import { Device } from '@store/devices/devices.types';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, AfterContentInit, OnDestroy {
  @HostBinding('style.width') get _width() {
    if (this.zen) {
      return this.platform.width() + 'px';
    }
    return this.width + 'px';
  }
  @HostBinding('style.height') get _height() {
    if (this.zen) {
      return this.platform.height() + 'px';
    }
    return this.height + 'px';
  }
  @HostBinding('style.transform') get _transform() {
    return `scale(${this.zoom / 100})`;
  }

  @HostBinding('style.transform-origin') get _transformOrigin() {
    return this.zen ? 'center center' : 'top left';
  }

  @ContentChildren(DeviceComponent) devices: QueryList<DeviceComponent>;
  @ContentChildren(DeviceDragDropDirective) dragDevices: QueryList<
    DeviceDragDropDirective
  >;

  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(AppearanceState.padding)
  padding: number;
  @SelectSnapshot(AppearanceState.width())
  width: number;
  @SelectSnapshot(AppearanceState.height())
  height: number;
  @SelectSnapshot(DevicesState.zen)
  zen: Device;

  documents$: Observable<Document[]>;
  onDestroy$ = new Subject();

  constructor(public element: ElementRef, private platform: Platform) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngAfterContentInit(): void {
    this.documents$ = this.devices.changes.pipe(
      map(devices => devices.map(device => device.document)),
      filter(devices => devices.filter(d => !!d).length > 0),
      flatMap((obs: Observable<Document>[]) => zip(...obs))
    );

    this.documents$.pipe(takeUntil(this.onDestroy$)).subscribe();
  }
}
