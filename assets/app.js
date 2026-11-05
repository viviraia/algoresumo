/* Comportamento comum: tema, índice lateral do resumo, scroll-spy, checklist, desenhos. */
(function () {
  'use strict';
  const root = document.documentElement;

  // Tema claro/escuro
  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      root.dataset.theme = next;
      try { localStorage.setItem('theme', next); } catch (e) { /* ignora */ }
    });
  }

  // Desenha grafos, matrizes e simulações declarados no HTML
  if (window.Viz) Viz.autorender(document);

  // Índice lateral (gerado a partir de h2/h3 do resumo)
  const toc = document.getElementById('toc');
  const content = document.getElementById('content');
  if (toc && content) {
    const links = [];
    content.querySelectorAll('h2, h3').forEach((h, i) => {
      const sec = h.closest('section');
      let id;
      if (h.tagName === 'H2' && sec && sec.id) id = sec.id;           // o próprio <section> já tem id
      else { if (!h.id) h.id = 's' + i + '-' + h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24); id = h.id; }
      const a = document.createElement('a');
      a.href = '#' + id;
      a.textContent = h.textContent.replace(/^\d+/, (m) => m + '. ');
      if (h.tagName === 'H3') a.className = 'sub';
      toc.appendChild(a);
      links.push({ a, h });
    });
    const hero = document.getElementById('visao');
    if (hero) { const a = document.createElement('a'); a.href = '#visao'; a.textContent = 'Visão geral'; toc.insertBefore(a, toc.children[1]); links.unshift({ a, h: hero }); }

    const onScroll = () => {
      let cur = links[0];
      for (const l of links) if (l.h.getBoundingClientRect().top < 120) cur = l;
      links.forEach((l) => l.a.classList.toggle('on', l === cur));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    toc.addEventListener('click', (e) => { if (e.target.tagName === 'A') document.body.classList.remove('menu-open'); });
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.addEventListener('click', () => document.body.classList.toggle('menu-open'));
  }

  // Checklist persistente
  const list = document.getElementById('checklist');
  if (list) {
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('checklist') || '[]'); } catch (e) { /* ignora */ }
    const items = [...list.children];
    items.forEach((li, i) => {
      if (saved.includes(i)) li.classList.add('done');
      li.addEventListener('click', (ev) => {
        if (ev.target.tagName === 'A') return;
        li.classList.toggle('done');
        try { localStorage.setItem('checklist', JSON.stringify(items.map((x, j) => (x.classList.contains('done') ? j : -1)).filter((j) => j >= 0))); } catch (e) { /* ignora */ }
      });
    });
  }
})();
