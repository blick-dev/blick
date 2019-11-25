import { DevicesState } from '@store/devices/devices.state';
import { WidthPipe } from './../../pipes/width.pipe';
import { Platform, IonContent } from '@ionic/angular';
import {
  RemoveDeviceAction,
  ToggleDeviceOrientation,
  FocusDevice
} from './../../store/devices/devices.action';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  HostBinding,
  OnDestroy,
  Host
} from '@angular/core';
import {
  fromEvent,
  Subject,
  ReplaySubject,
  Observable,
  merge,
  from
} from 'rxjs';
import {
  map,
  tap,
  first,
  takeUntil,
  withLatestFrom,
  flatMap,
  repeat,
  filter
} from 'rxjs/operators';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { Device } from '@store/devices/devices.types';
import { HeightPipe } from '@pipes/height.pipe';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import { Store } from '@ngxs/store';

export interface DeviceDragEvent {
  left: number;
  device: DeviceComponent;
}
export interface DeviceDragEndEvent {
  left: number;
  device: DeviceComponent;
  order: number;
}

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit, OnDestroy {
  @Input() device: Device;
  @Input() url: string;

  document$: ReplaySubject<Document> = new ReplaySubject();
  finishedLoading$: Observable<Event>;

  onDestroy$ = new Subject();

  drag$: Observable<DeviceDragEvent>;
  dragStart$: Observable<DeviceDragEvent>;
  dragEnd$: Observable<DeviceDragEndEvent>;
  click$: Observable<MouseEvent>;

  @SelectSnapshot(AppearanceState.padding)
  padding: number;
  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;
  @SelectSnapshot(DevicesState.drag)
  private drag: Device;
  @SelectSnapshot(DevicesState.focus)
  private focus: Device;

  @HostBinding('style.left')
  get _left() {
    if (!this.device) {
      return;
    }
    if (this.drag && this.drag.name === this.device.name) {
      return parseInt(this.element.nativeElement.style.left, 10) || 0 + 'px';
    }
    const order = this.store.selectSnapshot(DevicesState.order(this.device));
    const before = this.store.selectSnapshot(DevicesState.before(order));
    const width = before
      .map(b => this.widthPipe.transform(b))
      .reduce((a, b) => a + b, 0);
    const padding = before.length * this.padding;
    return width + padding + 'px';
  }

  @HostBinding('style.width')
  get _width() {
    return this.widthPipe.transform(this.device) + 'px';
  }
  @HostBinding('style.z-index')
  get _zIndex() {
    if (this.drag && this.drag.name === this.device.name) {
      return 100;
    }
    return this.store.selectSnapshot(DevicesState.order(this.device));
  }
  @HostBinding('style.height')
  get _height() {
    return this.heightPipe.transform(this.device, 56) + 'px';
  }
  @HostBinding('style.margin')
  get _margin() {
    return this.padding / 2 + 'px';
  }

  @HostBinding('class')
  get _classes() {
    const drag =
      this.drag && this.device && this.drag.name === this.device.name
        ? 'drag'
        : 'no-drag';

    const focus =
      this.focus && this.device && this.focus.name === this.device.name
        ? 'focus'
        : 'blur';

    return [focus, drag].join(' ');
  }

  @ViewChild('frame', { static: true }) iframe: ElementRef<HTMLIFrameElement>;
  @ViewChild('overlay', { static: true }) overlay: ElementRef;

  constructor(
    private _platform: Platform,
    private heightPipe: HeightPipe,
    private widthPipe: WidthPipe,
    public element: ElementRef,
    private store: Store,
    @Host() private content: IonContent
  ) {}

  ngOnInit() {
    this.initDevice();
    this.setupDragDrop();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  initDevice() {
    this.finishedLoading$ = fromEvent(this.iframe.nativeElement, 'load');

    if (this._platform.is('electron')) {
      this.finishedLoading$
        .pipe(
          first(),
          // tap(() => this.setUserAgent()),
          tap(() => this.initTouch()),
          tap(() => this.silence()),
          map<Event, Document>(
            () => this.iframe.nativeElement.contentWindow.document
          ),
          tap<Document>(doc => this.document$.next(doc))
        )
        .subscribe();
    }
  }

  setupDragDrop() {
    const down$ = fromEvent<MouseEvent>(
      this.overlay.nativeElement,
      'mousedown'
    ).pipe(
      tap(event => event.stopPropagation()),
      tap(event => event.preventDefault())
    );

    const up$ = merge(
      fromEvent<MouseEvent>(this.overlay.nativeElement, 'mouseup'),
      fromEvent<MouseEvent>(window, 'mouseout')
    );
    const move$ = fromEvent<MouseEvent>(
      this.overlay.nativeElement,
      'mousemove'
    );

    this.drag$ = down$.pipe(
      withLatestFrom(from(this.content.getScrollElement())),
      flatMap(down => {
        const factor = 1 / (this.zoom / 100);
        const startX = (down[0].clientX + down[1].scrollLeft) * factor;
        const startLeft =
          parseInt(this.element.nativeElement.style.left, 10) || 0;

        return move$.pipe(
          withLatestFrom(from(this.content.getScrollElement())),
          map(move => {
            return {
              left:
                startLeft +
                factor * move[0].clientX -
                startX +
                factor * move[1].scrollLeft,
              device: this
            };
          }),
          takeUntil(up$)
        );
      })
    );

    this.dragStart$ = this.drag$.pipe(
      first(),
      repeat(),
      takeUntil(this.onDestroy$)
    );

    this.dragEnd$ = this.dragStart$.pipe(
      flatMap(() => {
        return up$;
      }),
      first(),
      withLatestFrom(this.drag$),
      map(([event, drag]) => {
        const order = this.store.selectSnapshot(
          DevicesState.order(this.device)
        );
        const before = this.store.selectSnapshot(DevicesState.before(order));
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
      takeUntil(this.onDestroy$)
    );

    this.click$ = fromEvent<MouseEvent>(
      this.overlay.nativeElement,
      'mousedown'
    ).pipe(
      filter(ev => !this.focus || this.device.name !== this.focus.name),
      first(),
      flatMap(() => fromEvent<MouseEvent>(this.overlay.nativeElement, 'click')),
      takeUntil(this.drag$),
      repeat(),
      takeUntil(this.onDestroy$)
    );

    this.click$.pipe(tap(() => this.focusDevice(this.device))).subscribe();
  }

  setUserAgent() {
    const agent = `Mozilla/5.0 (Linux; Android 8.0.0; Pixel 2 XL Build/OPD1.170816.004)
     AppleWebKit/537.36 (KHTML, like Gecko)
      Chrome/78.0.3904.97 Mobile Safari/537.36`;
    const ios = `Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X)
     AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1 ios`;
    Object.defineProperty(
      this.iframe.nativeElement.contentWindow.navigator,
      'userAgent',
      {
        get: function() {
          return agent; // customized user agent
        },
        configurable: true
      }
    );
  }

  silence(): void {
    this.iframe.nativeElement.contentWindow.console.log = function() {
      /* nop */
    };
  }

  initTouch() {
    const cursor = 'url(assets/cursor.png), auto';
    this.iframe.nativeElement.contentWindow.document.body.style.cursor = cursor;
  }

  @Dispatch()
  delete = (device: string) => new RemoveDeviceAction(device);

  @Dispatch()
  toggleDeviceOrientation = (device: string) =>
    new ToggleDeviceOrientation(device);

  @Dispatch()
  focusDevice = (device: Device) => new FocusDevice(device);
}
