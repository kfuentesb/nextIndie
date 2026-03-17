import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommentService } from '../../../../core/services/comment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Comment } from '../../../../shared/models/comment.model';

@Component({
  selector: 'app-comments-section',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="comments-container">
      <div class="comments-header">
        <h3>Comentarios</h3>
        <span class="count">{{ comments().length }}</span>
      </div>

      <div class="comments-list">
        @for (comment of comments(); track comment.id) {
          <div class="comment">
            <div class="comment-header">
              <span class="username">&#64;{{ comment.username }}</span>
              <span class="date">{{ comment.createdAt | date:'short' }}</span>
            </div>
            <p class="comment-text">{{ comment.content }}</p>
          </div>
        } @empty {
          <div class="no-comments">
            <span class="icon">💬</span>
            <p>No hay comentarios aún</p>
            <span class="subtext">¡Sé el primero en comentar!</span>
          </div>
        }
      </div>

      <div class="comment-input-section">
        @if (authService.isLoggedIn()) {
          <div class="input-wrapper">
            <input
              type="text"
              [(ngModel)]="newComment"
              placeholder="Escribe un comentario..."
              class="comment-input"
              (keyup.enter)="submitComment()"
              maxlength="500">
            <button
              class="send-btn"
              (click)="submitComment()"
              [disabled]="!newComment.trim() || isSubmitting()">
              @if (isSubmitting()) {
                <span class="spinner-small"></span>
              } @else {
                <span>➤</span>
              }
            </button>
          </div>
        } @else {
          <div class="login-prompt">
            <a routerLink="/login">Inicia sesión</a> para comentar
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./comments-section.component.scss']
})
export class CommentsSectionComponent implements OnInit {
  @Input({ required: true }) gameId!: number;

  private commentService = inject(CommentService);
  authService = inject(AuthService);

  comments = signal<Comment[]>([]);
  newComment = '';
  isSubmitting = signal(false);

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.commentService.getCommentsByGame(this.gameId).subscribe({
      next: (comments) => this.comments.set(comments),
      error: (err) => console.error('Error cargando comentarios:', err)
    });
  }

  submitComment(): void {
    if (!this.newComment.trim() || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    this.commentService.createComment(this.gameId, { content: this.newComment.trim() }).subscribe({
      next: (comment) => {
        this.comments.update(comments => [comment, ...comments]);
        this.newComment = '';
        this.isSubmitting.set(false);
      },
      error: (err) => {
        console.error('Error creando comentario:', err);
        this.isSubmitting.set(false);
      }
    });
  }
}
