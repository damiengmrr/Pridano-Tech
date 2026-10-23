var z=`#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`,I=`#version 300 es
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

  /* Nuit : mati\xE8re sombre, bande de lumi\xE8re (softbox) qui glisse sur les biseaux, liser\xE9 cyan. */
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

  /* Ombre port\xE9e douce sur le plan arri\xE8re (le fond de page). */
  vec3 pw = ro + rd * ((ro.z + 0.9) / -rd.z);
  float sh = sd2(pw.xy - vec2(0.16, -0.24));
  float shadow = (1.0 - smoothstep(-0.25, 0.55, sh)) * 0.2;
  shadow *= 0.85 + 0.15 * sin(uTime * 0.6);
  vec2 sq = (gl_FragCoord.xy - uFrame.xy) / uFrame.zw;
  shadow *= smoothstep(0.0, 0.14, min(min(sq.x, 1.0 - sq.x), min(sq.y, 1.0 - sq.y))) * uMood;
  vec4 bg = vec4(vec3(0.06, 0.16, 0.34) * shadow, shadow);

  /* Halo (nuit) : lumi\xE8re diffus\xE9e autour du volume, d\u2019apr\xE8s la distance minimale du rayon. */
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
}`;function _(o,f,d){let v=o.createShader(f);return o.shaderSource(v,d),o.compileShader(v),v}function q(o){let f=o.getExtension("WEBGL_debug_renderer_info"),d=String(f?o.getParameter(f.UNMASKED_RENDERER_WEBGL):o.getParameter(o.RENDERER));return/swiftshader|llvmpipe|softpipe|software|basic render/i.test(d)}function C(o,f,{onReady:d,onFail:v,allowSoftware:w=!1}={}){let e=o.getContext("webgl2",{antialias:!1,alpha:!0,premultipliedAlpha:!0,powerPreference:"low-power",preserveDrawingBuffer:!1});if(!e)return null;if(!w&&q(e))return e.getExtension("WEBGL_lose_context")?.loseContext(),null;let E=e.getExtension("KHR_parallel_shader_compile"),i=e.createProgram(),A=_(e,e.VERTEX_SHADER,z),R=_(e,e.FRAGMENT_SHADER,I);e.attachShader(i,A),e.attachShader(i,R),e.linkProgram(i);let g=e.createTexture();e.bindTexture(e.TEXTURE_2D,g),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.R16F,f.size,f.size,0,e.RED,e.FLOAT,f.data);let T=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,T),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW);let t=null,b=!1,y=!1,D=()=>{if(!e.getProgramParameter(i,e.LINK_STATUS))return console.warn("[pridano] Sc\xE8ne 3D indisponible :",e.getShaderInfoLog(R)||e.getProgramInfoLog(i)),v?.(),!1;e.useProgram(i);let a=e.getAttribLocation(i,"aPos");return e.enableVertexAttribArray(a),e.vertexAttribPointer(a,2,e.FLOAT,!1,0,0),t=Object.fromEntries(["uSdf","uRes","uTime","uDot","uMerge","uRot","uZoom","uShift","uMood","uSweep","uGlow","uFrame","S"].map(n=>[n,e.getUniformLocation(i,n)])),e.uniform1i(t.uSdf,0),e.uniform1f(t.S,f.span),b=!0,d?.(),!0},S=()=>{if(!y){if(E&&!e.getProgramParameter(i,E.COMPLETION_STATUS_KHR)){setTimeout(S,32);return}D()}};setTimeout(S,0);function P(a,n,x){let s=Math.cos(a),c=Math.sin(a),p=Math.cos(n),l=Math.sin(n),u=Math.cos(x),m=Math.sin(x),r=[u*s-m*l*c,-m*p,u*c+m*l*s,m*s+u*l*c,u*p,m*c-u*l*s,-p*c,l,p*s];return new Float32Array([r[0],r[3],r[6],r[1],r[4],r[7],r[2],r[5],r[8]])}function M({width:a,height:n,time:x,dot:s,merge:c,yaw:p,pitch:l,roll:u,zoom:m,shift:r,mood:k=1,sweep:F=0,glow:U=0,frame:G=null}){if(!b)return!1;(o.width!==a||o.height!==n)&&(o.width=a,o.height=n),e.viewport(0,0,a,n),e.uniform2f(t.uRes,a,n),e.uniform1f(t.uTime,x),e.uniform3f(t.uDot,s[0],s[1],s[2]),e.uniform1f(t.uMerge,c),e.uniformMatrix3fv(t.uRot,!1,P(p,l,u)),e.uniform1f(t.uZoom,m),e.uniform2f(t.uShift,r[0],r[1]),e.uniform1f(t.uMood,k),e.uniform1f(t.uSweep,F),e.uniform1f(t.uGlow,U);let h=G||[0,0,a,n];return e.uniform4f(t.uFrame,h[0],h[1],h[2],h[3]),e.drawArrays(e.TRIANGLES,0,3),!0}function L(){y=!0,e.deleteProgram(i),e.deleteTexture(g),e.deleteBuffer(T),e.getExtension("WEBGL_lose_context")?.loseContext()}return{render:M,dispose:L,get ready(){return b}}}export{C as createLogoScene};
