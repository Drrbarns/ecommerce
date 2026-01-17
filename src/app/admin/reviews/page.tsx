import { Star, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProductReviews } from "@/lib/actions/feature-actions";
import { ReviewActions } from "./review-actions";

export default async function AdminReviewsPage() {
    const reviews = await getProductReviews();

    const pendingCount = reviews.filter((r: any) => r.status === 'pending').length;
    const approvedCount = reviews.filter((r: any) => r.status === 'approved').length;
    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : '0';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
                <p className="text-muted-foreground">
                    Moderate and manage customer reviews.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{reviews.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Reviews List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    {reviews.length > 0 ? (
                        <div className="space-y-4">
                            {reviews.map((review: any) => (
                                <div key={review.id} className="p-4 border rounded-lg">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            className={`h-4 w-4 ${star <= review.rating
                                                                    ? 'text-yellow-500 fill-yellow-500'
                                                                    : 'text-gray-300'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <StatusBadge status={review.status} />
                                            </div>
                                            {review.title && (
                                                <h4 className="font-medium">{review.title}</h4>
                                            )}
                                            <p className="text-sm text-muted-foreground my-2">
                                                {review.content}
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <span>By: {review.customer_name}</span>
                                                <span>Product: {review.product?.name || 'Unknown'}</span>
                                                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <ReviewActions reviewId={review.id} currentStatus={review.status} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium mb-2">No Reviews Yet</h3>
                            <p className="text-muted-foreground">
                                Reviews will appear here once customers submit them.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
    };

    return (
        <Badge className={styles[status] || "bg-gray-100"}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
