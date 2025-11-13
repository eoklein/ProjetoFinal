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
    "categoriaId" INTEGER,
    "contaId" INTEGER,
    "numeroParcelas" INTEGER,
    "parcelaAtual" INTEGER,
    "lancamentoPaiId" INTEGER,
    "efetivado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Lancamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_contaId_fkey" FOREIGN KEY ("contaId") REFERENCES "Conta" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lancamento_lancamentoPaiId_fkey" FOREIGN KEY ("lancamentoPaiId") REFERENCES "Lancamento" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lancamento" ("categoriaId", "contaId", "data", "descricao", "id", "lancamentoPaiId", "numeroParcelas", "parcelaAtual", "tipo", "userId", "valor") SELECT "categoriaId", "contaId", "data", "descricao", "id", "lancamentoPaiId", "numeroParcelas", "parcelaAtual", "tipo", "userId", "valor" FROM "Lancamento";
DROP TABLE "Lancamento";
ALTER TABLE "new_Lancamento" RENAME TO "Lancamento";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
