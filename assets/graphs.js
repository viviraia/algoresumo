/* Grafos usados nos exemplos do resumo e na prova modelo.
 * nodes: posições (x,y) no desenho; edges: [origem, destino, peso?]; directed: true/false.
 * Em grafos não direcionados cada aresta é listada uma só vez.
 */
(function (root) {
  'use strict';
  const G = {
    /* ===== Resumo ===== */
    // Exemplo numérico direcionado (definições, graus, matriz)
    s_dir: {
      w: 420, h: 220, directed: true,
      nodes: { 0: [50, 110], 1: [150, 40], 2: [150, 180], 3: [260, 110], 4: [370, 185] },
      edges: [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 1]],
    },
    // Exemplo com pesos (matriz com ∞)
    s_pesos: {
      w: 420, h: 220, directed: true,
      nodes: { 0: [50, 110], 1: [150, 40], 2: [150, 180], 3: [260, 110], 4: [370, 185] },
      edges: [[0, 1, 4], [0, 2, 1], [2, 1, 2], [1, 3, 5], [2, 3, 8], [3, 4, 3]],
    },
    // Rede social do handout: aresta u -> v significa "u curtiu algum post de v"
    s_rede: {
      w: 420, h: 230, directed: true,
      nodes: { 1: [50, 115], 2: [140, 30], 3: [280, 30], 4: [375, 115], 5: [210, 200] },
      edges: [[3, 1], [2, 1], [3, 5], [2, 3], [2, 5], [4, 2], [3, 2], [4, 3], [1, 5]],
    },
    // Não direcionado, 2 componentes (labels [1,1,1,1,2,2,2,2])
    s_comp: {
      w: 460, h: 220, directed: false,
      nodes: { A: [60, 50], B: [170, 50], C: [60, 170], D: [170, 170], F: [300, 50], G: [410, 50], I: [300, 170], J: [410, 170] },
      edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['F', 'G'], ['F', 'I'], ['G', 'J']],
    },
    // DFS acha caminho longo, BFS acha o curto (A -> G)
    s_bfs: {
      w: 460, h: 220, directed: false,
      nodes: { A: [40, 50], B: [135, 50], C: [230, 50], D: [325, 50], E: [420, 50], F: [230, 175], G: [420, 175] },
      edges: [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'G'], ['A', 'F'], ['F', 'G']],
    },
    // Exemplo dos handouts: fonte D, destino A
    s_dij: {
      w: 360, h: 240, directed: true,
      nodes: { A: [180, 205], C: [70, 120], D: [180, 30], E: [290, 120], F: [180, 120] },
      edges: [['D', 'C', 3], ['D', 'F', 4], ['D', 'E', 2], ['C', 'A', 3], ['F', 'A', 1], ['E', 'A', 5]],
    },
    // BFS falha com pesos: A->D (1 aresta, custo 10) vs A->B->C->D (custo 6)
    s_bfsfail: {
      w: 380, h: 170, directed: true,
      nodes: { A: [40, 120], B: [125, 40], C: [255, 40], D: [340, 120] },
      edges: [['A', 'B', 2], ['B', 'C', 2], ['C', 'D', 2], ['A', 'D', 10]],
    },
    // "Menor aresta primeiro" falha: guloso vai A->B->D (11); ótimo é A->C->D (5)
    s_greedy: {
      w: 340, h: 220, directed: true,
      nodes: { A: [40, 110], B: [170, 40], C: [170, 180], D: [300, 110] },
      edges: [['A', 'B', 1], ['A', 'C', 2], ['B', 'D', 10], ['C', 'D', 3]],
    },
    // Pesos negativos 1 (handout): Dijkstra para em B com dist 2, mas A->D->B custa -50
    s_neg1: {
      w: 340, h: 230, directed: true,
      nodes: { A: [170, 30], C: [80, 115], D: [260, 115], B: [170, 200] },
      edges: [['A', 'C', 1], ['A', 'D', 100], ['A', 'B', 2], ['C', 'B', 1], ['D', 'B', -150]],
    },
    // Pesos negativos 2 (handout): ciclo A->D->F->A de peso -2
    s_neg2: {
      w: 350, h: 250, directed: true,
      nodes: { A: [170, 30], C: [70, 120], D: [280, 120], B: [70, 215], F: [280, 215] },
      edges: [['A', 'C', 10], ['A', 'D', 10], ['A', 'B', 20], ['C', 'B', 1], ['D', 'B', 15], ['D', 'F', -6], ['F', 'A', -6]],
    },

    /* ===== Prova modelo ===== */
    p_matriz: {
      w: 420, h: 220, directed: true,
      nodes: { 0: [50, 110], 1: [150, 40], 2: [150, 180], 3: [260, 110], 4: [370, 185] },
      edges: [[0, 2], [1, 0], [1, 3], [2, 3], [2, 4], [3, 4], [4, 1]],
    },
    p_comp: {
      w: 460, h: 210, directed: false,
      nodes: { A: [40, 50], B: [140, 40], C: [90, 150], D: [230, 60], E: [230, 160], F: [340, 40], G: [400, 100], H: [340, 160] },
      edges: [['A', 'B'], ['B', 'C'], ['C', 'A'], ['D', 'E'], ['F', 'G'], ['G', 'H']],
    },
    p_dfs: {
      w: 460, h: 220, directed: false,
      nodes: { A: [40, 110], B: [130, 40], C: [130, 180], D: [240, 40], E: [240, 180], F: [350, 110], G: [430, 110] },
      edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['C', 'E'], ['D', 'F'], ['E', 'F'], ['F', 'G']],
    },
    p_bfs: {
      w: 460, h: 220, directed: false,
      nodes: { A: [40, 110], B: [130, 40], C: [130, 180], D: [240, 40], E: [350, 40], F: [240, 180], G: [350, 180] },
      edges: [['A', 'B'], ['A', 'C'], ['B', 'D'], ['C', 'D'], ['D', 'E'], ['C', 'F'], ['F', 'G']],
    },
    p_dij: {
      w: 460, h: 240, directed: true,
      nodes: { A: [40, 120], B: [160, 45], C: [160, 195], D: [290, 45], E: [290, 195], F: [420, 120] },
      edges: [['A', 'B', 4], ['A', 'C', 1], ['C', 'B', 2], ['B', 'D', 1], ['C', 'D', 5], ['D', 'E', 3], ['C', 'E', 8], ['E', 'F', 2]],
    },
  };
  root.Graphs = G;
})(typeof window !== 'undefined' ? window : globalThis);
