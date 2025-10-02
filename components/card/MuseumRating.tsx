import { fetchMuseumRating } from "@/utils/actions/museums";
import { FaStar } from "react-icons/fa";
type props = {
  museumId: string;
  inPage: boolean;
};

export default async function MuseumRating({
  museumId,
  inPage = false,
}: props) {
  const { rating, count } = await fetchMuseumRating(museumId);
  if (count === 0) return null;

  const className = `flex gap-1 items-center ${inPage ? "text-md" : "text-xs"}`;
  const countText = count > 1 ? "reviews" : "review";
  const countValue = inPage ? `(${count} ${countText})` : `(${count})`;

  if (!museumId) return null;

  return (
    <span className={className}>
      <FaStar className="w-3 h-3" />
      {`${rating} ${countValue}`}
    </span>
  );
}
