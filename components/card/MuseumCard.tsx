import Link from "next/link";
import { MuseumCardProps } from "@/utils/types";
import { formatCurrency } from "@/utils/format";
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
    </article>
  );
}
