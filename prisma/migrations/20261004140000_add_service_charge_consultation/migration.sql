-- サービスチャージ未払いの相談フォーム(utils/actions/consult.ts)。
--
-- ★ prisma migrate diff を DB に向けて作り直さないこと。Content / ContentSection の
--   image* 列(DB にだけあり schema.prisma に無い)を DROP する文が混ざる。
--   このファイルは手で書いた。

-- CreateTable
CREATE TABLE "ServiceChargeConsultation" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "email" TEXT NOT NULL,
    "nickname" TEXT,
    "employment" TEXT NOT NULL,
    "lastPaidOn" DATE,
    "chargeRate" TEXT,
    "sharing" TEXT,
    "acas" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "publishOk" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,

    CONSTRAINT "ServiceChargeConsultation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceChargeConsultation_token_key" ON "ServiceChargeConsultation"("token");
CREATE INDEX "ServiceChargeConsultation_email_createdAt_idx" ON "ServiceChargeConsultation"("email", "createdAt");
CREATE INDEX "ServiceChargeConsultation_ip_createdAt_idx" ON "ServiceChargeConsultation"("ip", "createdAt");
CREATE INDEX "ServiceChargeConsultation_createdAt_idx" ON "ServiceChargeConsultation"("createdAt");
