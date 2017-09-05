/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Upload4Component } from './upload4.component';

describe('Upload4Component', () => {
  let component: Upload4Component;
  let fixture: ComponentFixture<Upload4Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Upload4Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Upload4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
