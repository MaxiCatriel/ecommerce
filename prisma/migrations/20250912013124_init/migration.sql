-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Variant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "availableForSale" BOOLEAN NOT NULL DEFAULT true,
    "selectedOptions" TEXT NOT NULL DEFAULT '',
    "priceAmount" TEXT NOT NULL DEFAULT '0',
    "currencyCode" TEXT NOT NULL DEFAULT 'ARS',
    "productId" TEXT NOT NULL,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Variant" ("availableForSale", "currencyCode", "id", "priceAmount", "productId", "selectedOptions", "title") SELECT "availableForSale", "currencyCode", "id", "priceAmount", "productId", "selectedOptions", "title" FROM "Variant";
DROP TABLE "Variant";
ALTER TABLE "new_Variant" RENAME TO "Variant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
