/* Navigation enrichie : aucun appel réseau. Accessible clavier, souris et tactile. */
(() => {
  const header = document.querySelector('[data-header]');
  const panels = [...document.querySelectorAll('[data-mega-panel]')];
  const triggers = [...document.querySelectorAll('[data-mega-trigger]')];
  const clusters = [...document.querySelectorAll('[data-mega-item]')];
  let active = null;
  let exitTimer;
  const isDesktop = () => matchMedia('(min-width: 1081px)').matches;
  function closeMega() {
    clearTimeout(exitTimer);
    active = null;
    header?.classList.remove('has-mega');
    panels.forEach((p) => { p.hidden = true; });
    triggers.forEach((t) => t.setAttribute('aria-expanded', 'false'));
  }
  function openMega(name) {
    if (!isDesktop()) return closeMega();
    clearTimeout(exitTimer);
    if (!panels.some((p) => p.dataset.megaPanel === name)) return;
    active = name;
    header?.classList.remove('is-hidden');
    header?.classList.add('has-mega');
    panels.forEach((p) => { p.hidden = p.dataset.megaPanel !== name; });
    triggers.forEach((t) => t.setAttribute('aria-expanded', String(t.dataset.megaTrigger === name)));
  }
  clusters.forEach((cluster) => {
    const name = cluster.dataset.megaItem;
    cluster.addEventListener('pointerenter', (event) => { if (event.pointerType !== 'touch') openMega(name); });
    cluster.addEventListener('focusin', () => openMega(name));
  });
  triggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openMega(trigger.dataset.megaTrigger);
    });
    trigger.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        openMega(trigger.dataset.megaTrigger);
        panels.find((p) => p.dataset.megaPanel === active)?.querySelector('a')?.focus();
      }
    });
  });
  header?.addEventListener('pointerleave', () => { exitTimer = setTimeout(closeMega, 180); });
  header?.addEventListener('pointerenter', () => clearTimeout(exitTimer));
  header?.addEventListener('focusout', (event) => { if (!header.contains(event.relatedTarget)) closeMega(); });
  document.addEventListener('pointerdown', (event) => { if (active && !header?.contains(event.target)) closeMega(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && active) { const focused = triggers.find((t) => t.dataset.megaTrigger === active); closeMega(); focused?.focus({preventScroll:true}); closeMega(); }
  });
  window.addEventListener('resize', () => { if (!isDesktop()) closeMega(); }, { passive: true });

  const dialog = document.querySelector('[data-quick-search]');
  const field = dialog?.querySelector('[data-quick-input]');
  const results = [...(dialog?.querySelectorAll('[data-quick-result]') || [])];
  const empty = dialog?.querySelector('[data-quick-empty]');
  let previousFocus = null;
  if (dialog && field) {
    const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    function update() {
      const text = fold(field.value.trim());
      let count = 0;
      results.forEach((li) => {
        const visible = fold(li.dataset.searchText || '').includes(text);
        li.hidden = !visible;
        if (visible) count++;
      });
      empty.hidden = count !== 0;
    }
    field.addEventListener('input', update);
    function open() {
      closeMega();
      previousFocus = document.activeElement;
      if (!dialog.open) dialog.showModal();
      field.value = '';
      update();
      field.focus();
    }
    document.querySelectorAll('[data-quick-open]').forEach((button) => button.addEventListener('click', open));
    dialog.querySelector('[data-quick-close]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => previousFocus?.focus?.());
    document.addEventListener('keydown', (event) => {
      const target = event.target;
      const typing = target?.matches?.('input, textarea, select, [contenteditable="true"]');
      if ((event.key === '/' && !typing && !dialog.open) || ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k')) {
        event.preventDefault();
        open();
      }
      if (event.key === 'ArrowDown' && document.activeElement === field) {
        const first = results.find((item) => !item.hidden)?.querySelector('a');
        if (first) { event.preventDefault(); first.focus(); }
      }
    });
  }
  const filterBar = document.querySelector('[data-software-filters]');
  if (filterBar) {
    const cards = [...document.querySelectorAll('.software-cards [data-status]')];
    filterBar.querySelectorAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterBar.querySelectorAll('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
      cards.forEach((card) => { card.hidden = filter !== 'tous' && card.dataset.status !== filter; });
    }));
  }
})();
