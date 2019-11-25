import { IonContent } from '@ionic/angular';
import {
  Directive,
  AfterViewInit,
  Host,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { from, fromEvent, Subject } from 'rxjs';
import {
  withLatestFrom,
  tap,
  takeUntil,
  filter,
  map,
  startWith,
  scan,
  flatMap,
  mergeMap
} from 'rxjs/operators';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { UpdateZoom } from '@store/appearance/appearance.action';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';

@Directive({ selector: '[gestures]' })
export class GesturesDirective implements AfterViewInit, OnDestroy {
  onDestroy$ = new Subject();
  @SelectSnapshot(AppearanceState.zoom)
  zoom: number;

  constructor(@Host() private content: IonContent, private el: ElementRef) {}

  ngAfterViewInit(): void {
    this.setupDrag();
    this.setupWheel();
    this.setupPinch();
  }
  ngOnDestroy(): void {
    this.onDestroy$.next();
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
    fromEvent<WheelEvent>(window, 'mousewheel', {
      passive: false,
      capture: true
    })
      .pipe(
        filter(e => !!e.ctrlKey),
        tap(event => event.preventDefault()),
        map(event => -1 * event.deltaY),
        startWith(this.zoom),
        scan((curr, value) => Math.min(180, Math.max(curr + value, 20))),
        tap(this.setZoom),
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
      const walkX = (x - startX) * 2.8;
      const walkY = (y - startY) * 2.8;
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
  setZoom = (zoom: number) => new UpdateZoom(zoom);
}
