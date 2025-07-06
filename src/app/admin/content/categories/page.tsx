"use client";

import { useEffect, useState } from "react";
import { adminContentApi } from "@/lib/api";
import { Category } from "@/types/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    Plus,
    Edit2,
    Trash2,
    Tag,
    BookOpen,
    RefreshCw,
    ArrowLeft,
    Folder,
} from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

interface CategoryFormData {
    name: string;
    description: string;
}

export default function AdminContentCategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Form data
    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        description: "",
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const response = await adminContentApi.getCategories();
            if (response.success && response.data) {
                setCategories(response.data);
            }
        } catch (error) {
            console.error("Failed to load categories:", error);
            toast.error("카테고리를 불러오는데 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async () => {
        if (!formData.name.trim()) {
            toast.error("카테고리명을 입력해주세요.");
            return;
        }

        try {
            const response = await adminContentApi.createCategory(formData);
            if (response.success) {
                toast.success("새 카테고리가 추가되었습니다.");
                setShowCreateDialog(false);
                resetForm();
                loadCategories();
            }
        } catch (error) {
            toast.error("카테고리 생성에 실패했습니다.");
        }
    };

    const handleEditCategory = async () => {
        if (!selectedCategory || !formData.name.trim()) return;

        try {
            console.log(selectedCategory.id, formData)
            const response = await adminContentApi.updateCategory(selectedCategory.id, formData);

            if (response.success) {
                toast.success("카테고리가 수정되었습니다.");
                setShowEditDialog(false);
                resetForm();
                loadCategories();
            }
        } catch (error) {
            toast.error("카테고리 수정에 실패했습니다.");
        }
    };

    const handleDeleteCategory = async () => {
        if (!selectedCategory) return;

        try {
            const response = await adminContentApi.deleteCategory(selectedCategory.id);
            if (response.success) {
                toast.success("카테고리가 삭제되었습니다.");
                setShowDeleteDialog(false);
                setSelectedCategory(null);
                loadCategories();
            }
        } catch (error) {
            toast.error("카테고리 삭제에 실패했습니다. 해당 카테고리에 주제가 있는지 확인해주세요.");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
        });
        setSelectedCategory(null);
    };

    const openEditDialog = (category: Category) => {
        setSelectedCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
        });
        setShowEditDialog(true);
    };

    const openDeleteDialog = (category: Category) => {
        setSelectedCategory(category);
        setShowDeleteDialog(true);
    };

    return (
        <div>
            <Button
                variant="ghost"
                className="mb-6"
                onClick={() => router.push("/admin/content/topics")}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                주제 관리로 돌아가기
            </Button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">카테고리 관리</h1>
                <p className="text-gray-600 mt-2">스터디 주제 카테고리 관리</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 카테고리
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">{categories.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            전체 주제 수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {categories.reduce((acc, cat) => acc + (cat.topicCount || 0), 0)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            평균 주제 수
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {categories.length > 0
                                ? Math.round(
                                    categories.reduce((acc, cat) => acc + (cat.topicCount || 0), 0) / categories.length
                                )
                                : 0}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                            <Button onClick={loadCategories} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                새로고침
                            </Button>
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                카테고리 추가
                            </Button>
                        </div>
                    </div>
                </CardContent>
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
                                    <TableHead>카테고리명</TableHead>
                                    <TableHead>설명</TableHead>
                                    <TableHead>주제 수</TableHead>
                                    <TableHead className="text-right">작업</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <p className="text-gray-500">등록된 카테고리가 없습니다.</p>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Folder className="w-4 h-4 text-gray-400" />
                                                    {category.name}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-md truncate">
                                                {category.description || "-"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-gray-400" />
                                                    {category.topicCount || 0}개
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditDialog(category)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openDeleteDialog(category)}
                                                        disabled={(category.topicCount || 0) > 0}
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
                        <DialogTitle>새 카테고리 추가</DialogTitle>
                        <DialogDescription>
                            스터디 주제를 분류할 새 카테고리를 추가합니다.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">카테고리명</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="예: 일상 대화, 비즈니스, 여행"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">설명</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="카테고리에 대한 설명을 입력하세요"
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleCreateCategory}>생성</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>카테고리 수정</DialogTitle>
                        <DialogDescription>카테고리 정보를 수정합니다.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <label className="text-sm font-medium">카테고리명</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="카테고리명 입력"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">설명 (선택)</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                placeholder="카테고리에 대한 설명을 입력하세요"
                                className="mt-1"
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                            취소
                        </Button>
                        <Button onClick={handleEditCategory}>수정</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>카테고리 삭제 확인</AlertDialogTitle>
                        <AlertDialogDescription>
                            정말로 "{selectedCategory?.name}" 카테고리를 삭제하시겠습니까?
                            카테고리 내 주제도 함께 삭제됩니다.
                            이 작업은 되돌릴 수 없습니다.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>취소</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCategory}
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