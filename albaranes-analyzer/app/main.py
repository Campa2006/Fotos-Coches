"""API FastAPI del Analizador de Albaranes Campalans."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from . import database, service

BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

app = FastAPI(title="Analizador de Albaranes Campalans")


@app.on_event("startup")
def _startup() -> None:
    database.init_db()


class LineaIn(BaseModel):
    tramite: str
    importe: float | str | None = None


class AlbaranUpdateIn(BaseModel):
    numero: Optional[str] = None
    fecha: Optional[str] = None
    cliente_nombre: Optional[str] = None
    cliente_nif: Optional[str] = None
    lineas: list[LineaIn] = []


@app.post("/api/upload")
async def upload(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No se ha enviado ningún archivo")
    resultados = []
    for f in files:
        content = await f.read()
        if not content:
            resultados.append({
                "archivo": f.filename, "estado": "error",
                "mensaje": "El archivo está vacío", "albaran_id": None,
            })
            continue
        resultados.append(service.import_pdf(f.filename or "sin_nombre.pdf", content))
    return {"resultados": resultados}


@app.get("/api/periodos")
def periodos():
    return service.get_periodos()


@app.get("/api/resumen")
def resumen(mes: Optional[int] = None, anio: Optional[int] = None):
    return service.get_resumen(mes, anio)


@app.get("/api/clientes")
def ranking_clientes(mes: Optional[int] = None, anio: Optional[int] = None):
    return service.get_ranking_clientes(mes, anio)


@app.get("/api/tramites")
def ranking_tramites(mes: Optional[int] = None, anio: Optional[int] = None):
    return service.get_ranking_tramites(mes, anio)


@app.get("/api/albaranes")
def albaranes(mes: Optional[int] = None, anio: Optional[int] = None, estado: Optional[str] = None):
    return service.list_albaranes(mes, anio, estado)


@app.get("/api/albaranes/{albaran_id}")
def albaran_detalle(albaran_id: int):
    data = service.get_albaran(albaran_id)
    if not data:
        raise HTTPException(status_code=404, detail="Albarán no encontrado")
    return data


@app.put("/api/albaranes/{albaran_id}")
def albaran_actualizar(albaran_id: int, payload: AlbaranUpdateIn):
    try:
        return service.update_albaran(
            albaran_id,
            payload.numero,
            payload.fecha,
            payload.cliente_nombre,
            payload.cliente_nif,
            [l.model_dump() for l in payload.lineas],
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.delete("/api/albaranes/{albaran_id}")
def albaran_eliminar(albaran_id: int):
    if not service.delete_albaran(albaran_id):
        raise HTTPException(status_code=404, detail="Albarán no encontrado")
    return {"ok": True}


app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
def index():
    return FileResponse(STATIC_DIR / "index.html")
