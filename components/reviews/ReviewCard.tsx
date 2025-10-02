import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Rating from "./Rating";
import Comment from "./Comment";
import Image from "next/image";

type props = {
  reviewInfo: {
    comment: string;
    rating: number;
    name: string;
    image: string;
  };
  children?: React.ReactNode;
};

export default function ReviewCard({ reviewInfo, children }: props) {
  const { comment, rating, name, image } = reviewInfo;
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-center gap-x-2">
          <Image
            src={image}
            alt="profile"
            className="h-12 w-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-sm font-bold capitalize mb-1">{name}</h3>
            <Rating rating={rating} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Comment comment={comment} />
      </CardContent>
      <div className="absolute top-3 right-3">{children}</div>
    </Card>
  );
}
