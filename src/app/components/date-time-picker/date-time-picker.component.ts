import { Component, forwardRef, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Ionic4DatepickerModalComponent } from '@logisticinfotech/ionic4-datepicker';
import * as moment from 'moment';
import { isNullOrUndefined } from 'util';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormGroup, Validators, FormBuilder, FormControl } from '@angular/forms';

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
export class DateTimePickerComponent implements ControlValueAccessor {
  @Input() isStartDate:boolean; 
  @Input() inputtedStartDate: string;
  public dateTimeForm: FormGroup;

  private onChange: Function = (newDate: string) => { };
  private onTouch: Function = () => { };
  private disabled: boolean = false;

  /**
   * Config for the calendar date picker component from logisticinfotech
   */
  datePickerObj: any = {
    closeOnSelect: true,
    mondayFirst: true,
    titleLabel: 'Select a Date',
    monthsList: [
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weeksList: [
      'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'
    ],
    dateFormat: 'D MMMM YYYY',
    momentLocale: 'en-NZ'
  }

  constructor(public modalCtrl: ModalController, private formBuilder: FormBuilder) {
    // create form validation for user inputted date
    this.dateTimeForm = this.formBuilder.group({
      selectedDate: ['', this.dateValidator("D MMMM YYYY h:mm a")]
    });
  }

  /**
   * date validator used to validate form. Code from 
   * https://stackoverflow.com/questions/51905033/pre-populating-and-validating-date-in-angular-6-reactive-form
   * @param format 
   */
  dateValidator(format): any {
    return (control: FormControl): { [key: string]: any } => {
      if (isNullOrUndefined(control.value) || control.value == ''){
        return null;
      }
      const val = moment(control.value, format, true);
  
      if (!val.isValid()) {
        return { invalidDate: true };
      }
  
      return null;
    };
  }

  /**
   * Returns the selectedDate form control
   */
  get selectedDate() { return this.dateTimeForm.get('selectedDate');}

  /**
   * Opens and handles the calendar date picker component modal made by logisticinfotech
   */
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
            this.writeValue('');
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

  /**
   * Allow Angular to set the value on the component
   */
  writeValue(value: string): void {
    if (isNullOrUndefined(this.selectedDate.value)) {
      let currentDateTime = moment(new Date()).format("D MMMM YYYY h:mm a");
      this.selectedDate.setValue(currentDateTime);
      console.log(this.selectedDate.value);
      console.log("isStartDate ", this.isStartDate);
      console.log("Start Date ", this.inputtedStartDate);
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
