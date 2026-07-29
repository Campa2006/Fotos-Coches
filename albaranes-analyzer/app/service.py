"""Lógica de negocio: importación de PDFs, deduplicación, CRUD y rankings."""
from __future__ import annotations

import hashlib
from datetime import datetime
from typing import Any

from . import database
from .parser import extract_text, parse_albaran


def _sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _get_or_create_cliente(conn, nombre: str, nif: str | None) -> int:
    cur = conn.cursor()
    if nif:
        row = cur.execute("SELECT id FROM clientes WHERE nif = ?", (nif,)).fetchone()
        if row:
            return row["id"]
    else:
        row = cur.execute(
            "SELECT id FROM clientes WHERE nombre = ? AND nif IS NULL", (nombre,)
        ).fetchone()
        if row:
            return row["id"]
    cur.execute("INSERT INTO clientes (nombre, nif) VALUES (?, ?)", (nombre, nif))
    return cur.lastrowid


def import_pdf(filename: str, content: bytes) -> dict[str, Any]:
    file_hash = _sha256(content)

    with database.get_connection() as conn:
        cur = conn.cursor()

        existing_by_hash = cur.execute(
            "SELECT * FROM albaranes WHERE archivo_hash = ?", (file_hash,)
        ).fetchone()
        if existing_by_hash:
            mensaje = (
                f"Este archivo ya se había importado antes "
                f"(albarán {existing_by_hash['numero'] or 's/n'}). No se ha vuelto a sumar."
            )
            cur.execute(
                "INSERT INTO importaciones (archivo_nombre, archivo_hash, estado, mensaje, albaran_id) "
                "VALUES (?, ?, ?, ?, ?)",
                (filename, file_hash, "duplicado", mensaje, existing_by_hash["id"]),
            )
            return {
                "archivo": filename,
                "estado": "duplicado",
                "mensaje": mensaje,
                "albaran_id": existing_by_hash["id"],
            }

        try:
            text = extract_text(content)
            if not text or not text.strip():
                raise ValueError("el PDF no contiene texto extraíble")
            data = parse_albaran(text)
        except Exception as exc:  # noqa: BLE001 - queremos capturar cualquier fallo de lectura
            mensaje = f"No se ha podido leer el PDF: {exc}"
            cur.execute(
                "INSERT INTO importaciones (archivo_nombre, archivo_hash, estado, mensaje) VALUES (?, ?, ?, ?)",
                (filename, file_hash, "error", mensaje),
            )
            return {"archivo": filename, "estado": "error", "mensaje": mensaje, "albaran_id": None}

        if data.numero:
            existing_numero = cur.execute(
                "SELECT * FROM albaranes WHERE numero = ?", (data.numero,)
            ).fetchone()
            if existing_numero:
                mensaje = f"El albarán {data.numero} ya existe en la base de datos. No se ha vuelto a sumar."
                cur.execute(
                    "INSERT INTO importaciones (archivo_nombre, archivo_hash, estado, mensaje, albaran_id) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (filename, file_hash, "duplicado", mensaje, existing_numero["id"]),
                )
                return {
                    "archivo": filename,
                    "estado": "duplicado",
                    "mensaje": mensaje,
                    "albaran_id": existing_numero["id"],
                }

        estado = "importado" if data.es_valido else "revision"
        motivo = "; ".join(data.warnings) if data.warnings else None

        cliente_id = None
        if data.cliente_nombre:
            cliente_id = _get_or_create_cliente(conn, data.cliente_nombre, data.cliente_nif)

        cur.execute(
            """INSERT INTO albaranes
               (numero, fecha, mes, anio, cliente_id, cliente_nombre_raw, cliente_nif_raw,
                total_honorarios, estado, motivo, archivo_nombre, archivo_hash, texto_extraido)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                data.numero, data.fecha, data.mes, data.anio, cliente_id,
                data.cliente_nombre, data.cliente_nif, data.total_honorarios,
                estado, motivo, filename, file_hash, data.texto,
            ),
        )
        albaran_id = cur.lastrowid

        for orden, linea in enumerate(data.lineas):
            cur.execute(
                "INSERT INTO lineas_honorarios (albaran_id, tramite, importe, orden) VALUES (?, ?, ?, ?)",
                (albaran_id, linea.tramite, linea.importe, orden),
            )

        mensaje = motivo if estado == "revision" else "Importado correctamente."
        cur.execute(
            "INSERT INTO importaciones (archivo_nombre, archivo_hash, estado, mensaje, albaran_id) "
            "VALUES (?, ?, ?, ?, ?)",
            (filename, file_hash, estado, mensaje, albaran_id),
        )

        return {
            "archivo": filename,
            "estado": estado,
            "mensaje": mensaje,
            "albaran_id": albaran_id,
            "numero": data.numero,
            "cliente": data.cliente_nombre,
            "total": data.total_honorarios,
        }


def _periodo_filter(mes: int | None, anio: int | None, alias: str = "a") -> tuple[str, tuple]:
    clauses = []
    params: list[Any] = []
    if anio:
        clauses.append(f"{alias}.anio = ?")
        params.append(anio)
    if mes:
        clauses.append(f"{alias}.mes = ?")
        params.append(mes)
    where = (" AND " + " AND ".join(clauses)) if clauses else ""
    return where, tuple(params)


def get_periodos() -> list[dict]:
    with database.get_connection() as conn:
        rows = conn.execute(
            "SELECT DISTINCT anio, mes FROM albaranes "
            "WHERE anio IS NOT NULL AND mes IS NOT NULL ORDER BY anio DESC, mes DESC"
        ).fetchall()
        return [{"anio": r["anio"], "mes": r["mes"]} for r in rows]


def get_resumen(mes: int | None = None, anio: int | None = None) -> dict:
    where, params = _periodo_filter(mes, anio)
    query = f"""
        SELECT COALESCE(SUM(a.total_honorarios), 0) AS total, COUNT(*) AS num_albaranes
        FROM albaranes a
        WHERE a.estado = 'importado' {where}
    """
    with database.get_connection() as conn:
        row = conn.execute(query, params).fetchone()
        return {"total_honorarios": round(row["total"], 2), "num_albaranes": row["num_albaranes"]}


def get_ranking_clientes(mes: int | None = None, anio: int | None = None) -> list[dict]:
    where, params = _periodo_filter(mes, anio)
    query = f"""
        SELECT c.id, c.nombre, c.nif,
               COUNT(DISTINCT a.id) AS num_albaranes,
               SUM(a.total_honorarios) AS total
        FROM albaranes a
        JOIN clientes c ON c.id = a.cliente_id
        WHERE a.estado = 'importado' {where}
        GROUP BY c.id
        ORDER BY total DESC
    """
    with database.get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [
            {
                "posicion": i + 1,
                "cliente_id": r["id"],
                "nombre": r["nombre"],
                "nif": r["nif"],
                "num_albaranes": r["num_albaranes"],
                "total_honorarios": round(r["total"], 2),
            }
            for i, r in enumerate(rows)
        ]


def get_ranking_tramites(mes: int | None = None, anio: int | None = None) -> list[dict]:
    where, params = _periodo_filter(mes, anio)
    query = f"""
        SELECT lh.tramite AS tramite,
               COUNT(*) AS veces,
               SUM(lh.importe) AS total
        FROM lineas_honorarios lh
        JOIN albaranes a ON a.id = lh.albaran_id
        WHERE a.estado = 'importado' {where}
        GROUP BY lh.tramite
        ORDER BY total DESC
    """
    with database.get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [
            {
                "posicion": i + 1,
                "tramite": r["tramite"],
                "veces": r["veces"],
                "total_honorarios": round(r["total"], 2),
            }
            for i, r in enumerate(rows)
        ]


def list_albaranes(mes: int | None = None, anio: int | None = None, estado: str | None = None) -> list[dict]:
    clauses = []
    params: list[Any] = []
    if anio:
        clauses.append("a.anio = ?")
        params.append(anio)
    if mes:
        clauses.append("a.mes = ?")
        params.append(mes)
    if estado:
        clauses.append("a.estado = ?")
        params.append(estado)
    where = ("WHERE " + " AND ".join(clauses)) if clauses else ""
    query = f"""
        SELECT a.id, a.numero, a.fecha, a.mes, a.anio, a.estado, a.motivo,
               a.total_honorarios, a.archivo_nombre, a.fecha_importacion,
               COALESCE(c.nombre, a.cliente_nombre_raw) AS cliente_nombre,
               COALESCE(c.nif, a.cliente_nif_raw) AS cliente_nif,
               (SELECT GROUP_CONCAT(lh.tramite, ' | ') FROM lineas_honorarios lh
                WHERE lh.albaran_id = a.id) AS tramites
        FROM albaranes a
        LEFT JOIN clientes c ON c.id = a.cliente_id
        {where}
        ORDER BY a.fecha_importacion DESC, a.id DESC
    """
    with database.get_connection() as conn:
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]


def get_albaran(albaran_id: int) -> dict | None:
    with database.get_connection() as conn:
        row = conn.execute(
            """SELECT a.*, COALESCE(c.nombre, a.cliente_nombre_raw) AS cliente_nombre,
                      COALESCE(c.nif, a.cliente_nif_raw) AS cliente_nif
               FROM albaranes a LEFT JOIN clientes c ON c.id = a.cliente_id WHERE a.id = ?""",
            (albaran_id,),
        ).fetchone()
        if not row:
            return None
        lineas = conn.execute(
            "SELECT id, tramite, importe FROM lineas_honorarios WHERE albaran_id = ? ORDER BY orden",
            (albaran_id,),
        ).fetchall()
        result = dict(row)
        result["lineas"] = [dict(l) for l in lineas]
        return result


def delete_albaran(albaran_id: int) -> bool:
    with database.get_connection() as conn:
        cur = conn.execute("DELETE FROM albaranes WHERE id = ?", (albaran_id,))
        return cur.rowcount > 0


def update_albaran(
    albaran_id: int,
    numero: str | None,
    fecha: str | None,
    cliente_nombre: str | None,
    cliente_nif: str | None,
    lineas: list[dict],
) -> dict:
    numero = (numero or "").strip() or None
    cliente_nombre = (cliente_nombre or "").strip() or None
    cliente_nif = (cliente_nif or "").strip() or None

    with database.get_connection() as conn:
        cur = conn.cursor()
        existing = cur.execute("SELECT id FROM albaranes WHERE id = ?", (albaran_id,)).fetchone()
        if not existing:
            raise ValueError("Albarán no encontrado")

        if numero:
            conflicto = cur.execute(
                "SELECT id FROM albaranes WHERE numero = ? AND id != ?", (numero, albaran_id)
            ).fetchone()
            if conflicto:
                raise ValueError(f"El número de albarán '{numero}' ya está usado por otro registro")

        warnings: list[str] = []
        mes = anio = None
        fecha_iso = None
        if fecha:
            try:
                dt = datetime.strptime(fecha, "%Y-%m-%d")
                fecha_iso = dt.strftime("%Y-%m-%d")
                mes, anio = dt.month, dt.year
            except ValueError:
                warnings.append("Fecha con formato inválido (use AAAA-MM-DD)")
        else:
            warnings.append("Falta la fecha de operación")

        if not numero:
            warnings.append("Falta el número de albarán")

        if not cliente_nombre:
            warnings.append("Falta el cliente")

        lineas_validas: list[tuple[str, float]] = []
        for l in lineas:
            tramite = (l.get("tramite") or "").strip()
            importe = l.get("importe")
            if not tramite or importe in (None, ""):
                continue
            try:
                importe = round(float(importe), 2)
            except (TypeError, ValueError):
                continue
            lineas_validas.append((tramite, importe))

        if not lineas_validas:
            warnings.append("No hay líneas de honorarios válidas")

        estado = "importado" if not warnings else "revision"
        motivo = "; ".join(warnings) if warnings else None
        total = round(sum(i for _, i in lineas_validas), 2)

        cliente_id = None
        if cliente_nombre:
            cliente_id = _get_or_create_cliente(conn, cliente_nombre, cliente_nif)

        cur.execute(
            """UPDATE albaranes SET numero=?, fecha=?, mes=?, anio=?, cliente_id=?,
               cliente_nombre_raw=?, cliente_nif_raw=?, total_honorarios=?, estado=?, motivo=?
               WHERE id=?""",
            (numero, fecha_iso, mes, anio, cliente_id, cliente_nombre, cliente_nif,
             total, estado, motivo, albaran_id),
        )
        cur.execute("DELETE FROM lineas_honorarios WHERE albaran_id = ?", (albaran_id,))
        for orden, (tramite, importe) in enumerate(lineas_validas):
            cur.execute(
                "INSERT INTO lineas_honorarios (albaran_id, tramite, importe, orden) VALUES (?, ?, ?, ?)",
                (albaran_id, tramite, importe, orden),
            )

    return get_albaran(albaran_id)
