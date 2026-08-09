-- CreateTable
CREATE TABLE "TweetDraft" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "postedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TweetDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TweetDraft_status_createdAt_idx" ON "TweetDraft"("status", "createdAt");
