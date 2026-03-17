import { Component, Input, inject } from '@angular/core';
import { CommonModule, DomSanitizer, SafeResourceUrl } from '@angular/common';
import { Game } from '../../../../shared/models/game.model';
import { CommentsSectionComponent } from '../comments-section/comments-section.component';

@Component({
  selector: 'app-video-feed',
  standalone: true,
  imports: [CommonModule, CommentsSectionComponent],
  template: `
    <div class="video-container">
      <div class="video-wrapper">
        <iframe
          [src]="safeUrl"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy">
        </iframe>
      </div>

      <div class="video-info">
        <div class="game-details">
          <h2 class="game-title">{{ game.title }}</h2>
          <p class="game-meta">{{ game.developer }} • {{ game.genre }} • {{ game.releaseDate | date:'yyyy' }}</p>
          <p class="game-description">{{ game.description }}</p>
        </div>

        <div class="game-actions">
          <button class="action-btn" (click)="showComments = !showComments">
            <span class="icon">💬</span>
            <span class="label">Comentarios</span>
          </button>
          <button class="action-btn">
            <span class="icon">❤️</span>
            <span class="label">Me gusta</span>
          </button>
          <button class="action-btn">
            <span class="icon">📤</span>
            <span class="label">Compartir</span>
          </button>
        </div>
      </div>

      @if (showComments) {
        <div class="comments-overlay" (click)="$event.stopPropagation()">
          <app-comments-section [gameId]="game.id"></app-comments-section>
          <button class="close-comments" (click)="showComments = false">✕</button>
        </div>
      }
    </div>
  `,
  styleUrls: ['./video-feed.component.scss']
})
export class VideoFeedComponent {
  @Input({ required: true }) game!: Game;

  private sanitizer = inject(DomSanitizer);
  showComments = false;

  get safeUrl(): SafeResourceUrl {
    const videoId = this.extractVideoId(this.game.trailerUrl);
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  private extractVideoId(url: string): string {
    if (url.includes('embed')) {
      return url.split('/embed/')[1]?.split('?')[0] || '';
    }
    const match = url.match(/(?:v=|\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : url;
  }
}
