import { ReviewTest } from "@/types/review";
import { CheckCircle, XCircle, Trophy, RefreshCw } from "lucide-react";

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

    const correctCount = test.questions.filter(q => q.isCorrect).length;
    const totalCount = test.questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);

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
                        {totalCount}문제 중 {correctCount}문제 정답
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
                    {test.questions.map((question, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-lg border ${question.isCorrect
                                    ? "bg-green-50 border-green-200"
                                    : "bg-red-50 border-red-200"
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {question.isCorrect ? (
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        문제 {index + 1}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-1">
                                        {question.question}
                                    </p>
                                    {question.answer && (
                                        <div className="mt-2 p-2 bg-white rounded">
                                            <p className="text-xs font-medium text-gray-600 mb-1">내 답변:</p>
                                            <p className="text-sm text-gray-700">{question.answer}</p>
                                        </div>
                                    )}
                                    <p className={`text-xs mt-2 ${question.isCorrect ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {question.isCorrect ? "정답입니다" : "오답입니다"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
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