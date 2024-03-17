-- CreateTable
CREATE TABLE "UsersIp" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "ip_address" TEXT NOT NULL,

    CONSTRAINT "UsersIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlackList" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "BlackList_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UsersIp" ADD CONSTRAINT "UsersIp_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlackList" ADD CONSTRAINT "BlackList_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
