import { Pipe, PipeTransform } from '@angular/core';
import { DevicePlatform } from '@store/devices/devices.types';

@Pipe({
  name: 'plt'
})
export class PlatformPipe implements PipeTransform {
  transform(value: string, platform: DevicePlatform): any {
    if ('ios' === platform) {
      return value.indexOf('?') > -1
        ? `${value}&ionic:mode=ios`
        : `${value}?ionic:mode=ios`;
    }

    return value;
  }
}
