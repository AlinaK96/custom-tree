import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiSortHeaderComponent } from './multi-sort-header.component';

describe('MultiSortHeaderComponent', () => {
  let component: MultiSortHeaderComponent;
  let fixture: ComponentFixture<MultiSortHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiSortHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiSortHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
