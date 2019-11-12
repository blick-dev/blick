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
  tap,
  flatMap,
  withLatestFrom,
  takeUntil,
  mergeMap
} from 'rxjs/operators';
import { Select } from '@ngxs/store';
import { Device } from '@store/devices/devices.action';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnDestroy, AfterViewInit {
  url: string = 'https://fivethree-team.github.io/ionic-4-components/';
  zoom: number = 60;

  @Select(DevicesState.devices)
  devices: Observable<Device[]>;

  @ViewChild(IonContent, { static: true })
  content: IonContent;
  @ViewChild('content', { static: true, read: ElementRef }) el: ElementRef;
  @ViewChild(DevicesComponent, { static: true })
  devicesComponent: DevicesComponent;

  onDestroy$ = new Subject();

  constructor() {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  ngAfterViewInit(): void {
    this.setupDrag();
    this.setupWheel();
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

    const walk = (event: [MouseEvent, HTMLElement]) => {
      console.log('walk', event);
      const x = event[0].pageX - event[1].offsetLeft;
      const walk = (x - startX) * 3; //scroll fast
      event[1].scrollLeft = scrollLeft - walk;
    };

    down$
      .pipe(
        tap(console.log),
        tap(() => this.el.nativeElement.classList.add('drag')),
        flatMap(() => scroll),
        withLatestFrom(down$),
        tap(v => (startX = v[1].pageX - v[0].offsetLeft)),
        tap(v => (scrollLeft = v[0].scrollLeft)),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    up$
      .pipe(
        tap(console.log),
        tap(() => this.el.nativeElement.classList.remove('drag')),
        takeUntil(this.onDestroy$)
      )
      .subscribe();

    down$
      .pipe(
        mergeMap(() => move$.pipe(takeUntil(up$))),
        withLatestFrom(scroll),
        tap(console.log),
        tap(event => event[0].preventDefault()),
        tap(walk),
        takeUntil(this.onDestroy$)
      )
      .subscribe();
  }
}
