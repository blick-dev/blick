import { Directive, OnInit, ElementRef, Host } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { WidthPipe } from '@pipes/width.pipe';
import { Store } from '@ngxs/store';
import { fromEvent, merge, from, Observable } from 'rxjs';
import {
  tap,
  withLatestFrom,
  flatMap,
  map,
  takeUntil,
  first,
  repeat,
  filter
} from 'rxjs/operators';
import { AppearanceState } from '@store/appearance/appearance.state';
import { DevicesState } from '@store/devices/devices.state';
import { DeviceComponent } from './device.component';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Device } from '@store/devices/devices.types';
import { FocusDevice } from '@store/devices/devices.action';

export interface DeviceDragEvent {
  left: number;
  top: number;
  device: DeviceComponent;
}
export interface DeviceDragEndEvent {
  left: number;
  device: DeviceComponent;
  order: number;
}

@Directive({ selector: '[dragdrop]' })
export class DeviceDragDropDirective implements OnInit {
  @SelectSnapshot(AppearanceState.padding)
  padding: number;
  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(DevicesState.focus)
  private focus: Device;

  drag$: Observable<DeviceDragEvent>;
  dragStart$: Observable<DeviceDragEvent>;
  dragEnd$: Observable<DeviceDragEndEvent>;
  click$: Observable<MouseEvent>;

  constructor(
    @Host() private device: DeviceComponent,
    private widthPipe: WidthPipe,
    public element: ElementRef,
    private store: Store,
    @Host() private content: IonContent
  ) {}

  ngOnInit(): void {
    this.setupDragDrop();
  }

  setupDragDrop() {
    const down$ = fromEvent<MouseEvent>(
      this.device.overlay.nativeElement,
      'mousedown'
    ).pipe(
      tap(event => event.stopPropagation()),
      tap(event => event.preventDefault())
    );

    const up$ = merge(
      fromEvent<MouseEvent>(this.device.overlay.nativeElement, 'mouseup'),
      fromEvent<MouseEvent>(window, 'mouseout')
    );
    const move$ = fromEvent<MouseEvent>(
      this.device.overlay.nativeElement,
      'mousemove'
    );

    this.drag$ = down$.pipe(
      withLatestFrom(from(this.content.getScrollElement())),
      flatMap(down => {
        const factor = 1 / (this.zoom / 100);
        const startX = (down[0].clientX + down[1].scrollLeft) * factor;
        const startLeft =
          parseInt(this.element.nativeElement.style.left, 10) || 0;
        const startY = (down[0].clientY + down[1].scrollTop) * factor;
        const startTop =
          parseInt(this.element.nativeElement.style.top, 10) || 0;

        return move$.pipe(
          withLatestFrom(from(this.content.getScrollElement())),
          map(move => {
            return {
              left:
                startLeft +
                factor * move[0].clientX -
                startX +
                factor * move[1].scrollLeft,
              top:
                startTop +
                factor * move[0].clientY -
                startY +
                factor * move[1].scrollTop,
              device: this.device
            };
          }),
          takeUntil(up$)
        );
      })
    );

    this.dragStart$ = this.drag$.pipe(
      first(),
      repeat(),
      takeUntil(this.device.onDestroy$)
    );

    this.dragEnd$ = this.dragStart$.pipe(
      flatMap(() => {
        return up$;
      }),
      first(),
      withLatestFrom(this.drag$),
      map(([event, drag]) => {
        const order = this.store.selectSnapshot(
          AppearanceState.order(this.device.device)
        );
        const before = this.store.selectSnapshot(AppearanceState.before(order));
        const width = before
          .map(b => this.widthPipe.transform(b))
          .reduce((a, b) => a + b, 0);
        const padding = before.length * this.padding;
        const ret: DeviceDragEndEvent = {
          device: drag.device,
          left: width + padding,
          order
        };
        return ret;
      }),
      repeat(),
      takeUntil(this.device.onDestroy$)
    );

    this.click$ = fromEvent<MouseEvent>(
      this.device.overlay.nativeElement,
      'mousedown'
    ).pipe(
      filter(ev => !this.focus || this.device.device.name !== this.focus.name),
      first(),
      flatMap(() =>
        fromEvent<MouseEvent>(this.device.overlay.nativeElement, 'click')
      ),
      takeUntil(this.drag$),
      repeat(),
      takeUntil(this.device.onDestroy$)
    );

    this.click$
      .pipe(tap(() => this.focusDevice(this.device.device)))
      .subscribe();
  }

  @Dispatch()
  focusDevice = (device: Device) => new FocusDevice(device);
}
