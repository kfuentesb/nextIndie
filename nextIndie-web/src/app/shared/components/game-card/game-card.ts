import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Game } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-card">
      <div class="game-image">
        <img [src]="game.imageUrl" [alt]="game.title" loading="lazy">
        <div class="game-overlay">
          <span class="genre-badge">{{ game.genre }}</span>
        </div>
      </div>
      <div class="game-info">
        <h3>{{ game.title }}</h3>
        <p class="developer">{{ game.developer }}</p>
      </div>
    </div>
  `,
  styleUrls: ['./game-card.component.scss']
})
export class GameCardComponent {
  @Input({ required: true }) game!: Game;
}
