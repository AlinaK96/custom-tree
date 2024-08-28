import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonRowFilterWrapperComponent } from './common-row-filter-wrapper.component';

describe('CommonRowFilterWrapperComponent', () => {
  let component: CommonRowFilterWrapperComponent;
  let fixture: ComponentFixture<CommonRowFilterWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonRowFilterWrapperComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonRowFilterWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
