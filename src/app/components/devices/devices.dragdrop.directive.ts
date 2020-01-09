import { DevicesComponent } from './devices.component';
import { Directive, QueryList, Host, AfterViewInit } from '@angular/core';
import { Observable, merge } from 'rxjs';
import {
  DeviceDragEvent,
  DeviceDragEndEvent,
  DeviceDragDropDirective
} from '@components/device/device-dragdrop.directive';
import {
  startWith,
  tap,
  flatMap,
  filter,
  withLatestFrom,
  map,
  takeUntil,
  debounceTime,
  throttleTime,
  repeat
} from 'rxjs/operators';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Device } from '@store/devices/devices.types';
import {
  DragDevice,
  ClearDrag,
  FocusDevice,
  ZenDevice
} from '@store/devices/devices.action';
import { SwapAction } from '@store/appearance/appearance.action';
import { DevicesState } from '@store/devices/devices.state';
import { Select, Store } from '@ngxs/store';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import {
  tween,
  easeInOutSine,
  toPosition,
  RectPosition
} from '@fivethree/ngx-rxjs-animations';

@Directive({ selector: '[drapdroparea]' })
export class DevicesDragDropDirective implements AfterViewInit {
  drags$: Observable<DeviceDragEvent>;
  dragStarts$: Observable<DeviceDragEvent>;
  dragEnds$: Observable<DeviceDragEndEvent>;
  overlayed$: Observable<DeviceDragEvent[]>;
  clicks$: Observable<Device>;
  doubleclicks$: Observable<Device>;

  @Select(DevicesState.nondrag)
  nondrag: Observable<Device[]>;

  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(AppearanceState.padding)
  padding: number;

  constructor(
    @Host() private devices: DevicesComponent,
    private store: Store
  ) {}

  ngAfterViewInit(): void {
    this.setupDrag();
  }

  setupDrag() {
    this.dragStarts$ = this.devices.dragDevices.changes.pipe(
      startWith(this.devices.dragDevices),
      flatMap((devices: QueryList<DeviceDragDropDirective>) =>
        merge(...devices.map(device => device.dragStart$))
      )
    );

    this.dragEnds$ = this.devices.dragDevices.changes.pipe(
      startWith(this.devices.dragDevices),
      flatMap((devices: QueryList<DeviceDragDropDirective>) =>
        merge(...devices.map(device => device.dragEnd$))
      )
    );

    this.drags$ = this.devices.dragDevices.changes.pipe(
      startWith(this.devices.dragDevices),
      flatMap((devices: QueryList<DeviceDragDropDirective>) =>
        merge(...devices.map(device => device.drag$))
      )
    );
    this.clicks$ = this.devices.dragDevices.changes.pipe(
      startWith(this.devices.dragDevices),
      flatMap((devices: QueryList<DeviceDragDropDirective>) =>
        merge(...devices.map(device => device.click$))
      )
    );
    this.doubleclicks$ = this.devices.dragDevices.changes.pipe(
      startWith(this.devices.dragDevices),
      flatMap((devices: QueryList<DeviceDragDropDirective>) =>
        merge(...devices.map(device => device.doubleclick$))
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
        this.devices.devices
          .filter(d => devices.some(dev => dev.name === d.device.name))
          .map(device => {
            const dRect = (device.element
              .nativeElement as HTMLElement).getBoundingClientRect();

            if (this.touching(rect as DOMRect, dRect as DOMRect)) {
              const left = -1 * (rect.width + this.padding / 2) * factor;
              overlayed.push({ device, left, top: 0 });
            }
          });
        return overlayed;
      }),
      takeUntil(this.devices.onDestroy$)
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
        takeUntil(this.devices.onDestroy$)
      )
      .subscribe();

    this.drags$
      .pipe(
        tap(
          ({ left, device }) =>
            (device.element.nativeElement.style.left = left + 'px')
        ),
        tap(
          ({ top, device }) =>
            (device.element.nativeElement.style.top = top + 'px')
        ),
        takeUntil(this.devices.onDestroy$)
      )
      .subscribe();

    this.dragEnds$
      .pipe(tap(this.clearDrag), takeUntil(this.devices.onDestroy$))
      .subscribe();

    this.clicks$
      .pipe(tap(this.focusDevice), takeUntil(this.devices.onDestroy$))
      .subscribe();
    // this.doubleclicks$
    //   .pipe(
    //     flatMap((device: Device) => {
    //       const comp = this.devices.devices.find(
    //         d => d.device.name === device.name
    //       );
    //       const left = this.store.selectSnapshot(
    //         AppearanceState.zenleft(device)
    //       );
    //       const top = this.store.selectSnapshot(AppearanceState.zentop(device));
    //       const position: RectPosition = {
    //         left: left,
    //         top: top,
    //         height: device.height,
    //         width: device.width
    //       };
    //       const animation = tween(easeInOutSine, 200).pipe(
    //         tap(console.log),
    //         toPosition(comp.element, position)
    //       );
    //       return animation;
    //     }),
    //     takeUntil(this.devices.onDestroy$)
    //   )
    //   .subscribe();

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

  @Dispatch()
  focusDevice = (device: Device) => new FocusDevice(device);

  @Dispatch()
  zenDevice = (device: Device) => new ZenDevice(device);
}
