import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import { createProfileAction } from "@/utils/actions/museums";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function CreateProfilePage() {
  const user = await currentUser();
  if (user?.privateMetadata?.hasProfile) {
    redirect("/");
  }
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">New User</h1>
      <div className="border p-8 rounded-md max-w-lg md:grid-cols-2">
        {/* <ImageInputContainer image={user?.imageUrl}  action={updateProfileAction} /> */}
        <FormContainer action={createProfileAction}>
          <div className="grid gap-4 mt-4">
            <FormInput name="username" type="text" label="Username" />
          </div>
          <SubmitButton text="Create Profile" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
