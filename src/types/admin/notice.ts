// 공지사항 타입
export type NoticeType = 'general' | 'important' | 'system' | 'maintenance';
export type NoticeStatus = 'draft' | 'published' | 'archived';

// 공지사항 정보
export interface Notice {
    id: string;
    title: string;
    content: string;
    type: NoticeType;
    status: NoticeStatus;
    isImportant: boolean;
    isPinned: boolean;
    publishedAt?: string;
    expiresAt?: string;
    viewCount: number;
    authorId: number;
    authorName: string;
    createdAt: string;
    updatedAt: string;
    tags?: string[];
    attachments?: NoticeAttachment[];
}

// 공지사항 첨부파일
export interface NoticeAttachment {
    id: string;
    filename: string;
    originalName: string;
    fileSize: number;
    mimeType: string;
    downloadCount: number;
    uploadedAt: string;
}

// 공지사항 목록 응답
export interface NoticeListResponse {
    notices: Notice[];
    total: number;
    page: number;
    size: number;
}

// 공지사항 검색/필터 조건
export interface NoticeSearchParams {
    page?: number;
    size?: number;
    type?: NoticeType;
    status?: NoticeStatus;
    isImportant?: boolean;
    isPinned?: boolean;
    keyword?: string; // 제목, 내용 검색
    authorId?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'publishedAt' | 'title' | 'viewCount';
    sortOrder?: 'asc' | 'desc';
}

// 공지사항 생성/수정 요청
export interface NoticeCreateRequest {
    title: string;
    content: string;
    type: NoticeType;
    status: NoticeStatus;
    isImportant: boolean;
    isPinned: boolean;
    publishedAt?: string;
    expiresAt?: string;
    tags?: string[];
}

export interface NoticeUpdateRequest extends Partial<NoticeCreateRequest> {
    id: string;
}

// 공지사항 일괄 작업
export interface NoticeBulkActionRequest {
    noticeIds: string[];
    action: 'publish' | 'archive' | 'delete' | 'pin' | 'unpin';
}

// 공지사항 통계
export interface NoticeStats {
    totalNotices: number;
    publishedNotices: number;
    draftNotices: number;
    archivedNotices: number;
    importantNotices: number;
    pinnedNotices: number;
    totalViews: number;
    averageViews: number;
    recentNotices: Notice[];
    popularNotices: Notice[];
    noticesByType: {
        type: NoticeType;
        count: number;
    }[];
    monthlyStats: {
        month: string;
        created: number;
        published: number;
        views: number;
    }[];
}

// 공지사항 조회 기록
export interface NoticeViewLog {
    id: string;
    noticeId: string;
    userId: number;
    userName: string;
    viewedAt: string;
    ipAddress: string;
    userAgent: string;
}

// 공지사항 댓글 (향후 확장용)
export interface NoticeComment {
    id: string;
    noticeId: string;
    userId: number;
    userName: string;
    content: string;
    isPrivate: boolean;
    createdAt: string;
    updatedAt: string;
    replies?: NoticeComment[];
}