import { Component, forwardRef} from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import * as moment from 'moment';
import { isNullOrUndefined } from 'util';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-calendar-date-picker',
  templateUrl: './calendar-date-picker.component.html',
  styleUrls: ['./calendar-date-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CalendarDatePickerComponent),
    multi: true
  }]
})
export class CalendarDatePickerComponent implements ControlValueAccessor {
  public selectedDate: string;

  private onChange: Function = (newDate: string) => {};
  private onTouch: Function = () => {};
  private disabled: boolean = false;

  datePickerObj: any = {
    closeOnSelect: true,
    mondayFirst: true,
    titleLabel: 'Select a Date',
    monthsList: [ 
      'January', 'February', 'March', 'April', 'May','June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weeksList: [
      'Sun','Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
    dateFormat: 'D MMMM YYYY',
    momentLocale: 'en-NZ'  
  }

  constructor(public modalCtrl: ModalController) { }

  async openDatePicker() {
    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: { 'objConfig': this.datePickerObj }
  });

  await datePickerModal.present();
  datePickerModal.onDidDismiss()
    .then((data) => {
      if (isNullOrUndefined(data.data) || data.data.date === 'Invalid date') {
        if (isNullOrUndefined(this.selectedDate)) {
          this.writeValue(moment(new Date()).format('D MMMM YYYY'));
          this.onTouch();
          console.log(this.selectedDate);
        }
      } else {
        this.writeValue(data.data.date);
        this.onTouch();
        console.log(this.selectedDate);
       }    
    });
  }

  // Allow Angular to set the value on the component
  writeValue(value: string): void {
    this.onChange(value);
    this.selectedDate = value;
  }

  // Save a reference to the change function passed to us by 
  // the Angular form control
  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  // Save a reference to the touched function passed to us by 
  // the Angular form control
  registerOnTouched(fn: Function): void {
    this.onTouch = fn;    
  }

  // Allow the Angular form control to disable this input
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
