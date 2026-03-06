// app/admin/museum/[id]/exhibitions/CreateExhibitionForm.tsx
import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { handleExhibitionAction } from "@/utils/actions/museums";

export default async function CreateExhibitionForm({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <FormContainer action={handleExhibitionAction}>
        <input type="hidden" name="museumId" value={params.id} />
        <div className="grid gap-4">
          <FormInput name="name" label="展示会名" />
          <TextAreaInput name="description" labelText="説明" rows={6} />
          <FormInput name="startDate" label="開始日" type="date" />
          <FormInput name="endDate" label="終了日" type="date" />
          <FormInput name="admission" label="料金" />
        </div>
        <SubmitButton text="作成する" className="mt-8" />
      </FormContainer>
    </div>
  );
}
