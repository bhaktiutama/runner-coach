/*
  plan3d.js - KM 1: you run down a race course through the 19 weeks of a real half marathon plan.
  Every week is a feather flag on both sides of the road (flag height = km x 0.27), phase gates span
  the road, race day is the chequered finish arch. Barriers line the road, pines and far hills fill the
  park. Plain WebGL2, one context, one program, flat shading. The sky is CSS behind the transparent
  canvas; labels are DOM, projected every frame.

  createPlan(canvas, labelsEl, { km, phase, colors, names }) -> { render(p, yaw, horizonRGB, groundRGB), resize() }
  p is the scroll progress 0..1: the camera only moves when p moves.
*/
const WEEK = 26, FLAG = 0.27, ROAD = 7;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);

const VS = `#version 300 es
layout(location=0) in vec3 aPos; layout(location=1) in vec3 aNor; layout(location=2) in vec3 aCol;
uniform mat4 uVP; out vec3 vW; out vec3 vN; out vec3 vC;
void main(){ vW = aPos; vN = aNor; vC = aCol; gl_Position = uVP * vec4(aPos, 1.); }`;
const FS = `#version 300 es
precision highp float;
in vec3 vW; in vec3 vN; in vec3 vC; out vec4 o;
uniform int uMode; uniform vec3 uEye, uFog, uGround;
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
  } else if (uMode == 2) {                // the park either side, a little darker near the road
    col = uGround * mix(.82, 1., smoothstep(8., 30., abs(vW.x)));
  } else {                                // everything else: flat shaded, lit from both sides of a flag
    vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
    float d = max(dot(n, L), 0.);
    col = vC * (.55 + .55 * d);
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
  const U = {}; for (const n of ['uVP', 'uMode', 'uEye', 'uFog', 'uGround']) U[n] = gl.getUniformLocation(prog, n);

  /* geometry: every triangle carries position, normal, colour */
  const mesh = v => { const vao = gl.createVertexArray(); gl.bindVertexArray(vao); gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW); for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 3, gl.FLOAT, false, 36, i * 12); } return { vao, n: v.length / 9 }; };
  const quad = (x0, x1, z0, z1, y) => { const v = []; for (const [x, z] of [[x0, z0], [x1, z0], [x1, z1], [x0, z0], [x1, z1], [x0, z1]]) v.push(x, y, z, 0, 1, 0, 0, 0, 0); return v; };
  const V = [];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const tri = (a, b, c, col) => { const n = norm(cross(sub(b, a), sub(c, a))); for (const p of [a, b, c]) V.push(...p, ...n, ...col); };
  const box = (cx, cy, cz, sx, sy, sz, c) => {
    const x0 = cx - sx / 2, x1 = cx + sx / 2, y0 = cy - sy / 2, y1 = cy + sy / 2, z0 = cz - sz / 2, z1 = cz + sz / 2;
    const f = (a, b, d, e, k = 1) => { const cc = [c[0] * k, c[1] * k, c[2] * k]; tri(a, b, d, cc); tri(a, d, e, cc); };
    f([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);
    f([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]);
    f([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]);
    f([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]);
    f([x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], 1.08);
  };
  // a prism or cone around a vertical axis: n sides, radius r0 at y0, r1 at y1 (0 = a point)
  const prism = (cx, cz, y0, y1, r0, r1, n, c, rot = 0) => {
    for (let k = 0; k < n; k++) {
      const a0 = rot + k / n * Math.PI * 2, a1 = rot + (k + 1) / n * Math.PI * 2;
      const p0 = [cx + Math.cos(a0) * r0, y0, cz + Math.sin(a0) * r0], p1 = [cx + Math.cos(a1) * r0, y0, cz + Math.sin(a1) * r0];
      const q0 = [cx + Math.cos(a0) * r1, y1, cz + Math.sin(a0) * r1], q1 = [cx + Math.cos(a1) * r1, y1, cz + Math.sin(a1) * r1];
      tri(p0, q1, p1, c); if (r1 > 0) { tri(p0, q0, q1, c); tri([cx, y1, cz], q1, q0, c); }
    }
  };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const pine = (x, z, h, k) => {
    const g = [[0.16, 0.33, 0.25], [0.2, 0.38, 0.27], [0.13, 0.29, 0.24]][Math.abs(k) % 3], r = h * 0.32, rot = rnd() * 6;
    prism(x, z, 0, h * 0.22, 0.16 * h / 6, 0.12 * h / 6, 5, [0.33, 0.24, 0.17]);
    prism(x, z, h * 0.16, h * 0.62, r, 0, 7, g, rot);
    prism(x, z, h * 0.4, h * 0.84, r * 0.74, 0, 7, g.map(v => v * 1.1), rot + 0.4);
    prism(x, z, h * 0.62, h, r * 0.48, 0, 7, g.map(v => v * 1.2), rot + 0.8);
  };
  // a feather flag: pole, and a cloth that billows and rounds over at the top, with a white band
  const flag = (x, z, sx, top, c) => {
    prism(x, z, 0, top + 0.25, 0.07, 0.05, 6, [0.2, 0.23, 0.25]);
    prism(x, z, 0, 0.12, 0.5, 0.42, 4, [0.2, 0.23, 0.25], Math.PI / 4);
    const d = norm([sx * 0.94, 0, -0.34]), nrm = cross(d, [0, 1, 0]), w = 1.75, y0 = 0.9, S = 12, U = 4;
    const at = (t, u) => {
      const tt = t < 0.78 ? 1 : Math.sqrt(Math.max(0, 1 - ((t - 0.78) / 0.22) ** 2));
      const along = u * w * (0.86 + 0.14 * Math.sin(t * Math.PI)) * tt, bil = Math.sin(u * Math.PI) * 0.18 * (0.4 + t);
      return [x + 0.07 * sx + d[0] * along + nrm[0] * bil, y0 + t * (top - y0), z + d[2] * along + nrm[2] * bil];
    };
    for (let i = 0; i < S; i++) for (let j = 0; j < U; j++) {
      const t0 = i / S, t1 = (i + 1) / S, u0 = j / U, u1 = (j + 1) / U, band = t0 >= 1 / S && t0 < 2 / S;
      const col = band ? [0.96, 0.957, 0.949] : c;
      tri(at(t0, u0), at(t0, u1), at(t1, u1), col); tri(at(t0, u0), at(t1, u1), at(t1, u0), col);
    }
  };
  const N = data.km.length, END = N * WEEK, cols = data.colors.map(hex), labels = [];
  const label = (cls, htmlText, pos) => { const el = document.createElement('span'); el.className = cls; el.innerHTML = htmlText; labelsEl.append(el); labels.push({ el, pos, op: -1, gate: cls.includes('gate') }); };
  data.km.forEach((km, i) => {
    const zc = -(i * WEEK + WEEK / 2), top = km * FLAG, c = cols[data.phase(i)];
    for (const sx of [-1, 1]) flag(sx * 9.2, zc, sx, top, c);
    label('', `<small>WEEK ${i + 1}</small>${km} km`, [10.2, top + 1.3, zc]);
  });
  // barriers along both edges, panels in the colour of the phase they stand in
  const phaseAt = z => data.phase(Math.min(N - 1, Math.max(0, Math.floor(-z / WEEK))));
  for (let z = 6; z > -END - 40; z -= 4) for (const sx of [-1, 1]) {
    const c = z > 0 || z < -END ? [0.96, 0.957, 0.949] : cols[phaseAt(z)].map(v => v * 0.92);
    box(sx * 7.4, 0.62, z - 2, 0.1, 0.72, 3.7, c);
    box(sx * 7.4, 1.02, z - 2, 0.14, 0.08, 3.9, [0.96, 0.957, 0.949]);
    box(sx * 7.4, 0.13, z - 0.2, 0.7, 0.26, 0.12, [0.25, 0.28, 0.3]);
  }
  // the park: pines in loose rows behind the flags, hills far out
  for (let z = 20; z > -END - 160; z -= 6.5) for (const sx of [-1, 1]) for (let r = 0; r < 3; r++) {
    if (rnd() < 0.25) continue;
    pine(sx * (14 + r * 9 + rnd() * 7), z + rnd() * 5, 4.5 + rnd() * 5.5 + r * 1.2, r + (z | 0));
  }
  for (let k = 0; k < 26; k++) {
    const sx = k % 2 ? 1 : -1, z = 40 - k * 46 - rnd() * 30;
    prism(sx * (170 + rnd() * 220), z, -1, 45 + rnd() * 70, 90 + rnd() * 70, 0, 6, [0.17, 0.27, 0.29], rnd() * 6);
  }
  const gate = (z, c, text, finish) => {
    box(-8.2, 4.6, z, 0.8, 9.2, 0.8, c); box(8.2, 4.6, z, 0.8, 9.2, 0.8, c);
    if (!finish) box(0, 9.6, z, 17.2, 1.6, 0.8, c);
    else for (let r = 0; r < 2; r++) for (let k = 0; k < 16; k++) box(-8.06 + k * 1.075, 9.2 + r * 0.8, z, 1.075, 0.8, 0.8, (k + r) % 2 ? [0.96, 0.957, 0.949] : [0.141, 0.173, 0.196]);
    label('gate' + (finish ? ' gate--finish' : ''), text, [0, 11.6, z]);
  };
  let w0 = 0; data.names.forEach((n, ph) => { let cnt = 0; for (let i = 0; i < N; i++) if (data.phase(i) === ph) cnt++; gate(-w0 * WEEK, cols[ph], `${n.toUpperCase()} · ${cnt} WEEKS`, false); w0 += cnt; });
  gate(-END, hex('#F26B38'), 'RACE DAY · MAR 15', true);
  const M = { road: mesh(quad(-ROAD, ROAD, 60, -END - 120, 0)), ground: mesh(quad(-900, 900, 120, -END - 900, -0.03)), scene: mesh(V) };

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
    gl.uniform1i(U.uMode, 1); gl.bindVertexArray(M.scene.vao); gl.drawArrays(gl.TRIANGLES, 0, M.scene.n);

    // labels: DOM, projected
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    for (const l of labels) {
      const [x, y, zz] = l.pos, d = z - zz;
      const far = l.gate ? 190 : 84;
      let op = d < 6 ? 0 : Math.min(1, (far - d) / 26, (d - 6) / 10); op = Math.max(0, op);
      if (op > 0) {
        const cx = VP[0] * x + VP[4] * y + VP[8] * zz + VP[12], cy = VP[1] * x + VP[5] * y + VP[9] * zz + VP[13], cwc = VP[3] * x + VP[7] * y + VP[11] * zz + VP[15];
        const sy = 0.5 - cy / cwc * 0.5;
        if (cwc <= 0.01 || (!l.gate && sy < 0.2)) op = 0; else l.el.style.transform = `translate3d(${((cx / cwc * 0.5 + 0.5) * cw).toFixed(1)}px, ${((0.5 - cy / cwc * 0.5) * ch).toFixed(1)}px, 0) translate(-50%, -100%) scale(${Math.min(1.25, Math.max(l.gate ? 0.85 : 0.55, 34 / d)).toFixed(3)})`;
      }
      if (op !== l.op) { l.op = op; l.el.style.opacity = op.toFixed(2); }
    }
    return { week: Math.min(N, Math.max(1, Math.floor(-z / WEEK) + 1)), z };
  }
  canvas.addEventListener('webglcontextlost', e => e.preventDefault());
  return { render, resize };
}
