import { GradeLevel, ReviewTest } from "@/types/review";
import { CheckCircle, XCircle, Trophy, RefreshCw, AlertCircle } from "lucide-react";

interface TestResultProps {
    test: ReviewTest;
    onRetry: () => void;
    onBack: () => void;
}

export default function TestResult({ test, onRetry, onBack }: TestResultProps) {
    // 안전성 체크
    if (!test || !test.questions || test.questions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-8">
                <div className="text-center">
                    <p className="text-gray-500">테스트 결과가 없습니다.</p>
                    <button
                        onClick={onBack}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 3단계 채점 기준으로 점수 계산
    const correctCount = test.questions.filter(q => q.grade === GradeLevel.CORRECT).length;
    const partialCount = test.questions.filter(q => q.grade === GradeLevel.PARTIAL).length;
    const incorrectCount = test.questions.filter(q => q.grade === GradeLevel.INCORRECT).length;
    const totalCount = test.questions.length;

    // 점수 계산 (CORRECT: 100점, PARTIAL: 70점, INCORRECT: 0점)
    const totalScore = (correctCount * 100 + partialCount * 70) / totalCount;
    const percentage = Math.round(totalScore);

    const getScoreMessage = () => {
        if (percentage === 100) return "완벽해요! 🎉";
        if (percentage >= 80) return "훌륭해요! 👏";
        if (percentage >= 60) return "잘했어요! 👍";
        if (percentage >= 40) return "조금 더 노력해요! 💪";
        return "다시 복습해보세요! 📚";
    };

    const getScoreColor = () => {
        if (percentage >= 80) return "text-green-600";
        if (percentage >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getQuestionIcon = (gradeLevel: GradeLevel | null) => {
        switch (gradeLevel) {
            case GradeLevel.CORRECT:
                return <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />;
            case GradeLevel.PARTIAL:
                return <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />;
            case GradeLevel.INCORRECT:
                return <XCircle className="w-5 h-5 text-red-600 mt-0.5" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400 mt-0.5" />;
        }
    };

    const getQuestionStyle = (gradeLevel: GradeLevel | null) => {
        switch (gradeLevel) {
            case GradeLevel.CORRECT:
                return "bg-green-50 border-green-200";
            case GradeLevel.PARTIAL:
                return "bg-yellow-50 border-yellow-200";
            case GradeLevel.INCORRECT:
                return "bg-red-50 border-red-200";
            default:
                return "bg-gray-50 border-gray-200";
        }
    };

    const getResultText = (gradeLevel: GradeLevel | null) => {
        switch (gradeLevel) {
            case GradeLevel.CORRECT:
                return { text: "정답입니다", color: "text-green-600" };
            case GradeLevel.PARTIAL:
                return { text: "부분 정답입니다", color: "text-yellow-600" };
            case GradeLevel.INCORRECT:
                return { text: "오답입니다", color: "text-red-600" };
            default:
                return { text: "채점되지 않음", color: "text-gray-400" };
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
            {/* Header */}
            <div className="p-8 text-center border-b">
                <Trophy className={`w-16 h-16 mx-auto mb-4 ${getScoreColor()}`} />
                <h2 className="text-2xl font-bold mb-2">테스트 결과</h2>
                <p className="text-lg text-gray-600">{getScoreMessage()}</p>
            </div>

            {/* Score */}
            <div className="p-8 bg-gray-50">
                <div className="text-center mb-8">
                    <div className={`text-5xl font-bold ${getScoreColor()}`}>
                        {percentage}%
                    </div>
                    <p className="text-gray-600 mt-2">
                        {totalCount}문제 중 정답 {correctCount}개, 부분정답 {partialCount}개
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-4 mb-8">
                    <div
                        className={`h-4 rounded-full transition-all duration-1000 ${percentage >= 80 ? "bg-green-500" :
                            percentage >= 60 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>

                {/* Question Results */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 mb-3">문제별 결과</h3>
                    {test.questions.map((question, index) => {
                        const resultInfo = getResultText(question.grade);
                        return (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border ${getQuestionStyle(question.grade)}`}
                            >
                                <div className="flex items-start gap-3">
                                    {getQuestionIcon(question.grade)}
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">
                                            문제 {index + 1}
                                        </p>
                                        <p className="text-sm text-gray-700 mt-1">
                                            {question.question}
                                        </p>
                                        {question.response && (
                                            <div className="mt-2 p-2 bg-white rounded">
                                                <p className="text-xs font-medium text-gray-600 mb-1">내 답변:</p>
                                                <p className="text-sm text-gray-700">{question.response}</p>
                                            </div>
                                        )}
                                        {question.answer && (
                                            <div className="mt-2 p-2 bg-blue-50 rounded">
                                                <p className="text-xs font-medium text-gray-600 mb-1">정답:</p>
                                                <p className="text-sm text-gray-700">{question.answer}</p>
                                            </div>
                                        )}
                                        <p className={`text-xs mt-2 ${resultInfo.color}`}>
                                            {resultInfo.text}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Actions */}
            <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={onBack}
                        className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        복습자료로 돌아가기
                    </button>
                    <button
                        onClick={onRetry}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        다시 테스트하기
                    </button>
                </div>
            </div>
        </div>
    );
}