/**
 * Parser de arquivos .OBJ
 *
 * TODO (Requisito A): implementar leitura completa de vértices (v) e faces (f).
 * - Triangular faces com mais de 3 vértices (fan triangulation)
 * - Suportar formato f v/vt/vn (usar apenas índice de vértice e normal)
 * - Retornar arrays lineares compatíveis com WebGL2 (Float32Array)
 */

/**
 * @param {string} objText Conteúdo textual do arquivo .obj
 * @returns {{ positions: Float32Array, normals: Float32Array, indices: Uint32Array, vertexCount: number }}
 */
export function parseObj(objText) {
  const rawPositions = [];
  const rawNormals = [];
  const indices = [];

  const lines = objText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const parts = trimmed.split(/\s+/);
    const type = parts[0];

    if (type === 'v') {
      // TODO: extrair x, y, z e push em rawPositions
      continue;
    }

    if (type === 'vn') {
      // TODO: extrair nx, ny, nz e push em rawNormals
      continue;
    }

    if (type === 'f') {
      // TODO: parsear índices da face e triangular se necessário
      // Formato comum: "f 1/1/1 2/2/2 3/3/3" ou "f 1 2 3 4"
      continue;
    }
  }

  // TODO: montar buffers interleaved ou indexados para WebGL
  // Se não houver normais no arquivo, calcule-as a partir das faces (Requisito D)

  return {
    positions: new Float32Array(rawPositions),
    normals: new Float32Array(rawNormals),
    indices: new Uint32Array(indices),
    vertexCount: indices.length,
  };
}
