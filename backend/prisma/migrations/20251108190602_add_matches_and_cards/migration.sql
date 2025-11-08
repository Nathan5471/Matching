-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'ongoing', 'completed');

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "value" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL DEFAULT false,
    "matchId" INTEGER NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "winnerId" INTEGER,
    "scores" INTEGER[],
    "status" "Status" NOT NULL DEFAULT 'pending',

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_matches" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_matches_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_matches_B_index" ON "_matches"("B");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_matches" ADD CONSTRAINT "_matches_A_fkey" FOREIGN KEY ("A") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_matches" ADD CONSTRAINT "_matches_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
