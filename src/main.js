import { createProgram, createBuffer, loadText } from './gl/glUtils.js';
import { parseObj } from './loader/objParser.js';
import * as mat4 from './math/mat4.js';

const statusEl = document.getElementById('status');
const canvas = document.getElementById('glcanvas');
const rotationSlider = document.getElementById('rotationY');
const scaleSlider = document.getElementById('scale');
const rotationValue = document.getElementById('rotationYValue');
const scaleValue = document.getElementById('scaleValue');

function setStatus(message) {
  statusEl.textContent = message;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
    canvas.width = displayWidth * dpr;
    canvas.height = displayHeight * dpr;
  }
}

/** Estado de interação (Requisito C) */
const state = {
  rotationYDeg: 0,
  scale: 1,
};

rotationSlider.addEventListener('input', () => {
  state.rotationYDeg = Number(rotationSlider.value);
  rotationValue.textContent = `${state.rotationYDeg}°`;
});

scaleSlider.addEventListener('input', () => {
  state.scale = Number(scaleSlider.value);
  scaleValue.textContent = state.scale.toFixed(2);
});

async function init() {
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const gl = canvas.getContext('webgl2');
  if (!gl) {
    setStatus('WebGL2 não disponível neste navegador.');
    return;
  }

  setStatus('Carregando shaders…');

  const [vertSource, fragSource] = await Promise.all([
    loadText('shaders/shader.vert'),
    loadText('shaders/shader.frag'),
  ]);

  const program = createProgram(gl, vertSource, fragSource);
  gl.useProgram(program);

  const attrPosition = gl.getAttribLocation(program, 'a_position');
  const attrNormal = gl.getAttribLocation(program, 'a_normal');
  const uniModel = gl.getUniformLocation(program, 'u_model');
  const uniView = gl.getUniformLocation(program, 'u_view');
  const uniProjection = gl.getUniformLocation(program, 'u_projection');
  const uniLightDir = gl.getUniformLocation(program, 'u_lightDir');
  const uniObjectColor = gl.getUniformLocation(program, 'u_objectColor');

  setStatus('Carregando teapot.obj…');

  const objText = await loadText('assets/models/teapot.obj');
  const mesh = parseObj(objText);

  if (mesh.vertexCount === 0) {
    setStatus('Parser .OBJ ainda não implementado — veja src/loader/objParser.js');
  }

  // TODO: criar VAO e configurar atributos quando o parser retornar dados válidos
  let positionBuffer = null;
  let normalBuffer = null;

  if (mesh.positions.length > 0) {
    positionBuffer = createBuffer(gl, mesh.positions);
    normalBuffer = createBuffer(gl, mesh.normals);
  }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.06, 0.06, 0.1, 1);

  const projection = mat4.perspective(
    (45 * Math.PI) / 180,
    canvas.width / canvas.height,
    0.1,
    1000
  );
  const view = mat4.lookAt([0, 30, 80], [0, 10, 0], [0, 1, 0]);

  function render() {
    resizeCanvas();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (!positionBuffer || mesh.vertexCount === 0) {
      requestAnimationFrame(render);
      return;
    }

    // TODO (Requisito C): montar matriz de modelo com rotação Y e escala
    const rotY = mat4.rotateY((state.rotationYDeg * Math.PI) / 180);
    const scl = mat4.scale(state.scale, state.scale, state.scale);
    const model = mat4.multiply(scl, rotY);

    gl.uniformMatrix4fv(uniModel, false, model);
    gl.uniformMatrix4fv(uniView, false, view);
    gl.uniformMatrix4fv(uniProjection, false, projection);
    gl.uniform3f(uniLightDir, 0.5, 1, 0.3);
    gl.uniform3f(uniObjectColor, 0.85, 0.75, 0.55);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(attrPosition);
    gl.vertexAttribPointer(attrPosition, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.enableVertexAttribArray(attrNormal);
    gl.vertexAttribPointer(attrNormal, 3, gl.FLOAT, false, 0, 0);

    // TODO: usar gl.drawElements se mesh.indices tiver dados
    gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);

    requestAnimationFrame(render);
  }

  setStatus(
    mesh.vertexCount > 0
      ? 'Renderizando — implemente iluminação e ajuste transforms nos shaders'
      : 'WebGL2 OK — implemente o parser .OBJ para ver o modelo'
  );

  requestAnimationFrame(render);
}

init().catch((err) => {
  console.error(err);
  setStatus(`Erro: ${err.message}`);
});
