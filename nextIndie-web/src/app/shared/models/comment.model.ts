export interface Comment {
  id: number;
  content: string;
  username: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  content: string;
}
