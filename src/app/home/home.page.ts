import { NavigateURL } from './../store/devices/devices.action';
import { UpdateTheme } from './../store/appearance/appearance.action';
import { DevicesState } from './../store/devices/devices.state';
import { DevicesComponent } from './../components/devices/devices.component';
import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { IonContent, Platform, IonRange, IonInput } from '@ionic/angular';
import { from, fromEvent, Subject, Observable, merge } from 'rxjs';
import {
  filter,
  map,
  flatMap,
  withLatestFrom,
  takeUntil,
  mergeMap,
  tap,
  startWith,
  scan,
  debounceTime
} from 'rxjs/operators';
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

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy, AfterViewInit {
  @Select(DevicesState.url)
  url$: Observable<string>;
  zoom = 60;

  @Select(DevicesState.devices)
  devices: Observable<Device[]>;
  @Select(DevicesState.orientation)
  orientation: Observable<DeviceOrientation>;
  @Select(AppearanceState.theme)
  theme: Observable<Theme>;

  @ViewChild(IonContent, { static: true })
  content: IonContent;
  @ViewChild('content', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild(DevicesComponent, { static: true })
  devicesComponent: DevicesComponent;
  @ViewChild('zoomRange', { static: true })
  zoomRange: IonRange;

  onDestroy$ = new Subject();

  constructor(private activeRoute: ActivatedRoute, private platform: Platform) {
    this.activeRoute.queryParams
      .pipe(
        filter(params => !!params.url),
        tap(params => console.log(params)),
        tap(params => this.navigate(params.url)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngAfterViewInit(): void {
    this.setupDrag();
    this.setupWheel();
    this.setupPinch();
  }

  setupWheel() {
    const scroll = from(this.content.getScrollElement());
    const ua = navigator.userAgent.toLowerCase();
    if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') !== -1) {
      // workaround for chrome on mac
      fromEvent<WheelEvent>(this.el.nativeElement, 'mousewheel', {
        passive: false,
        capture: true
      })
        .pipe(
          withLatestFrom(scroll),
          tap(event => event[0].preventDefault()),
          tap(value =>
            value[1].scrollBy({
              left: value[0].deltaX,
              top: value[0].deltaY,
              behavior: 'auto'
            })
          ),
          takeUntil(this.onDestroy$)
        )
        .subscribe();
    }
  }

  setupPinch() {
    fromEvent<WheelEvent>(this.el.nativeElement, 'mousewheel', {
      passive: false,
      capture: true
    })
      .pipe(
        filter(e => !!e.ctrlKey),
        map(event => -1 * event.deltaY),
        startWith(60),
        scan((curr, value) => Math.min(140, Math.max(curr + value, 20))),
        tap(zoom => (this.zoom = zoom)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    // fromEvent<WheelEvent>(this.el.nativeElement, 'mousewheel', {
    //   passive: false,
    //   capture: true
    // })
    //   .pipe(
    //     filter(e => !e.ctrlKey),
    //     map(event => ({ posX: event.deltaX * -2, posY: event.deltaY * -2 })),
    //     takeUntil(this.onDestroy$)
    //   )
    //   .subscribe();
  }

  setupDrag() {
    const scroll = from(this.content.getScrollElement());
    const move$ = fromEvent<MouseEvent>(this.el.nativeElement, 'mousemove');
    const down$ = fromEvent<MouseEvent>(
      this.el.nativeElement,
      'mousedown'
    ).pipe(filter(ev => ev.button !== 2));
    const up$ = fromEvent<MouseEvent>(this.el.nativeElement, 'mouseup');
    let startX;
    let scrollLeft;
    let startY;
    let scrollTop;

    const walk = (event: [MouseEvent, HTMLElement]) => {
      const x = event[0].pageX - event[1].offsetLeft;
      const y = event[0].pageY - event[1].offsetTop;
      const walkX = (x - startX) * 2.6;
      const walkY = (y - startY) * 2.6;
      event[1].scrollLeft = scrollLeft - walkX;
      event[1].scrollTop = scrollTop - walkY;
    };

    down$
      .pipe(
        tap(() => this.el.nativeElement.classList.add('drag')),
        flatMap(() => scroll),
        withLatestFrom(down$),
        tap(v => (startX = v[1].pageX - v[0].offsetLeft)),
        tap(v => (startY = v[1].pageY - v[0].offsetTop)),
        tap(v => (scrollLeft = v[0].scrollLeft)),
        tap(v => (scrollTop = v[0].scrollTop)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    up$
      .pipe(
        tap(() => this.el.nativeElement.classList.remove('drag')),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    down$
      .pipe(
        mergeMap(() => move$.pipe(takeUntil(up$))),
        withLatestFrom(scroll),
        tap(event => event[0].preventDefault()),
        tap(walk),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
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
}
