import { DevicePlatform } from './../store/devices/devices.action';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'plt'
})
export class PlatformPipe implements PipeTransform {
  transform(value: string, platform: DevicePlatform): any {
    if (['ios', 'safari'].some(s => s === platform)) {
      return value.indexOf('?') > -1
        ? `${value}&ionic:mode=ios`
        : `${value}?ionic:mode=ios`;
    }

    return value;
  }
}
