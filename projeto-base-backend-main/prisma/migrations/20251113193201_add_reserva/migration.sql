-- CreateTable Reserva
CREATE TABLE "Reserva" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "patrimonioId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "dataReserva" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataDevolucao" DATETIME NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'ativa',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Reserva_patrimonioId_fkey" FOREIGN KEY ("patrimonioId") REFERENCES "Patrimonio" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reserva_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Reserva_patrimonioId_idx" ON "Reserva"("patrimonioId");
CREATE INDEX "Reserva_userId_idx" ON "Reserva"("userId");
