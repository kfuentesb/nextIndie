import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FeedPageComponent } from './pages/feed-page/feed-page.component';
import { VideoFeedComponent } from './components/video-feed/video-feed.component';
import { CommentsSectionComponent } from './components/comments-section/comments-section.component';

const routes: Routes = [
  { path: '', component: FeedPageComponent }
];

@NgModule({
  declarations: [
    FeedPageComponent,
    VideoFeedComponent,
    CommentsSectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class FeedModule { }
