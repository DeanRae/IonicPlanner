import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskListsPage } from './task-lists.page';

describe('TaskListsPage', () => {
  let component: TaskListsPage;
  let fixture: ComponentFixture<TaskListsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TaskListsPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskListsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
