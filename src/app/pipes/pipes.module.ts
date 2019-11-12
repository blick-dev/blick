import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe.pipe';
import { PlatformPipe } from './platform.pipe';
import {
  EmptyPipeModule,
  PendingPipeModule,
  ErrorPipeModule
} from '@fivethree/async-pipes';

@NgModule({
  declarations: [SafePipe, PlatformPipe],
  imports: [CommonModule, EmptyPipeModule, PendingPipeModule, ErrorPipeModule],
  exports: [
    SafePipe,
    PlatformPipe,
    EmptyPipeModule,
    PendingPipeModule,
    ErrorPipeModule
  ]
})
export class PipesModule {}
