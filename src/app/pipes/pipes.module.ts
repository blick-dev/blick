import { PixelPipe } from './pixel.pipe';
import { LogPipe } from './log.pipe';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe.pipe';
import { PlatformPipe } from './platform.pipe';
import {
  EmptyPipeModule,
  PendingPipeModule,
  ErrorPipeModule
} from '@fivethree/async-pipes';
import { WidthPipe } from './width.pipe';
import { HeightPipe } from './height.pipe';

const pipes = [
  SafePipe,
  PlatformPipe,
  WidthPipe,
  HeightPipe,
  LogPipe,
  PixelPipe
];

@NgModule({
  declarations: pipes,
  imports: [CommonModule, EmptyPipeModule, PendingPipeModule, ErrorPipeModule],
  providers: pipes,
  exports: [EmptyPipeModule, PendingPipeModule, ErrorPipeModule, ...pipes]
})
export class PipesModule {}
