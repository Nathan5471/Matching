/*
  Warnings:

  - Changed the type of `value` on the `Card` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CardValues" AS ENUM ('shrek', 'fiona', 'donkey', 'puss', 'dragon', 'waffles', 'onions', 'farquaad', 'fairyGodmother', 'princeCharming', 'gingy', 'humanShrek', 'humanFiona', 'horseDonkey', 'pinocchio', 'blindMice', 'bigBadWolf', 'farFarAway', 'fionaCastle', 'swamp', 'duloc');

-- AlterTable
ALTER TABLE "Card" DROP COLUMN "value",
ADD COLUMN     "value" "CardValues" NOT NULL;

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "currentTurn" INTEGER NOT NULL DEFAULT 0;
