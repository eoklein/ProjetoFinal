/*
  Warnings:

  - You are about to drop the column `estado` on the `Reserva` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Estoque" ADD COLUMN "statusReserva" TEXT;

-- AlterTable
ALTER TABLE "Patrimonio" ADD COLUMN "statusReserva" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patrimonioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataReserva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ativa',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reserva" ("criadoEm", "dataDevolucao", "dataReserva", "id", "patrimonioId", "userId") SELECT "criadoEm", "dataDevolucao", "dataReserva", "id", "patrimonioId", "userId" FROM "Reserva";
DROP TABLE "Reserva";
ALTER TABLE "new_Reserva" RENAME TO "Reserva";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
