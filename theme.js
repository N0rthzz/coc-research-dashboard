(() => {
  const allowed = ['light', 'dark', 'cozy', 'system'];
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = 'light';
  try { preference = localStorage.getItem('coc-theme') || 'light'; } catch {}
  if (!allowed.includes(preference)) preference = 'light';
  function apply() {
    document.documentElement.dataset.theme = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
  }
  apply();
  media.addEventListener('change', apply);
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.getElementById('themeSelect');
    select.value = preference;
    select.addEventListener('change', () => {
      preference = select.value;
      try { localStorage.setItem('coc-theme', preference); } catch {}
      apply();
    });
  });
})();
