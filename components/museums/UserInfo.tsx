import Image from "next/image";

type props = {
  profile: {
    profileImage: string;
    username: string;
  };
};
export default function UserInfo({ profile }: props) {
  const { profileImage, username } = profile;
  return (
    <article className="grid grid-cols-[auto, 1fr] gap-4 mt-4">
      <img
        src={profileImage}
        alt={username}
        width={50}
        height={50}
        className="rounded h-12 w-12 object-cover"
        loading="lazy"
        decoding="async"
        fetchPriority="low"
      />
      <div>
        <p>
          Hosted by
          <span className="font-bold"> {username}</span>
        </p>
        <p className="text-muted-foreground font-light">
          Superhost &middot; 2 years hosting
        </p>
      </div>
    </article>
  );
}
