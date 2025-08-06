"use client";

import { useEffect, useState } from "react";
import { adminMemberApi } from "@/lib/api";
import { MemberA, MemberStatus } from "@/types/admin";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    RefreshCw,
    ChevronRight,
    User,
    Mail,
    GraduationCap,
    Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import * as XLSX from 'xlsx';

const statusOptions = [
    { value: "all", label: "전체 상태" },
    { value: MemberStatus.PENDING, label: "가입 승인 대기" },
    { value: MemberStatus.ACTIVE, label: "활동중" },
    { value: MemberStatus.SUSPENDED, label: "일시 정지" },
    { value: MemberStatus.WITHDRAWN, label: "자발적 탈퇴" },
    { value: MemberStatus.BANNED, label: "강제 탈퇴" },
    { value: MemberStatus.DORMANT, label: "휴면 계정" },
    { value: MemberStatus.DORMANT_REQUESTED, label: "휴면 해제 대기중" },
];

const levelOptions = [
    { value: "all", label: "전체 레벨" },
    { value: "0", label: "입문" },
    { value: "1", label: "중급" },
    { value: "2", label: "고급" }
];

// 상태를 한국어로 변환하는 함수
const getStatusLabel = (status: MemberStatus): string => {
    const statusMap: Record<MemberStatus, string> = {
        [MemberStatus.PENDING]: "승인 대기",
        [MemberStatus.ACTIVE]: "활동중",
        [MemberStatus.SUSPENDED]: "정지",
        [MemberStatus.WITHDRAWN]: "탈퇴",
        [MemberStatus.BANNED]: "강제 탈퇴",
        [MemberStatus.DORMANT]: "휴면 계정",
        [MemberStatus.DORMANT_REQUESTED]: "휴면 해제 대기중",
    };
    return statusMap[status] || status;
};

export default function AdminMembersPage() {
    const router = useRouter();
    const [members, setMembers] = useState<MemberA[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<MemberA[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");

    useEffect(() => {
        loadMembers();
    }, []);

    useEffect(() => {
        filterMembers();
    }, [members, searchTerm, statusFilter, levelFilter]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const response = await adminMemberApi.getAllMembers();
            if (response.success && response.data) {
                setMembers(response.data);
            }
        } catch (error) {
            console.error("Failed to load members:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterMembers = () => {
        let filtered = [...members];

        // 검색어 필터링
        if (searchTerm) {
            filtered = filtered.filter(
                (member) =>
                    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    member.studentId.includes(searchTerm) ||
                    member.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // 상태 필터링
        if (statusFilter !== "all") {
            filtered = filtered.filter((member) => member.status === statusFilter);
        }

        // 레벨 필터링
        if (levelFilter !== "all") {
            filtered = filtered.filter(
                (member) => member.level === parseInt(levelFilter)
            );
        }

        setFilteredMembers(filtered);
    };

    // 엑셀 파일로 내보내기 함수
    const exportToExcel = () => {
        // 엑셀에 포함될 데이터 준비
        const excelData = filteredMembers.map((member, index) => ({
            '순번': index + 1,
            '이름': member.name,
            '학번': member.studentId,
            '이메일': member.email,
            '전화번호': member.tel,
            '카카오톡 아이디': member.kakaoTel,
            '전공': member.majorName,
            '레벨': `Level ${member.level}`,
            '상태': getStatusLabel(member.status),
            '가입일': new Date(member.createdAt).toLocaleDateString('ko-KR'),
        }));

        // 워크시트 생성
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // 컬럼 너비 설정
        const columnWidths = [
            { wch: 8 },   // 순번
            { wch: 15 },  // 이름
            { wch: 15 },  // 학번
            { wch: 25 },  // 이메일
            { wch: 18 },  // 전화번호
            { wch: 20 },  // 카카오톡 아이디
            { wch: 20 },  // 전공
            { wch: 12 },  // 레벨
            { wch: 15 },  // 상태
            { wch: 15 },  // 가입일
        ];
        worksheet['!cols'] = columnWidths;

        // 워크북 생성
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "회원 명단");

        // 파일명 생성 (현재 날짜 포함)
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        const fileName = `ECC_${dateString}.xlsx`;

        // 파일 다운로드
        XLSX.writeFile(workbook, fileName);
    };

    const getStatusBadge = (status: MemberStatus) => {
        const variants: Record<MemberStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
            [MemberStatus.PENDING]: { label: "승인 대기", variant: "secondary" },
            [MemberStatus.ACTIVE]: { label: "활동중", variant: "default" },
            [MemberStatus.SUSPENDED]: { label: "정지", variant: "destructive" },
            [MemberStatus.WITHDRAWN]: { label: "탈퇴", variant: "outline" },
            [MemberStatus.BANNED]: { label: "강제 탈퇴", variant: "destructive" },
            [MemberStatus.DORMANT]: { label: "휴면 계정", variant: "outline" },
            [MemberStatus.DORMANT_REQUESTED]: { label: "휴면 해제 대기중", variant: "outline" },
        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const handleMemberClick = (uuid: number) => {
        router.push(`/admin/members/${uuid}`);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">회원 관리</h1>
                <p className="text-gray-600 mt-2">전체 회원 목록 및 관리</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 회원
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{members.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            활동 회원
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {members.filter((m) => m.status === MemberStatus.ACTIVE).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            승인 대기
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-yellow-600">
                            {members.filter((m) => m.status === MemberStatus.PENDING).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            탈퇴/정지
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-red-600">
                            {members.filter(
                                (m) =>
                                    m.status === MemberStatus.WITHDRAWN ||
                                    m.status === MemberStatus.SUSPENDED
                            ).length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="이름, 학번, 이메일로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="상태 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select value={levelFilter} onValueChange={setLevelFilter}>
                            <SelectTrigger className="w-full lg:w-[180px]">
                                <SelectValue placeholder="레벨 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                {levelOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            onClick={exportToExcel}
                            className="bg-green-700 hover:bg-green-800 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            엑셀 다운로드
                        </Button>
                        <Button onClick={loadMembers} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-6 space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>이름</TableHead>
                                    <TableHead>학번</TableHead>
                                    <TableHead>전화번호</TableHead>
                                    <TableHead>카톡아이디</TableHead>
                                    <TableHead>전공</TableHead>
                                    <TableHead>레벨</TableHead>
                                    <TableHead>상태</TableHead>
                                    <TableHead>가입일</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredMembers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8">
                                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <TableRow
                                            key={member.uuid}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleMemberClick(member.uuid)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    {member.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {member.studentId}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {member.tel}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {member.kakaoTel}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-gray-400" />
                                                    {member.majorName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">Level {member.level}</Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(member.status)}</TableCell>
                                            <TableCell className="text-gray-500">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}