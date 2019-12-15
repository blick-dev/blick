import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Device } from '@store/devices/devices.types';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl
} from '@angular/forms';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Dispatch } from '@ngxs-labs/dispatch-decorator';
import {
  UpdateDeviceAction,
  UpdateDevicePayload
} from '@store/devices/devices.action';

@Component({
  selector: 'app-device-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class DeviceSettingsComponent implements OnInit {
  _device: Device;
  @Input() set device(_device: Device) {
    this._device = _device;
    this.updateForm();
  }
  get device() {
    return this._device;
  }
  settings: FormGroup;

  changes: Observable<boolean>;

  @Output() close = new EventEmitter();

  constructor(public formBuilder: FormBuilder) {
    this.setupForm();
  }

  ngOnInit() {}

  setupForm() {
    this.settings = this.formBuilder.group({
      name: ['', [Validators.required]],
      width: ['', [Validators.required]],
      height: ['', [Validators.required]],
      orientation: ['', [Validators.required]],
      platform: ['', Validators.required]
    });

    this.changes = this.settings.valueChanges.pipe(
      map(
        () =>
          !(
            this.device.name === this.name.value &&
            this.device.width === this.width.value &&
            this.device.height === this.height.value &&
            this.device.orientation === this.orientation.value &&
            this.device.platform === this.platform.value
          )
      )
    );
  }

  updateForm() {
    this.settings.setValue({
      name: this._device.name,
      width: this._device.width,
      height: this._device.height,
      orientation: this._device.orientation,
      platform: this._device.platform
    });
  }

  get name(): AbstractControl {
    return this.settings.get('name');
  }
  get width(): AbstractControl {
    return this.settings.get('width');
  }
  get height(): AbstractControl {
    return this.settings.get('height');
  }
  get orientation(): AbstractControl {
    return this.settings.get('orientation');
  }
  get platform(): AbstractControl {
    return this.settings.get('platform');
  }

  onSubmit() {
    const old: Device = {
      name: this.device.name,
      width: this.device.width,
      height: this.device.height,
      orientation: this.device.orientation,
      platform: this.device.platform
    };
    const updated: Device = {
      ...this.settings.value
    };
    this.update({ old, updated });
    this.close.emit();
  }

  @Dispatch()
  update = (payload: UpdateDevicePayload) => new UpdateDeviceAction(payload);
}
