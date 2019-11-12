import { DevicesState } from './../store/devices/devices.state';
import { DevicesComponent } from './../components/devices/devices.component';
import {
  Component,
  ViewChild,
  ElementRef,
  OnDestroy,
  AfterViewInit
} from '@angular/core';
import { IonContent } from '@ionic/angular';
import { from, fromEvent, Subject, Observable } from 'rxjs';
import {
  filter,
  map,
  flatMap,
  withLatestFrom,
  takeUntil,
  mergeMap,
  tap,
  startWith,
  reduce,
  scan
} from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { Device } from '@store/devices/devices.action';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy, AfterViewInit {
  url: Observable<string>;
  zoom: number = 60;

  @Select(DevicesState.devices)
  devices: Observable<Device[]>;

  @ViewChild(IonContent, { static: true })
  content: IonContent;
  @ViewChild('content', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild(DevicesComponent, { static: true })
  devicesComponent: DevicesComponent;

  onDestroy$ = new Subject();

  constructor(private activeRoute: ActivatedRoute) {
    this.url = this.activeRoute.queryParams.pipe(
      map(params =>
        params.url
          ? params.url
          : 'https://fivethree-team.github.io/ionic-4-components/'
      )
    );
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

    fromEvent<WheelEvent>(this.el.nativeElement, 'mousewheel', {
      passive: false,
      capture: true
    })
      .pipe(
        filter(e => !e.ctrlKey),
        map(event => ({ posX: event.deltaX * -2, posY: event.deltaY * -2 })),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
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
}
