/*
  Warnings:

  - You are about to drop the column `nome` on the `Patrimonio` table. All the data in the column will be lost.
  - You are about to drop the column `valor` on the `Patrimonio` table. All the data in the column will be lost.
  - Added the required column `descricao` to the `Patrimonio` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Patrimonio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "Patrimonio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patrimonio" ("data", "id", "status", "userId") SELECT "data", "id", "status", "userId" FROM "Patrimonio";
DROP TABLE "Patrimonio";
ALTER TABLE "new_Patrimonio" RENAME TO "Patrimonio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
