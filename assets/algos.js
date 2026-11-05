/* Algoritmos de grafos usados no resumo e na prova.
 * Funcionam no navegador (window.Algos) e no Node (module.exports),
 * assim os gabaritos do site são CALCULADOS, não digitados à mão.
 *
 * Um "spec" de grafo é: { nodes: {A:[x,y], ...}, edges: [[u,v,peso?], ...], directed: bool }
 * Vértices são numerados pela ordem das chaves de `nodes` (alfabética nos exemplos).
 * Grafo não direcionado: cada aresta listada vale nos dois sentidos.
 */
(function (root) {
  'use strict';

  function build(spec) {
    const names = Object.keys(spec.nodes);
    const n = names.length;
    const idx = {};
    names.forEach((k, i) => (idx[k] = i));
    const A = Array.from({ length: n }, () => Array(n).fill(0));
    const P = Array.from({ length: n }, () => Array(n).fill(Infinity));
    for (const e of spec.edges) {
      const u = idx[e[0]], v = idx[e[1]];
      const w = typeof e[2] === 'number' ? e[2] : 1;
      A[u][v] = 1; P[u][v] = w;
      if (!spec.directed) { A[v][u] = 1; P[v][u] = w; }
    }
    return { names, idx, n, A, P, directed: !!spec.directed };
  }

  function neighbors(g, u) {
    const r = [];
    for (let v = 0; v < g.n; v++) if (g.A[u][v]) r.push(v);
    return r;
  }

  function degrees(g) {
    return g.names.map((_, i) => {
      let out = 0, inn = 0;
      for (let j = 0; j < g.n; j++) { out += g.A[i][j]; inn += g.A[j][i]; }
      return { out, in: inn };
    });
  }

  function countEdges(g) {
    let c = 0;
    for (let i = 0; i < g.n; i++) for (let j = 0; j < g.n; j++) c += g.A[i][j];
    return c; // arestas direcionadas (um grafo não direcionado conta cada aresta 2x)
  }

  /* ---------- DFS ---------- */
  // Visita em pré-ordem; vizinhos em ordem crescente de índice (alfabética).
  function dfs(g, start) {
    const visited = Array(g.n).fill(false);
    const parent = Array(g.n).fill(-1);
    const order = [];
    const events = []; // {type:'visit'|'back', u, v}
    (function rec(u, p) {
      visited[u] = true; parent[u] = p; order.push(u);
      events.push({ type: 'visit', u, from: p });
      for (const v of neighbors(g, u)) {
        if (!visited[v]) rec(v, u);
        else if (v !== p) events.push({ type: 'back', u, v }); // vizinho já visitado e != predecessor => ciclo
      }
    })(start, -1);
    return { order, parent, events };
  }

  /* ---------- IDENTIFICA-COMPONENTES ---------- */
  function components(g) {
    const labels = Array(g.n).fill(0); // 0 = ainda sem rótulo
    let count = 0;
    const roots = [];
    function rec(u, c) {
      labels[u] = c;
      for (const v of neighbors(g, u)) if (labels[v] === 0) rec(v, c);
    }
    for (let i = 0; i < g.n; i++) {
      if (labels[i] === 0) { count++; roots.push(i); rec(i, count); }
    }
    return { labels, count, roots };
  }

  /* ---------- BFS ---------- */
  // Para quando o destino t é alcançado (se t >= 0). Registra cada passo.
  function bfs(g, s, t) {
    const dist = Array(g.n).fill(-1);
    const pred = Array(g.n).fill(-1);
    const queue = [s];
    dist[s] = 0; pred[s] = s;
    const steps = [{ pop: null, added: [s], queue: [s] }];
    const order = [];
    let found = s === t;
    while (queue.length && !found) {
      const u = queue.shift();
      order.push(u);
      const added = [];
      for (const v of neighbors(g, u)) {
        if (dist[v] === -1) {
          dist[v] = dist[u] + 1; pred[v] = u; queue.push(v); added.push(v);
          if (v === t) found = true;
        }
      }
      steps.push({ pop: u, added, queue: queue.slice() });
    }
    return { dist, pred, steps, order, path: found || t < 0 ? pathTo(pred, s, t) : [] };
  }

  function pathTo(pred, s, t) {
    if (t < 0 || pred[t] === -1) return [];
    const p = [];
    let v = t;
    while (v !== s) { p.push(v); v = pred[v]; }
    p.push(s);
    return p.reverse();
  }

  /* ---------- Dijkstra (versão dos slides: vetor/conjunto h) ---------- */
  // Para ao processar o destino t (se t >= 0).
  function dijkstra(g, s, t) {
    const dist = Array(g.n).fill(Infinity);
    const pred = Array(g.n).fill(-1);
    dist[s] = 0; pred[s] = s;
    const h = new Set([s]);
    const done = Array(g.n).fill(false);
    const steps = [];
    while (h.size) {
      let k = -1;
      for (const v of h) if (k === -1 || dist[v] < dist[k] || (dist[v] === dist[k] && v < k)) k = v;
      h.delete(k);
      done[k] = true;
      const changed = [];
      for (const j of neighbors(g, k)) {
        const dk = dist[k] + g.P[k][j];
        if (dk < dist[j]) { dist[j] = dk; pred[j] = k; h.add(j); changed.push(j); }
      }
      steps.push({ k, changed, dist: dist.slice(), pred: pred.slice(), h: [...h].sort((a, b) => a - b), done: done.slice() });
      if (k === t) break;
    }
    return { dist, pred, steps, path: pathTo(pred, s, t) };
  }

  /* ---------- Min-heap em array ---------- */
  // Valores comparados por `key` (padrão: o próprio valor) para permitir pares (dist, vértice).
  function key(x) { return Array.isArray(x) ? x[0] : x; }

  function heapInsert(arr, v) {
    const a = arr.slice();
    const states = [];
    a.push(v);
    let i = a.length - 1;
    states.push({ note: `coloca ${show(v)} no final (índice ${i})`, arr: a.slice(), mark: [i] });
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (key(a[i]) < key(a[p])) {
        [a[i], a[p]] = [a[p], a[i]];
        states.push({ note: `${show(a[p])} < pai ${show(a[i])} (índice ${p}): troca`, arr: a.slice(), mark: [i, p] });
        i = p;
      } else break;
    }
    return { arr: a, states };
  }

  function heapPop(arr) {
    const a = arr.slice();
    const states = [];
    const min = a[0];
    const last = a.length - 1;
    [a[0], a[last]] = [a[last], a[0]];
    states.push({ note: `troca raiz ${show(min)} com o último (${show(a[0])})`, arr: a.slice(), mark: [0, last] });
    a.pop();
    states.push({ note: `diminui o tamanho (${show(min)} sai do heap)`, arr: a.slice(), mark: [0] });
    let i = 0;
    for (;;) {
      const l = 2 * i + 1, r = 2 * i + 2;
      let m = i;
      if (l < a.length && key(a[l]) < key(a[m])) m = l;
      if (r < a.length && key(a[r]) < key(a[m])) m = r;
      if (m === i) break;
      [a[i], a[m]] = [a[m], a[i]];
      states.push({ note: `desce: troca com o menor filho (índice ${m})`, arr: a.slice(), mark: [i, m] });
      i = m;
    }
    return { min, arr: a, states };
  }

  function show(v) { return Array.isArray(v) ? `(${v[0]}, ${v[1]})` : String(v); }

  function isMinHeap(a) {
    for (let i = 1; i < a.length; i++) if (key(a[i]) < key(a[(i - 1) >> 1])) return false;
    return true;
  }

  /* ---------- Dijkstra com min-heap (pares (dist, vértice)) ---------- */
  function dijkstraHeap(g, s) {
    const dist = Array(g.n).fill(Infinity);
    const pred = Array(g.n).fill(-1);
    const visited = Array(g.n).fill(false);
    dist[s] = 0; pred[s] = s;
    let h = [[0, s]];
    const steps = [];
    let pops = 0, pushes = 1;
    while (h.length) {
      const r = heapPop(h);
      h = r.arr;
      const [d, k] = r.min;
      pops++;
      if (visited[k]) { steps.push({ pair: [d, k], skipped: true, pushed: [], heap: h.slice() }); continue; }
      visited[k] = true;
      const pushed = [];
      for (const j of neighbors(g, k)) {
        const dk = dist[k] + g.P[k][j];
        if (dk < dist[j]) {
          dist[j] = dk; pred[j] = k;
          h = heapInsert(h, [dk, j]).arr; pushes++;
          pushed.push([dk, j]);
        }
      }
      steps.push({ pair: [d, k], skipped: false, pushed, heap: h.slice() });
    }
    return { dist, pred, steps, pops, pushes };
  }

  const Algos = { build, neighbors, degrees, countEdges, dfs, components, bfs, pathTo, dijkstra, dijkstraHeap, heapInsert, heapPop, isMinHeap, show };
  if (typeof module !== 'undefined' && module.exports) module.exports = Algos;
  else root.Algos = Algos;
})(typeof window !== 'undefined' ? window : globalThis);
