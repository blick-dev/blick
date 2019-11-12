import {
  Device,
  DeviceOrientation,
  DevicePlatform,
  RemoveDeviceAction
} from './../../store/devices/devices.action';
import {
  Component,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  HostBinding,
  OnDestroy
} from '@angular/core';
import { fromEvent, Subject, ReplaySubject } from 'rxjs';
import { map, tap, first } from 'rxjs/operators';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.scss']
})
export class DeviceComponent implements OnInit, OnDestroy, Device {
  @Input() orientation: DeviceOrientation;
  @Input() platform: DevicePlatform;
  @Input() name: string;
  @Input() width: number;
  @Input() height: number;

  @Input() url: string;

  document: ReplaySubject<Document> = new ReplaySubject();
  $onDestroy = new Subject();

  @HostBinding('style.width')
  get _width() {
    return `${this.width}px`;
  }

  @HostBinding('style.height')
  get _height() {
    return `${this.height + 56}px`;
  }

  @ViewChild('frame', { static: true }) iframe: ElementRef<HTMLIFrameElement>;

  constructor() {}

  ngOnInit() {
    fromEvent(this.iframe.nativeElement, 'load')
      .pipe(
        first(),
        tap(() => this.setUserAgent()),
        tap(() => this.initTouch()),
        map<Event, Document>(
          () => this.iframe.nativeElement.contentWindow.document
        ),
        tap<Document>(doc => this.document.next(doc))
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this.$onDestroy.next();
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
          return ios; // customized user agent
        },
        configurable: true
      }
    );

    console.log(this.iframe.nativeElement.contentWindow.navigator.userAgent);
  }

  initTouch() {
    const cursor = 'url(assets/cursor.png), auto';
    this.iframe.nativeElement.contentWindow.document.body.style.cursor = cursor;
    console.log(window.matchMedia('(any-pointer:coarse)'));
  }

  @Dispatch()
  delete = (device: string) => new RemoveDeviceAction(device);
}
