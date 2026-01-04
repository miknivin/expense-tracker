-- CreateTable
CREATE TABLE "heartbeat" (
    "id" SERIAL NOT NULL,
    "pinged_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "heartbeat_pkey" PRIMARY KEY ("id")
);
