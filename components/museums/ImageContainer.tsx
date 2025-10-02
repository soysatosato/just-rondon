import Image from "next/image";

type props = {
  image: string;
  name: string;
};
export default function ImageContainer({ image, name }: props) {
  return (
    <section className="h-[300px] md:h-[500px] relative mt-8">
      {/* priorityは最優先でプリロード（読み込み）する 
    　　　　　　　　objet-coverははみ出してもいいから縦横比は維持しながら全体に埋める　*/}
      <Image
        src={image}
        fill
        sizes="100vw"
        alt={name}
        className="obejct-cover rounded"
        priority
      />
    </section>
  );
}
