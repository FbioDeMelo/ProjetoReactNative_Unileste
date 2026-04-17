import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

export async function openDb() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database
  });

  // Habilitar chaves estrangeiras
  await db.exec('PRAGMA foreign_keys = ON;');

  // Migrations iniciais
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orcamentos (
      id          TEXT PRIMARY KEY,
      cliente     TEXT NOT NULL,
      titulo      TEXT NOT NULL,
      status      TEXT NOT NULL,
      desconto    REAL DEFAULT 0,
      subtotal    REAL NOT NULL DEFAULT 0,
      total       REAL NOT NULL,
      dataCriacao TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id            TEXT PRIMARY KEY,
      orcamento_id  TEXT NOT NULL,
      nome          TEXT NOT NULL,
      quantidade    INTEGER NOT NULL,
      precoUnitario REAL NOT NULL,
      FOREIGN KEY (orcamento_id) REFERENCES orcamentos (id) ON DELETE CASCADE
    );
  `);

  // Migration incremental: adiciona coluna subtotal se não existir (banco já criado antes)
  try {
    await db.exec('ALTER TABLE orcamentos ADD COLUMN subtotal REAL NOT NULL DEFAULT 0;');
  } catch (_) {
    // Coluna já existe — ignorar
  }

  return db;
}
