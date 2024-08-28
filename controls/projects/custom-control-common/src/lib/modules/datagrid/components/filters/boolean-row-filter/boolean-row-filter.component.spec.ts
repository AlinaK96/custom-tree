import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BooleanRowFilterComponent } from './boolean-row-filter.component';

describe('BooleanRowFilterComponent', () => {
  let component: BooleanRowFilterComponent;
  let fixture: ComponentFixture<BooleanRowFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BooleanRowFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BooleanRowFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
