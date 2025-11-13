/*
  Warnings:

  - You are about to drop the column `statusReserva` on the `Estoque` table. All the data in the column will be lost.
  - You are about to drop the column `statusReserva` on the `Patrimonio` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Estoque" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipoPatrimonioId" INTEGER,
    "patrimonioId" INTEGER,
    "numeroRetiradas" INTEGER,
    "retiradaAtual" INTEGER,
    "estoquePaiId" INTEGER,
    "efetivado" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT,
    CONSTRAINT "Estoque_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estoque_tipoPatrimonioId_fkey" FOREIGN KEY ("tipoPatrimonioId") REFERENCES "TipoPatrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Estoque_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Estoque_estoquePaiId_fkey" FOREIGN KEY ("estoquePaiId") REFERENCES "Estoque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Estoque" ("data", "descricao", "efetivado", "estoquePaiId", "id", "numeroRetiradas", "patrimonioId", "retiradaAtual", "tipo", "tipoPatrimonioId", "userId", "valor") SELECT "data", "descricao", "efetivado", "estoquePaiId", "id", "numeroRetiradas", "patrimonioId", "retiradaAtual", "tipo", "tipoPatrimonioId", "userId", "valor" FROM "Estoque";
DROP TABLE "Estoque";
ALTER TABLE "new_Estoque" RENAME TO "Estoque";
CREATE TABLE "new_Patrimonio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "codigo" TEXT,
    "estado" TEXT NOT NULL,
    "valor" REAL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "status" TEXT,
    CONSTRAINT "Patrimonio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Patrimonio" ("codigo", "data", "estado", "id", "nome", "userId", "valor") SELECT "codigo", "data", "estado", "id", "nome", "userId", "valor" FROM "Patrimonio";
DROP TABLE "Patrimonio";
ALTER TABLE "new_Patrimonio" RENAME TO "Patrimonio";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
