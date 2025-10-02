import { Button } from "../ui/button";
import Link from "next/link";

type EmptyListProps = {
  heading?: string;
  message?: string;
  btnText?: string;
};

export default function EmptyList({
  heading = "No items in the list.",
  message = "Keep exploring.",
  btnText = "back home",
}: EmptyListProps) {
  return (
    <div className="mt-4 text-center">
      <h2 className="text-xl font-bold">{heading}</h2>
      <p className="text-lg">{message}</p>
      <Button className="mt-4 capitalize text-lg" size="lg">
        <Link href="/">{btnText}</Link>
      </Button>
    </div>
  );
}
