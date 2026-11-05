/* Visualização: grafos e heaps em SVG, matrizes e tabelas de simulação. */
(function (root) {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const R = 17;
  let uid = 0;

  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  const fmt = (x) => (x === Infinity ? '∞' : x === -1 ? '–' : String(x));

  /* ---------- Grafo ---------- */
  // opts: nodeClass {A:'start'}, nodeSub {A:'0'}, edgeClass {'A>B':'hl'} ; chave 'A-B' para não direcionado
  function drawGraph(container, spec, opts) {
    opts = opts || {};
    const id = 'm' + ++uid;
    const svg = el('svg', { viewBox: `0 0 ${spec.w || 400} ${spec.h || 220}`, class: 'graph-svg', role: 'img' });
    const defs = el('defs', {}, svg);
    ['', '-hl'].forEach((sfx) => {
      const m = el('marker', { id: id + sfx, viewBox: '0 0 10 10', refX: '9', refY: '5', markerWidth: '9', markerHeight: '9', markerUnits: 'userSpaceOnUse', orient: 'auto' }, defs);
      el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrow' + sfx }, m);
    });
    const pos = spec.nodes;
    const has = new Set(spec.edges.map((e) => e[0] + '>' + e[1]));
    for (const e of spec.edges) {
      const [u, v] = e; const w = e[2];
      const p0 = pos[u], p1 = pos[v];
      const curved = spec.directed && has.has(v + '>' + u);
      const dx = p1[0] - p0[0], dy = p1[1] - p0[1];
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len, ny = dx / len;
      let cls = 'edge';
      const ec = (opts.edgeClass || {});
      const extra = ec[u + '>' + v] || (!spec.directed && ec[v + '>' + u]) || ec[u + '-' + v] || ec[v + '-' + u];
      if (extra) cls += ' ' + extra;
      const hl = /hl/.test(cls);
      let d, lx, ly;
      if (curved) {
        const off = 28;
        const cx = (p0[0] + p1[0]) / 2 + nx * off, cy = (p0[1] + p1[1]) / 2 + ny * off;
        const trim = (a, b) => { const ddx = b[0] - a[0], ddy = b[1] - a[1], l = Math.hypot(ddx, ddy) || 1; return [a[0] + ddx / l * R, a[1] + ddy / l * R]; };
        const s = trim(p0, [cx, cy]);
        const t = [p1[0] - (p1[0] - cx) / (Math.hypot(p1[0] - cx, p1[1] - cy) || 1) * (R + 2), p1[1] - (p1[1] - cy) / (Math.hypot(p1[0] - cx, p1[1] - cy) || 1) * (R + 2)];
        d = `M${s[0]},${s[1]} Q${cx},${cy} ${t[0]},${t[1]}`;
        lx = 0.25 * p0[0] + 0.5 * cx + 0.25 * p1[0] + nx * 9; ly = 0.25 * p0[1] + 0.5 * cy + 0.25 * p1[1] + ny * 9;
      } else {
        const ux = dx / len, uy = dy / len;
        const s = [p0[0] + ux * R, p0[1] + uy * R];
        const t = [p1[0] - ux * (R + (spec.directed ? 2 : 0)), p1[1] - uy * (R + (spec.directed ? 2 : 0))];
        d = `M${s[0]},${s[1]} L${t[0]},${t[1]}`;
        lx = (p0[0] + p1[0]) / 2 + nx * 10; ly = (p0[1] + p1[1]) / 2 + ny * 10;
      }
      const path = el('path', { d, class: cls, fill: 'none' }, svg);
      if (spec.directed) path.setAttribute('marker-end', `url(#${id}${hl ? '-hl' : ''})`);
      if (typeof w === 'number') {
        const t = el('text', { x: lx, y: ly + 4, class: 'wlabel', 'text-anchor': 'middle' }, svg);
        t.textContent = w;
      }
    }
    for (const name in pos) {
      const [x, y] = pos[name];
      const g = el('g', { class: 'node ' + ((opts.nodeClass || {})[name] || '') }, svg);
      el('circle', { cx: x, cy: y, r: R }, g);
      const t = el('text', { x, y: y + 5, 'text-anchor': 'middle' }, g);
      t.textContent = name;
      if (opts.nodeSub && opts.nodeSub[name] !== undefined) {
        const s = el('text', { x, y: y + R + 13, 'text-anchor': 'middle', class: 'sub' }, g);
        s.textContent = opts.nodeSub[name];
      }
    }
    container.innerHTML = '';
    container.appendChild(svg);
    return svg;
  }

  /* ---------- Heap (árvore + array) ---------- */
  function arrayTable(arr, mark) {
    mark = mark || [];
    let t = '<div class="scroll"><table class="arr"><tr class="idx"><th>índice</th>' + arr.map((_, i) => `<td>${i}</td>`).join('') + '</tr><tr><th>valor</th>' +
      arr.map((v, i) => `<td class="${mark.includes(i) ? 'mk' : ''}">${Algos.show(v)}</td>`).join('') + '</tr></table></div>';
    return t;
  }

  function drawHeap(container, arr, opts) {
    opts = opts || {};
    const mark = opts.mark || [];
    const n = arr.length;
    const depth = n ? Math.floor(Math.log2(n)) + 1 : 1;
    const leaves = Math.pow(2, depth - 1);
    const W = Math.max(280, leaves * 46), H = depth * 52 + 20;
    const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'graph-svg heap-svg', role: 'img' });
    const P = (i) => {
      const l = Math.floor(Math.log2(i + 1)), p = i + 1 - Math.pow(2, l);
      return [((p + 0.5) / Math.pow(2, l)) * W, 28 + l * 52];
    };
    for (let i = 1; i < n; i++) {
      const a = P((i - 1) >> 1), b = P(i);
      el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'edge' }, svg);
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = P(i);
      const g = el('g', { class: 'node ' + (mark.includes(i) ? 'hl' : '') }, svg);
      el('circle', { cx: x, cy: y, r: 16 }, g);
      const t = el('text', { x, y: y + 4, 'text-anchor': 'middle', class: Array.isArray(arr[i]) ? 'small' : '' }, g);
      t.textContent = Algos.show(arr[i]);
    }
    container.innerHTML = '';
    container.appendChild(svg);
    if (opts.table !== false) container.insertAdjacentHTML('beforeend', arrayTable(arr, mark));
  }

  /* ---------- Tabelas ---------- */
  function matrixHTML(spec, weighted) {
    const g = Algos.build(spec);
    const M = weighted ? g.P : g.A;
    let t = '<table class="matrix"><tr><th></th>' + g.names.map((n) => `<th>${n}</th>`).join('') + '</tr>';
    for (let i = 0; i < g.n; i++) {
      t += `<tr><th>${g.names[i]}</th>` + M[i].map((x) => `<td class="${x === Infinity || x === 0 ? 'z' : ''}">${fmt(x)}</td>`).join('') + '</tr>';
    }
    return t + '</table>';
  }

  function degreesHTML(spec) {
    const g = Algos.build(spec), d = Algos.degrees(g);
    let t = '<table class="matrix"><tr><th>vértice</th>' + g.names.map((n) => `<th>${n}</th>`).join('') + '</tr>';
    t += '<tr><th>grau de entrada</th>' + d.map((x) => `<td>${x.in}</td>`).join('') + '</tr>';
    t += '<tr><th>grau de saída</th>' + d.map((x) => `<td>${x.out}</td>`).join('') + '</tr></table>';
    return t;
  }

  function dijkstraTable(spec, s, t) {
    const g = Algos.build(spec);
    const src = g.idx[s], dst = t ? g.idx[t] : -1;
    const r = Algos.dijkstra(g, src, dst);
    const N = g.names;
    let html = '<div class="scroll"><table class="trace"><thead><tr><th>passo</th><th>k (menor dist em h)</th><th>h depois</th>' +
      N.map((n) => `<th>dist[${n}]</th>`).join('') + N.map((n) => `<th>pred[${n}]</th>`).join('') + '</tr></thead><tbody>';
    html += `<tr class="init"><td>início</td><td>–</td><td>{${s}}</td>` +
      N.map((_, i) => `<td>${i === src ? 0 : '∞'}</td>`).join('') + N.map((_, i) => `<td>${i === src ? s : '–'}</td>`).join('') + '</tr>';
    r.steps.forEach((st, i) => {
      html += `<tr><td>${i + 1}</td><td><b>${N[st.k]}</b> (${fmt(st.dist[st.k])})</td><td>{${st.h.map((x) => N[x]).join(', ')}}</td>` +
        N.map((_, j) => `<td class="${st.changed.includes(j) ? 'chg' : ''} ${st.done[j] ? 'dn' : ''}">${fmt(st.dist[j])}</td>`).join('') +
        N.map((_, j) => `<td class="${st.changed.includes(j) ? 'chg' : ''}">${st.pred[j] === -1 ? '–' : N[st.pred[j]]}</td>`).join('') + '</tr>';
    });
    html += '</tbody></table></div><p class="legend"><span class="chg">amarelo</span> = atualizado neste passo · <span class="dn">negrito</span> = vértice já processado (distância definitiva).</p>';
    return { html, result: r, g };
  }

  function bfsTable(spec, s, t) {
    const g = Algos.build(spec);
    const r = Algos.bfs(g, g.idx[s], t ? g.idx[t] : -1);
    const N = g.names;
    let html = '<div class="scroll"><table class="trace"><thead><tr><th>passo</th><th>desenfileira</th><th>enfileira (novos)</th><th>fila depois</th></tr></thead><tbody>';
    r.steps.forEach((st, i) => {
      html += `<tr><td>${i}</td><td>${st.pop === null ? '–' : N[st.pop]}</td><td>${st.added.map((x) => N[x]).join(', ') || '–'}</td><td>[${st.queue.map((x) => N[x]).join(', ')}]</td></tr>`;
    });
    html += '</tbody></table></div>';
    return { html, result: r, g };
  }

  function dijkstraHeapTable(spec, s) {
    const g = Algos.build(spec);
    const r = Algos.dijkstraHeap(g, g.idx[s]);
    const N = g.names;
    const P = (p) => `(${p[0]}, ${N[p[1]]})`;
    let html = '<div class="scroll"><table class="trace"><thead><tr><th>passo</th><th>MENOR → (dist, k)</th><th>já visitado?</th><th>INSERE (novos pares)</th><th>heap depois</th></tr></thead><tbody>';
    html += `<tr class="init"><td>início</td><td>–</td><td>–</td><td>(0, ${s})</td><td>[(0, ${s})]</td></tr>`;
    r.steps.forEach((st, i) => {
      html += `<tr class="${st.skipped ? 'skip' : ''}"><td>${i + 1}</td><td>${P(st.pair)}</td><td>${st.skipped ? 'sim → descarta' : 'não'}</td><td>${st.pushed.map(P).join(', ') || '–'}</td><td>[${st.heap.map(P).join(', ')}]</td></tr>`;
    });
    html += `</tbody></table></div><p class="legend">${r.pushes} inserções · ${r.pops} remoções (sempre remoções = inserções, e inserções ≤ nº de relaxamentos ≤ |E| + 1).</p>`;
    return { html, result: r, g };
  }

  function heapTraceHTML(arr, op, arg) {
    let r, title;
    if (op === 'insert') { r = Algos.heapInsert(arr, arg); title = `INSERE(${Algos.show(arg)})`; }
    else { r = Algos.heapPop(arr); title = 'MENOR (remove o menor)'; }
    let html = `<ol class="steps">`;
    r.states.forEach((s) => { html += `<li>${s.note}${arrayTable(s.arr, s.mark)}</li>`; });
    html += '</ol>';
    return { html, result: r, title };
  }

  /* ---------- Auto-render do resumo ---------- */
  function autorender(rootEl) {
    rootEl = rootEl || document;
    rootEl.querySelectorAll('[data-g]').forEach((c) => {
      if (c.dataset.trace) return;
      const spec = Graphs[c.dataset.g];
      const o = {};
      if (c.dataset.start) o.nodeClass = { [c.dataset.start]: 'start' };
      if (c.dataset.opts) Object.assign(o, JSON.parse(c.dataset.opts));
      if (spec) drawGraph(c, spec, o);
    });
    rootEl.querySelectorAll('[data-trace]').forEach((c) => {
      const kind = c.dataset.trace, name = c.dataset.g;
      const spec = name ? Graphs[name] : null;
      if (kind === 'matrix') c.innerHTML = matrixHTML(spec, c.dataset.weighted === '1');
      else if (kind === 'degrees') c.innerHTML = degreesHTML(spec);
      else if (kind === 'dijkstra') c.innerHTML = dijkstraTable(spec, c.dataset.s, c.dataset.t).html;
      else if (kind === 'dijkstraheap') c.innerHTML = dijkstraHeapTable(spec, c.dataset.s).html;
      else if (kind === 'bfs') c.innerHTML = bfsTable(spec, c.dataset.s, c.dataset.t).html;
      else if (kind === 'heap') {
        const arr = c.dataset.arr.split(',').map(Number);
        const wrap = h('div', 'heapwrap');
        const a = h('div', 'heapcol'); const b = h('div', 'heapcol');
        const out = h('div', 'heapsteps');
        c.innerHTML = '';
        const op = c.dataset.op || 'view';
        if (op === 'view') { drawHeap(a, arr); wrap.appendChild(a); c.appendChild(wrap); return; }
        const arg = op === 'insert' ? Number(c.dataset.val) : null;
        const tr = heapTraceHTML(arr, op, arg);
        a.innerHTML = '<h5>Antes</h5>'; const a1 = h('div'); a.appendChild(a1); drawHeap(a1, arr);
        b.innerHTML = `<h5>Depois de ${tr.title}</h5>`; const b1 = h('div'); b.appendChild(b1); drawHeap(b1, tr.result.arr);
        wrap.appendChild(a); wrap.appendChild(b);
        c.appendChild(wrap);
        const det = h('details', 'steps-details', `<summary>Ver passo a passo</summary>${tr.html}`);
        c.appendChild(det);
      }
    });
  }

  root.Viz = { drawGraph, drawHeap, arrayTable, matrixHTML, degreesHTML, dijkstraTable, dijkstraHeapTable, bfsTable, heapTraceHTML, autorender, fmt };
})(window);
