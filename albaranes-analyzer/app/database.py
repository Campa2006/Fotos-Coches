"""Acceso a la base de datos SQLite del analizador de albaranes."""
import sqlite3
from pathlib import Path
from contextlib import contextmanager

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "albaranes.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    nif TEXT UNIQUE,
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS albaranes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT UNIQUE,
    fecha TEXT,
    mes INTEGER,
    anio INTEGER,
    cliente_id INTEGER REFERENCES clientes(id) ON DELETE SET NULL,
    cliente_nombre_raw TEXT,
    cliente_nif_raw TEXT,
    total_honorarios REAL NOT NULL DEFAULT 0,
    estado TEXT NOT NULL,
    motivo TEXT,
    archivo_nombre TEXT,
    archivo_hash TEXT,
    texto_extraido TEXT,
    fecha_importacion TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lineas_honorarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    albaran_id INTEGER NOT NULL REFERENCES albaranes(id) ON DELETE CASCADE,
    tramite TEXT NOT NULL,
    importe REAL NOT NULL,
    orden INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS importaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    archivo_nombre TEXT NOT NULL,
    archivo_hash TEXT NOT NULL,
    estado TEXT NOT NULL,
    mensaje TEXT,
    albaran_id INTEGER REFERENCES albaranes(id) ON DELETE SET NULL,
    fecha_importacion TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_albaranes_mes_anio ON albaranes(anio, mes);
CREATE INDEX IF NOT EXISTS idx_albaranes_estado ON albaranes(estado);
CREATE INDEX IF NOT EXISTS idx_albaranes_hash ON albaranes(archivo_hash);
CREATE INDEX IF NOT EXISTS idx_lineas_albaran ON lineas_honorarios(albaran_id);
"""


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(SCHEMA)


@contextmanager
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
