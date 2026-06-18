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

## O que falta implementar (checklist da avaliação)

### A. Parser .OBJ (`src/loader/objParser.js`)

- [ ] Extrair coordenadas de vértices (`v x y z`)
- [ ] Extrair índices de faces (`f ...`)
- [ ] Triangular polígonos (o teapot usa quads: `f v1 v2 v3 v4`)
- [ ] Tratar formato `f v/vt/vn` (usar índice de vértice; normal opcional do arquivo ou calculada)
- [ ] Retornar `Float32Array` / `Uint32Array` prontos para `gl.bufferData`

### B. Pipeline gráfico (shaders)

- [ ] **Vertex shader:** `in vec3 a_position`, uniform `mat4 u_model`, calcular `gl_Position` no clip space
- [ ] **Fragment shader:** `precision mediump float` no topo, cor final do fragmento
- [ ] Garantir que `gl.uniformMatrix4fv(..., false, matrix)` usa arrays **column-major** (já é o padrão de `mat4.js`)

### C. Transformações e interatividade

- [ ] Aplicar rotação em torno do eixo Y (slider já existe)
- [ ] Aplicar escala para zoom (slider já existe)
- [ ] Enviar matriz de modelo atualizada a cada frame via uniform

### D. Iluminação difusa (diferencial)

- [ ] Normais por vértice (do `.obj` ou calculadas por face)
- [ ] Lei de Lambert no fragment shader: `max(dot(N, L), 0.0)`
- [ ] Passar normal transformada do vertex para o fragment shader

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
