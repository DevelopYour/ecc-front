// app/(main)/team/[teamId]/study/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, Loader2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Languages, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { studyApi, handleApiResponse } from '@/lib/api';
import {
    StudyRedis,
    TopicRecommendation,
    Topic,
    ExpressionToAsk
} from '@/types/study';

interface StudyPageProps {
    params: Promise<{ teamId: string }>;
}

export default function StudyPage({ params }: StudyPageProps) {
    const router = useRouter();
    const resolvedParams = use(params);
    const teamId = resolvedParams.teamId;

    const [studyRoom, setStudyRoom] = useState<StudyRedis | null>(null);
    const [topicRecommendations, setTopicRecommendations] = useState<TopicRecommendation[]>([]);
    const [selectedTopics, setSelectedTopics] = useState<Topic[]>([]);
    const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
    const [translateQuestion, setTranslateQuestion] = useState('');
    const [feedbackQuestion, setFeedbackQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingTranslate, setLoadingTranslate] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [activeTab, setActiveTab] = useState('topics');
    const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

    useEffect(() => {
        enterStudyRoom();
    }, [teamId]);

    const enterStudyRoom = async () => {
        setLoading(true);
        try {
            const response = await studyApi.enterStudyRoom(teamId);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    // 주제 추천 자동 로드
                    loadTopicRecommendations(teamId);
                    // 이미 저장된 주제가 있으면 표현 학습 탭으로 이동
                    if (data.topics && data.topics.length > 0) {
                        setActiveTab('expressions');
                    }
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

    const loadTopicRecommendations = async (teamId: string) => {
        try {
            const response = await studyApi.getTopicRecommendations(teamId);

            handleApiResponse(
                response,
                (data) => {
                    setTopicRecommendations(data || []);
                },
                (error) => {
                    console.error('Error loading topic recommendations:', error);
                    toast.error('오류', {
                        description: '주제 추천을 불러오는데 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error loading topic recommendations:', error);
            toast.error('오류', {
                description: '주제 추천을 불러오는데 실패했습니다.'
            });
        }
    };

    const toggleCategory = (categoryId: number) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryId)) {
            newExpanded.delete(categoryId);
        } else {
            newExpanded.add(categoryId);
        }
        setExpandedCategories(newExpanded);
    };

    const handleTopicSelection = (category: string, topic: string, checked: boolean) => {
        if (checked) {
            // Topic 인터페이스에 맞게 임시로 id를 0으로 설정
            setSelectedTopics([...selectedTopics, { id: 0, category, topic }]);
        } else {
            setSelectedTopics(selectedTopics.filter(t => !(t.category === category && t.topic === topic)));
        }
    };

    const handleSaveTopics = async () => {
        if (!studyRoom || selectedTopics.length === 0) {
            toast.warning('알림', {
                description: '최소 하나 이상의 주제를 선택해주세요.'
            });
            return;
        }

        // 이미 저장된 주제는 제외
        const newTopics = selectedTopics.filter(selected =>
            !studyRoom.topics?.some(saved =>
                saved.category === selected.category && saved.topic === selected.topic
            )
        );

        if (newTopics.length === 0) {
            toast.warning('알림', {
                description: '모든 선택한 주제가 이미 저장되어 있습니다.'
            });
            return;
        }

        setLoading(true);
        try {
            const response = await studyApi.saveTopics(studyRoom.id, newTopics);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setSelectedTopics([]); // 선택 초기화
                    setActiveTab('expressions');
                    toast.success('성공', {
                        description: `${newTopics.length}개의 새로운 주제가 저장되었습니다.`,
                    });
                },
                (error) => {
                    console.error('Error saving topics:', error);
                    toast.error('오류', {
                        description: '주제 저장에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error saving topics:', error);
            toast.error('오류', {
                description: '주제 저장에 실패했습니다.'
            });
        } finally {
            setLoading(false);
        }
    };

    const detectKorean = (text: string): boolean => {
        const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;   // 한글 유니코드 범위
        return koreanRegex.test(text);
    };

    const handleTranslateHelp = async () => {
        if (!studyRoom || !translateQuestion.trim() || studyRoom.topics.length === 0) return;

        const currentTopic = studyRoom.topics[currentTopicIndex];
        if (!currentTopic) return;

        setLoadingTranslate(true);
        try {
            const question: ExpressionToAsk = {
                topicId: currentTopic.topicId,
                question: translateQuestion,
                korean: detectKorean(translateQuestion),
                translation: true
            };

            const response = await studyApi.getAiHelp(studyRoom.id, question);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setTranslateQuestion('');
                    toast.success('성공', {
                        description: 'AI가 번역을 추가했습니다.',
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

    const handleFeedbackHelp = async () => {
        if (!studyRoom || !feedbackQuestion.trim() || studyRoom.topics.length === 0) return;

        const currentTopic = studyRoom.topics[currentTopicIndex];
        if (!currentTopic) return;

        setLoadingFeedback(true);
        try {
            const question: ExpressionToAsk = {
                topicId: currentTopic.topicId,
                question: feedbackQuestion,
                korean: false, // 피드백을 원하는 문장은 영어로 고정이라고 가정
                translation: false
            };

            const response = await studyApi.getAiHelp(studyRoom.id, question);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setFeedbackQuestion('');
                    toast.success('성공', {
                        description: 'AI가 교정을 추가했습니다.',
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
            const response = await studyApi.finishStudy(studyRoom.id);

            handleApiResponse(
                response,
                (reportId) => {
                    // 보고서 페이지로 이동
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
                            <h1 className="text-3xl font-bold">공부방</h1>
                            <p className="text-muted-foreground mt-1">
                                주제를 선택하고 표현을 학습해보세요
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={handleFinishStudy}
                        disabled={!studyRoom.topics || studyRoom.topics.length === 0 || loading}
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        스터디 종료
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="topics">주제 선택</TabsTrigger>
                        <TabsTrigger
                            value="expressions"
                            disabled={!studyRoom.topics || studyRoom.topics.length === 0}
                        >
                            표현 학습
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="topics" className="space-y-4">
                        {topicRecommendations.length === 0 ? (
                            <Card>
                                <CardContent className="flex items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </CardContent>
                            </Card>
                        ) : (
                            <>
                                {topicRecommendations.map((recommendation) => {
                                    const isExpanded = expandedCategories.has(recommendation.id);
                                    const categoryTopicCount = recommendation.topics.length;
                                    const selectedInCategory = selectedTopics.filter(t => t.category === recommendation.category).length;
                                    const savedInCategory = studyRoom.topics?.filter(t => t.category === recommendation.category).length || 0;

                                    return (
                                        <Card key={recommendation.id}>
                                            <CardHeader
                                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                                onClick={() => toggleCategory(recommendation.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <CardTitle className="text-lg">{recommendation.category}</CardTitle>
                                                        <div className="flex gap-2">
                                                            <Badge variant="secondary" className="text-xs">
                                                                {recommendation.description}
                                                            </Badge>
                                                            <Badge variant="outline" className="text-xs">
                                                                {categoryTopicCount}개 주제
                                                            </Badge>
                                                            {selectedInCategory > 0 && (
                                                                <Badge variant="default" className="text-xs">
                                                                    {selectedInCategory}개 선택됨
                                                                </Badge>
                                                            )}
                                                            {savedInCategory > 0 && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {savedInCategory}개 저장됨
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {isExpanded ? (
                                                            <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                        ) : (
                                                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {isExpanded && (
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        {recommendation.topics.map((topic, idx) => {
                                                            const isAlreadySaved = studyRoom.topics?.some(
                                                                t => t.category === recommendation.category && t.topic === topic.topic
                                                            ) || false;

                                                            return (
                                                                <div key={topic.id} className="flex items-center space-x-2">
                                                                    <Checkbox
                                                                        id={`${recommendation.category}-${topic.id}`}
                                                                        checked={selectedTopics.some(
                                                                            t => t.category === recommendation.category && t.topic === topic.topic
                                                                        )}
                                                                        onCheckedChange={(checked) =>
                                                                            handleTopicSelection(recommendation.category, topic.topic, checked as boolean)
                                                                        }
                                                                        disabled={isAlreadySaved}
                                                                    />
                                                                    <Label
                                                                        htmlFor={`${recommendation.category}-${topic.id}`}
                                                                        className={`text-sm font-normal cursor-pointer flex-1 ${isAlreadySaved ? 'text-muted-foreground line-through' : ''
                                                                            }`}
                                                                    >
                                                                        {topic.topic}
                                                                        {isAlreadySaved && (
                                                                            <span className="ml-2 text-xs text-muted-foreground">(이미 선택됨)</span>
                                                                        )}
                                                                    </Label>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            )}
                                        </Card>
                                    );
                                })}
                                <Button
                                    onClick={handleSaveTopics}
                                    disabled={selectedTopics.length === 0 || loading}
                                    className="w-full"
                                >
                                    {loading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Check className="mr-2 h-4 w-4" />
                                    )}
                                    주제 저장
                                </Button>
                            </>
                        )}
                    </TabsContent>

                    <TabsContent value="expressions" className="space-y-4">
                        {studyRoom.topics && studyRoom.topics.length > 0 && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>{studyRoom.topics[currentTopicIndex]?.topic}</CardTitle>
                                            <Badge>
                                                {studyRoom.topics[currentTopicIndex]?.category}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* 저장된 표현들 */}
                                        <ScrollArea className="h-[300px] pr-4">
                                            <div className="space-y-4">
                                                {studyRoom.topics[currentTopicIndex]?.expressions.length === 0 ? (
                                                    <p className="text-center text-muted-foreground py-8">
                                                        아직 저장된 표현이 없습니다. AI에게 물어보세요!
                                                    </p>
                                                ) : (
                                                    // 표현 카드에서 조건부 렌더링
                                                    studyRoom.topics[currentTopicIndex]?.expressions.map((expression) => (
                                                        <Card key={expression.expressionId}>
                                                            <CardContent className="pt-4">

                                                                <p className="font-medium">{expression.english}</p>
                                                                <p className="text-sm text-muted-foreground mt-1">{expression.korean}</p>

                                                                {/* 번역 요청인 경우 예문 표시 */}
                                                                {expression.example && (
                                                                    <p className="text-sm mt-2 italic text-blue-600">{expression.example}</p>
                                                                )}

                                                                {/* 교정 요청인 경우 피드백 표시 */}
                                                                {expression.feedback && (
                                                                    <>
                                                                        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                                                                            <p className="text-sm text-red-600">원본:</p>
                                                                            <p className="text-sm">{expression.original}</p>
                                                                        </div>
                                                                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                                                                            <p className="text-sm text-green-600">피드백:</p>
                                                                            <p className="text-sm">{expression.feedback}</p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>

                                        {/* AI 도움받기 */}
                                        <div className="space-y-4 pt-4 border-t">
                                            <h4 className="text-sm font-medium text-muted-foreground">AI에게 물어보기</h4>

                                            {/* 두 개의 입력 영역을 나란히 배치 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                                {/* 번역 요청 영역 */}
                                                <div className="space-y-3 p-4 border border-blue-200 bg-blue-50/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <Languages className="h-4 w-4 text-blue-600" />
                                                        <Label className="text-sm font-medium text-blue-900">번역 요청</Label>
                                                    </div>
                                                    <p className="text-xs text-blue-700">단어나 문장의 뜻을 알고 싶어요</p>

                                                    <Textarea
                                                        placeholder="예: 사과, apple, 안녕하세요, How are you?"
                                                        value={translateQuestion}
                                                        onChange={(e) => setTranslateQuestion(e.target.value)}
                                                        className="min-h-[80px] resize-none border-blue-200 focus:border-blue-400"
                                                        rows={3}
                                                    />

                                                    <Button
                                                        onClick={handleTranslateHelp}
                                                        disabled={!translateQuestion.trim() || loadingTranslate}
                                                        size="sm"
                                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        {loadingTranslate ? (
                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <Languages className="mr-2 h-3 w-3" />
                                                        )}
                                                        번역 요청
                                                    </Button>
                                                </div>

                                                {/* 교정 요청 영역 */}
                                                <div className="space-y-3 p-4 border border-green-200 bg-green-50/30 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="h-4 w-4 text-green-600" />
                                                        <Label className="text-sm font-medium text-green-900">교정 요청</Label>
                                                    </div>
                                                    <p className="text-xs text-green-700">내가 쓴 영어가 맞는지 확인하고 싶어요</p>

                                                    <Textarea
                                                        placeholder="예: I go to school yesterday, How do you think about this?"
                                                        value={feedbackQuestion}
                                                        onChange={(e) => setFeedbackQuestion(e.target.value)}
                                                        className="min-h-[80px] resize-none border-green-200 focus:border-green-400"
                                                        rows={3}
                                                    />

                                                    <Button
                                                        onClick={handleFeedbackHelp}
                                                        disabled={!feedbackQuestion.trim() || loadingFeedback}
                                                        size="sm"
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                        {loadingFeedback ? (
                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                        ) : (
                                                            <MessageSquare className="mr-2 h-3 w-3" />
                                                        )}
                                                        교정 요청
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* 주제 네비게이션 */}
                                {studyRoom.topics.length > 1 && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentTopicIndex(Math.max(0, currentTopicIndex - 1))}
                                            disabled={currentTopicIndex === 0}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            이전
                                        </Button>
                                        <span className="text-sm text-muted-foreground px-2">
                                            {currentTopicIndex + 1} / {studyRoom.topics.length}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                setCurrentTopicIndex(
                                                    Math.min(studyRoom.topics.length - 1, currentTopicIndex + 1)
                                                )
                                            }
                                            disabled={currentTopicIndex === studyRoom.topics.length - 1}
                                        >
                                            다음
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}