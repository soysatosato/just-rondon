import { SubmitButton } from "@/components/form/Buttons";
import CheckboxInput from "@/components/form/CheckboxInput";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import HighlightInput from "@/components/form/HighlightInput";
import ImageInput from "@/components/form/ImageInput";
import MuseumInput from "@/components/form/MuseumInput";
import RecommendLevelSelect from "@/components/form/ReccomendLevelSelect";
import TextAreaInput from "@/components/form/TextAreaInput";
import { createArtworkAction } from "@/utils/actions/museums";

export default async function CreateArtworkPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">Create Artwork</h1>
      <div className="border p-8 rounded-md">
        <h3 className="text-lg mb-4 font-medium">General Info</h3>
        <FormContainer action={createArtworkAction}>
          <div className="grid gap-4 mt-4">
            <FormInput name="title" type="text" label="Title" />
            <FormInput name="artist" type="text" label="Artist" />
            <FormInput name="year" type="text" label="Year" />
            <FormInput name="location" type="text" label="Location" />
            <FormInput name="room" type="text" label="Room" />
            <TextAreaInput name="description" labelText="Description" />
            <HighlightInput name="highlights" />
            <MuseumInput name="museumId" labelText="Museum" />
            <ImageInput name="image" />

            {/* 展示中フラグ */}
            <CheckboxInput
              name="isOnDisplay"
              label="Currently On Display"
              defaultChecked={true}
            />

            {/* おすすめ度（1〜5など） */}
            <RecommendLevelSelect name="recommendLevel" />

            {/* 必見フラグ */}
            <CheckboxInput name="mustSee" label="Must See" />
          </div>

          <SubmitButton text="Create Artwork" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
