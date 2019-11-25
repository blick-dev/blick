import { Pipe, PipeTransform } from '@angular/core';
import { Device } from '@store/devices/devices.types';

@Pipe({
  name: 'height'
})
export class HeightPipe implements PipeTransform {
  transform(device: Device, offset = 0): number {
    const height =
      device.orientation === 'portrait' ? device.height : device.width;
    return height + offset;
  }
}
