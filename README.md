# Grafos — resumo completo e prova final modelo

Site estático (HTML + CSS + JavaScript puro, sem build e sem dependências) com o resumo da matéria de **Algoritmos e Estruturas de Dados — Grafos** (slides e handouts de Igor Montagner, Insper, 2026/02) e uma **prova final modelo** para estudo.

## Conteúdo

- `index.html` — **Resumo**: definições, matriz de adjacências, representação em C, DFS e componentes conexas, BFS e fila circular, Dijkstra, pesos negativos, min-heap, complexidades, receitas de prova, pegadinhas e checklist. As simulações (tabelas de DFS/BFS/Dijkstra e operações no heap) são geradas pelos próprios algoritmos.
- `prova.html` — **Prova modelo**: 21 questões / 100 pontos (Parte A: 11 de múltipla escolha e V/F com correção automática; Parte B: 6 simulações com gabarito calculado; Parte C: 4 de código, modelagem e complexidade), cronômetro de 2 h, placar e lista de tópicos para revisar.
- `assets/` — `algos.js` (DFS, componentes, BFS, Dijkstra, min-heap), `graphs.js` (grafos dos exemplos), `viz.js` (SVG e tabelas), `app.js`, `prova.js`, `style.css`.
- Os PDFs originais ficam na raiz do repositório.

## Como usar

Abra `index.html` no navegador (funciona offline, via `file://`). Para servir localmente:

```bash
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`.

### Publicar no GitHub Pages

Em *Settings → Pages*, escolha a branch desejada e a pasta `/ (root)`. O site abre em `index.html`.

## Observação

Material de estudo não oficial. Trechos marcados como "complemento" no resumo (por exemplo, complexidades de DFS/BFS com matriz de adjacências) não constam nos PDFs, mas completam a explicação.
