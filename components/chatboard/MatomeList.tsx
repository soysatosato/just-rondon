import { fetchAllMatome } from "@/utils/actions/chatboard";
import { MatomeCard } from "./MatomeCard";

export async function MatomeList({
  page = 1,
  limit = 10,
  take,
}: {
  page?: number;
  limit?: number;
  take?: number;
} = {}) {
  const { reddits } = await fetchAllMatome({ page, limit, take });

  if (!reddits.length) {
    return (
      <div className="rounded-xl border p-6 text-sm text-neutral-500">
        No threads.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {reddits.map((t: any) => (
        <MatomeCard key={t.id} thread={t} />
      ))}
    </section>
  );
}
