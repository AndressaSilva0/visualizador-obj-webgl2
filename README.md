# Visualizador de Modelos 3D (.OBJ)

Projeto base para a **Atividade Avaliativa** de Computação Gráfica: visualizador interativo do Utah Teapot usando **WebGL2** e **JavaScript**.

## Estrutura do projeto

```
.
├── index.html              # Página principal e controles (sliders)
├── css/style.css           # Estilos da interface
├── shaders/
│   ├── shader.vert         # Vertex shader (ESSL 3.00) — TODO
│   └── shader.frag         # Fragment shader (ESSL 3.00) — TODO
├── assets/models/
│   └── teapot.obj          # Utah Teapot (University of Utah)
└── src/
    ├── main.js             # Inicialização WebGL2, loop de renderização
    ├── gl/glUtils.js       # Compilação de shaders, buffers
    ├── loader/objParser.js # Parser .OBJ — TODO (requisito principal)
    └── math/mat4.js        # Matrizes column-major (WebGL)
```

## Como rodar

O projeto usa módulos ES (`import`) e carrega arquivos via `fetch`. **Não abra o `index.html` direto no navegador** (`file://`) — use um servidor local:

```bash
cd /home/andressa/trabalho_computacao_grafica
python3 -m http.server 8080
```

Abra no navegador: **http://localhost:8080**

Requisitos: navegador com suporte a **WebGL2** (Chrome, Firefox, Edge recentes).

## Como mexer no projeto

| O que fazer | Onde editar |
|-------------|-------------|
| Ler vértices e faces do `.obj` | `src/loader/objParser.js` |
| Transformação no vertex shader | `shaders/shader.vert` |
| Cor e iluminação Lambert | `shaders/shader.frag` |
| Montar buffers, VAO, draw call | `src/main.js` |
| Rotação Y e escala (CPU → GPU) | `src/main.js` (já lê os sliders) + shaders |

Fluxo de desenvolvimento sugerido:

1. Implemente o parser em `objParser.js` e confira no console se `vertexCount > 0`.
2. Complete o vertex shader (`u_model`, `u_view`, `u_projection` → `gl_Position`).
3. Conecte os buffers em `main.js` (`vertexAttribPointer`, `drawElements` ou `drawArrays`).
4. Implemente Lambert no fragment shader.
5. Ajuste câmera/escala do modelo até o bule aparecer centralizado.

Marque os `TODO` no código conforme for implementando cada requisito.

---

## O que já está pronto (setup básico)

- [x] Estrutura de pastas e `index.html` com canvas WebGL2
- [x] Sliders de **rotação Y** e **escala** (estado em `main.js`)
- [x] Carregamento e compilação de shaders (`glUtils.js`)
- [x] Utilitários de matriz **column-major** (`mat4.js`: identidade, rotação Y, escala, perspectiva, lookAt)
- [x] Loop `requestAnimationFrame` e matrizes view/projection iniciais
- [x] Modelo `teapot.obj` baixado do repositório da University of Utah

## Divisão de tarefas — grupo de 5

Cada integrante escolhe **uma tarefa**. Marque o nome no README ao assumir a responsabilidade.

| Tarefa | Arquivo(s) principal(is) | Requisito | Depende de |
|--------|---------------------------|-----------|------------|
| **1** — Leitura de vértices e normais | `src/loader/objParser.js` | A | — |
| **2** — Faces, triangulação e buffers | `src/loader/objParser.js` | A | Tarefa 1 |
| **3** — Vertex shader (pipeline MVP) | `shaders/shader.vert` | B | Tarefa 2 |
| **4** — Buffers WebGL e draw call | `src/main.js` | B | Tarefa 2 |
| **5** — Interatividade + iluminação Lambert | `src/main.js` + `shaders/shader.frag` | C + D | Tarefas 3 e 4 |

**Ordem sugerida de entrega:** 1 → 2 → (3 e 4 em paralelo) → 5

---

### Tarefa 1 — Leitura de vértices e normais do `.OBJ`

**Responsável:** _nome aqui_  
**Arquivo:** `src/loader/objParser.js`  
**Requisito avaliativo:** A (parte 1)

**O que fazer:**

1. No loop de linhas, quando `type === 'v'`, extrair `x, y, z` de `parts[1]`, `parts[2]`, `parts[3]` e adicionar em `rawPositions`.
2. Quando `type === 'vn'`, extrair `nx, ny, nz` e adicionar em `rawNormals`.
3. Ignorar linhas vazias e comentários (`#`) — isso já está feito.

**Como testar:**

```js
// Temporariamente, no final de parseObj:
console.log('vértices:', rawPositions.length / 3);
console.log('normais:', rawNormals.length / 3);
// Esperado para teapot.obj: ~2760 vértices, ~2760 normais
```

**Pronto quando:** `rawPositions` e `rawNormals` forem preenchidos ao carregar o arquivo.

---

### Tarefa 2 — Faces, triangulação e montagem dos arrays WebGL

**Responsável:** _nome aqui_  
**Arquivo:** `src/loader/objParser.js`  
**Requisito avaliativo:** A (parte 2)

**O que fazer:**

1. Quando `type === 'f'`, parsear cada canto da face (`parts[1]`, `parts[2]`, …).
2. Tratar formato `v/vt/vn` — use só o índice de vértice (antes da `/`). Ex.: `"12/5/3"` → vértice `12`.
3. **Atenção:** índices no `.OBJ` começam em **1**; no JavaScript subtraia 1.
4. **Triangular quads:** o teapot usa faces de 4 lados. Use *fan triangulation*: triângulo `(0,1,2)` e `(0,2,3)`.
5. Montar arrays finais compatíveis com WebGL:
   - Opção indexada: `positions` + `normals` + `indices` (recomendado)
   - Ou expandir vértices duplicados por triângulo
6. Retornar `Float32Array` e `Uint32Array`; `vertexCount` = número de índices (ou vértices, se usar `drawArrays`).

**Exemplo de face quad:**

```
f 1/1/1 2/2/2 3/3/3 4/4/4   →  triângulos (1,2,3) e (1,3,4)
```

**Como testar:** após Tarefa 1, `mesh.vertexCount > 0` e o status na tela deixa de mostrar *"Parser .OBJ ainda não implementado"*.

**Pronto quando:** `parseObj()` retorna buffers válidos e `vertexCount > 0`.

---

### Tarefa 3 — Vertex shader (transformações no pipeline)

**Responsável:** _nome aqui_  
**Arquivo:** `shaders/shader.vert`  
**Requisito avaliativo:** B

**O que fazer:**

1. Calcular posição final no clip space:

   ```glsl
   gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
   ```

2. Passar dados ao fragment shader para iluminação (Tarefa 5):
   - `v_worldPos` = posição no espaço mundial (parte xyz de `u_model * vec4(a_position, 1.0)`)
   - `v_normal` = normal transformada (matriz normal ou rotação da `u_model`)

3. Remover o placeholder `gl_Position = vec4(a_position, 1.0)`.

**Como testar:** com Tarefas 2 e 4 prontas, o bule aparece na tela (mesmo sem sombreamento ainda).

**Pronto quando:** o modelo renderiza na posição correta, respondendo à câmera (`u_view` / `u_projection`).

---

### Tarefa 4 — Buffers WebGL e draw call

**Responsável:** _nome aqui_  
**Arquivo:** `src/main.js`  
**Requisito avaliativo:** B (CPU → GPU)

**O que fazer:**

1. Após `parseObj()`, criar buffers para posições, normais e índices:

   ```js
   const indexBuffer = createBuffer(gl, mesh.indices, gl.ELEMENT_ARRAY_BUFFER);
   ```

2. Configurar atributos `a_position` e `a_normal` com `vertexAttribPointer` (já esboçado — revisar tamanho/stride).
3. Trocar `gl.drawArrays` por `gl.drawElements`:

   ```js
   gl.drawElements(gl.TRIANGLES, mesh.vertexCount, gl.UNSIGNED_INT, 0);
   ```

4. (Opcional) Criar VAO com `gl.createVertexArray()` para organizar o setup.
5. Ajustar câmera em `lookAt` ou escala inicial se o bule sair fora da tela.

**Como testar:** bule visível ao rodar o servidor; sem erros no console do navegador (F12).

**Pronto quando:** geometria desenhada corretamente com `drawElements`.

---

### Tarefa 5 — Interatividade (CPU) + iluminação Lambert (GPU)

**Responsável:** _nome aqui_  
**Arquivos:** `src/main.js` + `shaders/shader.frag`  
**Requisito avaliativo:** C + D (diferencial)

**O que fazer — Interatividade (Requisito C):**

1. Em `render()`, montar a matriz de modelo a cada frame (já esboçado):

   ```js
   const rotY = mat4.rotateY((state.rotationYDeg * Math.PI) / 180);
   const scl = mat4.scale(state.scale, state.scale, state.scale);
   const model = mat4.multiply(scl, rotY);
   gl.uniformMatrix4fv(uniModel, false, model);
   ```

2. Confirmar que os sliders `#rotationY` e `#scale` alteram rotação Y e zoom em tempo real.
3. Garantir `gl.uniformMatrix4fv(..., false, matrix)` — o `false` indica **column-major** (padrão de `mat4.js`).

**O que fazer — Iluminação Lambert (Requisito D):**

1. Em `shader.frag`, substituir a cor sólida por:

   ```glsl
   vec3 N = normalize(v_normal);
   vec3 L = normalize(-u_lightDir);
   float diff = max(dot(N, L), 0.0);
   fragColor = vec4(u_objectColor * diff, 1.0);
   ```

2. Se as normais parecerem erradas, coordene com quem fez a Tarefa 2 (normais do `.obj` ou calculadas por face).

**Como testar:** mover os sliders e ver rotação/zoom; o bule deve ter volume (lados iluminados e em sombra).

**Pronto quando:** interação fluida + sombreamiento difuso visível.

---

### Checklist geral (marquem juntos na entrega)

- [ ] **A** — Parser `.OBJ` completo (Tarefas 1 + 2)
- [ ] **B** — Pipeline WebGL2 / ESSL 3.00 (Tarefas 3 + 4)
- [ ] **C** — Rotação Y e escala interativas (Tarefa 5)
- [ ] **D** — Iluminação difusa Lambert (Tarefa 5)

---

## Entrega da atividade

1. **Arquivo `.zip`** com todo o código do projeto.
2. **Vídeo curto** (YouTube/Drive) com:
   - Menção de **todos os integrantes** no início
   - Explicação dos recursos implementados
   - Demonstração da animação 3D em tempo real na tela

## Referências

- [Utah Teapot — University of Utah](https://graphics.cs.utah.edu/teapot/)
- [WebGL2 Fundamentals](https://webgl2fundamentals.org/)
- Modelo local: `assets/models/teapot.obj` (fonte: cursos CS6620, Utah)

## Créditos do modelo

O Utah Teapot é livre para uso. Identifique-o como **Utah Teapot** e reconheça a origem na University of Utah, conforme termos do repositório oficial.
