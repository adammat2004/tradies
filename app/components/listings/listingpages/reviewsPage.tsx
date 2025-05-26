"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Star } from "lucide-react";
import { Textarea } from "@/app/components/ui/Textarea";
import { Button } from "@/app/components/ui/Button";

interface Review {
  id: string;
  userId: string;
  listingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: {
    name: string;
    image: string;
  };
}

export default function ReviewsComponent({ listingId, userId }: { listingId: string, userId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  async function fetchReviews() {
    try {
      const res = await axios.get(`/api/reviews?listingId=${listingId}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      alert("Could not load reviews. Please try again later.");
    }
  }

  async function submitReview() {
    if (rating < 1) {
      alert("Please select a rating.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/reviews", { listingId, userId, rating, comment });
      setRating(0);
      setComment("");
      await fetchReviews(); // Ensure new review is shown
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold">Reviews</h2>

      {/* Existing Reviews */}
      <div className="space-y-4">
        {reviews.length === 0 && <p className="text-gray-500">No reviews yet.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="border rounded-xl p-4 shadow-sm bg-white">
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={16} fill={i < r.rating ? "gold" : "none"} />
              ))}
              <span className="text-sm text-gray-500 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="mt-1 font-medium">{r.user.name}</p>
            <p className="text-sm text-gray-700 mt-1">{r.comment}</p>
          </div>
        ))}
      </div>

      {/* Add Review */}
      <div className="border rounded-xl p-4 shadow bg-gray-50 space-y-4">
        <h3 className="text-lg font-semibold">Leave a Review</h3>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              size={20}
              className={`cursor-pointer ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
        <Textarea
          placeholder="Write your comment here..."
          value={comment}
          onChange={(e: any) => setComment(e.target.value)}
        />
        <Button onClick={submitReview} disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
