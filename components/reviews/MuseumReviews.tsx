import { fetchMuseumReviews } from "@/utils/actions/museums";
import Title from "@/components/museums/Title";
import ReviewCard from "./ReviewCard";

export default async function MuseumReviews({
  museumId,
}: {
  museumId: string;
}) {
  const reviews = await fetchMuseumReviews(museumId);
  if (reviews.length < 1) return null;
  return (
    <div className="mt-4 ">
      <Title text="Reviews" />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
        {reviews.map((review) => {
          const reviewInfo = {
            comment: review.comment,
            rating: review.rating,
            name: review.profile.username,
            image: review.profile.profileImage,
          };
          return <ReviewCard key={review.id} reviewInfo={reviewInfo} />;
        })}
      </div>
    </div>
  );
}
