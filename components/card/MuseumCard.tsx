import Link from "next/link";
import FavoriteToggleButton from "./FavoriteToggleButton";
import { MuseumCardProps } from "@/utils/types";
import { formatCurrency } from "@/utils/format";
import MuseumRating from "./MuseumRating";
import ImageCarousel from "./ImageCarousel";

type props = {
  museum: MuseumCardProps;
};
export default function MuseumCard({ museum }: props) {
  const { price, slug, name, image, id: museumId, tagline } = museum;
  return (
    <article className="group relative">
      <Link href={`museums/${slug}`}>
        <div className="relative h-[300px] mb-2 overflow-hidden rounded-md">
          <ImageCarousel images={image} name={name} />
        </div>
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold mt-1">
            {name.substring(0, 30)}
          </h3>
          <MuseumRating inPage={false} museumId={museumId} />
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {tagline?.substring(0, 40)}
        </p>
        <div className="flex justify-between mt-1">
          <p className="text-sm mt-1">
            <span className="font-semibold">{formatCurrency(price)} </span>
            night
          </p>
        </div>
      </Link>
      <div className="absolute top-5 right-5 z-5">
        <FavoriteToggleButton type="museum" targetId={museumId} />
      </div>
    </article>
  );
}
