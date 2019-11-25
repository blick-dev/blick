import { WidthPipe } from './../../pipes/width.pipe';
import {
  Component,
  OnInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  HostBinding,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { zip, Observable, Subject } from 'rxjs';
import { map, flatMap, takeUntil, filter } from 'rxjs/operators';
import { DeviceComponent } from '../device/device.component';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import { DeviceDragDropDirective } from '@components/device/device-dragdrop.directive';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, AfterContentInit, OnDestroy {
  @HostBinding('style.width') get width() {
    return this.pixelWidth + 'px';
  }
  @HostBinding('style.transform') get transform() {
    return `scale(${this.zoom / 100})`;
  }

  @ContentChildren(DeviceComponent) devices: QueryList<DeviceComponent>;
  @ContentChildren(DeviceDragDropDirective) dragDevices: QueryList<
    DeviceDragDropDirective
  >;

  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(AppearanceState.padding)
  padding: number;

  get pixelWidth() {
    const w =
      this.devices && this.devices.length > 0
        ? this.devices
            .map(d => this.widthPipe.transform(d.device) + this.padding)
            .reduce((p, c) => p + c + this.padding / 2)
        : 0;
    return w;
  }

  documents$: Observable<Document[]>;
  onDestroy$ = new Subject();

  constructor(public element: ElementRef, private widthPipe: WidthPipe) {}

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
