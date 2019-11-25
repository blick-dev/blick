import { DeviceDragEndEvent } from './../device/device.component';
import { SwapAction } from './../../store/devices/devices.action';
import { DevicesState } from '@store/devices/devices.state';
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
import { zip, Observable, Subject, merge } from 'rxjs';
import {
  map,
  tap,
  flatMap,
  takeUntil,
  startWith,
  filter,
  withLatestFrom,
  repeat,
  throttleTime,
  debounceTime
} from 'rxjs/operators';
import { DeviceComponent, DeviceDragEvent } from '../device/device.component';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { DragDevice, ClearDrag } from '@store/devices/devices.action';
import { Device } from '@store/devices/devices.types';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, AfterContentInit, OnDestroy {
  drags$: Observable<DeviceDragEvent>;
  dragStarts$: Observable<DeviceDragEvent>;
  dragEnds$: Observable<DeviceDragEndEvent>;
  overlayed$: Observable<DeviceDragEvent[]>;

  @HostBinding('style.width') get width() {
    return this.pixelWidth + 'px';
  }
  @HostBinding('style.transform') get transform() {
    return `scale(${this.zoom / 100})`;
  }

  @ContentChildren(DeviceComponent) devices: QueryList<DeviceComponent>;

  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(AppearanceState.padding)
  padding: number;

  @Select(DevicesState.nondrag)
  private nondrag: Observable<Device[]>;

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

  constructor(
    public element: ElementRef,
    private widthPipe: WidthPipe,
    private store: Store
  ) {}

  ngOnInit() {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngAfterContentInit(): void {
    this.documents$ = this.devices.changes.pipe(
      map(devices => devices.map(device => device.document)),
      filter(devices => devices.filter(d => !!d).length > 0),
      tap(console.log),
      flatMap((obs: Observable<Document>[]) => zip(...obs))
    );

    this.documents$.pipe(takeUntil(this.onDestroy$)).subscribe();

    this.setupDrag();
  }

  setupDrag() {
    this.dragStarts$ = this.devices.changes.pipe(
      startWith(this.devices),
      flatMap((devices: QueryList<DeviceComponent>) =>
        merge(...devices.map(device => device.dragStart$))
      )
    );

    this.dragEnds$ = this.devices.changes.pipe(
      startWith(this.devices),
      flatMap((devices: QueryList<DeviceComponent>) =>
        merge(...devices.map(device => device.dragEnd$))
      )
    );

    this.drags$ = this.devices.changes.pipe(
      startWith(this.devices),
      flatMap((devices: QueryList<DeviceComponent>) =>
        merge(...devices.map(device => device.drag$))
      )
    );

    this.overlayed$ = this.drags$.pipe(
      flatMap(() => this.nondrag),
      filter(devices => devices.length > 0),
      withLatestFrom(this.drags$),
      map(([devices, drag]) => {
        const factor = 1 / (this.zoom / 100);
        const rect = (drag.device.element
          .nativeElement as HTMLElement).getBoundingClientRect();
        const overlayed: DeviceDragEvent[] = [];
        this.devices
          .filter(d => devices.some(dev => dev.name === d.device.name))
          .map(device => {
            const dRect = (device.element
              .nativeElement as HTMLElement).getBoundingClientRect();

            if (this.touching(rect as DOMRect, dRect as DOMRect)) {
              const left = -1 * (rect.width + this.padding / 2) * factor;
              overlayed.push({ device, left });
            }
          });
        return overlayed;
      }),
      takeUntil(this.onDestroy$)
    );

    this.handleDrag();
  }

  touching(a: DOMRect, b: DOMRect) {
    return !(
      a.y + a.height < b.y ||
      a.y > b.y + b.height ||
      a.x + a.width < b.x ||
      a.x > b.x + b.width
    );
  }

  handleDrag() {
    this.dragStarts$
      .pipe(
        tap(({ device }) => this.selectDragDevice(device.device)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    this.drags$
      .pipe(
        tap(
          ({ left, device }) =>
            (device.element.nativeElement.style.left = left + 'px')
        ),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    this.dragEnds$
      .pipe(tap(this.clearDrag), takeUntil(this.onDestroy$))
      .subscribe();

    this.overlayed$
      .pipe(
        filter(o => o.length > 0),
        debounceTime(200),
        throttleTime(1000),
        withLatestFrom(this.drags$),
        tap(vals =>
          this.swap(
            vals[1].device.device,
            vals[0].map(e => e.device.device)
          )
        ),
        takeUntil(this.dragEnds$),
        repeat()
      )
      .subscribe();
  }

  @Dispatch()
  selectDragDevice = (device: Device) => new DragDevice(device);

  @Dispatch()
  swap = (drag: Device, overlayed: Device[]) => new SwapAction(drag, overlayed);

  @Dispatch()
  clearDrag = () => new ClearDrag();
}
