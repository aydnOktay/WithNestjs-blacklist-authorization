/*
  Warnings:

  - You are about to drop the column `status` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "status";

-- DropEnum
DROP TYPE "UserStatus";

-- CreateTable
CREATE TABLE "Sessions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sessions" ADD CONSTRAINT "Sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
