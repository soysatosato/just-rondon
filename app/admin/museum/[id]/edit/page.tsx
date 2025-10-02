import {
  fetchMuseumDetails,
  updateMuseumAction,
} from "@/utils/actions/museums";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { SubmitButton } from "@/components/form/Buttons";
import { redirect } from "next/navigation";
import { OpeningHoursInput } from "@/components/form/OpeningHoursInput";
import Link from "next/link";
import HighlightInput from "@/components/form/HighlightInput";

export default async function EditMuseumPage({
  params,
}: {
  params: { id: string };
}) {
  const museum = await fetchMuseumDetails(params.id);
  if (!museum) redirect("/");

  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8 capitalize">Edit Museum</h1>
      <div className="border p-8 rounded-md ">
        <FormContainer action={updateMuseumAction}>
          <input type="hidden" name="id" value={museum.id} />
          <div className="grid gap-4 mt-4">
            <FormInput
              name="name"
              type="text"
              label="Name"
              defaultValue={museum.name}
            />
            <FormInput
              name="slug"
              type="text"
              label="Slug"
              defaultValue={museum.slug}
            />
            <FormInput
              name="tagline"
              type="text"
              label="Tagline"
              defaultValue={museum.tagline ?? ""}
            />
            <FormInput
              name="category"
              type="text"
              label="Category"
              defaultValue={museum.category ?? ""}
            />
            <TextAreaInput
              name="description"
              labelText="Description"
              defaultValue={museum.description ?? ""}
            />

            <HighlightInput
              name="highlights"
              defaultValue={museum.highlights}
            />
            <PriceInput name="price" defaultValue={museum.price ?? 0} />
            <PriceInput
              label="Tour Price"
              name="tourPrice"
              defaultValue={museum.price ?? 0}
            />
            <FormInput
              name="address"
              type="text"
              label="Address"
              defaultValue={museum.address}
            />
            <FormInput
              name="lat"
              type="number"
              label="Latitude"
              step="any"
              defaultValue={museum.lat?.toString() ?? ""}
            />
            <FormInput
              name="lng"
              type="number"
              label="Longitude"
              step="any"
              defaultValue={museum.lng?.toString() ?? ""}
            />
            <FormInput
              name="website"
              type="url"
              label="Website URL"
              defaultValue={museum.website ?? ""}
            />
            <OpeningHoursInput
              name="openingHours"
              label="Opening Hours"
              defaultValues={museum.openingHours}
            />
          </div>
          <SubmitButton text="edit museum" className="mt-12" />
        </FormContainer>
      </div>
      <Link href={`/admin/museum/${museum.id}/museumInfo`}>
        Register MuseumInfo
      </Link>
    </section>
  );
}
