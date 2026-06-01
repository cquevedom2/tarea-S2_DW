/**
 * admin.js — Panel de Administración · Lumen
 * Responsabilidades:
 *   1. Cargar usuarios desde GET /api/admin/users
 *   2. Renderizar tabla dinámicamente
 *   3. Filtrado en tiempo real (nombre o correo)
 *   4. Botón de exportación → GET /api/admin/export
 *   5. Sistema de Toast notifications
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Referencias al DOM ───────────────────────────────── */
  const tableLoading   = document.getElementById('tableLoading');
  const tableError     = document.getElementById('tableError');
  const tableErrorMsg  = document.getElementById('tableErrorMsg');
  const tableEmpty     = document.getElementById('tableEmpty');
  const usersTable     = document.getElementById('usersTable');
  const usersTableBody = document.getElementById('usersTableBody');
  const searchInput    = document.getElementById('searchInput');
  const clearSearch    = document.getElementById('clearSearch');
  const btnExport      = document.getElementById('btnExport');
  const btnRetry       = document.getElementById('btnRetry');
  const statTotal      = document.getElementById('statTotal');
  const statFiltered   = document.getElementById('statFiltered');
  const toastContainer = document.getElementById('toastContainer');

  /* ── Estado ───────────────────────────────────────────── */
  let allUsers = [];      // todos los usuarios cargados
  let query    = '';      // término de búsqueda activo

  /* ══════════════════════════════════════════════════════════
     SISTEMA DE TOASTS
  ══════════════════════════════════════════════════════════ */

  /**
   * Muestra una notificación Toast.
   * @param {'success'|'error'|'info'} type
   * @param {string} title
   * @param {string} [message]
   * @param {number} [duration=4000]  ms hasta auto-close (0 = manual)
   */
  function showToast(type, title, message = '', duration = 4000) {
    const icons = { success: '✓', error: '✕', info: 'i' };

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="toast__icon" aria-hidden="true">${icons[type] ?? 'i'}</div>
      <div class="toast__body">
        <p class="toast__title">${escapeHtml(title)}</p>
        ${message ? `<p class="toast__message">${escapeHtml(message)}</p>` : ''}
      </div>
      <button class="toast__close" aria-label="Cerrar notificación">×</button>
    `;

    const closeBtn = toast.querySelector('.toast__close');
    closeBtn.addEventListener('click', () => removeToast(toast));

    toastContainer.appendChild(toast);

    if (duration > 0) {
      setTimeout(() => removeToast(toast), duration);
    }
  }

  function removeToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast--exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  /* ══════════════════════════════════════════════════════════
     ESTADOS DE LA TABLA
  ══════════════════════════════════════════════════════════ */

  function showState(state) {
    tableLoading.hidden = state !== 'loading';
    tableError.hidden   = state !== 'error';
    tableEmpty.hidden   = state !== 'empty';
    usersTable.hidden   = state !== 'table';
  }

  /* ══════════════════════════════════════════════════════════
     CARGA DE USUARIOS
  ══════════════════════════════════════════════════════════ */

  async function loadUsers() {
    showState('loading');

    try {
      const response = await fetch('/api/admin/users');

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Acepta tanto [ ] directamente como { users: [ ] }
      allUsers = Array.isArray(data) ? data : (data.users ?? []);

      statTotal.textContent = allUsers.length;

      if (allUsers.length === 0) {
        showState('empty');
        statFiltered.textContent = '0';
        return;
      }

      renderTable(allUsers);
      showToast('success', 'Datos cargados', `${allUsers.length} usuario(s) encontrado(s).`);

    } catch (err) {
      console.error('[Lumen Admin] Error al cargar usuarios:', err);
      tableErrorMsg.textContent = err.message ?? 'No se pudo contactar al servidor.';
      showState('error');
      showToast('error', 'Error de carga', err.message, 0);
    }
  }

  /* ══════════════════════════════════════════════════════════
     RENDERIZADO DE TABLA
  ══════════════════════════════════════════════════════════ */

  /**
   * Genera HTML de una celda resaltando el término buscado.
   * @param {string} text    texto de la celda
   * @param {string} term    término a resaltar
   * @returns {string}       HTML con <mark> si aplica
   */
  function highlight(text, term) {
    if (!term || !text) return escapeHtml(String(text ?? ''));
    const escaped  = escapeHtml(String(text));
    const escapedT = escapeHtml(term).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escaped.replace(
      new RegExp(`(${escapedT})`, 'gi'),
      '<mark>$1</mark>'
    );
  }

  /**
   * Formatea una fecha ISO a formato local legible.
   */
  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('es-EC', {
        year: 'numeric', month: 'short', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  }

  function renderTable(users) {
    const term = query.trim().toLowerCase();

    // Filtrar
    const filtered = term
      ? users.filter(u =>
          (u.fullname ?? '').toLowerCase().includes(term) ||
          (u.email    ?? '').toLowerCase().includes(term)
        )
      : users;

    statFiltered.textContent = filtered.length;

    if (filtered.length === 0) {
      showState('empty');
      return;
    }

    // Generar filas
    usersTableBody.innerHTML = filtered.map((user, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${highlight(user.fullname, term)}</td>
        <td class="cell-email">${highlight(user.email, term)}</td>
        <td>${escapeHtml(user.phone ?? '—')}</td>
        <td><span class="badge">${escapeHtml(user.source ?? 'directo')}</span></td>
        <td class="cell-date">${formatDate(user.created_at ?? user.date)}</td>
      </tr>
    `).join('');

    showState('table');
  }

  /* ══════════════════════════════════════════════════════════
     BÚSQUEDA EN TIEMPO REAL
  ══════════════════════════════════════════════════════════ */

  searchInput.addEventListener('input', () => {
    query = searchInput.value;
    clearSearch.hidden = query.length === 0;
    renderTable(allUsers);
  });

  clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    query = '';
    clearSearch.hidden = true;
    searchInput.focus();
    renderTable(allUsers);
  });

  /* ══════════════════════════════════════════════════════════
     EXPORTAR CSV
  ══════════════════════════════════════════════════════════ */

  btnExport.addEventListener('click', () => {
    showToast('info', 'Exportando…', 'Iniciando descarga del archivo CSV.');
    window.location.href = '/api/admin/export';
  });

  /* ══════════════════════════════════════════════════════════
     REINTENTAR
  ══════════════════════════════════════════════════════════ */

  btnRetry.addEventListener('click', loadUsers);

  /* ══════════════════════════════════════════════════════════
     UTILIDADES
  ══════════════════════════════════════════════════════════ */

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ── Arranque ──────────────────────────────────────────── */
  loadUsers();

});
