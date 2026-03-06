import { SubmitButton } from "@/components/form/Buttons";
import FormContainer from "@/components/form/FormContainer";
import FormInput from "@/components/form/FormInput";
import ImageInputContainer from "@/components/form/ImageInputContainer";
import {
  fetchProfile,
  updateProfileAction,
  updateProfileImageAction,
} from "@/utils/actions/museums";

export default async function ProfilePage() {
  const profile = await fetchProfile();
  return (
    <section>
      <h1 className="text-2xl font-semibold mb-8">User Profile</h1>
      <div className="border p-8 rounded-md max-w-lg md:grid-cols-2">
        <ImageInputContainer
          image={profile.profileImage}
          name={profile.username}
          action={updateProfileImageAction}
          text="Update Profile Image"
        />
        <FormContainer action={updateProfileAction}>
          <div className="grid gap-4 mt-4">
            <FormInput
              name="username"
              type="text"
              label="Username"
              defaultValue={profile.username}
            />
          </div>
          <SubmitButton text="Update Profile" className="mt-8" />
        </FormContainer>
      </div>
    </section>
  );
}
