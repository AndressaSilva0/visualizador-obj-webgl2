/**
 * Matrizes 4x4 em column-major (padrão WebGL/GPU).
 * Arrays Float32Array(16) — coluna 0: [0..3], coluna 1: [4..7], etc.
 */

export function createIdentity() {
  const out = new Float32Array(16);
  out[0] = out[5] = out[10] = out[15] = 1;
  return out;
}

export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[row] * b[col * 4 + 0] +
        a[4 + row] * b[col * 4 + 1] +
        a[8 + row] * b[col * 4 + 2] +
        a[12 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

export function rotateY(angleRad) {
  const c = Math.cos(angleRad);
  const s = Math.sin(angleRad);
  const out = createIdentity();
  out[0] = c;
  out[2] = s;
  out[8] = -s;
  out[10] = c;
  return out;
}

export function scale(sx, sy, sz) {
  const out = createIdentity();
  out[0] = sx;
  out[5] = sy;
  out[10] = sz;
  return out;
}

export function perspective(fovRad, aspect, near, far) {
  const f = 1 / Math.tan(fovRad / 2);
  const out = new Float32Array(16);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
  return out;
}

export function lookAt(eye, target, up) {
  const zx = eye[0] - target[0];
  const zy = eye[1] - target[1];
  const zz = eye[2] - target[2];
  let len = Math.hypot(zx, zy, zz);
  const z0 = zx / len;
  const z1 = zy / len;
  const z2 = zz / len;

  const xx = up[1] * z2 - up[2] * z1;
  const xy = up[2] * z0 - up[0] * z2;
  const xz = up[0] * z1 - up[1] * z0;
  len = Math.hypot(xx, xy, xz);
  const x0 = xx / len;
  const x1 = xy / len;
  const x2 = xz / len;

  const y0 = z1 * x2 - z2 * x1;
  const y1 = z2 * x0 - z0 * x2;
  const y2 = z0 * x1 - z1 * x0;

  const out = createIdentity();
  out[0] = x0;
  out[1] = y0;
  out[2] = z0;
  out[4] = x1;
  out[5] = y1;
  out[6] = z1;
  out[8] = x2;
  out[9] = y2;
  out[10] = z2;
  out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
  out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
  out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]);
  return out;
}
