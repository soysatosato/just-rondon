import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import PriceInput from "@/components/form/PriceInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import {
  fetchMuseumExhibition,
  handleExhibitionAction,
} from "@/utils/actions/museums";

export default async function EditExhibitionForm({
  params,
}: {
  params: { id: string; exhibitionId: string };
}) {
  const exhibition = await fetchMuseumExhibition(params.exhibitionId);

  return (
    <div>
      <FormContainer action={handleExhibitionAction}>
        {exhibition && <input type="hidden" name="id" value={exhibition.id} />}
        <input type="hidden" name="museumId" value={params.id} />
        <div className="grid gap-4">
          <FormInput
            name="name"
            label="展示会名"
            defaultValue={exhibition?.name}
          />
          <TextAreaInput
            name="description"
            labelText="説明"
            rows={6}
            defaultValue={exhibition?.description}
          />
          <FormInput
            name="startDate"
            label="開始日"
            type="date"
            defaultValue={
              exhibition?.startDate
                ? exhibition.startDate.toISOString().slice(0, 10)
                : undefined
            }
          />
          <FormInput
            name="endDate"
            label="終了日"
            type="date"
            defaultValue={
              exhibition?.endDate
                ? exhibition.endDate.toISOString().slice(0, 10)
                : undefined
            }
          />
          <PriceInput
            name="admission"
            label="料金"
            defaultValue={exhibition?.admission}
          />
        </div>
        <SubmitButton text="編集する" className="mt-8" />
      </FormContainer>
    </div>
  );
}
