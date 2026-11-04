/* Prova final modelo: banco de questões, correção automática e placar. */
(function () {
  'use strict';
  const { build, degrees, countEdges, dfs, components, bfs, pathTo, dijkstra, heapInsert, heapPop } = Algos;
  const G = Graphs;
  const letters = (g, a) => a.map((i) => g.names[i]).join(' → ');
  const list = (g, a) => a.map((i) => g.names[i]).join(', ');
  const fig = (name, extra) => `<figure class="fig"><div data-g="${name}" ${extra || ''}></div></figure>`;
  const REF = (id, txt) => `<a href="index.html#${id}">${txt}</a>`;

  /* =============== PARTE A =============== */
  const A = [
    { type: 'mc', topic: ['grafos', 'Matriz de adjacências'],
      stmt: 'Seja <b>A</b> a matriz de adjacências de um grafo <b>não direcionado</b> sem loops. Qual afirmação é <b>sempre</b> verdadeira?',
      opts: ['A é simétrica: A[i][j] = A[j][i] para todo i, j.', 'A tem 1 em toda a diagonal principal.', 'A soma de todos os elementos de A é igual ao número de linhas desenhadas.', 'Só há 1s acima da diagonal principal.'],
      correct: 0,
      explain: 'Em grafo não direcionado, para toda aresta (v,w) existe também (w,v) ⇒ matriz simétrica. Sem loops, a diagonal é 0; e a soma dos elementos conta cada linha desenhada <b>duas vezes</b>; há 1s dos dois lados da diagonal.' },
    { type: 'vf', topic: ['grafos', 'Graus'],
      stmt: 'Em um grafo <b>direcionado</b>, a soma dos graus de entrada de todos os vértices é igual à soma dos graus de saída (e ambas valem |E|).',
      correct: 0,
      explain: 'Verdadeiro. Toda aresta (v,w) contribui com 1 para o grau de saída de v e 1 para o grau de entrada de w; logo as duas somas são iguais a |E|.' },
    { type: 'mc', topic: ['grafos', 'Matriz com pesos'],
      stmt: 'Na matriz de adjacências de um grafo <b>com pesos</b>, usamos ∞ (e não 0) para indicar que <b>não há aresta</b>. Por quê?',
      opts: ['Porque 0 pode ser um peso válido de aresta, e ∞ nunca é escolhido ao procurar menores caminhos.', 'Porque o tipo double não consegue guardar o valor 0.', 'Porque 0 é usado para marcar a diagonal principal.', 'Porque a matriz precisa ser simétrica.'],
      correct: 0,
      explain: 'Se 0 significasse "sem aresta", ele seria ambíguo com uma aresta de peso 0, e uma ausência de aresta pareceria um caminho gratuito. Com ∞ a ausência nunca ganha de um caminho real.' },
    { type: 'mc', topic: ['dfs', 'Componentes conexos'],
      stmt: 'Um grafo não direcionado tem 6 vértices e <b>nenhuma aresta</b>. Quantos componentes conexos ele tem?',
      opts: ['1', '0', '6', '3'], correct: 2,
      explain: 'Cada vértice sozinho é um componente (não há caminho entre vértices diferentes): o máximo possível, |V| = 6. O mínimo é 1 (grafo todo conectado).' },
    { type: 'vf', topic: ['dfs', 'Definição de componente conexo'],
      stmt: 'Dado um componente conexo C, é possível existir um caminho entre dois vértices de C que passe por um vértice que <b>não</b> está em C.',
      correct: 1,
      explain: 'Falso. Se o caminho passasse por um vértice u ∉ C, então u seria alcançável a partir de um vértice de C, violando a condição 2 da definição (não existe caminho entre vértices de C e de V − C).' },
    { type: 'mc', topic: ['bfs', 'DFS não acha o menor caminho'],
      stmt: 'Sobre encontrar o caminho de <b>menor tamanho</b> entre dois vértices de um grafo sem pesos, é correto afirmar:',
      opts: ['A DFS sempre devolve um caminho mínimo.', 'A DFS devolve algum caminho entre os vértices, mas não necessariamente o mínimo.', 'A DFS só encontra caminhos em grafos sem ciclos.', 'A DFS devolve o caminho mínimo se os vizinhos forem visitados em ordem alfabética.'],
      correct: 1,
      explain: 'A DFS se aprofunda pelo primeiro vizinho e pode encontrar o destino por um caminho longo (ex.: A→B→C→D→E→G em vez de A→F→G). A ordem de visita dos vizinhos não muda isso.' },
    { type: 'mc', topic: ['bfs', 'Busca em largura'],
      stmt: 'Qual estrutura de dados a busca em largura (BFS) usa para visitar os vértices em ordem crescente de distância à raiz?',
      opts: ['Pilha', 'Fila', 'Min-heap', 'Matriz de adjacências ordenada'], correct: 1,
      explain: 'A BFS usa uma <b>fila</b> (FIFO): os vértices descobertos primeiro (mais próximos) são processados primeiro. Na implementação, a fila é circular com índices módulo a capacidade.' },
    { type: 'mc', topic: ['dijkstra', 'Pesos negativos'],
      stmt: 'Qual condição o algoritmo de Dijkstra exige para garantir o menor caminho?',
      opts: ['O grafo deve ser não direcionado.', 'O grafo não pode ter ciclos.', 'Todos os pesos das arestas devem ser não negativos.', 'Todos os pesos devem ser distintos.'], correct: 2,
      explain: 'A ideia "ao processar um vértice, sua distância não muda mais" só vale com pesos ≥ 0. Com pesos negativos (ex.: aresta −150) um caminho mais longo em arestas pode ser mais barato depois.' },
    { type: 'mc', topic: ['dijkstra', 'Representação do heap em array'],
      stmt: 'Em um min-heap guardado em um array com índices a partir de 0, onde estão os <b>filhos</b> e o <b>pai</b> do nó do índice <b>4</b>?',
      opts: ['filhos nos índices 8 e 9; pai no índice 2', 'filhos nos índices 9 e 10; pai no índice 1', 'filhos nos índices 4 e 5; pai no índice 2', 'filhos nos índices 8 e 9; pai no índice 1'], correct: 1,
      explain: 'Filhos de i: 2i+1 = 9 e 2i+2 = 10. Pai: (i−1)//2 = 3//2 = 1.' },
    { type: 'mc', topic: ['dijkstra', 'Complexidade do Dijkstra'],
      stmt: 'Dijkstra com vetor custa O(V²); com min-heap custa O(E log V). Em um grafo <b>denso</b> (E ≈ V²), qual versão é assintoticamente melhor?',
      opts: ['A do min-heap, porque log V é pequeno.', 'A do vetor: V² contra V² log V.', 'As duas são idênticas.', 'Nenhuma funciona em grafos densos.'], correct: 1,
      explain: 'Com E ≈ V², o heap custa O(V² log V), pior que O(V²). O heap compensa em grafos <b>esparsos</b> (E ≈ V): V log V ≪ V².' },
    { type: 'mc', topic: ['repr', 'Alocação em C'],
      stmt: 'Para alocar com <code>malloc</code> uma matriz <code>double **</code> de V × V (um array de arrays), quantas chamadas a <code>malloc</code> são necessárias?',
      opts: ['1', 'V', 'V + 1', 'V × V'], correct: 2,
      explain: '1 chamada para o array de V ponteiros (nível 1) + V chamadas, uma para cada linha (nível 2) = V + 1. Na liberação: V <code>free</code> nas linhas + 1 no array de ponteiros.' },
  ];

  /* =============== PARTE B =============== */
  const gM = build(G.p_matriz), dM = degrees(gM);
  const maxIn = Math.max(...dM.map((x) => x.in)), maxOut = Math.max(...dM.map((x) => x.out));
  const gC = build(G.p_comp), compR = components(gC);
  const gD = build(G.p_dfs), dfsR = dfs(gD, gD.idx.D);
  const backs = dfsR.events.filter((e) => e.type === 'back');
  const gB = build(G.p_bfs), bfsR = bfs(gB, 0, gB.idx.G), dfsFromA = dfs(gB, 0), dfsPathG = pathTo(dfsFromA.parent, 0, gB.idx.G);
  const gW = build(G.p_dij), dijR = dijkstra(gW, 0, -1), dijE = pathTo(dijR.pred, 0, gW.idx.E);
  const bfsE = bfs(gW, 0, gW.idx.E);
  const heap0 = [2, 5, 3, 9, 6, 8, 7, 12, 10];
  const hIns = heapInsert(heap0, 1), hPop = heapPop(hIns.arr);

  const B = [
    { type: 'open', topic: ['grafos', 'Grafos, graus e matriz'],
      stmt: `<p>Considere o grafo direcionado abaixo.</p>${fig('p_matriz')}
        <ol type="a"><li>Quantos vértices e quantas arestas ele tem?</li>
        <li>Escreva sua matriz de adjacências.</li>
        <li>Preencha o grau de entrada e o grau de saída de cada vértice. Quais vértices têm o maior grau de entrada? E o maior grau de saída?</li></ol>`,
      answer: () => `<p><b>(a)</b> |V| = ${gM.n} vértices e |E| = ${countEdges(gM)} arestas.</p>
        <p><b>(b)</b> Matriz (linha = origem, coluna = destino):</p>${Viz.matrixHTML(G.p_matriz, false)}
        <p><b>(c)</b></p>${Viz.degreesHTML(G.p_matriz)}
        <p>Maior grau de entrada (${maxIn}): vértices <b>${list(gM, dM.map((x, i) => (x.in === maxIn ? i : -1)).filter((i) => i >= 0))}</b>. Maior grau de saída (${maxOut}): vértices <b>${list(gM, dM.map((x, i) => (x.out === maxOut ? i : -1)).filter((i) => i >= 0))}</b>.</p>
        <p class="legend">Conferência: soma dos graus de entrada = soma dos graus de saída = |E| = ${countEdges(gM)}. Grau de saída = soma da linha; grau de entrada = soma da coluna.</p>` },

    { type: 'open', topic: ['dfs', 'IDENTIFICA-COMPONENTES'],
      stmt: `<p>O grafo não direcionado abaixo tem os vértices A..H.</p>${fig('p_comp')}
        <ol type="a"><li>Quantos componentes conexos ele possui? Liste os vértices de cada um.</li>
        <li>Execute IDENTIFICA-COMPONENTES percorrendo os vértices em ordem alfabética (A, B, …, H) e escreva o array <code>LABELS</code> (vértices A..H).</li></ol>`,
      answer: () => {
        const groups = {};
        compR.labels.forEach((l, i) => (groups[l] = (groups[l] || []).concat(gC.names[i])));
        return `<p><b>(a)</b> <b>${compR.count} componentes</b>: ${Object.values(groups).map((g) => '{' + g.join(', ') + '}').join(' · ')}.</p>
        <p><b>(b)</b> Começando por A: LABELS inicia em 0 para todos; A está sem rótulo ⇒ c = 1 e uma DFS rotula A, B, C. O primeiro vértice ainda sem rótulo é D ⇒ c = 2 (rotula D, E). Depois F ⇒ c = 3 (rotula F, G, H).</p>
        <pre><code>LABELS = [${compR.labels.join(', ')}]      (A B C D E F G H)</code></pre>
        <p class="legend">Qualquer numeração que separe os mesmos grupos é aceitável, mas em ordem alfabética o resultado acima é o único possível.</p>`;
      } },

    { type: 'open', topic: ['dfs', 'Simulação de DFS'],
      stmt: `<p>Execute uma <b>DFS a partir do vértice D</b> no grafo abaixo. Os vizinhos de cada vértice são visitados em <b>ordem alfabética</b>.</p>${fig('p_dfs', 'data-start="D"')}
        <ol type="a"><li>Escreva a ordem em que os vértices são visitados (numere-os de 1 a 7).</li>
        <li>Há ciclos no grafo? Como a DFS permite percebê-los?</li></ol>`,
      answer: () => `<p><b>(a)</b> Ordem de visita: <b>${letters(gD, dfsR.order)}</b>.</p>
        <p>Raciocínio: D → (vizinhos B, C, F) vai a B → de B (vizinhos A, D) vai a A → de A (vizinhos B, C) vai a C → de C (vizinhos A, D, E) vai a E → de E (vizinhos C, F) vai a F → de F (vizinhos D, E, G) vai a G. Ao voltar, não restam vizinhos novos.</p>
        <p><b>(b)</b> Sim. Há ciclo sempre que, ao examinar os vizinhos de um vértice, encontramos um <b>já visitado que não é o predecessor</b> (de quem veio a chamada). Exemplos nesta execução: ${backs.slice(0, 3).map((e) => `em <b>${gD.names[e.u]}</b> o vizinho <b>${gD.names[e.v]}</b> já foi visitado`).join('; ')}. (Ciclo D-B-A-C-D, por exemplo.)</p>` },

    { type: 'open', topic: ['bfs', 'BFS e caminho mínimo'],
      stmt: `<p>No grafo abaixo, queremos o <b>menor caminho de A até G</b> (vizinhos em ordem alfabética).</p>${fig('p_bfs', 'data-opts=\'{"nodeClass":{"A":"start","G":"end"}}\'')}
        <ol type="a"><li>Simule a BFS a partir de A, mostrando a fila a cada passo, até alcançar G. Qual o caminho encontrado e seu tamanho?</li>
        <li>Que caminho uma DFS (vizinhos em ordem alfabética) encontraria? Ele é mínimo?</li></ol>`,
      answer: () => `<p><b>(a)</b> Tabela da BFS (para ao alcançar G):</p>${Viz.bfsTable(G.p_bfs, 'A', 'G').html}
        <p>Caminho pelo vetor <code>pred</code>: <b>${letters(gB, bfsR.path)}</b> — tamanho <b>${bfsR.dist[gB.idx.G]}</b> arestas.</p>
        <p><b>(b)</b> A DFS a partir de A encontra G por <b>${letters(gB, dfsPathG)}</b> (${dfsPathG.length - 1} arestas). Esse caminho <b>não é mínimo</b> (o mínimo tem ${bfsR.dist[gB.idx.G]}); a DFS devolve algum caminho, não o menor.</p>` },

    { type: 'open', topic: ['dijkstra', 'Simulação de Dijkstra'],
      stmt: `<p>Grafo direcionado com pesos. <b>Fonte: A.</b></p>${fig('p_dij', 'data-start="A"')}
        <ol type="a"><li>Simule Dijkstra montando uma tabela com <code>dist</code>, <code>pred</code> e o conjunto <code>h</code> a cada iteração (em empate, escolha o vértice de menor letra).</li>
        <li>Qual o menor caminho de A até E e seu custo?</li>
        <li>Quantas arestas tem o caminho que uma BFS encontraria de A até E? Por que ele não serve aqui?</li></ol>`,
      answer: () => `<p><b>(a)</b></p>${Viz.dijkstraTable(G.p_dij, 'A').html}
        <p>Resultado final — <code>dist</code> = [${dijR.dist.map(Viz.fmt).join(', ')}] e <code>pred</code> = [${dijR.pred.map((p) => gW.names[p]).join(', ')}] (A B C D E F).</p>
        <p><b>(b)</b> Seguindo <code>pred</code> de E até A: <b>${letters(gW, dijE)}</b>, custo <b>${dijR.dist[gW.idx.E]}</b>.</p>
        <p><b>(c)</b> A BFS minimiza o <i>número de arestas</i>: encontra ${letters(gW, bfsE.path)} (${bfsE.dist[gW.idx.E]} arestas), cujo custo é ${gW.P[0][2] + gW.P[2][4]}. Já o menor caminho em custo tem ${dijE.length - 1} arestas e custo ${dijR.dist[gW.idx.E]}. Com pesos, é preciso o Dijkstra.</p>` },

    { type: 'open', topic: ['dijkstra', 'Min-heap'],
      stmt: `<p>O array <code>[${heap0.join(', ')}]</code> é um min-heap (índices a partir de 0).</p>
        <ol type="a"><li>Desenhe o heap como árvore. Qual o índice do pai do valor 12?</li>
        <li>Execute <code>INSERE(1)</code> e escreva o array resultante.</li>
        <li>Sobre o heap do item (b), execute <code>MENOR</code> e escreva o valor devolvido e o novo array.</li></ol>`,
      answer: () => `<p><b>(a)</b> Árvore e array do heap inicial:</p><div class="fig" data-trace="heap" data-arr="${heap0.join(',')}" data-op="view"></div>
        <p>O 12 está no índice 7; seu pai está em (7−1)//2 = <b>3</b> (valor 9).</p>
        <p><b>(b)</b> <code>INSERE(1)</code> → colocar 1 no fim (índice 9), subir trocando com o pai enquanto for menor (6, 5 e 2):</p>
        <div class="fig" data-trace="heap" data-arr="${heap0.join(',')}" data-op="insert" data-val="1"></div>
        <p>Array: <code>[${hIns.arr.join(', ')}]</code></p>
        <p><b>(c)</b> <code>MENOR</code> devolve <b>${hPop.min}</b>; o último elemento vai para a raiz e desce trocando com o menor filho:</p>
        <div class="fig" data-trace="heap" data-arr="${hIns.arr.join(',')}" data-op="pop"></div>
        <p>Array: <code>[${hPop.arr.join(', ')}]</code></p>` },
  ];

  /* =============== PARTE C =============== */
  const C = [
    { type: 'open', topic: ['repr', 'Matriz em C'],
      stmt: `<p>Escreva em C duas funções para um grafo <b>com pesos</b> de <code>V</code> vértices:</p>
        <ol type="a"><li><code>double **cria_matriz(int V)</code> — aloca e devolve a matriz de adjacências, já inicializada para um grafo sem nenhuma aresta;</li>
        <li><code>void libera_matriz(double **mat, int V)</code> — libera toda a memória.</li></ol>`,
      answer: () => `<pre><code>#include &lt;stdlib.h&gt;
#include &lt;math.h&gt;

double **cria_matriz(int V) {
    double **mat = malloc(V * sizeof(double *));   /* nível 1: array das V linhas */
    for (int i = 0; i &lt; V; i++) {
        mat[i] = malloc(V * sizeof(double));       /* nível 2: cada linha */
        for (int j = 0; j &lt; V; j++)
            mat[i][j] = INFINITY;                  /* sem aresta = infinito */
    }
    return mat;
}

void libera_matriz(double **mat, int V) {
    for (int i = 0; i &lt; V; i++)
        free(mat[i]);                              /* primeiro as linhas */
    free(mat);                                     /* depois o array de ponteiros */
}</code></pre>
        <p><b>Critérios:</b> 2 níveis de malloc (V+1 chamadas); tipos <code>double *</code> / <code>double **</code> no sizeof; inicialização com <code>INFINITY</code> (para grafo sem pesos seria 0); liberar linhas <u>antes</u> do array de ponteiros.</p>` },

    { type: 'open', topic: ['dfs', 'IDENTIFICA-COMPONENTES'],
      stmt: `<p>Escreva o pseudocódigo de <b>IDENTIFICA-COMPONENTES(G, LABELS)</b>. Você pode usar <code>NVERTICES(G)</code> (número de vértices) e <code>EH_VIZINHO(G, i, j)</code> (verdadeiro se há aresta entre i e j), e criar funções auxiliares. A saída é um array em que cada vértice recebe o número (a partir de 1) do seu componente. Lembre-se: <code>LABELS</code> chega sem inicializar.</p>`,
      answer: () => `<pre class="pseudo"><code>IDENTIFICA-COMPONENTES(G, LABELS)
    N &lt;- NVERTICES(G)
    PARA v &lt;- 0 ATÉ N-1 FAÇA LABELS[v] &lt;- 0     # 0 = "ainda sem rótulo"
    c &lt;- 0
    PARA v &lt;- 0 ATÉ N-1 FAÇA
        SE LABELS[v] = 0 ENTÃO
            c &lt;- c + 1
            ROTULA(G, v, c, LABELS)
    DEVOLVA c

ROTULA(G, v, c, LABELS)                        # DFS
    LABELS[v] &lt;- c
    PARA w &lt;- 0 ATÉ NVERTICES(G)-1 FAÇA
        SE EH_VIZINHO(G, v, w) E LABELS[w] = 0 ENTÃO
            ROTULA(G, w, c, LABELS)</code></pre>
        <p><b>Critérios:</b> (1) inicializa LABELS com valor inválido; (2) uma nova DFS só quando encontra vértice sem rótulo; (3) contador incrementado a cada nova DFS; (4) a DFS rotula todos os vértices alcançáveis e só desce em vizinhos sem rótulo (evita loop infinito); (5) o máximo de componentes é |V|.</p>` },

    { type: 'open', topic: ['grafos', 'Modelagem com grafos'],
      stmt: `<p>Um aplicativo de entregas conhece os <b>cruzamentos</b> de uma cidade e as <b>ruas</b> que ligam cruzamentos, com o <b>tempo médio de percurso</b> de cada rua (algumas são mão única).</p>
        <ol type="a"><li>Modele o problema respondendo às 4 perguntas (vértice, aresta, direção, peso).</li>
        <li>Que algoritmo você usaria para achar o trajeto de <b>menor tempo</b> entre a loja e o cliente? Por quê?</li>
        <li>E se todas as ruas tivessem o mesmo tempo e quiséssemos o trajeto com <b>menos ruas</b>?</li>
        <li>Como saber se alguma parte da cidade ficou <b>isolada</b> por um alagamento (ruas fechadas)? Como seria o grafo nesse caso?</li></ol>`,
      answer: () => `<p><b>(a)</b> <b>Vértices:</b> cruzamentos. <b>Aresta u → v:</b> existe uma rua que sai do cruzamento u e chega em v. <b>Direção:</b> sim, direcionado (ruas de mão única; rua de mão dupla = duas arestas, uma em cada sentido). <b>Peso:</b> sim, o tempo médio de percurso (não negativo).</p>
        <p><b>(b)</b> <b>Dijkstra</b>: grafo com pesos não negativos e queremos minimizar a soma dos pesos. Usa <code>dist</code>, <code>pred</code> e <code>h</code> (idealmente um min-heap: O(E log V), pois o grafo de ruas é esparso).</p>
        <p><b>(c)</b> <b>BFS</b>: sem pesos (arestas equivalentes) o tamanho do caminho é o nº de arestas, e a BFS o minimiza.</p>
        <p><b>(d)</b> Ruas fechadas são removidas; a pergunta vira "existe mais de um <b>componente conexo</b>?". Para isso o grafo é visto como não direcionado e sem pesos (relação simétrica de "estar ligado"), e usamos IDENTIFICA-COMPONENTES (DFS por componente).</p>` },

    { type: 'open', topic: ['dijkstra', 'Complexidade do Dijkstra com heap'],
      stmt: `<p>No Dijkstra com min-heap, o heap guarda pares <code>(dist, vértice)</code>, e o laço principal ignora o vértice retirado se ele já foi visitado.</p>
        <ol type="a"><li>Por que um mesmo vértice pode aparecer mais de uma vez no heap? Por que o teste "já foi visitado" é necessário?</li>
        <li>Mostre que o laço externo executa no máximo ≈ E vezes e deduza que o custo total é O(E log V).</li>
        <li>Compare com a versão que guarda <code>h</code> em um vetor (O(V²)): para qual tipo de grafo cada uma é preferível?</li></ol>`,
      answer: () => `<p><b>(a)</b> Cada vez que o relaxamento acha um caminho melhor para j, inserimos um <b>novo par</b> (distK, j) em vez de alterar o antigo. Assim j pode ter vários pares; o de <b>menor</b> distância sai primeiro e fixa a distância definitiva. Os pares antigos (com distância maior) saem depois e são <b>obsoletos</b>: reprocessá-los desperdiçaria tempo e poderia repetir relaxamentos — por isso "SE k já foi visitado ENTÃO continua".</p>
        <p><b>(b)</b> Todo par removido foi inserido antes. Inserimos o par inicial (1) e depois um par <b>a cada relaxamento bem-sucedido</b>, que acontece no máximo uma vez por aresta (E). Logo há ≤ E + 1 inserções e portanto ≤ E + 1 remoções ⇒ o laço roda ≤ ≈ E vezes. Cada INSERE/MENOR custa O(log N) com N ≤ E + 1 ≤ V², e log V² = 2 log V = O(log V). Total: <b>O(E log V)</b>.</p>
        <p><b>(c)</b> O vetor custa O(V²) independentemente de E; o heap, O(E log V). Em grafos <b>esparsos</b> (E ≈ V) o heap é bem melhor (V log V contra V²); em grafos <b>densos</b> (E ≈ V²) o vetor é melhor (V² contra V² log V).</p>` },
  ];

  /* =============== Montagem =============== */
  const PARTS = [
    { id: 'A', title: 'Parte A — Conceitos', sub: 'Múltipla escolha e verdadeiro/falso (3 pontos cada)', qs: A, pts: 3 },
    { id: 'B', title: 'Parte B — Aplicação', sub: 'Simulações e cálculos (7 pontos cada). Resolva no papel e confira o gabarito.', qs: B, pts: 7 },
    { id: 'C', title: 'Parte C — Código, modelagem e complexidade', sub: 'Escreva as respostas e compare com o gabarito (6 / 7 / 6 / 6 pontos)', qs: C, pts: null },
  ];
  C.forEach((q, i) => (q.pts = [6, 7, 6, 6][i]));
  A.forEach((q) => (q.pts = 3));
  B.forEach((q) => (q.pts = 7));

  const all = [];
  let n = 0;
  PARTS.forEach((p) => p.qs.forEach((q) => { q.n = ++n; q.part = p.id; q.id = 'q' + n; all.push(q); }));
  const TOTAL = all.reduce((s, q) => s + q.pts, 0);

  const state = { sel: {}, checked: {}, grade: {}, touched: {}, finished: false };
  const qEl = {};
  const container = document.getElementById('questions');

  function render() {
    container.innerHTML = '';
    PARTS.forEach((p) => {
      const h = document.createElement('div');
      h.innerHTML = `<div class="part">${p.title.split(' — ')[0]}</div><h2 class="part-title" style="border:0;margin:0;padding:0">${p.title.split(' — ')[1]}</h2><p class="legend">${p.sub}</p>`;
      container.appendChild(h);
      p.qs.forEach((q) => container.appendChild(renderQ(q)));
    });
    Viz.autorender(container);
    updateProgress();
  }

  function renderQ(q) {
    const el = document.createElement('article');
    el.className = 'q'; el.id = q.id;
    qEl[q.id] = el;
    let html = `<div class="qh"><span class="qn">Questão ${q.n}</span><span class="tag">${q.type === 'open' ? 'discursiva' : q.type === 'vf' ? 'V ou F' : 'múltipla escolha'}</span><span class="pts">${q.pts} pts</span></div>`;
    html += `<div class="stmt">${q.type === 'open' ? q.stmt : `<p>${q.stmt}</p>`}</div>`;
    if (q.type === 'mc' || q.type === 'vf') {
      const opts = q.type === 'vf' ? ['Verdadeiro', 'Falso'] : q.opts;
      html += '<div class="opts">' + opts.map((o, i) => `<label class="opt" data-i="${i}"><input type="radio" name="${q.id}" value="${i}"><span>${q.type === 'mc' ? String.fromCharCode(97 + i) + ') ' : ''}${o}</span></label>`).join('') + '</div>';
      html += `<div class="qactions"><button class="btn alt sm" data-act="check">Conferir</button><span class="verdict" data-v></span></div><div class="answer hidden" data-ans><h5>Resposta comentada</h5><p>${q.explain} <i>Revisar: ${REF(q.topic[0], q.topic[1])}.</i></p></div>`;
    } else {
      html += `<textarea placeholder="Rascunho (opcional) — escreva aqui ou no papel…" data-ta></textarea>`;
      html += `<div class="qactions"><button class="btn alt sm" data-act="show">Ver gabarito</button><span class="legend">Revisar: ${REF(q.topic[0], q.topic[1])}</span></div>`;
      html += `<div class="answer hidden" data-ans></div>`;
    }
    el.innerHTML = html;

    el.querySelectorAll('.opt input').forEach((inp) => inp.addEventListener('change', () => {
      state.sel[q.id] = Number(inp.value);
      el.querySelectorAll('.opt').forEach((l) => l.classList.toggle('sel', l.querySelector('input').checked));
      if (state.checked[q.id]) check(q); // reavalia se já conferida
      updateProgress();
    }));
    const chk = el.querySelector('[data-act="check"]');
    if (chk) chk.addEventListener('click', () => check(q));
    const show = el.querySelector('[data-act="show"]');
    if (show) show.addEventListener('click', () => showAnswer(q));
    const ta = el.querySelector('[data-ta]');
    if (ta) ta.addEventListener('input', () => { state.touched[q.id] = ta.value.trim().length > 0 || !!state.checked[q.id]; updateProgress(); });
    return el;
  }

  function check(q) {
    const el = qEl[q.id];
    state.checked[q.id] = true;
    const sel = state.sel[q.id];
    el.querySelectorAll('.opt').forEach((l) => {
      const i = Number(l.dataset.i);
      l.classList.toggle('right', i === q.correct);
      l.classList.toggle('miss', i === sel && sel !== q.correct);
    });
    const v = el.querySelector('[data-v]');
    if (sel === undefined) { v.textContent = 'Escolha uma alternativa.'; v.className = 'verdict'; el.classList.remove('correct', 'wrong'); }
    else if (sel === q.correct) { v.textContent = '✓ Correto'; v.className = 'verdict ok'; el.classList.add('correct'); el.classList.remove('wrong'); }
    else { v.textContent = '✗ Incorreto'; v.className = 'verdict bad'; el.classList.add('wrong'); el.classList.remove('correct'); }
    el.querySelector('[data-ans]').classList.remove('hidden');
  }

  function showAnswer(q) {
    const el = qEl[q.id];
    const box = el.querySelector('[data-ans]');
    state.touched[q.id] = true; state.checked[q.id] = true;
    if (!box.dataset.ready) {
      box.innerHTML = `<h5>Gabarito comentado</h5>${q.answer()}
        <div class="selfgrade"><b>Minha nota:</b>
        <label data-g="0"><input type="radio" name="g${q.id}" value="0">Errei (0%)</label>
        <label data-g="0.5"><input type="radio" name="g${q.id}" value="0.5">Parcial (50%)</label>
        <label data-g="1"><input type="radio" name="g${q.id}" value="1">Acertei (100%)</label></div>`;
      box.dataset.ready = '1';
      Viz.autorender(box);
      box.querySelectorAll('.selfgrade input').forEach((inp) => inp.addEventListener('change', () => {
        state.grade[q.id] = Number(inp.value);
        box.querySelectorAll('.selfgrade label').forEach((l) => l.classList.toggle('on', l.querySelector('input').checked));
        if (state.finished) finish();
      }));
    }
    box.classList.remove('hidden');
    updateProgress();
  }

  function score(q) {
    if (q.type === 'open') return (state.grade[q.id] || 0) * q.pts;
    return state.sel[q.id] === q.correct ? q.pts : 0;
  }

  function updateProgress() {
    const done = all.filter((q) => (q.type === 'open' ? state.touched[q.id] : state.sel[q.id] !== undefined)).length;
    document.getElementById('prog').style.width = (100 * done / all.length) + '%';
    document.getElementById('progTxt').textContent = done + '/' + all.length;
  }

  function finish() {
    state.finished = true;
    all.forEach((q) => { if (q.type !== 'open') check(q); });
    const parts = PARTS.map((p) => ({ p, got: p.qs.reduce((s, q) => s + score(q), 0), max: p.qs.reduce((s, q) => s + q.pts, 0) }));
    const got = parts.reduce((s, x) => s + x.got, 0);
    const ungraded = all.filter((q) => q.type === 'open' && state.grade[q.id] === undefined).length;
    const wrong = all.filter((q) => score(q) < q.pts);
    const topics = [...new Map(wrong.map((q) => [q.topic[1], q.topic])).values()];
    const pct = Math.round(100 * got / TOTAL);
    const msg = pct >= 85 ? 'Excelente! Você domina a matéria.' : pct >= 60 ? 'Bom resultado — revise os pontos abaixo.' : 'Vale reler o resumo e refazer a prova.';
    const html = `<h2 style="border:0;margin:0 0 8px;padding:0">Resultado</h2>
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:center"><div class="big">${got.toFixed(1).replace('.0', '')}<small style="font:600 18px var(--sans);color:var(--muted)"> / ${TOTAL}</small></div>
      <div><b>${msg}</b>${ungraded ? `<br><span class="legend">${ungraded} questão(ões) discursiva(s) sem autoavaliação contam 0 — abra o gabarito e marque sua nota.</span>` : ''}</div></div>
      <table style="margin-top:14px"><tr><th>Parte</th><th>Pontos</th></tr>${parts.map((x) => `<tr><td>${x.p.title}</td><td>${x.got.toFixed(1).replace('.0', '')} / ${x.max}</td></tr>`).join('')}</table>
      ${topics.length ? `<h5>Revisar</h5><ul>${topics.map((t) => `<li>${REF(t[0], t[1])}</li>`).join('')}</ul>` : '<p><b>Sem pendências!</b></p>'}`;
    ['result', 'result2'].forEach((id) => { const r = document.getElementById(id); r.innerHTML = html; r.classList.add('show'); });
    document.getElementById('result').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /* ---- Cronômetro ---- */
  let remaining = 2 * 3600, tick = null;
  const timerEl = document.getElementById('timer'), timerBtn = document.getElementById('timerBtn');
  function fmtT(s) { const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return `${h}:${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; }
  function showT() { timerEl.textContent = fmtT(Math.max(0, remaining)); timerEl.classList.toggle('low', remaining <= 600); }
  timerBtn.addEventListener('click', () => {
    if (tick) { clearInterval(tick); tick = null; timerBtn.textContent = '▶ Retomar'; return; }
    timerBtn.textContent = '⏸ Pausar';
    tick = setInterval(() => { remaining--; showT(); if (remaining <= 0) { clearInterval(tick); tick = null; timerBtn.textContent = '⏱ Tempo esgotado'; } }, 1000);
  });

  document.getElementById('finishBtn').addEventListener('click', finish);
  document.getElementById('finishBtn2').addEventListener('click', finish);
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (!confirm('Apagar todas as respostas e reiniciar a prova?')) return;
    for (const k of ['sel', 'checked', 'grade', 'touched']) state[k] = {};
    state.finished = false;
    if (tick) { clearInterval(tick); tick = null; }
    remaining = 2 * 3600; showT(); timerBtn.textContent = '▶ Cronômetro';
    ['result', 'result2'].forEach((id) => { const r = document.getElementById(id); r.classList.remove('show'); r.innerHTML = ''; });
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  showT();
  render();
})();
