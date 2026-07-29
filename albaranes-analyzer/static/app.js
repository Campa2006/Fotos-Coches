const state = { mes: "", anio: "", estado: "" };

const ESTADO_LABEL = {
  importado: "Importado correctamente",
  duplicado: "Duplicado",
  revision: "Necesita revisión",
  error: "Error de lectura",
};

function fmtMoney(n) {
  const v = Number(n || 0);
  return v.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function qs(params) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v !== "" && v !== null && v !== undefined) p.set(k, v); });
  const s = p.toString();
  return s ? "?" + s : "";
}

async function api(path, options) {
  const res = await fetch(path, options);
  if (!res.ok) {
    let detail = res.statusText;
    try { const j = await res.json(); detail = j.detail || detail; } catch (e) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---------- Carga y filtros ----------

async function cargarPeriodos() {
  const periodos = await api("/api/periodos");
  const anioSelect = document.getElementById("filtro-anio");
  const actual = anioSelect.value;
  const anios = [...new Set(periodos.map((p) => p.anio))].sort((a, b) => b - a);
  anioSelect.innerHTML = '<option value="">Todos</option>' +
    anios.map((a) => `<option value="${a}">${a}</option>`).join("");
  anioSelect.value = actual;
}

async function cargarResumen() {
  const r = await api("/api/resumen" + qs({ mes: state.mes, anio: state.anio }));
  document.getElementById("total-general").textContent = fmtMoney(r.total_honorarios);
  document.getElementById("num-albaranes-periodo").textContent =
    r.num_albaranes === 1 ? "1 albarán" : `${r.num_albaranes} albaranes`;
}

async function cargarClientes() {
  const rows = await api("/api/clientes" + qs({ mes: state.mes, anio: state.anio }));
  const tbody = document.getElementById("tabla-clientes");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#6b7280;">Sin datos para este periodo</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.posicion}</td>
      <td>${escapeHtml(r.nombre)}</td>
      <td>${escapeHtml(r.nif || "-")}</td>
      <td>${r.num_albaranes}</td>
      <td>${fmtMoney(r.total_honorarios)}</td>
    </tr>`).join("");
}

async function cargarTramites() {
  const rows = await api("/api/tramites" + qs({ mes: state.mes, anio: state.anio }));
  const tbody = document.getElementById("tabla-tramites");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#6b7280;">Sin datos para este periodo</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${r.posicion}</td>
      <td>${escapeHtml(r.tramite)}</td>
      <td>${r.veces}</td>
      <td>${fmtMoney(r.total_honorarios)}</td>
    </tr>`).join("");
}

async function cargarAlbaranes() {
  const rows = await api("/api/albaranes" + qs({ mes: state.mes, anio: state.anio, estado: state.estado }));
  const tbody = document.getElementById("tabla-albaranes");
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#6b7280;">Sin albaranes</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((r) => `
    <tr>
      <td>${escapeHtml(r.numero || "-")}</td>
      <td>${r.fecha || "-"}</td>
      <td>${escapeHtml(r.cliente_nombre || "-")}</td>
      <td>${escapeHtml(r.tramites || "-")}</td>
      <td>${fmtMoney(r.total_honorarios)}</td>
      <td><span class="estado-pill ${r.estado}">${ESTADO_LABEL[r.estado] || r.estado}</span></td>
      <td class="acciones">
        <button onclick="consultarAlbaran(${r.id})">Consultar</button>
        <button onclick="corregirAlbaran(${r.id})">Corregir</button>
        <button class="eliminar" onclick="eliminarAlbaran(${r.id})">Eliminar</button>
      </td>
    </tr>`).join("");
}

async function refrescarTodo() {
  await Promise.all([cargarResumen(), cargarClientes(), cargarTramites(), cargarAlbaranes()]);
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Subida de archivos ----------

function initUpload() {
  const dropzone = document.getElementById("dropzone");
  const input = document.getElementById("file-input");
  document.getElementById("btn-elegir").addEventListener("click", () => input.click());
  input.addEventListener("change", () => { if (input.files.length) subirArchivos(input.files); input.value = ""; });

  ["dragenter", "dragover"].forEach((ev) => dropzone.addEventListener(ev, (e) => {
    e.preventDefault(); dropzone.classList.add("dragover");
  }));
  ["dragleave", "drop"].forEach((ev) => dropzone.addEventListener(ev, (e) => {
    e.preventDefault(); dropzone.classList.remove("dragover");
  }));
  dropzone.addEventListener("drop", (e) => {
    const files = [...e.dataTransfer.files].filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (files.length) subirArchivos(files);
  });
}

async function subirArchivos(fileList) {
  const contenedor = document.getElementById("upload-resultados");
  contenedor.innerHTML = '<p>Procesando archivos…</p>';
  const formData = new FormData();
  [...fileList].forEach((f) => formData.append("files", f));

  try {
    const data = await api("/api/upload", { method: "POST", body: formData });
    contenedor.innerHTML = data.resultados.map((r) => `
      <div class="resultado-item ${r.estado}">
        <span class="estado-badge">${ESTADO_LABEL[r.estado] || r.estado}</span>
        — ${escapeHtml(r.archivo)}${r.numero ? " (" + escapeHtml(r.numero) + ")" : ""}
        ${r.mensaje ? "<br>" + escapeHtml(r.mensaje) : ""}
      </div>`).join("");
  } catch (e) {
    contenedor.innerHTML = `<div class="resultado-item error">Error al subir archivos: ${escapeHtml(e.message)}</div>`;
  }
  await cargarPeriodos();
  await refrescarTodo();
}

// ---------- Modal: consultar / corregir ----------

function abrirModal(html) {
  document.getElementById("modal").innerHTML = html;
  document.getElementById("modal-backdrop").classList.remove("hidden");
}
function cerrarModal() {
  document.getElementById("modal-backdrop").classList.add("hidden");
  document.getElementById("modal").innerHTML = "";
}
document.addEventListener("click", (e) => {
  if (e.target.id === "modal-backdrop") cerrarModal();
});

async function consultarAlbaran(id) {
  const a = await api(`/api/albaranes/${id}`);
  const lineasHtml = a.lineas.length
    ? a.lineas.map((l) => `<li>${escapeHtml(l.tramite)} — ${fmtMoney(l.importe)}</li>`).join("")
    : "<li>Sin líneas de honorarios</li>";
  abrirModal(`
    <h2>Albarán ${escapeHtml(a.numero || "(sin número)")}</h2>
    ${a.motivo ? `<div class="warning-box">${escapeHtml(a.motivo)}</div>` : ""}
    <p><strong>Estado:</strong> <span class="estado-pill ${a.estado}">${ESTADO_LABEL[a.estado] || a.estado}</span></p>
    <p><strong>Fecha operación:</strong> ${a.fecha || "-"}</p>
    <p><strong>Cliente:</strong> ${escapeHtml(a.cliente_nombre || "-")} (NIF: ${escapeHtml(a.cliente_nif || "-")})</p>
    <p><strong>Archivo:</strong> ${escapeHtml(a.archivo_nombre || "-")}</p>
    <p><strong>Total honorarios:</strong> ${fmtMoney(a.total_honorarios)}</p>
    <p><strong>Líneas de honorarios:</strong></p>
    <ul>${lineasHtml}</ul>
    <details>
      <summary>Texto extraído del PDF</summary>
      <pre class="texto-extraido">${escapeHtml(a.texto_extraido || "")}</pre>
    </details>
    <div class="modal-actions">
      <button onclick="cerrarModal()">Cerrar</button>
    </div>
  `);
}

async function corregirAlbaran(id) {
  const a = await api(`/api/albaranes/${id}`);
  const lineas = a.lineas.length ? a.lineas : [{ tramite: "", importe: "" }];
  abrirModal(`
    <h2>Corregir albarán</h2>
    ${a.motivo ? `<div class="warning-box">${escapeHtml(a.motivo)}</div>` : ""}
    <label>Número de albarán
      <input type="text" id="f-numero" value="${escapeHtml(a.numero || "")}">
    </label>
    <label>Fecha de operación
      <input type="date" id="f-fecha" value="${a.fecha || ""}">
    </label>
    <label>Cliente
      <input type="text" id="f-cliente" value="${escapeHtml(a.cliente_nombre || "")}">
    </label>
    <label>NIF del cliente
      <input type="text" id="f-nif" value="${escapeHtml(a.cliente_nif || "")}">
    </label>
    <label>Líneas de honorarios</label>
    <div id="lineas-container"></div>
    <button type="button" onclick="agregarLinea()">+ Añadir línea</button>
    <div class="modal-actions">
      <button onclick="cerrarModal()">Cancelar</button>
      <button class="primary" onclick="guardarAlbaran(${id})">Guardar</button>
    </div>
  `);
  window.__lineasEdit = lineas.map((l) => ({ tramite: l.tramite, importe: l.importe }));
  renderLineasEdit();
}

function renderLineasEdit() {
  const cont = document.getElementById("lineas-container");
  cont.innerHTML = window.__lineasEdit.map((l, i) => `
    <div class="linea-row">
      <input type="text" placeholder="Trámite" value="${escapeHtml(l.tramite || "")}" oninput="window.__lineasEdit[${i}].tramite=this.value">
      <input type="number" step="0.01" placeholder="Importe €" value="${l.importe ?? ""}" oninput="window.__lineasEdit[${i}].importe=this.value">
      <button type="button" onclick="quitarLinea(${i})">✕</button>
    </div>`).join("");
}
function agregarLinea() {
  window.__lineasEdit.push({ tramite: "", importe: "" });
  renderLineasEdit();
}
function quitarLinea(i) {
  window.__lineasEdit.splice(i, 1);
  renderLineasEdit();
}

async function guardarAlbaran(id) {
  const payload = {
    numero: document.getElementById("f-numero").value,
    fecha: document.getElementById("f-fecha").value,
    cliente_nombre: document.getElementById("f-cliente").value,
    cliente_nif: document.getElementById("f-nif").value,
    lineas: window.__lineasEdit
      .filter((l) => l.tramite && l.importe !== "")
      .map((l) => ({ tramite: l.tramite, importe: l.importe })),
  };
  try {
    await api(`/api/albaranes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    cerrarModal();
    await cargarPeriodos();
    await refrescarTodo();
  } catch (e) {
    alert("No se pudo guardar: " + e.message);
  }
}

async function eliminarAlbaran(id) {
  if (!confirm("¿Eliminar este albarán? Esta acción no se puede deshacer.")) return;
  await api(`/api/albaranes/${id}`, { method: "DELETE" });
  await cargarPeriodos();
  await refrescarTodo();
}

// ---------- Pestañas y filtros ----------

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById("tab-" + btn.dataset.tab).classList.add("active");
    });
  });
}

function initFiltros() {
  document.getElementById("filtro-mes").addEventListener("change", (e) => { state.mes = e.target.value; refrescarTodo(); });
  document.getElementById("filtro-anio").addEventListener("change", (e) => { state.anio = e.target.value; refrescarTodo(); });
  document.getElementById("filtro-estado").addEventListener("change", (e) => { state.estado = e.target.value; cargarAlbaranes(); });
}

(async function init() {
  initUpload();
  initTabs();
  initFiltros();
  await cargarPeriodos();
  await refrescarTodo();
})();
