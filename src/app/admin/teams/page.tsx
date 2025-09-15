// app/admin/teams/page.tsx
"use client";

import { useEffect, useState } from "react";
import { adminTeamApi, adminMemberApi, teamApi } from "@/lib/api";
import { MemberA, TeamA } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Calendar,
    Users,
    Clock,
    ChevronRight,
    RefreshCw,
    BookOpen,
    Target,
    Plus,
    X,
    Check,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AssignedTeamMember, AssignedTeam } from "@/types/apply-regular";
import { Subject } from "@/types/team";

const DAYS = [
    { value: "MON", label: "월요일" },
    { value: "TUE", label: "화요일" },
    { value: "WED", label: "수요일" },
    { value: "THU", label: "목요일" },
    { value: "FRI", label: "금요일" },
    { value: "SAT", label: "토요일" },
    { value: "SUN", label: "일요일" },
];

const TIME_SLOTS = Array.from({ length: 18 }, (_, i) => {
    const hour = i + 6;
    return {
        value: hour,
        label: `${hour}시`
    };
});

export default function AdminTeamsPage() {
    const router = useRouter();
    const [teams, setTeams] = useState<TeamA[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal form state
    const [selectedDay, setSelectedDay] = useState("");
    const [selectedStartTime, setSelectedStartTime] = useState<number | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [selectedMembers, setSelectedMembers] = useState<AssignedTeamMember[]>([]);

    // Member selection state
    const [allMembers, setAllMembers] = useState<MemberA[]>([]);
    const [memberSearch, setMemberSearch] = useState("");
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    useEffect(() => {
        loadTeams();
        loadMembers();
        loadSubjects();
    }, []);

    const loadTeams = async () => {
        try {
            setLoading(true);
            const response = await adminTeamApi.getAllTeams();
            if (response.success && response.data) {
                setTeams(response.data);
            }
        } catch (error) {
            console.error("Failed to load teams:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const response = await adminMemberApi.getAllMembers();
            if (response.success && response.data) {
                setAllMembers(response.data);
            }
        } catch (error) {
            console.error("Failed to load members:", error);
        }
    };

    const loadSubjects = async () => {
        try {
            setSubjectsLoading(true);
            const response = await teamApi.getSubjects();
            if (response.success && response.data) {
                setSubjects(response.data);
            }
        } catch (error) {
            console.error("Failed to load subjects:", error);
        } finally {
            setSubjectsLoading(false);
        }
    };

    const getFilteredTeams = () => {
        switch (activeTab) {
            case "regular":
                return teams.filter((team) => team.regular);
            case "onetime":
                return teams.filter((team) => !team.regular);
            default:
                return teams;
        }
    };

    const handleTeamClick = (regular: boolean, teamId: number) => {
        const path = regular ? 'regular' : 'one-time';
        router.push(`/admin/teams/${path}/${teamId}`);
    };

    const resetForm = () => {
        setSelectedDay("");
        setSelectedStartTime(null);
        setSelectedSubjectId(null);
        setSelectedMembers([]);
        setMemberSearch("");
        setIsMemberModalOpen(false);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        resetForm();
    };

    const handleMemberSelect = (member: MemberA) => {
        const isAlreadySelected = selectedMembers.some(m => m.id === member.uuid);

        if (isAlreadySelected) {
            // 이미 선택된 멤버면 제거
            handleMemberRemove(member.uuid);
        } else {
            // 새로운 멤버 추가
            const newMember: AssignedTeamMember = {
                id: member.uuid,
                studentId: member.studentId,
                name: member.name,
            };
            setSelectedMembers(prev => [...prev, newMember]);
        }
    };

    const handleMemberRemove = (memberId: number) => {
        setSelectedMembers(prev => prev.filter(m => m.id !== memberId));
    };

    // 폼 검증 개선
    const isFormValid = () => {
        return selectedDay &&
            selectedStartTime !== null &&
            selectedSubjectId &&
            selectedMembers.length > 0;
    };

    const handleCreateTeam = async () => {
        if (!isFormValid()) {
            let missingFields = [];
            if (!selectedDay) missingFields.push("요일");
            if (selectedStartTime === null) missingFields.push("시간");
            if (!selectedSubjectId) missingFields.push("과목");
            if (selectedMembers.length === 0) missingFields.push("멤버");

            alert(`다음 필드를 입력해주세요: ${missingFields.join(", ")}`);
            return;
        }

        const subject = subjects.find(s => s.subjectId === selectedSubjectId);
        if (!subject) {
            alert("선택한 과목 정보를 찾을 수 없습니다. 다시 선택해주세요.");
            return;
        }

        // 중복 멤버 체크 (추가 안전장치)
        const uniqueMembers = selectedMembers.filter((member, index, self) =>
            index === self.findIndex(m => m.id === member.id)
        );

        if (uniqueMembers.length !== selectedMembers.length) {
            setSelectedMembers(uniqueMembers);
            alert("중복된 멤버가 제거되었습니다.");
            return;
        }

        const newTeam: AssignedTeam = {
            day: selectedDay,
            timeId: selectedStartTime!,
            startTime: selectedStartTime!,
            subjectId: selectedSubjectId!,
            subjectName: subject.name,
            members: uniqueMembers,
        };

        try {
            setIsSubmitting(true);
            const response = await adminTeamApi.saveTeams([newTeam]);
            if (response.success) {
                alert(`팀이 성공적으로 생성되었습니다. (멤버 ${uniqueMembers.length}명)`);
                handleModalClose();
                loadTeams();
            } else {
                alert(`팀 생성에 실패했습니다: ${response.message || "알 수 없는 오류"}`);
            }
        } catch (error) {
            console.error("Failed to create team:", error);
            alert("팀 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredTeams = getFilteredTeams();
    const filteredMembers = allMembers.filter(member =>
        member.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
        member.studentId.includes(memberSearch)
    );

    return (
        <div>
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">팀 관리</h1>
                        <p className="text-gray-600 mt-2">스터디 팀 목록 및 관리</p>
                    </div>
                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                팀 추가
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>새 팀 생성</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                                {/* Day Selection */}
                                <div className="space-y-2">
                                    <Label>요일</Label>
                                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="요일을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DAYS.map((day) => (
                                                <SelectItem key={day.value} value={day.value}>
                                                    {day.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Time Selection */}
                                <div className="space-y-2">
                                    <Label>시간</Label>
                                    <Select value={selectedStartTime?.toString() || ""} onValueChange={(value) => setSelectedStartTime(Number(value))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="시간을 선택하세요" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TIME_SLOTS.map((slot) => (
                                                <SelectItem key={slot.value} value={slot.value.toString()}>
                                                    {slot.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Subject Selection */}
                                <div className="space-y-2">
                                    <Label>과목</Label>
                                    <Select
                                        value={selectedSubjectId?.toString() || ""}
                                        onValueChange={(value) => setSelectedSubjectId(Number(value))}
                                        disabled={subjectsLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={subjectsLoading ? "과목 로딩중..." : "과목을 선택하세요"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map((subject) => (
                                                <SelectItem key={subject.subjectId} value={subject.subjectId.toString()}>
                                                    {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Member Selection - 버튼으로 변경 */}
                                <div className="space-y-2">
                                    <Label>멤버</Label>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsMemberModalOpen(true)}
                                        className="w-full justify-start text-left"
                                    >
                                        <Users className="w-4 h-4 mr-2" />
                                        {selectedMembers.length > 0
                                            ? `${selectedMembers.length}명 선택됨`
                                            : "멤버 선택하기"
                                        }
                                    </Button>
                                </div>

                                {/* Selected Members - 개선된 버전 */}
                                {selectedMembers.length > 0 && (
                                    <div className="space-y-2">
                                        <Label className="flex items-center justify-between">
                                            <span>선택된 멤버</span>
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedMembers.length}명
                                            </Badge>
                                        </Label>
                                        <div className="max-h-32 overflow-y-auto border rounded-md p-2 bg-gray-50">
                                            <div className="flex flex-wrap gap-1">
                                                {selectedMembers.map((member) => (
                                                    <Badge
                                                        key={member.id}
                                                        variant="secondary"
                                                        className="flex items-center gap-1 text-xs"
                                                    >
                                                        <span className="max-w-[120px] truncate">
                                                            {member.name}
                                                        </span>
                                                        <span className="text-gray-500">
                                                            ({member.studentId})
                                                        </span>
                                                        <X
                                                            className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleMemberRemove(member.id);
                                                            }}
                                                        />
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                        {selectedMembers.length > 0 && (
                                            <div className="flex justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedMembers([])}
                                                    className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    모든 멤버 제거
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Action Buttons - 개선된 버전 */}
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
                                        취소
                                    </Button>
                                    <Button
                                        onClick={handleCreateTeam}
                                        disabled={isSubmitting || !isFormValid()}
                                        className={cn(
                                            !isFormValid() && "cursor-not-allowed opacity-50"
                                        )}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                생성중...
                                            </>
                                        ) : (
                                            "팀 생성"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* 멤버 선택 모달 */}
            <Dialog open={isMemberModalOpen} onOpenChange={setIsMemberModalOpen}>
                <DialogContent className="max-w-md max-h-[70vh]">
                    <DialogHeader>
                        <DialogTitle>멤버 선택</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Command>
                            <CommandInput
                                placeholder="멤버 이름 또는 학번으로 검색..."
                                value={memberSearch}
                                onValueChange={setMemberSearch}
                            />
                            <CommandList className="max-h-[400px] overflow-y-auto">
                                <CommandEmpty>
                                    {memberSearch ? "검색 결과가 없습니다." : "이름 또는 학번을 입력하세요."}
                                </CommandEmpty>
                                <CommandGroup>
                                    {filteredMembers.slice(0, 50).map((member) => {
                                        const isSelected = selectedMembers.some(m => m.id === member.uuid);
                                        return (
                                            <CommandItem
                                                key={member.uuid}
                                                onSelect={() => handleMemberSelect(member)}
                                                className={cn(
                                                    "flex items-center space-x-2 py-2",
                                                    isSelected && "bg-gray-100"
                                                )}
                                            >
                                                <Check
                                                    className={cn(
                                                        "h-4 w-4",
                                                        isSelected ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="font-medium truncate">{member.name}</span>
                                                    <span className="text-sm text-gray-500 truncate">
                                                        {member.studentId} | {member.majorName}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </Command>

                        {/* 검색 결과가 너무 많을 때 안내 */}
                        {memberSearch && filteredMembers.length > 50 && (
                            <p className="text-xs text-gray-500">
                                {filteredMembers.length}개의 결과 중 상위 50개만 표시됩니다. 더 구체적으로 검색해보세요.
                            </p>
                        )}

                        <div className="flex justify-between items-center pt-4 border-t">
                            <span className="text-sm text-gray-600">
                                {selectedMembers.length}명 선택됨
                            </span>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsMemberModalOpen(false)}
                                >
                                    완료
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 팀
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{teams.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            정규 스터디
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teams.filter((t) => t.regular).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            번개 스터디
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {teams.filter((t) => !t.regular).length}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            진행중
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold text-green-600">
                            {teams.filter((t) => t.status === "ACTIVE" || t.status === "IN_PROGRESS").length}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Teams Table */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>팀 목록</CardTitle>
                        <Button onClick={loadTeams} variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">전체</TabsTrigger>
                            <TabsTrigger value="regular">정규 스터디</TabsTrigger>
                            <TabsTrigger value="onetime">번개 스터디</TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeTab} className="mt-0">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <Skeleton key={i} className="h-16 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>팀명</TableHead>
                                            <TableHead>과목</TableHead>
                                            <TableHead>유형</TableHead>
                                            <TableHead>시간</TableHead>
                                            <TableHead>점수</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTeams.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8">
                                                    <p className="text-gray-500">등록된 팀이 없습니다.</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredTeams.map((team, index) => (
                                                <TableRow
                                                    key={`team-${team.id || index}`}
                                                    className="cursor-pointer hover:bg-gray-50"
                                                    onClick={() => handleTeamClick(team.regular, team.id)}
                                                >
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-gray-400" />
                                                            {team.name}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <BookOpen className="w-4 h-4 text-gray-400" />
                                                            {team.subjectName}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline">
                                                            {team.regular ? "정규" : "번개"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            {team.regular
                                                                ? `${team.day} ${team.startTime}:00`
                                                                : new Date(team.startDateTime!).toLocaleString("ko-KR", {
                                                                    month: "numeric",
                                                                    day: "numeric",
                                                                    hour: "numeric",
                                                                    minute: "numeric",
                                                                })}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {team.regular && (
                                                            <div className="flex items-center gap-2">
                                                                <Target className="w-4 h-4 text-gray-400" />
                                                                {team.score || 0}점
                                                            </div>
                                                        )}
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
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}