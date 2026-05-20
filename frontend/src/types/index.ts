export type UserRole = 'ADMIN' | 'MODERADOR' | 'EMPRESA' | 'NORMAL';

export interface User {
    id?: number;
    username: string;
    email: string;
    role?: UserRole;
    token?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    email: string;
    role: UserRole;
}

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: UserRole;
}

export interface AdminUserRequest {
    username: string;
    email: string;
    password?: string;
    role: UserRole;
}

export interface PageResponse<T> {
    content: T[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

export interface Game {
    id: number;
    title: string;
    description: string;
    trailerUrl: string;
    imageUrl: string;
    developer: string;
    gameStatus?: string;
    websiteUrl?: string;
    mainFranchise?: string;
    genres: string[];
    platforms: string[];
    similarGames?: string[];
    dlcs?: string[];
    totalLikes: number;
    totalSaves?: number;
    totalComments?: number;
    likedByMe?: boolean;
    savedByMe?: boolean;
    releaseDate: string;
}

export interface GameFeedResponse {
    games: Game[];
    page: number;
    hasMore: boolean;
}

export interface Comment {
    id: number;
    content: string;
    username: string;
    createdAt: string;
}

export interface CreateCommentRequest {
    content: string;
}
