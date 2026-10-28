/**
 * 古い投稿から、送信元の IP アドレス・ユーザーエージェント・連投判定用の識別子を消す。
 *
 * これらはコメント・お問い合わせ・相談の連投を止めるため(上限は直近1時間〜1日の
 * 件数で数える)と、荒らしに対応するためだけに記録している。90日たてば
 * どちらにも使わないので、UK GDPR の「必要な期間だけ保存する」に合わせて消す。
 * 投稿の本文・お名前・メールアドレスは、返信や記録のために残す。
 *
 * 期間はプライバシーポリシー(app/(no-ads)/privacy/page.tsx)と合わせること。
 * GitHub Actions(.github/workflows/purge-old-ips.yml)が毎日流す。
 *
 * 実行:
 *   npx tsx scripts/purge-old-ips.ts          消す
 *   npx tsx scripts/purge-old-ips.ts --dry    件数だけ数える
 */
import { PrismaClient } from "@prisma/client";

const RETENTION_DAYS = 90;

const db = new PrismaClient();

async function main() {
  const dry = process.argv.includes("--dry");
  const before = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
  const old = { createdAt: { lt: before } };
  const tracked = {
    OR: [
      { ip: { not: null } },
      { userAgent: { not: null } },
      { sessionId: { not: null } },
    ],
  };
  const cleared = { ip: null, userAgent: null, sessionId: null };

  if (dry) {
    const counts = await Promise.all([
      db.pageComment.count({ where: { ...old, ...tracked } }),
      db.contact.count({ where: { ...old, ip: { not: null } } }),
      db.serviceChargeConsultation.count({ where: { ...old, ip: { not: null } } }),
      // 旧掲示板(2026-10 に投稿口は削除済み)。行は記録として残っている。
      db.post.count({ where: { ...old, ...tracked } }),
      db.comment.count({ where: { ...old, ...tracked } }),
    ]);
    console.log("消す対象:", formatCounts(counts));
    return;
  }

  const results = await db.$transaction([
    db.pageComment.updateMany({ where: { ...old, ...tracked }, data: cleared }),
    db.contact.updateMany({ where: { ...old, ip: { not: null } }, data: { ip: null } }),
    db.serviceChargeConsultation.updateMany({
      where: { ...old, ip: { not: null } },
      data: { ip: null },
    }),
    db.post.updateMany({ where: { ...old, ...tracked }, data: cleared }),
    db.comment.updateMany({ where: { ...old, ...tracked }, data: cleared }),
  ]);
  console.log(
    `${RETENTION_DAYS}日より前の記録を消しました:`,
    formatCounts(results.map((r) => r.count)),
  );
}

function formatCounts([comments, contacts, consultations, posts, boardComments]: number[]) {
  return `コメント${comments}・お問い合わせ${contacts}・相談${consultations}・旧掲示板${posts + boardComments}`;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
