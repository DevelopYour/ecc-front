import { Review } from "@/types/review";
import ReviewCard from "./ReviewCard";

interface ReviewListProps {
    reviews: Review[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
    // 최신순으로 정렬
    const sortedReviews = [...reviews].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt);
        const dateB = new Date(b.updatedAt || b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
            ))}
        </div>
    );
}