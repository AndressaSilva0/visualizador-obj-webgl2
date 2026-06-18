#version 300 es

// TODO (Requisito B): receber posições via atributo e aplicar matriz de transformação
in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

out vec3 v_normal;
out vec3 v_worldPos;

void main() {
  // TODO: calcular posição no clip space (gl_Position)
  // Dica: gl_Position = u_projection * u_view * u_model * vec4(a_position, 1.0);
  gl_Position = vec4(a_position, 1.0);

  // TODO: transformar normal para o espaço mundial (para iluminação Lambert)
  v_normal = a_normal;
  v_worldPos = a_position;
}
