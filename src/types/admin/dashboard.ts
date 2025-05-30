// 대시보드 통계 카드 데이터
export interface DashboardStats {
    totalMembers: number;
    pendingMembers: number;
    totalTeams: number;
    pendingTeams: number;
}

// 통계 카드 개별 정보
export interface StatCard {
    title: string;
    count: number;
    icon: string;
    color: 'yellow' | 'red' | 'blue' | 'purple';
    actionText: string;
    actionLink: string;
}

// 공지사항 항목
export interface NoticeItem {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    isImportant: boolean;
    author: string;
}

// 공지사항 목록
export interface NoticeList {
    notices: NoticeItem[];
    total: number;
}

// 일정/할 일 항목
export interface TodoItem {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: 'high' | 'medium' | 'low';
    status: 'pending' | 'in_progress' | 'completed';
    category: 'member' | 'team' | 'system' | 'notice';
}

// 일정/할 일 목록
export interface TodoList {
    todos: TodoItem[];
    total: number;
}

// 대시보드 전체 데이터
export interface DashboardData {
    stats: DashboardStats;
    recentNotices: NoticeItem[];
    urgentTodos: TodoItem[];
    systemStatus: SystemStatus;
}

// 시스템 상태
export interface SystemStatus {
    serverStatus: 'online' | 'offline' | 'maintenance';
    lastBackup: string;
    activeUsers: number;
    storageUsed: number;
    storageTotal: number;
}

// 차트 데이터 (회원 가입 추이 등)
export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
}