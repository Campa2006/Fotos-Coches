"""Punto de entrada para arrancar el servidor local del Analizador de Albaranes."""
import webbrowser
from threading import Timer

import uvicorn

HOST = "127.0.0.1"
PORT = 8000


def _open_browser() -> None:
    webbrowser.open(f"http://{HOST}:{PORT}")


if __name__ == "__main__":
    Timer(1.5, _open_browser).start()
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=False)
