import MuseumCard from "../card/MuseumCard";

export default function MuseumsList({ museums }: { museums: any[] }) {
  return (
    <section className="mt-4 gap-8 grid sm:grid-cols-2  lg:grid-cols-3  xl:grid-cols-4">
      {museums.map((museum) => {
        return <MuseumCard key={museum.id} museum={museum} />;
      })}
    </section>
  );
}
