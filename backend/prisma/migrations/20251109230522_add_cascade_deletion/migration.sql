-- DropForeignKey
ALTER TABLE "Card" DROP CONSTRAINT "Card_matchId_fkey";

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
