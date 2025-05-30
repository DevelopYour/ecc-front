// 대시보드 관련 타입들
export * from './dashboard';

// 회원 관리 관련 타입들
export * from './member';

// 팀/스터디 관리 관련 타입들
export * from './team';

// 공지사항 관리 관련 타입들
export * from './notice';

// 시스템 관리 관련 타입들
export * from './system';

// 공통 응답 타입
export interface AdminResponse<T> {
    success: boolean;
    message: string;
    data: T;
    code?: string;
    timestamp: string;
}

// 페이지네이션 공통 타입
export interface AdminPaginationParams {
    page?: number;
    size?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface AdminPaginationResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// 관리자 권한 레벨
export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR';

// 관리자 액션 로그
export interface AdminActionLog {
    id: string;
    adminId: number;
    adminName: string;
    action: string;
    target: string;
    targetId?: string;
    description: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}

// 관리자 권한 체크
export interface AdminPermission {
    resource: string;
    action: 'create' | 'read' | 'update' | 'delete' | 'manage';
    granted: boolean;
}

// 관리자 세션 정보
export interface AdminSession {
    sessionId: string;
    adminId: number;
    adminName: string;
    role: AdminRole;
    permissions: AdminPermission[];
    loginTime: string;
    lastActivity: string;
    ipAddress: string;
    userAgent: string;
    isActive: boolean;
}

// 일괄 작업 요청
export interface BulkActionRequest<T = Record<string, unknown>> {
    ids: string[] | number[];
    action: string;
    data?: T;
    reason?: string;
}

// 일괄 작업 결과
export interface BulkActionResult {
    totalCount: number;
    successCount: number;
    failedCount: number;
    errors: {
        id: string | number;
        error: string;
    }[];
}

// 필터 옵션
export interface FilterOption {
    label: string;
    value: string | number;
    count?: number;
}

// 정렬 옵션
export interface SortOption {
    label: string;
    value: string;
    direction: 'asc' | 'desc';
}

// 내보내기 요청
export interface ExportRequest {
    type: 'csv' | 'excel' | 'pdf';
    filters?: Record<string, unknown>;
    columns?: string[];
    filename?: string;
}

// 내보내기 결과
export interface ExportResult {
    jobId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    downloadUrl?: string;
    filename?: string;
    fileSize?: number;
    createdAt: string;
    completedAt?: string;
    error?: string;
}