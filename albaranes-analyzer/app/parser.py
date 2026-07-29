"""Extracción de texto de los albaranes PDF de A9 Factura y aplicación de las
reglas de negocio de Gestoría Campalans para identificar cliente, fecha,
número de albarán y líneas de honorarios.

Formato observado en los PDF reales (A9 Factura):
  - "Número" / "Fecha operación" son etiquetas seguidas del valor en la
    línea siguiente.
  - El emisor (CAMPALANS ASSESSORAMENT I GESTIÓ SL) se identifica con
    "CIF:" en su bloque de datos. El cliente se identifica con "NIF:" en
    el bloque contrario. Por eso buscamos "NIF:" (nunca "CIF:") para
    localizar al cliente sin necesidad de listar nombres de clientes.
  - El nombre que aparece junto a "Vehículo:" pertenece al vehículo (o a
    su propietario/leasing) y nunca debe tratarse como cliente.
  - La tabla de conceptos aparece entre la cabecera "Concepto" y la línea
    "Base Imponible:", en filas de 4 valores: concepto, Importe (€),
    Tipo Impositivo (%) y Total (€). Solo se contabilizan las filas cuyo
    concepto empieza por "Honorarios." y solo se usa el Importe (€).
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import datetime

import fitz  # PyMuPDF

CAMPALANS_MARKER = "CAMPALANS"
HONORARIOS_PREFIX = "Honorarios."
TABLE_HEADERS = {"Concepto", "Importe (€)", "Tipo Impositivo (%)", "Total (€)"}
NIF_RE = re.compile(r"^NIF:\s*(.+)$")


@dataclass
class LineaHonorario:
    tramite: str
    importe: float


@dataclass
class AlbaranData:
    numero: str | None = None
    fecha: str | None = None  # ISO yyyy-mm-dd
    mes: int | None = None
    anio: int | None = None
    cliente_nombre: str | None = None
    cliente_nif: str | None = None
    lineas: list[LineaHonorario] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    texto: str = ""

    @property
    def total_honorarios(self) -> float:
        return round(sum(l.importe for l in self.lineas), 2)

    @property
    def es_valido(self) -> bool:
        return not self.warnings and bool(self.lineas)


def extract_text(pdf_bytes: bytes) -> str:
    """Extrae el texto de todas las páginas del PDF, en orden de lectura."""
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        return "\n".join(page.get_text("text") for page in doc)


def _parse_importe(raw: str) -> float | None:
    if raw is None:
        return None
    s = raw.strip().replace("€", "").strip()
    if not s:
        return None
    s = s.replace(".", "").replace(",", ".")
    try:
        return round(float(s), 2)
    except ValueError:
        return None


def _find_value_after_label(lines: list[str], label: str) -> str | None:
    for i, line in enumerate(lines):
        if line.strip() == label:
            for j in range(i + 1, len(lines)):
                if lines[j].strip():
                    return lines[j].strip()
    return None


def _find_client(lines: list[str]) -> tuple[str | None, str | None]:
    """Localiza el bloque de cliente mediante la etiqueta 'NIF:', que solo
    aparece en el bloque contrario al del emisor (Campalans usa 'CIF:')."""
    for i, line in enumerate(lines):
        m = NIF_RE.match(line.strip())
        if not m:
            continue
        nif = m.group(1).strip()
        for j in range(i - 1, -1, -1):
            candidate = lines[j].strip()
            if not candidate:
                continue
            if CAMPALANS_MARKER in candidate.upper():
                return None, None
            return candidate, nif
    return None, None


def parse_albaran(text: str) -> AlbaranData:
    data = AlbaranData(texto=text)
    lines = [l.rstrip() for l in text.split("\n")]

    numero = _find_value_after_label(lines, "Número")
    if numero:
        data.numero = numero
    else:
        data.warnings.append("No se ha detectado el número de albarán")

    fecha_str = _find_value_after_label(lines, "Fecha operación")
    if fecha_str:
        try:
            dt = datetime.strptime(fecha_str, "%d/%m/%Y")
            data.fecha = dt.strftime("%Y-%m-%d")
            data.mes = dt.month
            data.anio = dt.year
        except ValueError:
            data.warnings.append(f"Fecha de operación no reconocida: '{fecha_str}'")
    else:
        data.warnings.append("No se ha detectado la fecha de operación")

    cliente_nombre, cliente_nif = _find_client(lines)
    if cliente_nombre:
        data.cliente_nombre = cliente_nombre
        data.cliente_nif = cliente_nif
    else:
        data.warnings.append("No se ha podido identificar de forma segura al cliente")

    try:
        start = next(i for i, l in enumerate(lines) if l.strip() == "Concepto")
    except StopIteration:
        data.warnings.append("No se ha encontrado la tabla de conceptos")
        return data

    try:
        end = next(i for i, l in enumerate(lines) if l.strip().startswith("Base Imponible"))
    except StopIteration:
        end = len(lines)

    body = [l.strip() for l in lines[start + 1:end] if l.strip() and l.strip() not in TABLE_HEADERS]

    if len(body) % 4 != 0:
        data.warnings.append("La tabla de conceptos tiene un formato inesperado")
    else:
        for i in range(0, len(body), 4):
            concepto, importe_raw, _tipo, _total = body[i:i + 4]
            if not concepto.startswith(HONORARIOS_PREFIX):
                continue
            tramite = concepto[len(HONORARIOS_PREFIX):].strip(" .")
            importe = _parse_importe(importe_raw)
            if importe is None:
                data.warnings.append(f"No se pudo interpretar el importe de la línea: '{concepto}'")
                continue
            if not tramite:
                data.warnings.append("Una línea de honorarios no tiene nombre de trámite")
                continue
            data.lineas.append(LineaHonorario(tramite=tramite, importe=importe))

    if not data.lineas and "La tabla de conceptos tiene un formato inesperado" not in data.warnings:
        data.warnings.append("No se ha encontrado ninguna línea de honorarios")

    return data
