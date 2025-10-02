import {
  fetchArtworkDetails,
  updateArtworkImageAction,
  updateArtworkAction,
} from "@/utils/actions/museums";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Buttons";
import { redirect } from "next/navigation";
import ImageInputContainer from "@/components/form/ImageInputContainer";
import MuseumInput from "@/components/form/MuseumInput";
import HighlightInput from "@/components/form/HighlightInput";
import CheckboxInput from "@/components/form/CheckboxInput";
import RecommendLevelSelect from "@/components/form/ReccomendLevelSelect";

export default async function EditArtworkPage({
  params,
}: {
  params: { id: string };
}) {
  const artwork = await fetchArtworkDetails(params.id);
  if (!artwork) redirect("/");

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">Edit Museum</h1>
      <div className="border p-8 rounded-md ">
        <ImageInputContainer
          name={artwork.title}
          text="Update Image"
          action={updateArtworkImageAction}
          image={artwork.image}
        ></ImageInputContainer>

        <FormContainer action={updateArtworkAction}>
          <input type="hidden" name="id" value={artwork.id} />
          <div className="grid gap-4 mt-4">
            <FormInput
              name="title"
              type="text"
              label="Title"
              defaultValue={artwork.title}
            />
            <FormInput
              name="artist"
              type="text"
              label="Artist"
              defaultValue={artwork.artist ?? ""}
            />
            <FormInput
              name="year"
              type="text"
              label="Year"
              defaultValue={artwork.year ?? undefined}
            />
            <FormInput
              name="location"
              type="text"
              label="Location"
              defaultValue={artwork.location ?? ""}
            />
            <FormInput
              name="room"
              type="text"
              label="Room"
              defaultValue={artwork.room ?? ""}
            />
            <TextAreaInput
              name="description"
              labelText="Description"
              defaultValue={artwork.description ?? ""}
            />
            <HighlightInput
              name="highlights"
              defaultValue={artwork.highlights}
            />
            <MuseumInput
              name="museumId"
              labelText="Museum"
              defaultValue={artwork.museumId}
            />
            <CheckboxInput
              name="isOnDisplay"
              label="Currently On Display"
              defaultChecked={artwork.isOnDisplay}
            />

            {/* おすすめ度（1〜5など） */}
            <RecommendLevelSelect
              defaultValue={artwork.recommendLevel.toString()}
              name="recommendLevel"
            />

            {/* 必見フラグ */}
            <CheckboxInput
              name="mustSee"
              label="Must See"
              defaultChecked={artwork.mustSee}
            />
          </div>

          <SubmitButton text="Update Artwork" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
