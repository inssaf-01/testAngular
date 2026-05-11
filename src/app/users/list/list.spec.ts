import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUserComponent } from './list';

describe('List', () => {
  let component: ListUserComponent;
  let fixture: ComponentFixture<ListUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUserComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListUserComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
