import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  eventSource = [];
  calendar = {
    mode: 'month',
    currentDate: new Date(),
  }

  constructor() { }

  ngOnInit() {
  }

  onViewTitleChanged(title:string) {
    console.log(title);
  }

  onEventSelected(event:any) {
    console.log('Event selected:' + event.startTime + '-' + event.endTime + ',' + event.title);
  }

  onTimeSelected(ev:any) {
    console.log('Selected time: ' + ev.selectedTime + ', hasEvents: ' +
      (ev.events !== undefined && ev.events.length !== 0) + ', disabled: ' + ev.disabled);
  }

  onCurrentDateChanged(event: Date) {
    console.log('current date change: ' + event);
  }

  onRangeChanged(ev:any) {
    console.log('range changed: startTime: ' + ev.startTime + ', endTime: ' + ev.endTime);
  }

  today() {
    this.calendar.currentDate = new Date();
  }

}
