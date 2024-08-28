import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumberRowFilterComponent } from './number-row-filter.component';

describe('NumberRowFilterComponent', () => {
  let component: NumberRowFilterComponent;
  let fixture: ComponentFixture<NumberRowFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumberRowFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumberRowFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
