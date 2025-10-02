"use client";

import { usePathname } from "next/navigation";
import { CardSubmitButton } from "../form/Buttons";
import FormContainer from "../form/FormContainer";
import { toggleFavoriteUnifiedAction } from "@/utils/actions/likes";

type ToggleType = "museum" | "artwork" | "visited";

type props = {
  type: ToggleType;
  targetId: string;
  favoriteId: string;
};
export default function FavoriteToggleForm({
  type,
  targetId,
  favoriteId,
}: props) {
  const pathname = usePathname();
  const toggleAction = toggleFavoriteUnifiedAction.bind(null, {
    type,
    targetId,
    favoriteId,
    pathname,
  });

  return (
    <FormContainer action={toggleAction}>
      <CardSubmitButton isFavorite={favoriteId ? true : false} />
    </FormContainer>
  );
}
