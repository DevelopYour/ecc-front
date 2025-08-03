"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { adminContentApi } from "@/lib/api";
import { Category, TopicA } from "@/types/admin";
import {
    BookOpen,
    Edit2,
    Plus,
    RefreshCw,
    Search,
    Tag,
    Trash2,
    TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface TopicFormData {
    categoryId: number;
    topic: string;
    description?: string;
}

export default function AdminContentTopicsPage() {
    const [topics, setTopics] = useState<TopicA[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedTopic, setSelectedTopic] = useState<TopicA | null>(null);

    // Form data
    const [formData, setFormData] = useState<TopicFormData>({
        categoryId: 0,
        topic: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [topicsRes, categoriesRes] = await Promise.all([
                adminContentApi.getTopics(),
                adminContentApi.getCategories(),
            ]);

            if (topicsRes.success && topicsRes.data) {
                setTopics(topicsRes.data);
            }
            if (categoriesRes.success && categoriesRes.data) {
                setCategories(categoriesRes.data);
            }
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("데이터를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTopic = async () => {
        if (!formData.categoryId || formData.categoryId === 0 || !formData.topic.trim()) {
            toast.error("카테고리와 주제를 모두 입력해주세요.");
            return;
        }

        try {
            const response = await adminContentApi.createTopic(formData);
            if (response.success) {
                toast.success("새 주제가 추가되었습니다.");
                setShowCreateDialog(false);
                resetForm();
                loadData();
            }
        } catch (error) {
            toast.error("주제 생성에 실패했습니다.");
        }
    };

    const handleEditTopic = async () => {
        if (!selectedTopic || !formData.topic.trim()) return;

        try {
            // 객체 대신 문자열로 직접 전송
            const response = await adminContentApi.updateTopic(selectedTopic.id, formData.topic);
            if (response.success) {
                toast.success("주제가 수정되었습니다.");
                setShowEditDialog(false);
                resetForm();
                loadData();
            }
        } catch (error) {
            toast.error("주제 수정에 실패했습니다.");
        }
    };

    const handleDeleteTopic = async () => {
        if (!selectedTopic) return;

        try {
            const response = await adminContentApi.deleteTopic(selectedTopic.id);
            if (response.success) {
                toast.success("주제가 삭제되었습니다.");
                setShowDeleteDialog(false);
                setSelectedTopic(null);
                loadData();
            }
        } catch (error) {
            toast.error("주제 삭제에 실패했습니다.");
        }
    };

    const resetForm = () => {
        setFormData({
            categoryId: 0,
            topic: ""
        });
        setSelectedTopic(null);
    };

    const openEditDialog = (topic: TopicA) => {
        setSelectedTopic(topic);
        setFormData({
            categoryId: topic.categoryId,
            topic: topic.topic,
        });
        setShowEditDialog(true);
    };

    const openDeleteDialog = (topic: TopicA) => {
        setSelectedTopic(topic);
        setShowDeleteDialog(true);
    };

    const filteredTopics = topics.filter((topic) => {
        const matchesSearch = topic.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "all" ||
            topic.categoryId.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">주제 관리</h1>
                <p className="text-gray-600 mt-2">스터디 주제 목록 관리</p>
            </div>

            {/* Filters and Actions */}
            <Card className="mb-6">
                <CardContent>
                    전체 주제 {topics.length}개, 카테고리 {categories.length}개
                </CardContent>
                <CardContent className="pt-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    placeholder="주제 또는 설명으로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger className="w-full lg:w-[200px]">
                                <SelectValue placeholder="카테고리 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">전체 카테고리</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id.toString()}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button onClick={loadData} variant="outline">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            새로고침
                        </Button>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            주제 추가
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Topics Table */}
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
                                    <TableHead>카테고리</TableHead>
                                    <TableHead>주제</TableHead>
                                    <TableHead>사용 횟수</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTopics.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-gray-500">검색 결과가 없습니다.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTopics.map((topic) => (
                                        <TableRow key={topic.id}>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    <Tag className="w-3 h-3 mr-1" />
                                                    {topic.categoryName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                    {topic.topic}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-gray-400" />
                                                    {topic.usageCount || 0}회
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(topic)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(topic)}
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>새 주제 추가</DialogTitle>
                        <DialogDescription>
                            스터디에서 사용할 새 주제를 추가합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">카테고리</label>
                            <Select
                                value={formData.categoryId === 0 ? "" : formData.categoryId.toString()}
                                onValueChange={(value) =>
                                    setFormData({ ...formData, categoryId: parseInt(value) })
                                }
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="카테고리를 선택해주세요" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">주제</label>
                            <Input
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="주제 입력"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleCreateTopic}>생성</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>주제 수정</DialogTitle>
                        <DialogDescription>주제 정보를 수정합니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">카테고리</label>
                            <Select
                                value={formData.categoryId.toString()}
                                disabled
                            >
                                <SelectTrigger className="mt-1">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">주제</label>
                            <Input
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                placeholder="주제 입력"
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleEditTopic}>수정</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>주제 삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 "{selectedTopic?.topic}" 주제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteTopic}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            삭제
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}