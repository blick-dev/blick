import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pixel'
})
export class PixelPipe implements PipeTransform {
  transform(value: number): string {
    if (!value) {
      return '';
    }
    return `${value}px`;
  }
}
