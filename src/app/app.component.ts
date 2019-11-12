import { AddDeviceAction } from './store/devices/devices.action';
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(private platform: Platform) {}

  @Dispatch()
  addDevice = () =>
    new AddDeviceAction({
      name: 'Pixel 3Xl',
      width: 411,
      height: 823,
      orientation: 'portrait',
      platform: 'android'
    });
}
