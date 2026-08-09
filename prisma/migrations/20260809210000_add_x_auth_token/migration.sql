-- CreateTable
CREATE TABLE "XAuthToken" (
    "id" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XAuthToken_pkey" PRIMARY KEY ("id")
);
