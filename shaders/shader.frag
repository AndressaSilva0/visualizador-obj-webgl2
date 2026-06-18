#version 300 es
precision mediump float;

// TODO (Requisito D): iluminação difusa Lambert
in vec3 v_normal;
in vec3 v_worldPos;

uniform vec3 u_lightDir;
uniform vec3 u_objectColor;

out vec4 fragColor;

void main() {
  // TODO: normalizar v_normal, calcular dot(N, L) e aplicar cor difusa
  // fragColor = vec4(u_objectColor * max(dot(normalize(v_normal), normalize(-u_lightDir)), 0.0), 1.0);

  // Placeholder: cor sólida até implementar Lambert
  fragColor = vec4(u_objectColor, 1.0);
}
