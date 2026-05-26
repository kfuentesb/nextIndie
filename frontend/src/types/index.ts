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

export interface LookupItem {
    id: number;
    name: string;
}

export type GameRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROMOTED';

export type GameRequestType = 'NEW_GAME' | 'PROMOTION';

export interface GameRequestCreate {
    title: string;
    description: string;
    trailerUrl: string;
    developer: string;
    gameStatus: string;
    websiteUrl: string;
    mainFranchise: string;
    releaseDate: string;
    imageUrl?: string;
    genreIds: number[];
    platformIds: number[];
    similarGameIds?: number[];
}

export interface GameUpdateRequest {
    title: string;
    description: string;
    trailerUrl: string;
    developer: string;
    gameStatus: string;
    websiteUrl: string;
    mainFranchise: string;
    releaseDate: string;
    imageUrl?: string;
    genreIds: number[];
    platformIds: number[];
    similarGameIds?: number[];
}

export interface GameRequestResponse {
    id: number;
    title: string;
    description: string;
    trailerUrl: string;
    developer: string;
    gameStatus: string;
    websiteUrl: string;
    mainFranchise: string;
    releaseDate: string;
    imageUrl?: string;
    status: GameRequestStatus;
    requestType?: GameRequestType;
    requestedBy: string;
    createdAt: string;
    reviewedAt?: string | null;
    genres: string[];
    platforms: string[];
    similarGames: string[];
}

export interface Game {
    id: number;
    title: string;
    description: string;
    trailerUrl: string;
    imageUrl: string;
    imageUrls?: {
        micro?: string;
        thumb?: string;
        coverSmall?: string;
        coverBig?: string;
        coverSmall2x?: string;
        coverBig2x?: string;
        logoMed?: string;
        screenshotMed?: string;
        screenshotBig?: string;
        screenshotHuge?: string;
        screenshotMed2x?: string;
        screenshotBig2x?: string;
        size720p?: string;
        size1080p?: string;
        size720p2x?: string;
        size1080p2x?: string;
        original?: string;
    };
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
    requestedBy?: string;
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
