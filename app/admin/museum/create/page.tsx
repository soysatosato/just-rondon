import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import HighlightInput from "@/components/form/HighlightInput";
import ImageInput from "@/components/form/ImageInput";
import { OpeningHoursInput } from "@/components/form/OpeningHoursInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { createMuseumAction } from "@/utils/actions/museums";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateMuseumPage() {
  const user = await currentUser();
  if (user?.publicMetadata?.hasProfile) {
    redirect("/");
  }
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">Create Property</h1>
      <div className="border p-8 rounded-md">
        <h3 className="text-lg mb-4 font-medium">General Info</h3>
        <FormContainer action={createMuseumAction}>
          <div className="grid gap-4 mt-4">
            <FormInput name="name" type="text" label="Name" />
            <FormInput name="slug" type="text" label="Slug" />
            <FormInput name="tagline" type="text" label="Tagline" />
            <FormInput name="category" type="text" label="Category" />
            <TextAreaInput name="description" labelText="Description" />
            <HighlightInput name="highlights" />
            <PriceInput name="price" />
            <PriceInput name="tourPrice" label="Tour Price" />
            <FormInput name="address" type="text" label="Address" />
            <FormInput name="lat" type="number" step="any" label="Latitude" />
            <FormInput name="lng" type="number" step="any" label="Longitude" />
            <FormInput name="website" type="url" label="Website URL" />
            <OpeningHoursInput name="openingHours" label="Opening Hours" />
            <ImageInput name="image" />
          </div>

          <SubmitButton text="Create Museum" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
