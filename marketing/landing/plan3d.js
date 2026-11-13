/*
  plan3d.js - KM 1: you run down a road through the 19 weeks of a real half marathon plan.
  Weekly volume stands as pillars on both sides (height = km x 0.42), phase gates span the road,
  race day is the orange finish arch. Plain WebGL2, one context, one program. The sky is CSS behind
  the transparent canvas; labels are DOM, projected every frame.

  createPlan(canvas, labelsEl, { km, phase, colors, names }) -> { render(p, yaw, horizonRGB, groundRGB), resize() }
  p is the scroll progress 0..1: the camera only moves when p moves.
*/
const WEEK = 26, HEIGHT = 0.42, ROAD = 7;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec3 aCol;
uniform mat4 uVP; out vec3 vW; out vec3 vN; out vec3 vC;
void main(){ vW = aPos; vN = aNor; vC = aCol; gl_Position = uVP * vec4(aPos, 1.); }`;
const FS = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vC; out vec4 o;
uniform int uMode; uniform vec3 uEye, uFog, uGround; uniform float uDay;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
const vec3 L = normalize(vec3(-.35, .86, .45));
void main(){
  vec3 col;
  if (uMode == 0) {                       // the road: asphalt, six lanes, dashed lines
    float ax = abs(vW.x);
    col = vec3(.169, .204, .227);
    float w = fwidth(vW.x) * 1.2;
    float lane = 1. - smoothstep(.07, .07 + w, abs(fract(ax / 2. + .5) - .5) * 2.);
    float dash = step(fract(vW.z / 6.), .5);
    float edge = 1. - smoothstep(.1, .1 + w, abs(ax - 6.));
    float inside = step(ax, 5.);
    col = mix(col, vec3(.96, .957, .949), max(lane * dash * inside * .5, edge * .75));
  } else if (uMode == 2) {                // the ground either side
    col = uGround;
  } else if (uMode == 3) {                // a building: one floor per kilometre, windows lit at dawn
    vec3 n = normalize(vN);
    float d = max(dot(n, L), 0.);
    vec3 wall = vC * (.58 + .5 * d);
    if (n.y > .5) { col = vC * .5; }
    else {
      float u = abs(n.x) > .5 ? vW.z : vW.x;
      vec2 cell = vec2(u / .95, vW.y / ${HEIGHT});
      vec2 id = floor(cell), f = fract(cell);
      float ax = fwidth(cell.x) * 1.5, ay = fwidth(cell.y) * 1.5;
      float win = smoothstep(.2, .2 + ax, f.x) * (1. - smoothstep(.8 - ax, .8, f.x)) * smoothstep(.3, .3 + ay, f.y) * (1. - smoothstep(.82 - ay, .82, f.y));
      win = mix(win, .3, clamp(max(ax, ay) * .9, 0., 1.));           // far away the grid melts into a tone
      float lit = step(hash(id + floor(vW.z / 26.) * 3.7 + n.x * 11.), mix(.5, 0., smoothstep(.12, .55, uDay)));
      vec3 glass = mix(vec3(.13, .18, .22), uFog, .38 + .2 * uDay);
      vec3 pane = mix(glass, vec3(1., .8, .46), lit);
      col = mix(wall, pane, win);
      col *= 1. - .1 * (1. - smoothstep(0., .08, f.y));               // the floor line
      if (cell.y < 1.) col = mix(wall * .5, glass * .9, smoothstep(.15, .2, f.x) * (1. - smoothstep(.86, .9, f.x)) * step(.12, f.y) * .8);   // the ground floor: shopfronts
    }
  } else {                                // gates, pavement, trees, lamps
    float d = max(dot(normalize(vN), L), 0.);
    col = vC * (.6 + .5 * d);
  }
  float f = exp(-.0045 * distance(vW, uEye));
  o = vec4(mix(uFog, col, f), 1.);
}`;

const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2), o = new Float32Array(16); o[0] = t / asp; o[5] = t; o[10] = (f + n) / (n - f); o[11] = -1; o[14] = 2 * f * n / (n - f); return o; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return a.map(v => v / l); };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const look = (e, c, u) => { const z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross(u, z)), y = cross(z, x); return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1]); };
const mul = (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; };

export function createPlan(canvas, labelsEl, data) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'low-power' });
  if (!gl) throw new Error('no webgl2');
  const sh = (t, s) => { const x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x)); return x; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const U = {}; for (const n of ['uVP', 'uMode', 'uEye', 'uFog', 'uGround', 'uDay']) U[n] = gl.getUniformLocation(prog, n);

  /* geometry */
  const mesh = v => { const vao = gl.createVertexArray(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW); for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, i * 12); } return { vao, n: v.length / 9 }; };
  const quad = (x0, x1, z0, z1, y) => { const v = []; for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z0], [x1, z1], [x0, z1]]) v.push(x, y, z, 0, 1, 0, 0, 0, 0); return v; };
  const boxes = [], towers = [];
  const box = (cx, cy, cz, sx, sy, sz, c, boxes_ = boxes) => {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    const f = (n, pts, k = 1) => { for (const i of [0, 1, 2, 0, 2, 3]) boxes_.push(...pts[i], ...n, c[0] * k, c[1] * k, c[2] * k); };
    f([0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]);
    f([0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]]);
    f([1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]]);
    f([-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]);
    f([0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], 1.08);
  };
  const N = data.km.length, END = N * WEEK, cols = data.colors.map(hex), labels = [];
  const label = (cls, htmlText, pos) => { const el = document.createElement('span'); el.className = cls; el.innerHTML = htmlText; labelsEl.append(el); labels.push({ el, pos, op: -1, gate: cls.includes('gate') }); };
  data.km.forEach((km, i) => {
    const zc = -(i * WEEK + WEEK / 2), h = km * HEIGHT, c = cols[data.phase(i)];
    for (const sx of [-1, 1]) {
      box(sx * 12, h / 2, zc, 6.65, h, 15.2, c, towers);                                   // the week: km floors
      box(sx * 12.6, h + 0.5, zc - 3, 2, 1, 2.6, [c[0] * 0.55, c[1] * 0.55, c[2] * 0.55]);  // stair head on the roof
      box(sx * 11.2, h + 0.3, zc + 4, 1.2, 0.6, 1.2, [0.5, 0.52, 0.54]);
    }
    label('', `<small>WEEK ${i + 1}</small>${km} km`, [11.4, h + 1.6, zc + 7]);
  });
  // the street between the weeks: pavement, a tree and a lamp in every gap
  for (const sx of [-1, 1]) box(sx * 7.8, 0.06, (60 - END - 120) / 2, 1.6, 0.12, END + 180, [0.6, 0.58, 0.55]);
  for (let i = 0; i <= N; i++) for (const sx of [-1, 1]) {
    const z = -(i * WEEK);
    box(sx * 9.6, 0.8, z + 2.6, 0.3, 1.6, 0.3, [0.36, 0.27, 0.2]); box(sx * 9.6, 2.5, z + 2.6, 2.2, 1.9, 2.2, [0.24, 0.42, 0.33]); box(sx * 9.6, 3.9, z + 2.6, 1.4, 1.1, 1.4, [0.28, 0.48, 0.37]);
    box(sx * 7.6, 2.6, z - 2.8, 0.16, 5.2, 0.16, [0.2, 0.23, 0.25]); box(sx * 7.1, 5.2, z - 2.8, 1.1, 0.12, 0.16, [0.2, 0.23, 0.25]); box(sx * 6.7, 5.08, z - 2.8, 0.5, 0.14, 0.34, [1.6, 1.3, 0.8]);
  }
  const gate = (z, c, text, finish) => {
    box(-8.2, 4.6, z, 0.8, 9.2, 0.8, c); box(8.2, 4.6, z, 0.8, 9.2, 0.8, c);
    if (!finish) box(0, 9.6, z, 17.2, 1.6, 0.8, c);
    else for (let r = 0; r < 2; r++) for (let k = 0; k < 16; k++) box(-8.06 + k * 1.075, 9.2 + r * 0.8, z, 1.075, 0.8, 0.8, (k + r) % 2 ? [0.96, 0.957, 0.949] : [0.141, 0.173, 0.196]);
    label('gate' + (finish ? ' gate--finish' : ''), text, [0, 11.6, z]);
  };
  let w0 = 0; data.names.forEach((n, ph) => { let cnt = 0; for (let i = 0; i < N; i++) if (data.phase(i) === ph) cnt++; gate(-w0 * WEEK, cols[ph], `${n.toUpperCase()} · ${cnt} WEEKS`, false); w0 += cnt; });
  gate(-END, hex('#F26B38'), 'RACE DAY · MAR 15', true);
  const M = { road: mesh(quad(-ROAD, ROAD, 60, -END - 120, 0)), ground: mesh(quad(-900, 900, 120, -END - 900, -0.03)), boxes: mesh(boxes), towers: mesh(towers) };

  let W = 0, H = 0, asp = 1.6;
  const resize = () => { const r = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, innerWidth <= 600 ? 1.5 : 2); W = canvas.width = Math.max(2, Math.round(r.width * dpr)); H = canvas.height = Math.max(2, Math.round(r.height * dpr)); asp = W / H; };
  resize();

  function render(p, yaw, hor, gnd) {
    if (!W) resize();
    const travel = p * (END + 14), z = 8 - travel, steps = travel / 1.3;
    const bob = Math.abs(Math.sin(steps * Math.PI)) * 0.12, roll = Math.sin(steps * Math.PI) * 0.007;
    const fov = (asp < 1 ? 74 : 58) * Math.PI / 180;
    const eye = [0, 3.2 + bob, z], tgt = [Math.sin(yaw) * 40, 2.6, z - 40];
    const VP = mul(persp(fov, asp, 0.3, 1400), look(eye, tgt, [Math.sin(roll), Math.cos(roll), 0]));
    gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
    gl.uniformMatrix4fv(U.uVP, false, VP); gl.uniform3fv(U.uEye, eye);
    gl.uniform3f(U.uFog, hor[0] / 255, hor[1] / 255, hor[2] / 255); gl.uniform3f(U.uGround, gnd[0] / 255, gnd[1] / 255, gnd[2] / 255);
    gl.uniform1i(U.uMode, 2); gl.bindVertexArray(M.ground.vao); gl.drawArrays(gl.TRIANGLES, 0, M.ground.n);
    gl.uniform1i(U.uMode, 0); gl.bindVertexArray(M.road.vao); gl.drawArrays(gl.TRIANGLES, 0, M.road.n);
    gl.uniform1i(U.uMode, 1); gl.bindVertexArray(M.boxes.vao); gl.drawArrays(gl.TRIANGLES, 0, M.boxes.n);
    gl.uniform1f(U.uDay, p); gl.uniform1i(U.uMode, 3); gl.bindVertexArray(M.towers.vao); gl.drawArrays(gl.TRIANGLES, 0, M.towers.n);

    // labels: DOM, projected
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    for (const l of labels) {
      const [x, y, zz] = l.pos, d = z - zz;
      const far = l.gate ? 190 : 84;
      let op = d < 6 ? 0 : Math.min(1, (far - d) / 26, (d - 6) / 10); op = Math.max(0, op);
      if (op > 0) {
        const cx = VP[0] * x + VP[4] * y + VP[8] * zz + VP[12], cy = VP[1] * x + VP[5] * y + VP[9] * zz + VP[13], cwc = VP[3] * x + VP[7] * y + VP[11] * zz + VP[15];
        if (cwc <= 0.01) op = 0; else l.el.style.transform = `translate3d(${((cx / cwc * 0.5 + 0.5) * cw).toFixed(1)}px, ${((0.5 - cy / cwc * 0.5) * ch).toFixed(1)}px, 0) translate(-50%, -100%) scale(${Math.min(1.25, Math.max(l.gate ? 0.85 : 0.55, 34 / d)).toFixed(3)})`;
      }
      if (op !== l.op) { l.op = op; l.el.style.opacity = op.toFixed(2); }
    }
    return { week: Math.min(N, Math.max(1, Math.floor(-z / WEEK) + 1)), z };
  }
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());
  return { render, resize };
}
