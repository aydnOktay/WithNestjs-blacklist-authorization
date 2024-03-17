-- CreateTable
CREATE TABLE "SignAttempt" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip_address" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SignAttempt_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SignAttempt" ADD CONSTRAINT "SignAttempt_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
