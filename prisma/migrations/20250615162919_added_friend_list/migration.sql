/*
  Warnings:

  - Made the column `pfppath` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "friendList" TEXT,
ALTER COLUMN "pfppath" SET NOT NULL;
