export interface User {
    username: string;
    email: string;
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
