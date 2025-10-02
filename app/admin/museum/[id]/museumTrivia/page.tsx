import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import TriviaAccordion from "@/components/museums/TriviaAccordion";
import {
  fetchMuseumTrivias,
  handleTriviaAction,
} from "@/utils/actions/museums";

export default async function CreateMuseumTrivia({
  params,
}: {
  params: { id: string };
}) {
  const trivias = await fetchMuseumTrivias(params.id);
  return (
    <div>
      <TriviaAccordion trivias={trivias} />
      <FormContainer action={handleTriviaAction}>
        <input type="hidden" name="museumId" value={params.id} />
        <div className="grid gap-4">
          <FormInput name="title" label="タイトル" />
          <TextAreaInput
            name="content"
            labelText="内容（Markdown OK）"
            rows={10}
          />
        </div>
        <SubmitButton text="作成する" className="mt-8" />
      </FormContainer>
    </div>
  );
}
