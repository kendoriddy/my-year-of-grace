-- AlterTable
ALTER TABLE "Testimony" ADD COLUMN "clapCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Clap" (
    "id" TEXT NOT NULL,
    "testimonyId" TEXT NOT NULL,
    "visitorId" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Clap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Clap_testimonyId_idx" ON "Clap"("testimonyId");

-- CreateIndex
CREATE INDEX "Clap_testimonyId_visitorId_idx" ON "Clap"("testimonyId", "visitorId");

-- CreateIndex
CREATE INDEX "Testimony_clapCount_idx" ON "Testimony"("clapCount");

-- AddForeignKey
ALTER TABLE "Clap" ADD CONSTRAINT "Clap_testimonyId_fkey" FOREIGN KEY ("testimonyId") REFERENCES "Testimony"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
