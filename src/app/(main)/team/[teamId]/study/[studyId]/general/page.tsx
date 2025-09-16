'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { handleApiResponse, studyApi } from '@/lib/api';
import {
    CorrectionRedis,
    ExpressionToAsk,
    StudyRedis,
    VocabRedis
} from '@/types/study';
import { ArrowLeft, BookOpen, Check, Languages, Loader2, MessageSquare, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface StudyPageProps {
    params: Promise<{ teamId: string; studyId: string }>;
}

export default function GeneralStudyPage({ params }: StudyPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { teamId, studyId } = resolvedParams;

    const [studyRoom, setStudyRoom] = useState<StudyRedis | null>(null);
    const [loading, setLoading] = useState(false);

    // 오답정리 관련 상태
    const [newCorrections, setNewCorrections] = useState<CorrectionRedis[]>([]);
    const [savingCorrections, setSavingCorrections] = useState(false);

    // 단어정리 관련 상태
    const [newVocabs, setNewVocabs] = useState<VocabRedis[]>([]);
    const [savingVocabs, setSavingVocabs] = useState(false);

    // 번역 요청 관련 상태
    const [translateQuestion, setTranslateQuestion] = useState('');
    const [loadingTranslate, setLoadingTranslate] = useState(false);

    // 교정 요청 관련 상태
    const [feedbackQuestion, setFeedbackQuestion] = useState('');
    const [loadingFeedback, setLoadingFeedback] = useState(false);

    useEffect(() => {
        getStudyData();
    }, [studyId]);

    const getStudyData = async () => {
        setLoading(true);
        try {
            const response = await studyApi.getStudyData(studyId);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                },
                (error) => {
                    console.error('Error entering study room:', error);
                    toast.error('오류', {
                        description: '공부방 입장에 실패했습니다.'
                    });
                    router.push(`/team/${teamId}`);
                }
            );
        } catch (error) {
            console.error('Network error entering study room:', error);
            toast.error('오류', {
                description: '공부방 입장에 실패했습니다.'
            });
            router.push(`/team/${teamId}`);
        } finally {
            setLoading(false);
        }
    };

    // 새 오답 추가
    const addNewCorrection = () => {
        setNewCorrections([
            ...newCorrections,
            {
                id: `temp_${Date.now()}`,
                question: '',
                answer: '',
                description: ''
            }
        ]);
    };

    // 오답 제거
    const removeCorrection = (index: number) => {
        setNewCorrections(newCorrections.filter((_, i) => i !== index));
    };

    // 오답 업데이트
    const updateCorrection = (index: number, field: keyof CorrectionRedis, value: string) => {
        const updated = [...newCorrections];
        updated[index] = { ...updated[index], [field]: value };
        setNewCorrections(updated);
    };

    // 오답 저장
    const handleSaveCorrections = async () => {
        if (!studyRoom || newCorrections.length === 0) {
            toast.warning('알림', {
                description: '저장할 오답이 없습니다.'
            });
            return;
        }

        // 빈 필드 체크
        const hasEmptyFields = newCorrections.some(c => !c.question?.trim() || !c.answer?.trim());
        if (hasEmptyFields) {
            toast.warning('알림', {
                description: '문제와 답안을 모두 입력해주세요.'
            });
            return;
        }

        setSavingCorrections(true);
        try {
            const response = await studyApi.saveGenerals(studyId, newCorrections);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setNewCorrections([]);
                    toast.success('성공', {
                        description: `${newCorrections.length}개의 오답이 저장되었습니다.`
                    });
                },
                (error) => {
                    console.error('Error saving corrections:', error);
                    toast.error('오류', {
                        description: '오답 저장에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error saving corrections:', error);
            toast.error('오류', {
                description: '오답 저장에 실패했습니다.'
            });
        } finally {
            setSavingCorrections(false);
        }
    };

    // 새 단어 추가
    const addNewVocab = () => {
        setNewVocabs([
            ...newVocabs,
            {
                id: `temp_${Date.now()}`,
                english: '',
                korean: ''
            }
        ]);
    };

    // 단어 제거
    const removeVocab = (index: number) => {
        setNewVocabs(newVocabs.filter((_, i) => i !== index));
    };

    // 단어 업데이트
    const updateVocab = (index: number, field: keyof VocabRedis, value: string) => {
        const updated = [...newVocabs];
        updated[index] = { ...updated[index], [field]: value };
        setNewVocabs(updated);
    };

    // 단어 저장
    const handleSaveVocabs = async () => {
        if (!studyRoom || newVocabs.length === 0) {
            toast.warning('알림', {
                description: '저장할 단어가 없습니다.'
            });
            return;
        }

        // 빈 필드 체크
        const hasEmptyFields = newVocabs.some(v => !v.english.trim() || !v.korean.trim());
        if (hasEmptyFields) {
            toast.warning('알림', {
                description: '영어와 한국어를 모두 입력해주세요.'
            });
            return;
        }

        setSavingVocabs(true);
        try {
            const response = await studyApi.saveVocabs(studyId, newVocabs);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setNewVocabs([]);
                    toast.success('성공', {
                        description: `${newVocabs.length}개의 단어가 저장되었습니다.`
                    });
                },
                (error) => {
                    console.error('Error saving vocabs:', error);
                    toast.error('오류', {
                        description: '단어 저장에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error saving vocabs:', error);
            toast.error('오류', {
                description: '단어 저장에 실패했습니다.'
            });
        } finally {
            setSavingVocabs(false);
        }
    };

    const detectKorean = (text: string): boolean => {
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
        return koreanRegex.test(text);
    };

    // 번역 요청
    const handleTranslateHelp = async () => {
        if (!studyRoom || !translateQuestion.trim()) return;

        setLoadingTranslate(true);
        try {
            const question: ExpressionToAsk = {
                topicId: 0, // 일반 과목은 주제 ID가 없으므로 0
                question: translateQuestion,
                korean: detectKorean(translateQuestion),
                translation: true
            };

            const response = await studyApi.getAiHelpGeneral(studyId, question);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setTranslateQuestion('');
                    toast.success('성공', {
                        description: 'AI가 번역을 추가했습니다.'
                    });
                },
                (error) => {
                    console.error('Error getting translate help:', error);
                    toast.error('오류', {
                        description: '번역 요청에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error getting translate help:', error);
            toast.error('오류', {
                description: '번역 요청에 실패했습니다.'
            });
        } finally {
            setLoadingTranslate(false);
        }
    };

    // 교정 요청
    const handleFeedbackHelp = async () => {
        if (!studyRoom || !feedbackQuestion.trim()) return;

        setLoadingFeedback(true);
        try {
            const question: ExpressionToAsk = {
                topicId: 0, // 일반 과목은 주제 ID가 없으므로 0
                question: feedbackQuestion,
                korean: false, // 교정 요청은 영어로 가정
                translation: false
            };

            const response = await studyApi.getAiHelpGeneral(studyId, question);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setFeedbackQuestion('');
                    toast.success('성공', {
                        description: 'AI가 교정을 추가했습니다.'
                    });
                },
                (error) => {
                    console.error('Error getting feedback help:', error);
                    toast.error('오류', {
                        description: '교정 요청에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error getting feedback help:', error);
            toast.error('오류', {
                description: '교정 요청에 실패했습니다.'
            });
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleFinishStudy = async () => {
        if (!studyRoom) return;

        setLoading(true);
        try {
            const response = await studyApi.finishStudy(studyId);

            handleApiResponse(
                response,
                (reportId) => {
                    router.push(`/team/${teamId}/report/${reportId}`);
                },
                (error) => {
                    console.error('Error finishing study:', error);
                    toast.error('오류', {
                        description: '스터디 종료에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error finishing study:', error);
            toast.error('오류', {
                description: '스터디 종료에 실패했습니다.'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!studyRoom || loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const currentGeneral = studyRoom.generals?.[0];

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/team/${teamId}`)}
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">시험 과목 공부방</h1>
                            <p className="text-muted-foreground mt-1">
                                오답정리, 단어정리, AI 표현학습을 해보세요
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleFinishStudy}
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        스터디 종료
                    </Button>
                </div>

                {/* 4개 영역을 한 번에 표시 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 오답정리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    오답정리
                                </div>
                                <Badge variant="secondary">
                                    {currentGeneral?.corrections?.length || 0}개
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                            {/* 저장된 오답들 */}
                            {currentGeneral?.corrections && currentGeneral.corrections.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">저장된 오답</h4>
                                    {currentGeneral.corrections.map((correction) => (
                                        <div key={correction.id} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="space-y-2">
                                                <div>
                                                    <span className="text-sm font-medium text-red-600">문제: </span>
                                                    <span className="text-sm">{correction.question}</span>
                                                </div>
                                                <div>
                                                    <span className="text-sm font-medium text-green-600">정답: </span>
                                                    <span className="text-sm">{correction.answer}</span>
                                                </div>
                                                {correction.description && (
                                                    <div>
                                                        <span className="text-sm font-medium text-blue-600">설명: </span>
                                                        <span className="text-sm">{correction.description}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 새 오답 추가 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-muted-foreground">새 오답 추가</h4>
                                    <Button
                                        onClick={addNewCorrection}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        오답 추가
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {newCorrections.map((correction, index) => (
                                        <div key={correction.id} className="p-4 border border-dashed border-gray-300 rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">오답 {index + 1}</span>
                                                <Button
                                                    onClick={() => removeCorrection(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor={`question-${index}`} className="text-xs">문제</Label>
                                                    <Textarea
                                                        id={`question-${index}`}
                                                        placeholder="문제를 입력하세요"
                                                        value={correction.question || ''}
                                                        onChange={(e) => updateCorrection(index, 'question', e.target.value)}
                                                        className="min-h-[60px] resize-none mt-1"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`answer-${index}`} className="text-xs">정답</Label>
                                                    <Textarea
                                                        id={`answer-${index}`}
                                                        placeholder="정답을 입력하세요"
                                                        value={correction.answer || ''}
                                                        onChange={(e) => updateCorrection(index, 'answer', e.target.value)}
                                                        className="min-h-[60px] resize-none mt-1"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`description-${index}`} className="text-xs">설명 (선택)</Label>
                                                    <Textarea
                                                        id={`description-${index}`}
                                                        placeholder="추가 설명을 입력하세요 (선택사항)"
                                                        value={correction.description || ''}
                                                        onChange={(e) => updateCorrection(index, 'description', e.target.value)}
                                                        className="min-h-[60px] resize-none mt-1"
                                                        rows={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {newCorrections.length > 0 && (
                                    <Button
                                        onClick={handleSaveCorrections}
                                        disabled={savingCorrections}
                                        className="w-full"
                                    >
                                        {savingCorrections ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        오답 저장 ({newCorrections.length}개)
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 단어정리 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Languages className="h-5 w-5" />
                                    단어정리
                                </div>
                                <Badge variant="secondary">
                                    {currentGeneral?.vocabs?.length || 0}개
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                            {/* 저장된 단어들 */}
                            {currentGeneral?.vocabs && currentGeneral.vocabs.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">저장된 단어</h4>
                                    <div className="grid grid-cols-1 gap-3">
                                        {currentGeneral.vocabs.map((vocab) => (
                                            <div key={vocab.id} className="p-3 bg-gray-50 rounded-lg">
                                                <p className="font-medium text-sm">{vocab.english}</p>
                                                <p className="text-xs text-muted-foreground mt-1">{vocab.korean}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* 새 단어 추가 */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-muted-foreground">새 단어 추가</h4>
                                    <Button
                                        onClick={addNewVocab}
                                        size="sm"
                                        variant="outline"
                                    >
                                        <Plus className="mr-2 h-3 w-3" />
                                        단어 추가
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    {newVocabs.map((vocab, index) => (
                                        <div key={vocab.id} className="p-4 border border-dashed border-gray-300 rounded-lg space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">단어 {index + 1}</span>
                                                <Button
                                                    onClick={() => removeVocab(index)}
                                                    size="sm"
                                                    variant="ghost"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="space-y-3">
                                                <div>
                                                    <Label htmlFor={`english-${index}`} className="text-xs">영어</Label>
                                                    <Input
                                                        id={`english-${index}`}
                                                        placeholder="영어 단어"
                                                        value={vocab.english}
                                                        onChange={(e) => updateVocab(index, 'english', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`korean-${index}`} className="text-xs">한국어</Label>
                                                    <Input
                                                        id={`korean-${index}`}
                                                        placeholder="한국어 뜻"
                                                        value={vocab.korean}
                                                        onChange={(e) => updateVocab(index, 'korean', e.target.value)}
                                                        className="mt-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {newVocabs.length > 0 && (
                                    <Button
                                        onClick={handleSaveVocabs}
                                        disabled={savingVocabs}
                                        className="w-full"
                                    >
                                        {savingVocabs ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="mr-2 h-4 w-4" />
                                        )}
                                        단어 저장 ({newVocabs.length}개)
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 번역 요청 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Languages className="h-5 w-5" />
                                번역 요청
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                            <div className="space-y-3 p-4 border border-blue-200 bg-blue-50/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Languages className="h-4 w-4 text-blue-600" />
                                    <Label className="text-sm font-medium text-blue-900">단어나 문장의 뜻을 알고 싶어요</Label>
                                </div>

                                <Textarea
                                    placeholder="예: 사과, apple, 안녕하세요, How are you?"
                                    value={translateQuestion}
                                    onChange={(e) => setTranslateQuestion(e.target.value)}
                                    className="min-h-[80px] resize-none border-blue-200 focus:border-blue-400"
                                    rows={3}
                                />

                                <Button
                                    onClick={() => handleTranslateHelp()}
                                    disabled={!translateQuestion.trim() || loadingTranslate}
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                >
                                    {loadingTranslate ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Languages className="mr-2 h-4 w-4" />
                                    )}
                                    번역 요청
                                </Button>
                            </div>

                            {/* 번역 관련 표현들만 표시 */}
                            {currentGeneral?.expressions && currentGeneral.expressions.filter(e => !e.feedback).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">번역 결과</h4>
                                    {currentGeneral.expressions.filter(e => !e.feedback).map((expression) => (
                                        <div key={expression.expressionId} className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-sm">{expression.english}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{expression.korean}</p>
                                            {expression.exampleEnglish && (
                                                <p className="text-xs mt-2 italic text-blue-600">{expression.exampleEnglish}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* 교정 요청 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" />
                                교정 요청
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 max-h-[600px] overflow-y-auto">
                            <div className="space-y-3 p-4 border border-green-200 bg-green-50/30 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-green-600" />
                                    <Label className="text-sm font-medium text-green-900">내가 쓴 영어가 맞는지 확인하고 싶어요</Label>
                                </div>

                                <Textarea
                                    placeholder="예: I go to school yesterday, How do you think about this?"
                                    value={feedbackQuestion}
                                    onChange={(e) => setFeedbackQuestion(e.target.value)}
                                    className="min-h-[80px] resize-none border-green-200 focus:border-green-400"
                                    rows={3}
                                />

                                <Button
                                    onClick={() => handleFeedbackHelp()}
                                    disabled={!feedbackQuestion.trim() || loadingFeedback}
                                    className="w-full bg-green-600 hover:bg-green-700"
                                >
                                    {loadingFeedback ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <MessageSquare className="mr-2 h-4 w-4" />
                                    )}
                                    교정 요청
                                </Button>
                            </div>

                            {/* 교정 관련 표현들만 표시 */}
                            {currentGeneral?.expressions && currentGeneral.expressions.filter(e => e.feedback).length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="text-sm font-medium text-muted-foreground">교정 결과</h4>
                                    {currentGeneral.expressions.filter(e => e.feedback).map((expression) => (
                                        <div key={expression.expressionId} className="p-3 bg-gray-50 rounded-lg">
                                            <p className="font-medium text-sm">{expression.english}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{expression.korean}</p>
                                            {expression.feedback && (
                                                <div className="mt-2 space-y-1">
                                                    <div>
                                                        <span className="text-xs text-muted-foreground">원본: </span>
                                                        <span className="text-xs text-muted-foreground line-through">{expression.original}</span>
                                                    </div>
                                                    <div className="p-2 bg-green-50 border border-green-200 rounded">
                                                        <span className="text-xs text-green-600">피드백: </span>
                                                        <span className="text-xs">{expression.feedback}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}