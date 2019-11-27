import { GesturesDirective } from './gestures.directive';
import { FivPopoverModule, FivOverlayModule } from '@fivethree/core';
import { ComponentsModule } from './../components/components.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import {
  MatTooltipModule,
  MatIconModule,
  MatSliderModule
} from '@angular/material';
import { AppearanceSettingsComponent } from './appearance-settings/appearance-settings.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FivOverlayModule,
    ComponentsModule,
    MatTooltipModule,
    MatIconModule,
    MatSliderModule,
    FivPopoverModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ])
  ],
  declarations: [HomePage, GesturesDirective, AppearanceSettingsComponent]
})
export class HomePageModule {}
