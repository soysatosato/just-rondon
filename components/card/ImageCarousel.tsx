import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type Props = {
  images: string[];
  name: string;
};

export default function ImageCarousel({ images, name }: Props) {
  return (
    <Carousel className="w-full max-w-lg">
      <CarouselContent>
        {images.map((img, index) => (
          <CarouselItem
            key={index}
            className="relative h-[180px] sm:h-[240px] lg:h-[300px]"
          >
            <img
              src={img}
              alt={`${name} image ${index + 1}`}
              className="absolute inset-0 w-full h-full rounded-md object-cover"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
