import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideoFeed } from './video-feed';

describe('VideoFeed', () => {
  let component: VideoFeed;
  let fixture: ComponentFixture<VideoFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoFeed],
    }).compileComponents();

    fixture = TestBed.createComponent(VideoFeed);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
