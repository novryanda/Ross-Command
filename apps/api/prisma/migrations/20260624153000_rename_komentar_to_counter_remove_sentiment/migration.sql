ALTER TYPE "OrderType" RENAME VALUE 'komentar' TO 'counter';

ALTER TABLE "orders" DROP COLUMN "sentiment";

DROP TYPE "OrderSentiment";
