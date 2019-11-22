import { Pipe, PipeTransform } from '@angular/core';
import { Device } from '@store/devices/devices.types';

@Pipe({
  name: 'width',
  pure: false
})
export class WidthPipe implements PipeTransform {
  transform(device: Device, offset = 0): string {
    const width =
      device.orientation === 'portrait' ? device.width : device.height;
    return `${width + offset}px`;
  }
}
