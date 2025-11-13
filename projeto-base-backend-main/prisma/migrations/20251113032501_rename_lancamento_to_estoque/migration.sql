/*
  Warnings:

  - You are about to drop the `Lancamento` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Lancamento";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Estoque" (
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
    CONSTRAINT "Estoque_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Estoque_tipoPatrimonioId_fkey" FOREIGN KEY ("tipoPatrimonioId") REFERENCES "TipoPatrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Estoque_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Estoque_estoquePaiId_fkey" FOREIGN KEY ("estoquePaiId") REFERENCES "Estoque" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
