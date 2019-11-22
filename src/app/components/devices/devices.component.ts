import { WidthPipe } from './../../pipes/width.pipe';
import {
  Component,
  OnInit,
  ContentChildren,
  QueryList,
  AfterContentInit,
  HostBinding,
  ElementRef,
  Input
} from '@angular/core';
import { of, zip, Observable } from 'rxjs';
import { map, tap, flatMap } from 'rxjs/operators';
import { DeviceComponent } from '../device/device.component';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, AfterContentInit {
  @ContentChildren(DeviceComponent) devices: QueryList<DeviceComponent>;
  @HostBinding('style.width') get width() {
    return this.pixelWidth + 'px';
  }
  get pixelWidth() {
    const w =
      this.devices && this.devices.length > 0
        ? this.devices
            .map(d => this.widthPipe.transform(d) + this.padding * 2)
            .reduce((p, c) => p + c + 14)
        : 0;
    return w;
  }

  @HostBinding('style.transform') get transform() {
    return `scale(${this.zoom})`;
  }

  @Input() zoom: number = 0.6;
  @Input() padding: number = 32;

  documents: Observable<Document[]>;

  constructor(public element: ElementRef, private widthPipe: WidthPipe) {}

  ngOnInit() {}

  ngAfterContentInit(): void {
    this.documents = of(this.devices.toArray()).pipe(
      map(devices => devices.map(device => device.document)),
      flatMap((obs: Observable<Document>[]) => zip(...obs))
    );

    this.documents.subscribe();
  }
}
