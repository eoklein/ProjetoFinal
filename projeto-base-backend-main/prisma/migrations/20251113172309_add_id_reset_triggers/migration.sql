-- SQLite Triggers to reset auto-increment when tables are emptied

-- Drop old triggers if they exist (with old names)
DROP TRIGGER IF EXISTS reset_patrimonio_id_sequence;
DROP TRIGGER IF EXISTS reset_estoque_id_sequence;

-- Create trigger for Patrimonio table to reset ID sequence when table is emptied
CREATE TRIGGER reset_patrimonio_seq_on_delete
AFTER DELETE ON Patrimonio
BEGIN
  DELETE FROM sqlite_sequence WHERE name = 'Patrimonio' AND (SELECT COUNT(*) FROM Patrimonio) = 0;
END;

-- Create trigger for Estoque table to reset ID sequence when table is emptied
CREATE TRIGGER reset_estoque_seq_on_delete
AFTER DELETE ON Estoque
BEGIN
  DELETE FROM sqlite_sequence WHERE name = 'Estoque' AND (SELECT COUNT(*) FROM Estoque) = 0;
END;
