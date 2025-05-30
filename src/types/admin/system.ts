// 시스템 로그 타입
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
export type LogCategory = 'auth' | 'api' | 'database' | 'system' | 'user' | 'admin';

// 시스템 로그 정보
export interface SystemLog {
    id: string;
    level: LogLevel;
    category: LogCategory;
    message: string;
    details?: string;
    userId?: number;
    userName?: string;
    ipAddress?: string;
    userAgent?: string;
    endpoint?: string;
    method?: string;
    statusCode?: number;
    responseTime?: number;
    timestamp: string;
    stackTrace?: string;
}

// 시스템 로그 목록
export interface SystemLogListResponse {
    logs: SystemLog[];
    total: number;
    page: number;
    size: number;
}

// 시스템 로그 검색 조건
export interface SystemLogSearchParams {
    page?: number;
    size?: number;
    level?: LogLevel;
    category?: LogCategory;
    userId?: number;
    keyword?: string; // 메시지 검색
    startDate?: string;
    endDate?: string;
    ipAddress?: string;
    endpoint?: string;
    sortBy?: 'timestamp' | 'level' | 'category';
    sortOrder?: 'asc' | 'desc';
}

// 시스템 상태 정보
export interface SystemInfo {
    serverInfo: {
        hostname: string;
        os: string;
        architecture: string;
        totalMemory: number;
        availableMemory: number;
        cpuCores: number;
        cpuUsage: number;
        uptime: number;
    };
    applicationInfo: {
        name: string;
        version: string;
        environment: string;
        startTime: string;
        buildTime: string;
        javaVersion: string;
        springVersion: string;
    };
    databaseInfo: {
        type: string;
        version: string;
        url: string;
        status: 'connected' | 'disconnected';
        connectionPool: {
            active: number;
            idle: number;
            max: number;
        };
    };
    redisInfo?: {
        status: 'connected' | 'disconnected';
        version: string;
        usedMemory: number;
        maxMemory: number;
        connectedClients: number;
    };
    mongoInfo?: {
        status: 'connected' | 'disconnected';
        version: string;
        collections: number;
        totalSize: number;
    };
}

// 시스템 성능 메트릭
export interface SystemMetrics {
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkIn: number;
    networkOut: number;
    activeUsers: number;
    apiCalls: number;
    errorRate: number;
    responseTime: number;
}

// 시스템 성능 히스토리
export interface SystemMetricsHistory {
    metrics: SystemMetrics[];
    period: 'hour' | 'day' | 'week' | 'month';
    startTime: string;
    endTime: string;
}

// 시스템 설정
export interface SystemConfig {
    category: string;
    key: string;
    value: string;
    description: string;
    type: 'string' | 'number' | 'boolean' | 'json';
    isSecret: boolean;
    lastModified: string;
    modifiedBy: number;
}

// 시스템 설정 그룹
export interface SystemConfigGroup {
    category: string;
    displayName: string;
    description: string;
    configs: SystemConfig[];
}

// 시스템 설정 수정 요청
export interface SystemConfigUpdateRequest {
    key: string;
    value: string;
    reason?: string;
}

// 백업 정보
export interface BackupInfo {
    id: string;
    type: 'full' | 'incremental' | 'differential';
    status: 'in_progress' | 'completed' | 'failed';
    startTime: string;
    endTime?: string;
    duration?: number;
    fileSize?: number;
    filePath?: string;
    description?: string;
    error?: string;
    createdBy: number;
}

// 백업 목록
export interface BackupListResponse {
    backups: BackupInfo[];
    total: number;
    totalSize: number;
    lastBackup?: BackupInfo;
}

// 백업 생성 요청
export interface BackupCreateRequest {
    type: 'full' | 'incremental';
    description?: string;
    includeFiles?: boolean;
    includeDatabase?: boolean;
    includeRedis?: boolean;
    includeMongo?: boolean;
}

// 알림 설정
export interface NotificationSettings {
    id: string;
    category: 'system' | 'security' | 'performance' | 'user' | 'error';
    name: string;
    description: string;
    isEnabled: boolean;
    conditions: {
        threshold?: number;
        operator?: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
        duration?: number; // minutes
    };
    channels: ('email' | 'slack' | 'sms')[];
    recipients: string[];
    lastTriggered?: string;
    triggerCount: number;
}

// 시스템 알림
export interface SystemAlert {
    id: string;
    category: 'info' | 'warning' | 'error' | 'critical';
    title: string;
    message: string;
    details?: string;
    isResolved: boolean;
    resolvedAt?: string;
    resolvedBy?: number;
    createdAt: string;
    acknowledgedAt?: string;
    acknowledgedBy?: number;
}