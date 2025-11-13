/*
  Warnings:

  - You are about to drop the column `descricao` on the `Patrimonio` table. All the data in the column will be lost.
  - Added the required column `nome` to the `Patrimonio` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patrimonio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Patrimonio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patrimonio" ("id", "nome", "status", "data", "userId") SELECT "id", "descricao", "status", "data", "userId" FROM "Patrimonio";
DROP TABLE "Patrimonio";
ALTER TABLE "new_Patrimonio" RENAME TO "Patrimonio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
