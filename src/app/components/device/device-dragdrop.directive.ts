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
  filter,
  debounceTime,
  buffer
} from 'rxjs/operators';
import { AppearanceState } from '@store/appearance/appearance.state';
import { DevicesState } from '@store/devices/devices.state';
import { DeviceComponent } from './device.component';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Device } from '@store/devices/devices.types';

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
  click$: Observable<Device>;
  doubleclick$: Observable<Device>;

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
    const down$ = merge(
      fromEvent<MouseEvent>(this.device.overlay.nativeElement, 'pointerdown', {
        passive: false,
        capture: true
      })
    ).pipe(
      tap(event => event.stopPropagation()),
      tap(event => event.preventDefault())
    );

    const up$ = merge(
      fromEvent<MouseEvent>(this.device.overlay.nativeElement, 'pointerup'),
      fromEvent<MouseEvent>(window, 'pointerout', {
        passive: false,
        capture: true
      })
    ).pipe(
      tap(event => event.stopPropagation()),
      tap(event => event.preventDefault())
    );
    const move$ = fromEvent<MouseEvent>(
      this.device.overlay.nativeElement,
      'pointermove',
      {
        passive: false,
        capture: true
      }
    ).pipe(
      tap(event => event.stopPropagation()),
      tap(event => event.preventDefault())
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

    const buff$ = down$.pipe(debounceTime(150));

    this.doubleclick$ = down$.pipe(
      buffer(buff$),
      map(list => {
        return list.length;
      }),
      filter(x => x === 2),
      map(() => this.device.device),
      takeUntil(this.device.onDestroy$)
    );

    this.click$ = down$.pipe(
      filter(ev => !this.focus || this.device.device.name !== this.focus.name),
      debounceTime(200),
      first(),
      map(() => this.device.device),
      takeUntil(this.dragStart$),
      takeUntil(this.doubleclick$),
      repeat(),
      takeUntil(this.device.onDestroy$)
    );

    // prevent touch on overlay (electron) to make dra drop work
    merge<TouchEvent>(
      fromEvent(this.device.overlay.nativeElement, 'touchstart', {
        passive: false,
        capture: true
      }),
      fromEvent(this.device.overlay.nativeElement, 'touchmove', {
        passive: false,
        capture: true
      }),
      fromEvent(this.device.overlay.nativeElement, 'touchend', {
        passive: false,
        capture: true
      })
    )
      .pipe(
        tap(event => event.stopPropagation()),
        tap(event => event.preventDefault()),
        takeUntil(this.device.onDestroy$)
      )
      .subscribe();
  }
}
