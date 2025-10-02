import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import TextAreaInput from "@/components/form/TextAreaInput";
import { fetchMuseumTrivia, handleTriviaAction } from "@/utils/actions/museums";

export default async function CreateMuseumTrivia({
  params,
}: {
  params: { id: string; triviaId: string };
}) {
  const trivia = await fetchMuseumTrivia(params.triviaId);
  return (
    <div>
      <FormContainer action={handleTriviaAction}>
        <input type="hidden" name="id" value={params.triviaId} />
        <input type="hidden" name="museumId" value={trivia?.museumId} />
        <div className="grid gap-4">
          <FormInput
            name="title"
            label="タイトル"
            defaultValue={trivia?.title}
          />
          <TextAreaInput
            name="content"
            labelText="内容（Markdown OK）"
            rows={10}
            defaultValue={trivia?.content}
          />
        </div>
        <SubmitButton text="編集する" className="mt-8" />
      </FormContainer>
    </div>
  );
}
