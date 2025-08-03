import { ReviewTest as ReviewTestType } from "@/types/review";
import { AlertCircle, Send } from "lucide-react";
import { useState } from "react";

interface ReviewTestProps {
    test: ReviewTestType;
    onSubmit: (responses: string[]) => void;
    onCancel: () => void;
}

export default function ReviewTest({ test, onSubmit, onCancel }: ReviewTestProps) {

    // response 필드가 있으면 초기값으로 사용, 없으면 빈 문자열
    const [responses, setResponses] = useState<string[]>(() => {
        // 안전성 체크를 초기값 계산에서 처리
        if (!test || !test.questions || test.questions.length === 0) {
            return [];
        }
        return test.questions.map(question => question.response || "");
    });

    // 안전성 체크 (Hook 호출 이후에 처리)
    if (!test || !test.questions || test.questions.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-8">
                <div className="text-center">
                    <p className="text-gray-500">테스트 문제가 없습니다.</p>
                    <button
                        onClick={onCancel}
                        className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        돌아가기
                    </button>
                </div>
            </div>
        );
    }

    const handleResponseChange = (index: number, value: string) => {
        const newResponses = [...responses];
        newResponses[index] = value;
        setResponses(newResponses);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(responses); // 사용자 응답을 전달
    };

    const isAllAnswered = responses.every(response => response.trim() !== "");
    const answeredCount = responses.filter(response => response.trim() !== "").length;

    return (
        <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">

            {/* Questions */}
            <form onSubmit={handleSubmit}>
                <div className="p-8 space-y-8 max-h-[600px] overflow-y-auto">
                    {test.questions.map((question, index) => (
                        <div key={index} className="border-b pb-8 last:border-b-0">
                            <div className="mb-4">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                                        {index + 1}
                                    </span>
                                    <h3 className="text-lg font-medium text-gray-900 flex-1">
                                        {question.question}
                                    </h3>
                                </div>
                            </div>

                            <div className="ml-11">
                                <textarea
                                    id={`response-${index}`}
                                    value={responses[index]}
                                    onChange={(e) => handleResponseChange(index, e.target.value)}
                                    rows={1}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                    placeholder="답변을 작성해주세요..."
                                />
                                {responses[index].trim() === "" && (
                                    <div className="flex items-center gap-2 text-amber-600 text-sm mt-2">
                                        <AlertCircle className="w-4 h-4" />
                                        <span>답변을 작성하지 않았습니다</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-gray-500">
                            {answeredCount} / {test.questions.length} 문제 작성
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(answeredCount / test.questions.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            나가기
                        </button>

                        <button
                            type="submit"
                            disabled={!isAllAnswered}
                            className="px-8 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            제출하기 ({answeredCount}/{test.questions.length})
                        </button>
                    </div>

                    {!isAllAnswered && (
                        <p className="text-center text-sm text-red-600 mt-4">
                            ⚠️ 모든 문제에 답변을 작성해야 제출할 수 있습니다
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
}