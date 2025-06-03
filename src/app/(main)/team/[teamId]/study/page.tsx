// app/(main)/team/[teamId]/study/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Check, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
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
    ExpressionToAsk,
    getCategoryLabel,
    TopicCategory
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
    const [aiQuestion, setAiQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingAi, setLoadingAi] = useState(false);
    const [activeTab, setActiveTab] = useState('topics');

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

    const handleTopicSelection = (category: TopicCategory, topic: string, checked: boolean) => {
        if (checked) {
            setSelectedTopics([...selectedTopics, { category, topic }]);
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

    const handleAiHelp = async () => {
        if (!studyRoom || !aiQuestion.trim() || studyRoom.topics.length === 0) return;

        const currentTopic = studyRoom.topics[currentTopicIndex];
        if (!currentTopic) return;

        setLoadingAi(true);
        try {
            const question: ExpressionToAsk = {
                topicId: currentTopic.topicId,
                question: aiQuestion,
            };

            const response = await studyApi.getAiHelp(studyRoom.id, question);

            handleApiResponse(
                response,
                (data) => {
                    setStudyRoom(data);
                    setAiQuestion('');
                    toast.success('성공', {
                        description: 'AI가 표현을 추가했습니다.',
                    });
                },
                (error) => {
                    console.error('Error getting AI help:', error);
                    toast.error('오류', {
                        description: 'AI 도움 요청에 실패했습니다.'
                    });
                }
            );
        } catch (error) {
            console.error('Network error getting AI help:', error);
            toast.error('오류', {
                description: 'AI 도움 요청에 실패했습니다.'
            });
        } finally {
            setLoadingAi(false);
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
                                {topicRecommendations.map((recommendation) => (
                                    <Card key={recommendation.category}>
                                        <CardHeader>
                                            <CardTitle>{getCategoryLabel(recommendation.category)}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2">
                                                {recommendation.topic.map((topic, idx) => {
                                                    const isAlreadySaved = studyRoom.topics?.some(
                                                        t => t.category === recommendation.category && t.topic === topic
                                                    ) || false;

                                                    return (
                                                        <div key={idx} className="flex items-center space-x-2">
                                                            <Checkbox
                                                                id={`${recommendation.category}-${idx}`}
                                                                checked={selectedTopics.some(
                                                                    t => t.category === recommendation.category && t.topic === topic
                                                                )}
                                                                onCheckedChange={(checked) =>
                                                                    handleTopicSelection(recommendation.category, topic, checked as boolean)
                                                                }
                                                                disabled={isAlreadySaved}
                                                            />
                                                            <Label
                                                                htmlFor={`${recommendation.category}-${idx}`}
                                                                className={`text-sm font-normal cursor-pointer flex-1 ${isAlreadySaved ? 'text-muted-foreground line-through' : ''
                                                                    }`}
                                                            >
                                                                {topic}
                                                                {isAlreadySaved && (
                                                                    <span className="ml-2 text-xs text-muted-foreground">(이미 선택됨)</span>
                                                                )}
                                                            </Label>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
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
                                                {getCategoryLabel(studyRoom.topics[currentTopicIndex]?.category)}
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
                                                    studyRoom.topics[currentTopicIndex]?.expressions.map((expression) => (
                                                        <Card key={expression.expressionId}>
                                                            <CardContent className="pt-4">
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    {expression.question}
                                                                </p>
                                                                <p className="font-medium">{expression.english}</p>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {expression.korean}
                                                                </p>
                                                                {expression.example && (
                                                                    <p className="text-sm mt-2 italic">{expression.example}</p>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>

                                        {/* AI 도움받기 */}
                                        <div className="space-y-2 pt-4 border-t">
                                            <Label htmlFor="ai-question">AI에게 물어보기</Label>
                                            <div className="flex gap-2">
                                                <Textarea
                                                    id="ai-question"
                                                    placeholder="어떤 표현이 궁금하신가요?"
                                                    value={aiQuestion}
                                                    onChange={(e) => setAiQuestion(e.target.value)}
                                                    className="flex-1"
                                                    rows={2}
                                                />
                                                <Button
                                                    onClick={handleAiHelp}
                                                    disabled={!aiQuestion.trim() || loadingAi}
                                                    size="icon"
                                                    className="h-auto"
                                                >
                                                    {loadingAi ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Sparkles className="h-4 w-4" />
                                                    )}
                                                </Button>
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