import { auth } from "@clerk/nextjs/server";
import { CardSignInButton } from "../form/Buttons";
import {
  fetchArtworkFavoriteId,
  fetchHasVisitedId,
  fetchMuseumFavoriteId,
} from "@/utils/actions/likes";
import FavoriteToggleForm from "./FavoriteToggleForm";

type props = {
  type: "museum" | "artwork" | "visited";
  targetId: string; // museumId or artworkId
};
export default async function FavoriteToggleButton({ type, targetId }: props) {
  const { userId } = auth();
  if (!userId) return <CardSignInButton />;
  let favoriteId;

  switch (type) {
    case "museum":
      favoriteId = await fetchMuseumFavoriteId({ museumId: targetId });
      break;
    case "artwork":
      favoriteId = await fetchArtworkFavoriteId({
        artworkId: targetId,
      });
      break;
    case "visited":
      favoriteId = await fetchHasVisitedId({ museumId: targetId });
      break;
    default:
      throw new Error("Invalid type");
  }
  if (!favoriteId) return;
  return (
    <FavoriteToggleForm
      type={type}
      targetId={targetId}
      favoriteId={favoriteId}
    />
  );
}
