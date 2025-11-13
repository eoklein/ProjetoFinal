-- CreateTable
CREATE TABLE "SolicitacaoLancamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "descricao" TEXT NOT NULL,
    "valor" REAL NOT NULL,
    "data" DATETIME NOT NULL,
    "tipo" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "adminId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDENTE',
    "tipoPatrimonioId" INTEGER,
    "patrimonioId" INTEGER,
    "motivo_rejeicao" TEXT,
    "data_criacao" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_atualizacao" DATETIME NOT NULL,
    CONSTRAINT "SolicitacaoLancamento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoLancamento_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoLancamento_tipoPatrimonioId_fkey" FOREIGN KEY ("tipoPatrimonioId") REFERENCES "TipoPatrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SolicitacaoLancamento_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
