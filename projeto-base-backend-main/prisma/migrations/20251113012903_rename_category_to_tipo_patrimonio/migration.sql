/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `categoriaId` on the `Lancamento` table. All the data in the column will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Category";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "TipoPatrimonio" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "TipoPatrimonio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lancamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipoPatrimonioId" INTEGER,
    "patrimonioId" INTEGER,
    "numeroParcelas" INTEGER,
    "parcelaAtual" INTEGER,
    "lancamentoPaiId" INTEGER,
    "efetivado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Lancamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_tipoPatrimonioId_fkey" FOREIGN KEY ("tipoPatrimonioId") REFERENCES "TipoPatrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_lancamentoPaiId_fkey" FOREIGN KEY ("lancamentoPaiId") REFERENCES "Lancamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lancamento" ("data", "descricao", "efetivado", "id", "lancamentoPaiId", "numeroParcelas", "parcelaAtual", "patrimonioId", "tipo", "userId", "valor") SELECT "data", "descricao", "efetivado", "id", "lancamentoPaiId", "numeroParcelas", "parcelaAtual", "patrimonioId", "tipo", "userId", "valor" FROM "Lancamento";
DROP TABLE "Lancamento";
ALTER TABLE "new_Lancamento" RENAME TO "Lancamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
