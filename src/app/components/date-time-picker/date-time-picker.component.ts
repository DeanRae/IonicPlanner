import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import { IonicTimepickerModalComponent } from '@logisticinfotech/ionic-timepicker';
import * as moment from 'moment';
import { isNullOrUndefined } from 'util';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, FormBuilder, FormControl } from '@angular/forms';

@Component({
  selector: 'app-date-time-picker',
  templateUrl: './date-time-picker.component.html',
  styleUrls: ['./date-time-picker.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DateTimePickerComponent),
    multi: true
  }]
})
export class DateTimePickerComponent implements ControlValueAccessor, OnInit {
  @Input() isStartDate: boolean;
  public dateTimeForm: FormGroup;

  private onChange: Function = (newDate: string) => { };
  private onTouch: Function = () => { };
  private disabled: boolean = false;

  /**
   * Config for the calendar date picker component from logisticinfotech
   */
  datePickerObj: any;

  /**
   * Config for the time picker component from logisticinfotech
   */
  timePickerObj: any;

  constructor(public modalCtrl: ModalController, private formBuilder: FormBuilder) {
    // create form validation for user inputted date
    this.dateTimeForm = this.formBuilder.group({
      selectedDate: new FormControl('')
    });
  }

  ngOnInit() {
    this.datePickerObj = {
      closeOnSelect: true,
      mondayFirst: true,
      titleLabel: 'Select ' + (this.isStartDate ? 'Start' : 'End') + ' Date',
      monthsList: [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
      ],
      weeksList: [
        'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
      ],
      dateFormat: 'D MMMM YYYY',
      momentLocale: 'en-NZ'
    }

    let defaultInitDate = new Date();
    this.timePickerObj = {
      inputTime: this.selectedDate.value ? new Date(this.selectedDate.value) : (this.isStartDate ? defaultInitDate : defaultInitDate.setMinutes(defaultInitDate.getMinutes() + 30)),
      timeFormat: 'h:mm a',
      setLabel: 'Set',
      closeLabel: 'Close',
      titleLabel: (this.isStartDate ? 'Start' : 'End') + ' Time',
      clearButton: false,
      momentLocale: 'en-NZ',
    };
  }

  /**
   * Used to concatenate the date and time string received
   * through the user using the calendar date and time pickers instead 
   * of typing the date and time manually.
   * 
   * Concatenates a given date or time to produce D MMMM YYYY h:mm a
   * 
   * @param isTime if the new input is a time input
   * @param newDateTime the new input from the pickers (may be date or time)
   */
  dateTimeConcatenator(isTime: boolean, newDateTime: string): string {
    let currentDateTime = moment(this.selectedDate.value);
    let concatenatedString: string;

    if (isTime) {
      let date = currentDateTime.format("D MMMM YYYY");
      if (date === "Invalid date") {
        date = '';
      }
      concatenatedString = date + " " + newDateTime;
    } else {
      let time = currentDateTime.format("h:mm a");
      if (time === "Invalid date") {
        time = '';
      }
      concatenatedString = newDateTime + " " + time;
    }
    return concatenatedString;
  }

  /**
   * Returns the selectedDate form control
   */
  get selectedDate() { return this.dateTimeForm.get('selectedDate'); }

  /**
   * Opens and handles the calendar date picker component modal made by logisticinfotech
   */
  async openDatePicker() {
    // set the time that the picker will use when opened.
    let selectedDay: any = moment(this.selectedDate.value).format('D MMMM YYYY');
    if (selectedDay === 'Invalid date' || selectedDay === 'Invalid time') {
      selectedDay = new Date();
    } else {
      selectedDay = new Date(this.selectedDate.value);
    }

    const datePickerModal = await this.modalCtrl.create({
      component: Ionic4DatepickerModalComponent,
      cssClass: 'li-ionic4-datePicker',
      componentProps: { 'objConfig': this.datePickerObj, 'selectedDate': selectedDay}
    });

    await datePickerModal.present();
    datePickerModal.onDidDismiss()
      .then((data) => {
        if (!(isNullOrUndefined(data.data) || isNullOrUndefined(data.data.date) || data.data.date === 'Invalid date')) {
          let newDateTime = this.dateTimeConcatenator(false, data.data.date);
          this.writeValue(newDateTime);
          this.onTouch();
        }
      });
  }

   /**
   * Opens and handles the time picker component modal made by logisticinfotech
   */
  async openTimePicker() {
    // set the time that the picker will use when opened.
    let selectedTime: any = moment(this.selectedDate.value).format('h:mm a');
    if (selectedTime === 'Invalid date' || selectedTime === 'Invalid time') {
      selectedTime = new Date();
    } else {
      selectedTime = new Date(this.selectedDate.value);
    }

    const timePickerModal = await this.modalCtrl.create({
      component: IonicTimepickerModalComponent,
      cssClass: 'li-ionic-timepicker',
      componentProps: { 'objConfig': this.timePickerObj, 'selectedTime': selectedTime}
    });

    await timePickerModal.present();
    timePickerModal.onDidDismiss()
      .then((data) => {
        if (!(isNullOrUndefined(data.data) || isNullOrUndefined(data.data.time) || data.data.time === 'Invalid time')) {
          let newDateTime = this.dateTimeConcatenator(true, data.data.time);
          this.writeValue(newDateTime);
          this.onTouch();
        }
      });
  }

  /**
   * Allow Angular to set the value on the component
   */
  writeValue(value: string): void {
    if (isNullOrUndefined(this.selectedDate.value)) {
      let currentDateTime = moment(new Date()).format("D MMMM YYYY h:mm a");
      this.selectedDate.setValue(currentDateTime);
      console.log(this.selectedDate.value);
      this.onChange(this.selectedDate.value);
    } else {
      this.selectedDate.setValue(value);
      console.log(this.selectedDate.value);
      this.onChange(this.selectedDate.value);
    }
  }

  /**
   * Save a reference to the change function passed 
   * to us by the Angular form control
   */
  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  /**
   * Save a reference to the touched function passed to us by
   * the Angular form control
   * @param fn 
   */
  registerOnTouched(fn: Function): void {
    this.onTouch = fn;
  }

  /**
   * Allow the Angular form control to disable this input
   * @param disabled 
   */
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }
}
