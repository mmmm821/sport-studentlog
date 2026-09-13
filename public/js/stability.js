'use strict';

// Runtime reliability layer for SportLog. It prevents duplicate/slow Stats requests
// from leaving the dashboard stuck on a loading spinner.
(function () {
  const get = id => document.getElementById(id);
  let statsRequest = 0;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const errorBox = message => `<div class="empty-state">${esc(message)}</div>`;
  const spinner = () => '<div class="spinner-wrap"><div class="spinner"></div></div>';

  function setLoading() {
    ['chartBySport','chartByLevel','winnersTable'].forEach(id => {
      const el = get(id);
      if (el) el.innerHTML = spinner();
    });
  }

  function renderBars(el, rows, labelKey) {
    if (!el) return;
    const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (!safeRows.length) {
      el.innerHTML = errorBox('No achievement data yet.');
      return;
    }
    const max = Math.max(1, ...safeRows.map(row => Number(row.count) || 0));
    el.innerHTML = safeRows.map(row => {
      const count = Number(row.count) || 0;
      const label = row[labelKey] || 'Unknown';
      const width = Math.max(0, Math.min(100, Math.round(count / max * 100)));
      return `<div class="bar-row"><span>${esc(label)}</span><div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div><b>${count}</b></div>`;
    }).join('');
  }

  function renderWinners(el, rows) {
    if (!el) return;
    const safeRows = Array.isArray(rows) ? rows.filter(Boolean) : [];
    if (!safeRows.length) {
      el.innerHTML = errorBox('No medal winners yet.');
      return;
    }
    el.innerHTML = safeRows.map(row =>
      `<div class="winner-row"><div><b>${esc(row.student_name || 'Unknown')}</b><small>${esc(row.sport || '')}</small></div><strong>${esc(row.position || '')}</strong></div>`
    ).join('');
  }

  async function reliableLoadStats() {
    const requestId = ++statsRequest;
    setLoading();
    try {
      const response = await Promise.race([
        window.api('/stats'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Statistics request timed out.')), 10000))
      ]);
      if (requestId !== statsRequest) return;
      const data = response && response.data && typeof response.data === 'object' ? response.data : {};
      const total = Number(data.totalAchievements);
      const students = Number(data.totalStudents);
      const totalEl = get('pStatTotal');
      const studentsEl = get('pStatStudents');
      if (totalEl) totalEl.textContent = Number.isFinite(total) ? String(total) : '0';
      if (studentsEl) studentsEl.textContent = Number.isFinite(students) ? String(students) : '0';
      renderBars(get('chartBySport'), data.bySport, 'sport');
      renderBars(get('chartByLevel'), data.byLevel, 'level');
      renderWinners(get('winnersTable'), data.recentWinners);
    } catch (err) {
      if (requestId !== statsRequest) return;
      const message = err && err.message ? err.message : 'Unable to load statistics.';
      ['chartBySport','chartByLevel','winnersTable'].forEach(id => {
        const el = get(id);
        if (el) el.innerHTML = errorBox(`Unable to load statistics: ${message}`);
      });
      const totalEl = get('pStatTotal');
      const studentsEl = get('pStatStudents');
      if (totalEl) totalEl.textContent = '—';
      if (studentsEl) studentsEl.textContent = '—';
      if (typeof window.showToast === 'function') window.showToast(message, true);
    }
  }

  function install() {
    if (typeof window.api !== 'function') return;
    window.loadStats = reliableLoadStats;
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && get('psec-leaderboard')?.classList.contains('active')) reliableLoadStats();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
})();
