import { DevicesComponent } from "./devices/devices.component";
import { PipesModule } from "./../pipes/pipes.module";
import { IonicModule } from "@ionic/angular";
import { DeviceComponent } from "./device/device.component";
import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

@NgModule({
  declarations: [DeviceComponent, DevicesComponent],
  imports: [CommonModule, IonicModule, PipesModule],
  exports: [DeviceComponent, PipesModule, DevicesComponent]
})
export class ComponentsModule {}
