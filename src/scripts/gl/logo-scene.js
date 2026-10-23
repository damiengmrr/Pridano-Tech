/*
 * Scène signature « Le point rejoint le réseau ».
 *
 * Le symbole officiel est rendu en volume par raymarching : son tracé vectoriel
 * (issu de la vectorisation du logo) est converti en champ de distance signé, extrudé
 * avec un biseau arrondi, puis éclairé comme une pièce de matière satinée.
 * Le point isolé est une sphère analytique : une union lisse (smooth min) le fait
 * fusionner organiquement avec la forme quand il s’en approche.
 *
 * Deux ambiances partagent le même objet : « nuit » (studio sombre, bande de lumière qui
 * balaie les biseaux, liseré cyan, halo) pour la cinématique d’ouverture, et « jour »
 * (matière satinée) pour le site. uMood passe de l’une à l’autre sans changer d’objet.
 *
 * Aucune dépendance. Un seul quad plein écran, une texture, un draw call.
 */

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `#version 300 es
precision highp float;
uniform sampler2D uSdf;
uniform vec2 uRes;
uniform float uTime;
uniform vec3 uDot;
uniform float uMerge;
uniform mat3 uRot;
uniform float uZoom;
uniform vec2 uShift;
uniform float uMood;
uniform float uSweep;
uniform float uGlow;
uniform vec4 uFrame;
out vec4 outColor;

uniform float S;
const float H = 0.17;
const float R = 0.115;

float smin(float a, float b, float k){
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
float sdShape(vec2 p){
  vec2 uv = vec2((p.x + S) / (2.0 * S), (S - p.y) / (2.0 * S));
  float d = texture(uSdf, clamp(uv, 0.002, 0.998)).r;
  vec2 e = abs(p) - vec2(S);
  return d + length(max(e, 0.0));
}
float sd2(vec2 p){
  float a = sdShape(p);
  float b = length(p - uDot.xy) - uDot.z;
  return smin(a, b, mix(0.015, 0.36, uMerge));
}
float map(vec3 p){
  p = uRot * p;
  float d = sd2(p.xy);
  vec2 w = vec2(d + R, abs(p.z) - H + R);
  return min(max(w.x, w.y), 0.0) + length(max(w, 0.0)) - R;
}
vec3 normalAt(vec3 p){
  const vec2 k = vec2(1.0, -1.0);
  const float h = 0.006;
  return normalize(k.xyy * map(p + k.xyy * h) + k.yyx * map(p + k.yyx * h) + k.yxy * map(p + k.yxy * h) + k.xxx * map(p + k.xxx * h));
}
float occlusion(vec3 p, vec3 n){
  float o = 0.0, s = 1.0;
  for (int i = 1; i <= 3; i++) {
    float h = 0.04 * float(i);
    o += (h - map(p + n * h)) * s;
    s *= 0.6;
  }
  return clamp(1.0 - 2.2 * o, 0.0, 1.0);
}
vec3 shade(vec3 p, vec3 rd){
  vec3 n = normalAt(p);
  vec3 q = uRot * p;
  float g = clamp(0.5 + 0.42 * (q.x * 0.7 + q.y * 0.7), 0.0, 1.0);
  vec3 deep = vec3(0.016, 0.38, 0.88);
  vec3 mid = vec3(0.02, 0.6, 1.0);
  vec3 cyan = vec3(0.16, 0.86, 1.0);
  vec3 base = mix(deep, mix(mid, cyan, smoothstep(0.45, 1.0, g)), smoothstep(0.0, 0.55, g));
  vec3 key = normalize(vec3(-0.55, 0.75, 0.85));
  vec3 fill = normalize(vec3(0.75, -0.35, 0.55));
  float wrap = clamp((dot(n, key) + 0.35) / 1.35, 0.0, 1.0);
  float dif = clamp(dot(n, key), 0.0, 1.0);
  float fil = clamp(dot(n, fill), 0.0, 1.0);
  float fre = pow(1.0 - clamp(dot(n, -rd), 0.0, 1.0), 3.0);
  vec3 hv = normalize(key - rd);
  float spe = pow(clamp(dot(n, hv), 0.0, 1.0), 40.0) * (0.35 + 0.65 * dif);
  float ao = occlusion(p, n);
  float face = smoothstep(0.55, 0.95, abs((uRot * n).z));
  vec3 col = base * (0.42 + 0.7 * wrap) * mix(0.82, 1.0, ao);
  col += base * vec3(0.55, 0.8, 1.0) * fil * 0.22;
  col += vec3(0.82, 0.96, 1.0) * spe * mix(0.75, 0.32, face);
  col += vec3(0.62, 0.9, 1.0) * fre * 0.28;
  col = mix(col, col * vec3(0.9, 0.97, 1.05), 0.3);
  if (uMood >= 0.999) return col;

  /* Nuit : matière sombre, bande de lumière (softbox) qui glisse sur les biseaux, liseré cyan. */
  vec3 r = reflect(rd, n);
  float band = exp(-pow((r.x * 0.82 + r.y * 0.58 - uSweep) * 3.4, 2.0)) * (1.0 - 0.92 * face);
  float floorLight = exp(-pow((r.y + 0.42) * 4.5, 2.0)) * 0.3;
  vec3 night = base * (0.06 + 0.05 * wrap);
  night += vec3(0.72, 0.93, 1.0) * band * (0.75 + 0.9 * fre);
  night += vec3(0.18, 0.72, 1.0) * fre * 0.85;
  night += vec3(0.85, 0.97, 1.0) * spe * 0.55;
  night += base * floorLight;
  return mix(night, col, uMood);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / uRes.y;
  uv = (uv - uShift) / uZoom;
  vec3 ro = vec3(0.0, 0.0, 7.0);
  vec3 rd = normalize(vec3(uv * 0.33, -1.0));

  float b = dot(ro, rd);
  float c = dot(ro, ro) - 2.25;
  float disc = b * b - c;
  float px = 0.33 / (uRes.y * uZoom);

  vec4 col = vec4(0.0);
  float tHit = -1.0;
  float bestD = 1e3, bestT = 0.0;
  if (disc > 0.0) {
    float t = -b - sqrt(disc);
    float tEnd = -b + sqrt(disc);
    for (int i = 0; i < 80; i++) {
      vec3 p = ro + rd * t;
      float d = map(p);
      if (d < bestD) { bestD = d; bestT = t; }
      if (d < 0.0008 * t) { tHit = t; break; }
      t += d * 0.92;
      if (t > tEnd) break;
    }
  }

  /* Ombre portée douce sur le plan arrière (le fond de page). */
  vec3 pw = ro + rd * ((ro.z + 0.9) / -rd.z);
  float sh = sd2(pw.xy - vec2(0.16, -0.24));
  float shadow = (1.0 - smoothstep(-0.25, 0.55, sh)) * 0.2;
  shadow *= 0.85 + 0.15 * sin(uTime * 0.6);
  vec2 sq = (gl_FragCoord.xy - uFrame.xy) / uFrame.zw;
  shadow *= smoothstep(0.0, 0.14, min(min(sq.x, 1.0 - sq.x), min(sq.y, 1.0 - sq.y))) * uMood;
  vec4 bg = vec4(vec3(0.06, 0.16, 0.34) * shadow, shadow);

  /* Halo (nuit) : lumière diffusée autour du volume, d’après la distance minimale du rayon. */
  if (uGlow > 0.0 && bestD < 1.0) {
    float halo = exp(-bestD * 7.0) * uGlow;
    bg += vec4(vec3(0.08, 0.5, 1.0) * halo, halo * 0.55);
  }

  if (tHit > 0.0) {
    vec3 p = ro + rd * tHit;
    col = vec4(shade(p, rd), 1.0);
  } else if (bestD < px * bestT * 1.6) {
    vec3 p = ro + rd * bestT;
    float a = 1.0 - smoothstep(0.0, px * bestT * 1.6, bestD);
    col = vec4(shade(p, rd) * a, a);
  }
  vec4 outc = col + bg * (1.0 - col.a);
  outColor = vec4(pow(max(outc.rgb, 0.0), vec3(1.0 / 1.1)), outc.a);
}`;

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

/*
 * Monte la scène. Retourne null si WebGL2 indisponible (le visuel statique reste affiché).
 * `sdf` : champ de distance du symbole (sdf-core.js). L’état est piloté par hero.js.
 */
/* Rendu logiciel (pas de GPU) : le raymarching y serait trop coûteux, le visuel statique reste affiché. */
function isSoftwareRenderer(gl) {
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const renderer = String(info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
}

export function createLogoScene(canvas, sdf, { onReady, onFail, allowSoftware = false } = {}) {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return null;
  if (!allowSoftware && isSoftwareRenderer(gl)) {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return null;
  }

  const parallel = gl.getExtension('KHR_parallel_shader_compile');
  const program = gl.createProgram();
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, sdf.size, sdf.size, 0, gl.RED, gl.FLOAT, sdf.data);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);

  let uniforms = null;
  let ready = false;
  let disposed = false;

  const finishLink = () => {
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn('[pridano] Scène 3D indisponible :', gl.getShaderInfoLog(fs) || gl.getProgramInfoLog(program));
      onFail?.();
      return false;
    }
    gl.useProgram(program);
    const loc = gl.getAttribLocation(program, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(['uSdf', 'uRes', 'uTime', 'uDot', 'uMerge', 'uRot', 'uZoom', 'uShift', 'uMood', 'uSweep', 'uGlow', 'uFrame', 'S'].map((n) => [n, gl.getUniformLocation(program, n)]));
    gl.uniform1i(uniforms.uSdf, 0);
    gl.uniform1f(uniforms.S, sdf.span);
    ready = true;
    onReady?.();
    return true;
  };

  /* Compilation non bloquante quand le navigateur la propose. */
  const poll = () => {
    if (disposed) return;
    if (parallel && !gl.getProgramParameter(program, parallel.COMPLETION_STATUS_KHR)) {
      setTimeout(poll, 32);
      return;
    }
    finishLink();
  };
  setTimeout(poll, 0);

  function rotation(yaw, pitch, roll) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    /* R = Rz(roll) * Rx(pitch) * Ry(yaw), transmise transposée (monde -> objet). */
    const m = [
      cr * cy - sr * sp * sy, -sr * cp, cr * sy + sr * sp * cy,
      sr * cy + cr * sp * sy, cr * cp, sr * sy - cr * sp * cy,
      -cp * sy, sp, cp * cy,
    ];
    return new Float32Array([m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]);
  }

  /*
   * mood : 1 = jour (site), 0 = nuit (ouverture). frame : zone [x, y, l, h] en pixels du canevas
   * (origine en bas) où l’ombre portée s’estompe ; par défaut le canevas entier.
   */
  function render({ width, height, time, dot, merge, yaw, pitch, roll, zoom, shift, mood = 1, sweep = 0, glow = 0, frame = null }) {
    if (!ready) return false;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
    gl.uniform2f(uniforms.uRes, width, height);
    gl.uniform1f(uniforms.uTime, time);
    gl.uniform3f(uniforms.uDot, dot[0], dot[1], dot[2]);
    gl.uniform1f(uniforms.uMerge, merge);
    gl.uniformMatrix3fv(uniforms.uRot, false, rotation(yaw, pitch, roll));
    gl.uniform1f(uniforms.uZoom, zoom);
    gl.uniform2f(uniforms.uShift, shift[0], shift[1]);
    gl.uniform1f(uniforms.uMood, mood);
    gl.uniform1f(uniforms.uSweep, sweep);
    gl.uniform1f(uniforms.uGlow, glow);
    const f = frame || [0, 0, width, height];
    gl.uniform4f(uniforms.uFrame, f[0], f[1], f[2], f[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  }

  function dispose() {
    disposed = true;
    gl.deleteProgram(program);
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  return { render, dispose, get ready() { return ready; } };
}
