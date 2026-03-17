import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../../../core/services/game.service';
import { Game } from '../../../../shared/models/game.model';
import { VideoFeedComponent } from '../../components/video-feed/video-feed.component';

@Component({
  selector: 'app-feed-page',
  standalone: true,
  imports: [CommonModule, VideoFeedComponent],
  template: `
    <div class="feed-container">
      @if (isLoading) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando juegos...</p>
        </div>
      } @else {
        <div class="video-slider" [style.transform]="'translateY(' + (-currentIndex * 100) + 'vh)'">
          @for (game of games; track game.id; let i = $index) {
            <div class="video-slide" [class.active]="i === currentIndex">
              <app-video-feed [game]="game"></app-video-feed>
            </div>
          }
        </div>

        <div class="navigation-hint">
          <div class="scroll-indicator">
            <span>Desplaza para navegar</span>
            <div class="arrows">
              <span>↑</span>
              <span>↓</span>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styleUrls: ['./feed-page.component.scss']
})
export class FeedPageComponent implements OnInit {
  private gameService = inject(GameService);

  games: Game[] = [];
  currentIndex = 0;
  isLoading = true;
  private touchStartY = 0;
  private isScrolling = false;

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.gameService.getAllGames().subscribe({
      next: (games) => {
        this.games = games;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando juegos:', err);
        this.isLoading = false;
      }
    });
  }

  @HostListener('window:wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.isScrolling) return;

    const delta = event.deltaY;
    if (delta > 0 && this.currentIndex < this.games.length - 1) {
      this.nextSlide();
    } else if (delta < 0 && this.currentIndex > 0) {
      this.prevSlide();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown' && this.currentIndex < this.games.length - 1) {
      this.nextSlide();
    } else if (event.key === 'ArrowUp' && this.currentIndex > 0) {
      this.prevSlide();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    const touchEndY = event.changedTouches[0].clientY;
    const diff = this.touchStartY - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && this.currentIndex < this.games.length - 1) {
        this.nextSlide();
      } else if (diff < 0 && this.currentIndex > 0) {
        this.prevSlide();
      }
    }
  }

  private nextSlide(): void {
    this.isScrolling = true;
    this.currentIndex++;
    setTimeout(() => this.isScrolling = false, 800);
  }

  private prevSlide(): void {
    this.isScrolling = true;
    this.currentIndex--;
    setTimeout(() => this.isScrolling = false, 800);
  }
}
