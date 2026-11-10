/*
  hero3d.js - the hero's 3D stage: the logo's oval as a running track, a phone standing on the
  infield with the app's Today screen, and a runner's light circling the lanes at 180 steps a
  minute (the rhythm of the promo film). Plain WebGL2, no library.

  <div class="hero__stage" data-hero3d data-screen="assets/img/screen-today.webp">
    <picture>…<img class="is-cutout" src="assets/hero/hero-still.webp" …></picture>
  </div>

  The still under it is this scene's own render (tools/make-stills.cjs). The live scene replaces it
  only from 768px up, with WebGL2 and without prefers-reduced-motion; everywhere else the still
  stands. One context, paused off screen and in a hidden tab, with a pause button (the loop runs
  longer than five seconds). The camera leans a little towards the pointer.

  ?still=<seconds> draws one frame at that time and holds it (make-stills.cjs uses it).
*/
const TAU = Math.PI * 2;
const hex = (h, a = 1) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255, a];
const C = {
  track: hex('#2b343a'), wall: hex('#1b2126'), line: hex('#f5f4f2'), orange: hex('#f26b38'),
  body: hex('#242c32'), shadow: hex('#242c32'), infield: hex('#eae8e5')
};

/* ---- small matrix kit (column-major) ---- */
const m4 = {
  mul(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; },
  persp(fov, asp, n, f) { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; },
  look(e, c, u) {
    const z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross(u, z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]);
  },
  trs(t, ry = 0, rx = 0, s = [1, 1, 1]) {
    const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx);
    // T * Ry * Rx * S
    return new Float32Array([
      cy * s[0], 0, -sy * s[0], 0,
      sy * sx * s[1], cx * s[1], cy * sx * s[1], 0,
      sy * cx * s[2], -sx * s[2], cy * cx * s[2], 0,
      t[0], t[1], t[2], 1]);
  }
};
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/* ---- shaders ---- */
const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec2 aUv;
uniform mat4 uVP, uM; out vec3 vNor; out vec2 vUv; out vec3 vW;
void main(){ vec4 w = uM * vec4(aPos,1.); vW = w.xyz; vNor = mat3(uM) * aNor; vUv = aUv; gl_Position = uVP * w; }`;
const FS = `#version 300 es
precision highp float;
in vec3 vNor; in vec2 vUv; in vec3 vW; out vec4 o;
uniform int uMode; uniform vec4 uCol, uCol2, uCol3; uniform float uRun, uPulse, uLanes; uniform vec3 uEye; uniform sampler2D uTex;
const vec3 L = normalize(vec3(-.35, .86, .45));
void main(){
  vec3 n = normalize(vNor);
  if (uMode == 0) {                                   // the track's top: lanes, lines, the runner's trail
    float t = vUv.x, s = vUv.y, lt = t * uLanes, f = abs(fract(lt + .5) - .5), w = fwidth(lt);
    float inner = step(.5, lt) * step(lt, uLanes - .5);
    float line = (1. - smoothstep(.035, .035 + w * 1.5, f)) * inner * .42;
    float edge = 1. - smoothstep(.0, .06 + w, min(t, 1. - t) * uLanes);
    vec3 col = mix(uCol.rgb, uCol2.rgb, max(line, edge * .5));
    float d = fract(uRun - s), len = .42;
    float trail = d < len ? pow(1. - d / len, 1.6) : 0.;
    float lane = smoothstep(1.02, 1.02 + w * 2., lt) * (1. - smoothstep(1.98 - w * 2., 1.98, lt));
    col = mix(col, uCol3.rgb, trail * lane * .96);
    float head = exp(-d * 90.) + exp(-(1. - d) * 240.);
    col += uCol3.rgb * head * lane * (.35 + .25 * uPulse);
    o = vec4(col, 1.);
  } else if (uMode == 1) {                            // a lit solid: the phone's body, the track's walls
    float dif = max(dot(n, L), 0.);
    vec3 v = normalize(uEye - vW);
    float rim = pow(1. - max(dot(n, v), 0.), 3.) * .22;
    o = vec4(uCol.rgb * (.62 + .5 * dif) + rim, 1.);
  } else if (uMode == 2) {                            // the phone's screen: the app, unlit, with a soft sheen
    vec3 c = texture(uTex, vUv).rgb;
    vec3 v = normalize(uEye - vW);
    float sheen = pow(max(dot(reflect(-L, n), v), 0.), 24.) * .10;
    o = vec4(c + sheen, 1.);
  } else if (uMode == 3) {                            // a soft round blob: a contact shadow or the runner's glow
    float r = length(vUv - .5) * 2.;
    float a = pow(clamp(1. - r, 0., 1.), 2.) * uCol.a;
    o = vec4(uCol.rgb * a, a);
  } else if (uMode == 4) {                            // the track's shadow on the ground: soft across its width
    float a = pow(sin(clamp(vUv.x, 0., 1.) * 3.14159), 1.4) * uCol.a;
    o = vec4(uCol.rgb * a, a);
  } else {                                            // the runner: a small bright ball
    vec3 v = normalize(uEye - vW);
    float k = max(dot(n, v), 0.);
    o = vec4(mix(uCol.rgb, vec3(1., .86, .74), pow(k, 3.) * .55), 1.);
  }
}`;

/* ---- meshes: interleaved pos(3) nor(3) uv(2) ---- */
function stadium(a, n = 44) {
  // skeleton point (x, z) and outward normal (nx, nz) round the loop, with arc length at radius 1
  const p = [];
  const seg = (x0, x1, nz, k) => { for (let i = 0; i < k; i++) { const u = i / k; p.push([x0 + (x1 - x0) * u, 0, 0, nz]); } };
  const arc = (cx, a0, k) => { for (let i = 0; i < k; i++) { const t = a0 - Math.PI * i / k; p.push([cx, 0, Math.cos(t), Math.sin(t)]); } };
  seg(-a, a, 1, 10); arc(a, Math.PI / 2, n); seg(a, -a, -1, 10); arc(-a, -Math.PI / 2, n);
  p.push(p[0]);
  return p;
}
function ribbon(a, r0, r1, y, rm) {
  const pts = stadium(a), v = [], idx = [];
  let s = 0; const ss = [0];
  for (let i = 1; i < pts.length; i++) {
    const A = pts[i - 1], B = pts[i];
    s += Math.hypot((B[0] + B[2] * rm) - (A[0] + A[2] * rm), (B[3] - A[3]) * rm); ss.push(s);
  }
  pts.forEach((q, i) => {
    for (const [r, t] of [[r0, 0], [r1, 1]]) v.push(q[0] + q[2] * r, y, q[1] + q[3] * r, 0, 1, 0, t, ss[i] / s);
    if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); }
  });
  return { v, idx, len: s, pts, ss };
}
function wall(a, r, y0, y1, out) {
  const pts = stadium(a), v = [], idx = [];
  pts.forEach((q, i) => {
    const nx = q[2] * out, nz = q[3] * out;
    v.push(q[0] + q[2] * r, y0, q[1] + q[3] * r, nx, 0, nz, 0, 0, q[0] + q[2] * r, y1, q[1] + q[3] * r, nx, 0, nz, 0, 1);
    if (i) { const k = i * 2; idx.push(k - 2, k, k - 1, k - 1, k, k + 1); }
  });
  return { v, idx };
}
function roundRect(w, h, c, k = 12) {
  const o = [];
  for (const [cx, cy, a0] of [[w / 2 - c, h / 2 - c, 0], [-w / 2 + c, h / 2 - c, Math.PI / 2], [-w / 2 + c, -h / 2 + c, Math.PI], [w / 2 - c, -h / 2 + c, Math.PI * 1.5]])
    for (let i = 0; i <= k; i++) { const t = a0 + (Math.PI / 2) * i / k; o.push([cx + Math.cos(t) * c, cy + Math.sin(t) * c, Math.cos(t), Math.sin(t)]); }
  return o;
}
function slab(w, h, c, d) {                             // the phone's body: front, back and the rounded side
  const o = roundRect(w, h, c), v = [], idx = [], n = o.length;
  for (const [z, nz] of [[d / 2, 1], [-d / 2, -1]]) {
    const b = v.length / 8; v.push(0, 0, z, 0, 0, nz, 0, 0);
    o.forEach(p => v.push(p[0], p[1], z, 0, 0, nz, 0, 0));
    for (let i = 0; i < n; i++) { const i0 = b + 1 + i, i1 = b + 1 + (i + 1) % n; nz > 0 ? idx.push(b, i0, i1) : idx.push(b, i1, i0); }
  }
  const b = v.length / 8;
  o.forEach(p => { v.push(p[0], p[1], d / 2, p[2], p[3], 0, 0, 0, p[0], p[1], -d / 2, p[2], p[3], 0, 0, 0); });
  for (let i = 0; i < n; i++) { const k = b + i * 2, m = b + ((i + 1) % n) * 2; idx.push(k, k + 1, m, m, k + 1, m + 1); }
  return { v, idx };
}
function face(w, h, c, z) {                             // the screen, with the screenshot's uv
  const o = roundRect(w, h, c), v = [0, 0, z, 0, 0, 1, .5, .5], idx = [], n = o.length;
  o.forEach(p => v.push(p[0], p[1], z, 0, 0, 1, p[0] / w + .5, .5 - p[1] / h));
  for (let i = 0; i < n; i++) idx.push(0, 1 + i, 1 + (i + 1) % n);
  return { v, idx };
}
function quad() { return { v: [-.5, 0, -.5, 0, 1, 0, 0, 0, .5, 0, -.5, 0, 1, 0, 1, 0, .5, 0, .5, 0, 1, 0, 1, 1, -.5, 0, .5, 0, 1, 0, 0, 1], idx: [0, 2, 1, 0, 3, 2] }; }
function ball(k = 16) {
  const v = [], idx = [];
  for (let i = 0; i <= k; i++) for (let j = 0; j <= k * 2; j++) {
    const th = Math.PI * i / k, ph = TAU * j / (k * 2), x = Math.sin(th) * Math.cos(ph), y = Math.cos(th), z = Math.sin(th) * Math.sin(ph);
    v.push(x, y, z, x, y, z, 0, 0);
    if (i < k && j < k * 2) { const a = i * (k * 2 + 1) + j, b = a + k * 2 + 1; idx.push(a, a + 1, b, b, a + 1, b + 1); }
  }
  return { v, idx };
}

export function mount(stage, opts = {}) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) return null;
  stage.append(canvas);

  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const U = {}; for (const n of ['uVP', 'uM', 'uMode', 'uCol', 'uCol2', 'uCol3', 'uRun', 'uPulse', 'uLanes', 'uEye', 'uTex']) U[n] = gl.getUniformLocation(prog, n);
  const mesh = ({ v, idx }) => {
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
    return { vao, n: idx.length };
  };
  const I = m4.trs([0, 0, 0]);
  const draw = (m, mode, M = I, col = [0, 0, 0, 1]) => { gl.uniform1i(U.uMode, mode); gl.uniformMatrix4fv(U.uM, false, M); gl.uniform4fv(U.uCol, col); gl.bindVertexArray(m.vao); gl.drawElements(gl.TRIANGLES, m.n, gl.UNSIGNED_SHORT, 0); };

  /* the world, in metres of an imaginary desk-size track */
  const R0 = 1.02, R1 = 1.6, TH = 0.07, LANES = 6;                      // inner and outer radius, thickness, lanes
  const RL = R0 + (R1 - R0) * (1.5 / LANES);                             // the runner's lane (the second from inside)
  const PH = 3.3, PW = PH * 406 / 860, PD = 0.13, BZ = 0.055;           // the phone
  let A = 3.3, G = null;
  const build = a => {
    A = a;
    const top = ribbon(a, R0, R1, TH, RL);
    G = {
      top: mesh(top), path: top,
      shadow: mesh(ribbon(a, R0 - .42, R1 + .5, 0.001, RL)),
      wo: mesh(wall(a, R1, 0, TH, 1)), wi: mesh(wall(a, R0, 0, TH, -1)),
      body: mesh(slab(PW, PH, .26, PD)), screen: mesh(face(PW - BZ * 2, PH - BZ * 2, .26 - BZ, PD / 2 + .003)),
      quad: mesh(quad()), ball: mesh(ball())
    };
  };

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([245, 244, 242, 255]));
  let ready = false;
  const img = new Image();
  img.onload = () => {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const ext = gl.getExtension('EXT_texture_filter_anisotropic');
    if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    ready = true; opts.onready && opts.onready(); if (!running) frame(lastT);
  };
  img.src = stage.dataset.screen;

  let W = 0, H = 0, asp = 2;
  const resize = () => {
    const r = stage.getBoundingClientRect(), dpr = Math.min(opts.dpr || window.devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (w === W && h === H) return;
    W = canvas.width = w; H = canvas.height = h; asp = w / h;
    const a = asp > 1.7 ? 3.3 : asp > 1.15 ? 1.9 : 0.4;
    if (!G || a !== A) build(a);
    if (!running) frame(lastT);
  };

  /* the runner's place on the loop: s in 0..1 along the lane */
  const at = s => {
    const { pts, ss, len } = G.path, d = ((s % 1) + 1) % 1 * len;
    let i = 1; while (i < ss.length - 1 && ss[i] < d) i++;
    const u = (d - ss[i - 1]) / Math.max(1e-6, ss[i] - ss[i - 1]), p = pts[i - 1], q = pts[i];
    const x = (p[0] + p[2] * RL) + ((q[0] + q[2] * RL) - (p[0] + p[2] * RL)) * u, z = (p[3] * RL) + (q[3] * RL - p[3] * RL) * u;
    return [x, z];
  };

  let px = 0, py = 0, cx = 0, cy = 0, lastT = opts.still ?? 0, running = false, raf = 0, t0 = 0, paused = false, visible = true;
  const LAP = 9.6;                                                       // seconds a lap: 28.8 steps at 180 a minute
  function frame(t) {
    lastT = t;
    if (!W) return;
    cx += (px - cx) * .06; cy += (py - cy) * .06;
    const yaw = -0.16 + cx * .13 + Math.sin(t * .23) * .018, pitch = (asp > 1.15 ? .30 : .42) - cy * .05;
    const fov = 24 * Math.PI / 180, needW = 2 * (A + R1) * (asp > 1.7 ? 1.04 : 1.12), needH = asp > 1.15 ? 4.7 : 5.8;
    const dist = Math.max(needH, needW / asp) / (2 * Math.tan(fov / 2));
    const target = [0, asp > 1.15 ? 1.42 : 1.5, .1];
    const eye = [target[0] + Math.sin(yaw) * Math.cos(pitch) * dist, target[1] + Math.sin(pitch) * dist, target[2] + Math.cos(yaw) * Math.cos(pitch) * dist];
    const VP = m4.mul(m4.persp(fov, asp, .5, 60), m4.look(eye, target, [0, 1, 0]));

    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniform3fv(U.uEye, eye); gl.uniform1f(U.uLanes, LANES);
    const run = (t / LAP + .86) % 1, step = (t * 3) % 1, pulse = Math.exp(-step * 5);
    gl.uniform1f(U.uRun, run); gl.uniform1f(U.uPulse, pulse);
    gl.uniform4fv(U.uCol2, C.line); gl.uniform4fv(U.uCol3, C.orange);

    // soft things first, blended, without writing depth
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.CULL_FACE);
    draw(G.shadow, 4, m4.trs([.06, 0, .12]), [C.shadow[0], C.shadow[1], C.shadow[2], .2]);
    draw(G.quad, 3, m4.trs([.12, .002, .22], 0, 0, [PW * 2.6, 1, 1.9]), [C.shadow[0], C.shadow[1], C.shadow[2], .3]);
    draw(G.quad, 3, m4.trs([.02, .003, .06], -.2, 0, [PW * 1.25, 1, .42]), [C.shadow[0], C.shadow[1], C.shadow[2], .55]);

    gl.enable(gl.DEPTH_TEST); gl.depthMask(true);
    draw(G.wo, 1, I, C.wall); draw(G.wi, 1, I, C.wall);
    draw(G.top, 0, I, C.track);
    const PM = m4.mul(m4.trs([0, .012, 0], -.2, -.085), m4.trs([0, PH / 2, 0]));
    draw(G.body, 1, PM, C.body);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex); gl.uniform1i(U.uTex, 0);
    draw(G.screen, 2, PM);
    const [rx, rz] = at(run), ry = TH + .085 + pulse * .03;
    draw(G.ball, 5, m4.trs([rx, ry, rz], 0, 0, [.085, .085, .085]), C.orange);
    // the runner's glow on the track, over everything it lights
    gl.depthMask(false);
    draw(G.quad, 3, m4.trs([rx, TH + .004, rz], 0, 0, [.95, 1, .95]), [C.orange[0], C.orange[1], C.orange[2], .34 + pulse * .18]);
    gl.depthMask(true);
  }
  const loop = now => {
    if (!running) return;
    if (!t0) t0 = now - lastT * 1000;
    frame((now - t0) / 1000);
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const want = !paused && visible && !document.hidden && opts.still == null;
    if (want && !running) { running = true; t0 = 0; raf = requestAnimationFrame(loop); }
    else if (!want && running) { running = false; cancelAnimationFrame(raf); }
  };

  new ResizeObserver(resize).observe(stage); resize();
  if (opts.still == null) {
    new IntersectionObserver(e => { visible = e[0].isIntersecting; sync(); }, { rootMargin: '80px' }).observe(stage);
    document.addEventListener('visibilitychange', sync);
    if (matchMedia('(hover: hover) and (pointer: fine)').matches)
      addEventListener('pointermove', e => { px = e.clientX / innerWidth * 2 - 1; py = e.clientY / innerHeight * 2 - 1; }, { passive: true });
  }
  canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); running = false; cancelAnimationFrame(raf); stage.classList.remove('is-live'); });
  sync();
  return { canvas, isReady: () => ready, setPaused(p) { paused = p; sync(); }, frame };
}

/* ---- the page ---- */
const stage = document.querySelector('[data-hero3d]');
if (stage) {
  const q = new URLSearchParams(location.search), still = q.has('still') ? +q.get('still') : null;
  const wide = matchMedia('(min-width: 768px)').matches, calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (still != null || (wide && !calm)) {
    try {
      const s = mount(stage, {
        still: still ?? undefined, dpr: still != null ? 2 : undefined,
        onready() { stage.classList.add('is-live'); document.documentElement.dataset.hero3d = 'ready'; }
      });
      if (s && still != null) window.__hero3d = s;
      if (s && still == null) {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'loop-pause'; b.setAttribute('aria-pressed', 'false'); b.setAttribute('aria-label', 'Pause the track animation');
        const icon = on => b.innerHTML = on ? '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z"/></svg>' : '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M2.5 1.5h3v11h-3zM8.5 1.5h3v11h-3z"/></svg>';
        icon(false);
        b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'Play the track animation' : 'Pause the track animation'); icon(on); s.setPaused(on); });
        stage.append(b);
      }
    } catch (e) { stage.classList.remove('is-live'); }
  }
}
