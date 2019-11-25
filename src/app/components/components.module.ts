import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule, MatTooltipModule } from '@angular/material';
import { DevicesComponent } from './devices/devices.component';
import { PipesModule } from './../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { DeviceComponent } from './device/device.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FivPopoverModule, FivSpinnerModule } from '@fivethree/core';
import { DeviceSettingsComponent } from './device/settings/settings.component';
import { AnimationsModule } from '@fivethree/ngx-rxjs-animations';

@NgModule({
  declarations: [DeviceComponent, DevicesComponent, DeviceSettingsComponent],
  imports: [
    CommonModule,
    IonicModule,
    PipesModule,
    MatIconModule,
    MatTooltipModule,
    FivPopoverModule,
    FormsModule,
    ReactiveFormsModule,
    FivSpinnerModule,
    AnimationsModule
  ],
  exports: [
    DeviceComponent,
    PipesModule,
    DevicesComponent,
    DeviceSettingsComponent
  ]
})
export class ComponentsModule {}
