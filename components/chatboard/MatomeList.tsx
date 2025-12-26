import { fetchAllMatome } from "@/utils/actions/chatboard";
import { MatomeCard } from "./MatomeCard";
import Pagination from "../home/Pagination";

export async function MatomeList({
  page = 1,
  limit = 10,
  take,
  pagination = false,
}: {
  page?: number;
  limit?: number;
  take?: number;
  pagination?: boolean;
} = {}) {
  const { reddits, total } = await fetchAllMatome({ page, limit, take });
  const itemsPerPage = take ?? limit;
  if (!reddits.length) {
    return (
      <div className="rounded-xl border p-6 text-sm text-neutral-500">
        No threads.
      </div>
    );
  }

  return (
    <>
      <section className="space-y-4">
        {reddits.map((t: any) => (
          <MatomeCard key={t.id} thread={t} />
        ))}
      </section>

      {pagination && (
        <Pagination
          currentPage={page}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl="/matome"
          maxPageButtons={5}
        />
      )}
    </>
  );
}
