import { UpdateWidthSettings } from './../../store/appearance/appearance.action';
import {
  WidthSettings,
  DeviceAlignment
} from './../../store/appearance/appearance.types';
import { Component, OnDestroy, AfterViewInit } from '@angular/core';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { AppearanceState } from '@store/appearance/appearance.state';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-appearance-settings',
  templateUrl: './appearance-settings.component.html',
  styleUrls: ['./appearance-settings.component.scss']
})
export class AppearanceSettingsComponent implements AfterViewInit, OnDestroy {
  onDestroy$ = new Subject();
  @SelectSnapshot(AppearanceState.minWidth)
  min: number;
  @SelectSnapshot(AppearanceState.maxWidth())
  max: number;
  @SelectSnapshot(AppearanceState.width())
  width: number;
  @SelectSnapshot(AppearanceState.align)
  align: DeviceAlignment;

  constructor() {}

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

  horizontal() {
    this.updateWidthSettings({ width: 0, align: 'horizontal' });
  }
  vertical() {
    this.updateWidthSettings({ width: 0, align: 'vertical' });
  }
  custom(value: number) {
    this.updateWidthSettings({ width: value, align: 'custom' });
  }

  rangeChange(event: CustomEvent) {
    if (event.detail.value === this.max) {
      return this.updateWidthSettings({
        width: event.detail.value,
        align: 'horizontal'
      });
    } else if (event.detail.value === this.min) {
      return this.updateWidthSettings({
        width: event.detail.value,
        align: 'vertical'
      });
    }
    this.updateWidthSettings({ width: event.detail.value, align: 'custom' });
  }

  @Dispatch()
  updateWidthSettings = (settings: WidthSettings) =>
    new UpdateWidthSettings(settings);
}
