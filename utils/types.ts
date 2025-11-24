export type actionFunction = (
  prevState: any,
  formData: FormData
) => Promise<{ message: string } | { error: string } | void>;

export type MuseumCardProps = {
  image: string[];
  slug: string;
  name: string;
  tagline: string | null;
  address: string;
  price: number;
};
