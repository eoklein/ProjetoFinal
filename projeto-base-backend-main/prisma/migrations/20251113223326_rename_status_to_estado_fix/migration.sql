/*
  Warnings:

  - You are about to drop the column `status` on the `Patrimonio` table. All the data in the column will be lost.
  - Added the required column `estado` to the `Patrimonio` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Reserva_userId_idx";

-- DropIndex
DROP INDEX "Reserva_patrimonioId_idx";

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patrimonio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "estado" TEXT NOT NULL,
    "valor" REAL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Patrimonio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patrimonio" ("codigo", "data", "id", "nome", "userId", "valor") SELECT "codigo", "data", "id", "nome", "userId", "valor" FROM "Patrimonio";
DROP TABLE "Patrimonio";
ALTER TABLE "new_Patrimonio" RENAME TO "Patrimonio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
