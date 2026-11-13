/* RunCo landing v2: "Run the Page". Spec: docs/store/06-LANDING-V2-PROMPT.md
   The page is a 5K: scroll is running. Everything counted here stays in this tab. */

/* ---- the store links: one place to change them ---- */
const STORE = {
  play: 'https://play.google.com/store/apps/details?id=com.bhaktiutama.runco',
  ios: 'https://apps.apple.com/app/runco' // the App Store address is still to come: put the app's id here
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const html = document.documentElement;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isPhone = () => innerWidth <= 600;
const isDesk = () => innerWidth >= 992;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const mmss = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const mss = s => { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

$$('[data-store]').forEach(a => { a.href = STORE[a.dataset.store]; });

const reveal = () => { html.dataset.pageReady = ''; html.dataset.loadDone = ''; delete html.dataset.anim; };
const G = window.gsap;
if (!G) reveal();
setTimeout(() => { if (!('pageReady' in html.dataset)) reveal(); }, 4000);

if (G) {
  G.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, InertiaPlugin, Draggable);
  if (!RM) html.dataset.anim = '';

  /* ---- sound: the app's own timer cues, off until a click ---- */
  const sound = { on: false, bank: {} };
  const setSound = on => {
    sound.on = on;
    if (on) for (const n of ['tick', 'go', 'segment', 'halfway', 'finish']) if (!sound.bank[n]) { const a = new Audio(`assets/sounds/${n}.mp3`); a.preload = 'auto'; sound.bank[n] = a; }
    $$('.hud__sound').forEach(b => b.setAttribute('aria-pressed', on));
  };
  const play = n => { if (!sound.on || !sound.bank[n]) return; const a = sound.bank[n].cloneNode(); a.volume = 0.6; a.play().catch(() => {}); };
  $('.hud__sound').addEventListener('click', () => setSound(!sound.on));

  /* ---- 6.1 smooth scroll ---- */
  let lenis = null;
  if (!RM && window.Lenis) {
    lenis = new Lenis({ lerp: 0.14, wheelMultiplier: 1.1 });
    lenis.on('scroll', ScrollTrigger.update);
    G.ticker.add(t => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
  }
  const go = (target, dur = 1.6) => { lenis ? lenis.scrollTo(target, { duration: dur }) : (typeof target === 'number' ? scrollTo({ top: target, behavior: 'smooth' }) : $(target).scrollIntoView({ behavior: RM ? 'auto' : 'smooth' })); };
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"], [data-to]'); if (!a) return;
    const id = a.dataset.to || a.getAttribute('href'); if (id.length < 2 || !$(id)) return;
    e.preventDefault(); go(id);
  });

  /* ---- text reveals (6.3) and the marker ---- */
  const splitHead = el => $$('.ln', el).map(ln => new SplitText(ln, { type: 'chars', charsClass: 'char' }).chars).flat();
  const revealEl = (el, delay = 0) => {
    const mode = el.dataset.reveal || el.dataset.revealScroll;
    G.set(el, { visibility: 'visible' });
    if (RM) return;
    if (mode === 'chars') {
      const lns = $$('.ln', el); G.set(lns, { overflow: 'hidden' });
      G.set($$('.mk', el), { '--mk': 0 });
      G.from(splitHead(el), { yPercent: 120, duration: 0.9, ease: 'expo.out', stagger: 0.016, delay, onComplete: () => G.set(lns, { overflow: 'visible' }) });
      G.to($$('.mk', el), { '--mk': 1, duration: 0.5, ease: 'power2.inOut', delay: delay + 0.85 });
    } else G.from(el, { y: 24, autoAlpha: 0, duration: 0.8, ease: 'expo.out', delay });
  };

  /* ---- coach notes (6.7) ---- */
  const showNote = (n, delay = 0) => {
    if (n._shown) return; n._shown = true;
    G.set(n, { visibility: 'visible' });
    if (RM) return;
    const path = $('path', n), words = $('span', n);
    if (path) G.fromTo(path, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.inOut', delay });
    if (words) G.fromTo(words, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.5, ease: 'power1.out', delay: delay + (path ? 0.35 : 0) });
  };

  /* ---- the run: distance, time, scroll pace (5.3) ---- */
  const run = { v: 0, lastY: scrollY, still: 0, started: false, done: false, time: 0, thumb: 0, dist: 0, splits: [], zone: 'standing', zt: { easy: 0, tempo: 0, interval: 0 }, paceSum: 0, paceN: 0, fast: 0, pops: 0, lastPop: -99, dir: 1 };
  const hud = { el: $('.hud'), dist: $('[data-hud="dist"]'), fill: $('[data-hud="fill"]'), dot: $('[data-hud="dot"]'), pace: $('[data-hud="pace"]'), zone: $('[data-hud="zone"]'), time: $('[data-hud="time"]'), ticks: $$('.hud__ticks button'), shown: false };
  const kmEls = ['#plan', '#timer', '#strength', '#evidence', '#privacy', '#finish'].map(s => $(s));
  let marks = [];
  const measure = () => { marks = kmEls.map(e => e.getBoundingClientRect().top + scrollY); };
  ScrollTrigger.addEventListener('refresh', measure);
  const ZONE = { easy: 'Easy', tempo: 'Tempo', interval: 'Interval', standing: 'Standing' };
  const pop = $('.coachpop');

  const tickRun = (t, dms) => {
    const dt = Math.min(0.1, dms / 1000), y = scrollY, dy = y - run.lastY; run.lastY = y;
    if (dy) run.dir = dy > 0 ? 1 : -1;
    run.v += (Math.abs(dy) / Math.max(dt, 0.001) - run.v) * 0.12;
    if (!marks.length) measure();
    const pos = y + innerHeight * 0.5;
    let d = 0;
    if (pos >= marks[5]) d = 5; else for (let i = 4; i >= 0; i--) if (pos >= marks[i]) { d = i + (pos - marks[i]) / (marks[i + 1] - marks[i]); break; }
    run.dist = d;
    if (d > 0 && !run.started) run.started = true;
    if (run.started && !run.done) {
      if (!document.hidden) run.time += dt;
      run.thumb += Math.abs(dy) * 0.264583 / 1000;
      for (let k = run.splits.length + 1; k <= 5 && d >= k; k++) run.splits.push(run.time);
    }
    // pace
    run.still = run.v < 40 ? run.still + dt : 0;
    let zone = 'standing', pace = null;
    if (run.still < 0.6 && run.v >= 40) {
      pace = clamp(420 * (0.45 * innerHeight) / run.v, 150, 900);
      zone = pace >= 420 ? 'easy' : pace >= 375 ? 'tempo' : 'interval';
      if (run.started && !run.done) { run.zt[zone] += dt; run.paceSum += pace * dt; run.paceN += dt; }
    }
    // the coach reacts to a sprint
    run.fast = zone === 'interval' ? run.fast + dt : 0;
    if (run.fast > 2.5 && run.pops < 3 && t - run.lastPop > 25 && hud.shown && !RM) {
      run.pops++; run.lastPop = t; run.fast = 0;
      G.timeline().set(pop, { visibility: 'visible' }).fromTo(pop, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }).to(pop, { opacity: 0, duration: 0.3, delay: 3.2 }).set(pop, { visibility: 'hidden' });
    }
    // paint
    const show = y > innerHeight * 0.55;
    if (show !== hud.shown) { hud.shown = show; G.to(hud.el, { y: show ? '0%' : '160%', duration: 0.7, ease: show ? 'back.out(1.4)' : 'power2.in' }); }
    hud.dist.textContent = d.toFixed(2);
    const f5 = d / 5; if (f5 !== hud.f) { hud.f = f5; hud.fill.style.transform = `scaleX(${f5.toFixed(4)})`; hud.dot.style.transform = `translateX(${(f5 * hud.fill.parentElement.clientWidth).toFixed(1)}px)`; }
    hud.time.textContent = mmss(run.time);
    hud.pace.textContent = pace ? mss(pace) : '--:--';
    if (zone !== run.zone) { run.zone = zone; hud.zone.dataset.zone = zone; hud.zone.textContent = ZONE[zone]; }
    const cur = Math.min(5, Math.floor(d));
    hud.ticks.forEach((b, i) => b.classList.toggle('on', i === cur && d > 0));
    // 6.4 stride type: headlines lean with your pace
    if (!RM && !isPhone()) {
      const lean = clamp(run.v / 260, 0, 7), wd = 75 + clamp(run.v / 90, 0, 9);
      run.lean = (run.lean || 0) + (lean - (run.lean || 0)) * 0.12; run.wd = (run.wd || 75) + (wd - (run.wd || 75)) * 0.12;
      if (Math.abs(run.lean - (run.pl || 0)) > 0.04) { run.pl = run.lean; html.style.setProperty('--lean', run.lean.toFixed(2)); html.style.setProperty('--wdth', run.wd.toFixed(2)); }
    }
  };

  /* ---- grounds: one per kilometre ---- */
  const initGround = () => $$('[data-ground]', $('main')).forEach(s => ScrollTrigger.create({
    trigger: s, start: 'top 55%', end: 'bottom 45%', refreshPriority: -1,
    onToggle: st => { if (st.isActive) html.dataset.ground = s.dataset.ground; }
  }));

  /* ---- 5.4 start: the film and the week card ---- */
  const WEEK = [
    ['Monday', 'easy', 'Easy', '20', 'Easy + strides', 'track-overhead'],
    ['Tuesday', 'easy', 'Easy', '20', 'Easy run', 'riverside-city-m'],
    ['Wednesday', 'tempo', 'Tempo', '44', '14 min at 6:46 /km', 'track-back'],
    ['Thursday', 'easy', 'Easy', '20', 'Easy run', 'riverside-city-m'],
    ['Friday', 'easy', 'Easy', '20', 'Easy run', 'riverside-city-m'],
    ['Saturday', 'rest', 'Rest', '0', 'Rest day', 'track-aerial'],
    ['Sunday', 'long', 'Long', '43', 'Long run', 'road-sunrise-m']
  ];
  const initStart = () => {
    const sec = $('.start'), vid = $('.start__bg'), pause = $('.pause');
    if (!RM) { vid.src = 'assets/video/start-loop.mp4'; vid.play().catch(() => {}); } else pause.hidden = true;
    pause.addEventListener('click', () => { const p = pause.getAttribute('aria-pressed') !== 'true'; pause.setAttribute('aria-pressed', p); p ? vid.pause() : vid.play().catch(() => {}); });
    ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onToggle: st => { if (RM || pause.getAttribute('aria-pressed') === 'true') return; st.isActive ? vid.play().catch(() => {}) : vid.pause(); } });

    const card = $('.week'), inner = $('.week__in'), days = $$('.days li');
    const parts = { art: $('.week__art img'), chip: $('.week .chip'), day: $('.week__day'), num: $('.week__num b'), line: $('.week__line') };
    WEEK.forEach(w => { new Image().src = `assets/img/${w[5]}.webp`; });
    let day = 2;
    const setDay = (i, flip) => {
      if (i === day) return; day = i; const w = WEEK[i];
      parts.art.src = `assets/img/${w[5]}.webp`; parts.art.style.transform = i === 3 ? 'scaleX(-1)' : '';
      parts.chip.dataset.zone = w[1]; parts.chip.textContent = w[2]; parts.day.textContent = w[0]; parts.num.textContent = w[3]; parts.line.textContent = w[4];
      days.forEach((d, k) => d.classList.toggle('on', k === i));
      if (flip && !RM) { G.fromTo(inner, { rotationY: 90 }, { rotationY: 0, duration: 0.25, ease: 'power2.out' }); play('tick'); }
    };
    if (FINE && isDesk() && !RM) {
      const xTo = G.quickTo(card, 'x', { duration: 0.9, ease: 'power4' }), yTo = G.quickTo(card, 'y', { duration: 0.9, ease: 'power4' }), rTo = G.quickTo(card, 'rotation', { duration: 0.9, ease: 'power4' });
      let lx = 0, first = true, idle = 0, vis = false;
      const fade = on => { if (on === vis) return; vis = on; G.to(card, { autoAlpha: on ? 1 : 0, duration: on ? 0.3 : 0.25, ease: 'power2.out' }); };
      sec.addEventListener('mousemove', e => {
        if (e.target.closest('a, button')) return fade(false);
        const r = sec.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
        if (first) { G.set(card, { x, y }); first = false; lx = x; }
        fade(true); xTo(x); yTo(y); rTo(clamp((x - lx) / 5, -10, 10)); lx = x;
        setDay(clamp(Math.floor(e.clientX / innerWidth * 7), 0, 6), true);
        clearTimeout(idle); idle = setTimeout(() => rTo(0), 66);
      });
      sec.addEventListener('mouseleave', () => { fade(false); first = true; });
    } else if (isPhone() && !RM) {
      let i = 2; setInterval(() => { if (scrollY < innerHeight) setDay(i = (i + 1) % 7, true); }, 2200);
    }
  };

  /* ---- 5.6 KM 1: run your 19 weeks ---- */
  const KM = [15, 16, 17, 13, 18, 20, 21, 17, 23, 25, 27, 21, 29, 32, 35, 27, 38, 26, 19];
  const PHASE = i => i < 7 ? 0 : i < 14 ? 1 : i < 17 ? 2 : 3;
  const PHN = ['Base', 'Build', 'Peak', 'Taper'], PHC = ['#E9B79D', '#D98E63', '#F26B38', '#A6B8FF'];
  const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
  const tri = (stops, p) => { const t = p * 2; return t < 1 ? mix(stops[0], stops[1], t) : mix(stops[1], stops[2], t - 1); };
  const SKY = { top: ['#0F1B24', '#3E7C8C', '#7FC4D6'].map(hex), mid: ['#123C46', '#F7C59F', '#CFE9EE'].map(hex), hor: ['#F2A65A', '#FFE2B8', '#FFF9F2'].map(hex), gnd: ['#0C171B', '#4E6B58', '#8FB083'].map(hex) };
  const rgb = c => `rgb(${c[0]} ${c[1]} ${c[2]})`;
  const initPlan = async () => {
    const sec = $('.km1'), pin = $('.pin', sec), sky = $('.sky', sec), sun = $('.sun', sec), flash = $('.flash', sec), note = $('.note--2', sec);
    const out = { week: $('[data-plan="week"]'), phase: $('[data-plan="phase"]'), km: $('[data-plan="km"]'), left: $('[data-plan="left"]') };
    const chart = $('.chart', sec);
    KM.forEach((k, i) => { const b = document.createElement('i'); b.style.height = k / 38 * 100 + '%'; b.style.background = PHC[PHASE(i)]; b.dataset.km = k; chart.append(b); });
    let scene = null;
    if (!RM) try { scene = (await import('./plan3d.js')).createPlan($('.world', sec), $('.labels', sec), { km: KM, phase: PHASE, colors: PHC, names: PHN }); } catch (e) { scene = null; }
    if (!scene) { sec.classList.add('is-flat'); html.dataset.plan = 'flat'; return; }
    html.dataset.plan = '3d';
    let p = 0, yaw = 0, flashed = false;
    const paint = () => {
      const top = tri(SKY.top, p), mid = tri(SKY.mid, p), hor = tri(SKY.hor, p), gnd = tri(SKY.gnd, p);
      sky.style.background = `linear-gradient(${rgb(top)} 0%, ${rgb(mid)} 30%, ${rgb(hor)} 49%, ${rgb(hor)} 100%)`;
      sun.style.transform = `translateY(${(-p * 0.3 * pin.clientHeight).toFixed(1)}px)`;
      const st = scene.render(p, yaw, hor, gnd);
      const w = st.week; out.week.textContent = w; out.phase.textContent = PHN[PHASE(w - 1)]; out.km.textContent = KM[w - 1];
      out.left.textContent = w >= 19 ? 'Race week' : `Race in ${19 - w} week${19 - w === 1 ? '' : 's'}`;
      html.classList.toggle('is-day', p > 0.6 && p < 0.999);
      // coach note 2: the lighter weeks (4, 8, 12, 16), while their pillar is 40 to 90 units ahead
      const ahead = [3, 7, 11, 15].some(i => { const d = st.z - (-(i * 26 + 13)); return d > 40 && d < 90; });
      if (ahead !== note._on) { note._on = ahead; G.to(note, { autoAlpha: ahead ? 1 : 0, duration: 0.3 }); }
      if (p > 0.985 && !flashed) { flashed = true; G.fromTo(flash, { opacity: 0 }, { opacity: 0.9, duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.1 }); } else if (p < 0.9) flashed = false;
    };
    ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.4, onUpdate: st => { p = st.progress; paint(); }, onToggle: st => { if (!st.isActive) html.classList.remove('is-day'); } });
    if (FINE) { const yTo = G.quickTo({ get v() { return yaw; }, set v(x) { yaw = x; paint(); } }, 'v', { duration: 0.6, ease: 'power3' }); pin.addEventListener('mousemove', e => yTo((e.clientX / innerWidth - 0.5) * 0.021)); pin.addEventListener('mouseleave', () => yTo(0)); }
    addEventListener('resize', () => { scene.resize(); paint(); });
    paint();
  };

  /* ---- 5.7 KM 2: the timer ---- */
  const SEG = [
    { n: 'Warm-up', len: 600, zone: 'easy', chip: 'Easy', line: 'Warm-up · easy pace' },
    { n: 'ABC drills', len: 600, zone: 'drills', chip: 'Drills', line: 'A-skip, B-skip, C-skip, high knees, carioca' },
    { n: 'Tempo', len: 840, zone: 'tempo', chip: 'Tempo', line: 'Target 6:46 /km · comfortably hard (6-7)' },
    { n: 'Cool-down', len: 600, zone: 'easy', chip: 'Easy', line: 'Cool-down · easy pace' }
  ];
  const initTimer = () => {
    const sec = $('.km2'), pin = $('.pin', sec), C = 2 * Math.PI * 45;
    const el = { arc: $('.ring__arc'), head: $('.ring__head'), chip: $('[data-timer="chip"]'), time: $('[data-timer="time"]'), left: $('[data-timer="left"]'), line: $('[data-timer="line"]'), bars: $$('.ring__bar i'), waves: $$('.ring__waves i') };
    let last = -1, lastE = 0, demo = false, ended = false, half = 0;
    const wave = () => { if (!RM) G.fromTo(el.waves, { scale: 1, opacity: 0.5 }, { scale: 1.6, opacity: 0, duration: 0.9, ease: 'power2.out', stagger: 0.12 }); };
    const paint = p => {
      if (demo) return;
      const e = p * 2640; let i = 0, acc = 0; while (i < 3 && e >= acc + SEG[i].len) acc += SEG[i++].len;
      const s = SEG[i], f = clamp((e - acc) / s.len, 0, 1);
      el.arc.style.strokeDashoffset = C * (1 - f); el.head.style.transform = `rotate(${f * 360}deg)`;
      el.time.textContent = mmss(s.len - (e - acc)); if (performance.now() > half) el.left.textContent = 'left of ' + mmss(s.len);
      if (i !== last) {
        if (last >= 0 && i > last) { wave(); play('segment'); }
        last = i; el.chip.dataset.zone = s.zone; el.chip.textContent = s.chip; el.line.textContent = s.line; el.bars.forEach((b, k) => b.classList.toggle('on', k === i));
      }
      if (lastE < 1620 && e >= 1620 && e < 2040) { play('halfway'); half = performance.now() + 1200; el.left.textContent = 'Halfway'; wave(); G.delayedCall(1.25, () => paint(st.progress)); }   // halfway through the tempo
      if (p > 0.998 && !ended) { ended = true; play('finish'); wave(); } else if (p < 0.95) ended = false;
      lastE = e;
    };
    let st = { progress: 0 };
    st = ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.3, onUpdate: s => paint(s.progress) });
    paint(0);
    $('[data-321]').addEventListener('click', () => {
      if (demo) return; demo = true; setSound(true);
      el.chip.dataset.zone = 'tempo'; el.chip.textContent = 'Get ready'; el.left.textContent = 'the final 3-2-1';
      ['3', '2', '1', 'GO'].forEach((n, k) => G.delayedCall(k, () => { el.time.textContent = n; play(k < 3 ? 'tick' : 'go'); wave(); G.fromTo(el.time, { scale: 1.2 }, { scale: 1, duration: 0.3, ease: 'power2.out' }); }));
      if (navigator.vibrate) navigator.vibrate([60, 940, 60, 940, 60, 940, 300]);
      G.delayedCall(4.5, () => { demo = false; last = -1; paint(st.progress); });
    });
  };

  /* ---- 5.8 KM 3: the exercise demo runs on its own clock (2.2 s a rep, 2 sets of 10) ---- */
  const initStrength = () => {
    const sec = $('.km3'), cv = $('.flip__cv'), ctx = cv.getContext('2d'), rep = $('[data-flip="rep"]'), set = $('[data-flip="set"]'), name = $('[data-flip="name"]'), done = $('.flip__done'), pauseBtn = $('.flip__pause');
    const btns = $$('.exlist button'), cache = new Map(), REP = 2.2, REST = 1.8;
    let ex = 'squat', n = 16, t = 0, visible = false, paused = false, lastRep = -1, lastSet = 0, wasDone = false;
    // one cycle = set 1 (10 reps), rest, set 2 (10 reps), rest
    const SETLEN = 10 * REP + REST, CYCLE = 2 * SETLEN;
    const state = () => { const c = t % CYCLE, s = c < SETLEN ? 0 : 1, inSet = c - s * SETLEN, resting = inSet >= 10 * REP; return { s, resting, reps: resting ? 10 : Math.floor(inSet / REP), f: resting ? 0 : (inSet % REP) / REP }; };
    const frameT = () => { const st = state(); return 1 - Math.abs(1 - 2 * st.f); };
    const load = (id, count) => { if (!cache.has(id)) cache.set(id, Array.from({ length: count }, (_, i) => { const im = new Image(); im.src = `assets/exercises/${id}-m-${i + 1}.webp`; im.onload = () => { if (id === ex) draw(RM ? 0.5 : frameT()); }; return im; })); return cache.get(id); };
    const draw = k => { const fr = load(ex, n), im = fr[Math.round(k * (n - 1))]; if (im && im.complete && im.naturalWidth) { ctx.clearRect(0, 0, 840, 840); ctx.drawImage(im, 60, 70, 720, 720); } };
    const paint = () => {
      const st = state();
      if (st.reps !== lastRep) { if (st.reps > lastRep && st.reps > 0 && visible) { play('tick'); G.fromTo(rep, { scale: 1.3 }, { scale: 1, duration: 0.25 }); } lastRep = st.reps; rep.textContent = st.reps; }
      if (st.s + 1 !== lastSet) { lastSet = st.s + 1; set.textContent = lastSet; }
      if (st.resting !== wasDone) { wasDone = st.resting; G.fromTo(done, { autoAlpha: wasDone ? 0 : 1, y: wasDone ? -30 : 0 }, { autoAlpha: wasDone ? 1 : 0, y: 0, duration: 0.35, ease: 'back.out(2)' }); }
      draw(frameT());
    };
    const pick = b => {
      ex = b.dataset.ex; n = +b.dataset.n; name.textContent = b.textContent;
      btns.forEach(x => x.setAttribute('aria-pressed', x === b));
      cv.setAttribute('aria-label', `${b.textContent}, shown as a looping animation of the movement`);
      $$('.lib__row span').forEach(s => s.classList.toggle('on', s.dataset.ex === ex));
      if (RM) return draw(0.5);
      t = 0; lastRep = -1; lastSet = 0; paint();
    };
    btns.forEach(b => b.addEventListener('click', () => pick(b)));
    // the decorative marquee: one row of the 15 names, faster when you scroll faster
    const row = $('.lib__row');
    for (let k = 0; k < 3; k++) btns.forEach(b => { const s = document.createElement('span'); s.textContent = b.textContent; s.dataset.ex = b.dataset.ex; row.append(s); });
    if (RM) { pauseBtn.hidden = true; rep.textContent = '10'; pick(btns[0]); return; }
    const tw = G.fromTo(row, { xPercent: 0 }, { xPercent: -33.333, duration: 40 * (row.scrollWidth / 3 / innerWidth), ease: 'none', repeat: -1, paused: true });
    let ts = 1;
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? tw.play() : tw.pause(); }, { threshold: 0.15 }).observe(sec);
    pauseBtn.addEventListener('click', () => { paused = !paused; pauseBtn.setAttribute('aria-pressed', paused); pauseBtn.setAttribute('aria-label', paused ? 'Play the exercise animation' : 'Pause the exercise animation'); });
    G.ticker.add((_, dms) => {
      if (!visible) return;
      const want = (1 + clamp(run.v / 600, 0, 4)) * run.dir; ts += (want - ts) * 0.08; tw.timeScale(Math.abs(ts) < 0.05 ? 0.05 : ts);
      if (paused || document.hidden) return;
      t += Math.min(0.1, dms / 1000); paint();
    });
    pick(btns[0]);
  };

  /* ---- 5.9 KM 4: the coach's index cards ---- */
  const initCards = () => {
    const wrap = $('.cards'), row = $('.cards__row'), cards = $$('.card');
    if (!isPhone()) Draggable.create(row, { type: 'x', inertia: true, edgeResistance: 0.85, bounds: { minX: Math.min(0, wrap.clientWidth - row.scrollWidth), maxX: 0 }, cursor: 'grab', activeCursor: 'grabbing' });
    if (RM) return;
    G.set(cards, { x: '60vw', rotation: 18 }); G.set($$('.stamp'), { autoAlpha: 0, scale: 1.6 });
    ScrollTrigger.create({ trigger: wrap, start: 'top 75%', once: true, onEnter: () => {
      G.to(cards, { x: 0, rotation: 0, duration: 0.9, ease: 'expo.out', stagger: 0.08 });
      G.to($$('.stamp'), { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'back.out(3)', stagger: 0.08, delay: 0.55 });
    } });
  };

  /* ---- 5.10 KM 5: try to take it out ---- */
  const initVault = () => {
    const phone = $('.vault__phone'), tries = $('[data-vault="tries"]'); let n = 0;
    const home = c => { if (c._home) return; c._home = true; n++; tries.textContent = n; G.to(c, { x: 0, y: 0, duration: RM ? 0.01 : 1.1, ease: 'elastic.out(1, 0.5)', overwrite: true, onComplete: () => { c._home = false; } }); };
    const check = c => { if (c._home) return; const a = c.getBoundingClientRect(), b = phone.getBoundingClientRect(), cx = a.left + a.width / 2, cy = a.top + a.height / 2; if (cx < b.left || cx > b.right || cy < b.top || cy > b.bottom) home(c); };
    $$('.vault__phone .datachip').forEach(c => {
      Draggable.create(c, { type: 'x,y', inertia: true, bounds: '.km5', maxDuration: 0.5, onThrowComplete() { check(c); }, onDragEnd() { G.delayedCall(0.6, () => check(c)); },
        onClick() { G.to(c, { x: '+=' + (parseFloat(getComputedStyle(html).fontSize) * 14), duration: 0.3, ease: 'power2.out', onComplete: () => home(c) }); } });
    });
  };

  /* ---- 5.11 finish: the tape, the flood, your result ---- */
  const initFinish = () => {
    const sec = $('.finish'), flood = $('.finish__flood'), tl = $('.tape__l'), tr = $('.tape__r'), card = $('.result'), cv = $('.confetti');
    const res = k => $(`[data-res="${k}"]`);
    let snapped = false;
    const fill = () => {
      res('time').textContent = mmss(run.time);
      res('pace').textContent = run.paceN ? mss(run.paceSum / run.paceN) : '--:--';
      res('thumb').textContent = run.thumb.toFixed(1);
      res('splits').innerHTML = [0, 1, 2, 3, 4].map(i => { const t = run.splits[i], prev = i ? run.splits[i - 1] : 0; return `<li><span>KM ${i + 1}</span>${t == null ? '--' : mss(t - prev)}</li>`; }).join('');
      const tot = run.zt.easy + run.zt.tempo + run.zt.interval || 1; const zs = $$('i', res('zones'));
      ['easy', 'tempo', 'interval'].forEach((z, i) => { zs[i].style.flexBasis = run.zt[z] / tot * 100 + '%'; });
      res('verdict').textContent = run.zt.easy / tot >= 0.7 ? 'Mostly easy. That is how a base is built.' : 'Quick. Save some for race day.';
    };
    const confetti = () => {
      const ctx = cv.getContext('2d'), w = cv.width = cv.clientWidth, h = cv.height = cv.clientHeight, cols = ['#F5F4F2', '#B8472E', '#2F5D4A', '#242C32', '#F2C66D'];
      const ps = Array.from({ length: 60 }, () => ({ x: w / 2, y: 90, vx: (Math.random() - 0.5) * 22, vy: -Math.random() * 14 - 3, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.5, c: cols[Math.random() * 5 | 0], s: 6 + Math.random() * 10 }));
      const t0 = performance.now();
      const step = now => { const t = (now - t0) / 1600; ctx.clearRect(0, 0, w, h); if (t >= 1) return; for (const p of ps) { p.vy += 0.55; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.globalAlpha = 1 - t * t; ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 5, p.s, p.s / 2.5); ctx.restore(); } requestAnimationFrame(step); };
      requestAnimationFrame(step);
    };
    const snap = () => {
      if (snapped) return; snapped = true; while (run.splits.length < 5) run.splits.push(run.time); run.done = true; fill(); play('finish');
      if (RM) { G.set(flood, { clipPath: 'circle(150% at 50% 0)' }); G.set([tl, tr], { autoAlpha: 0 }); html.classList.add('is-flooded'); sec.classList.add('is-flooded'); return; }
      G.to(tl, { rotation: -28, y: '40vh', autoAlpha: 0, duration: 0.9, ease: 'power2.in' }); G.to(tr, { rotation: 24, y: '40vh', autoAlpha: 0, duration: 0.9, ease: 'power2.in' });
      confetti();
      G.to(flood, { clipPath: 'circle(150% at 50% 0)', duration: 0.8, ease: 'power3.inOut', delay: 0.15 });
      G.delayedCall(0.5, () => { html.classList.add('is-flooded'); sec.classList.add('is-flooded'); });
      G.fromTo(card, { y: 80, rotation: -12, autoAlpha: 0 }, { y: 0, rotation: 0, autoAlpha: 1, duration: 0.9, ease: 'expo.out', delay: 0.45 });
    };
    if (!RM) G.set(card, { autoAlpha: 0 });
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', onEnter: snap });
    $('[data-again]').addEventListener('click', () => {
      go(0, 2.2);
      G.delayedCall(lenis ? 2.3 : 0.6, () => {
        Object.assign(run, { started: false, done: false, time: 0, thumb: 0, splits: [], zt: { easy: 0, tempo: 0, interval: 0 }, paceSum: 0, paceN: 0 });
        snapped = false; html.classList.remove('is-flooded'); sec.classList.remove('is-flooded'); G.set(flood, { clipPath: 'circle(0% at 50% 0)' }); G.set([tl, tr], { rotation: 0, y: 0, autoAlpha: 1 }); if (!RM) G.set(card, { autoAlpha: 0 });
      });
    });
  };

  /* ---- everything that waits for the scroll ---- */
  const initScrollReveals = () => {
    $$('[data-reveal-scroll]').forEach(el => { const sec = el.closest('section'); ScrollTrigger.create({ trigger: el.closest('.pin') ? sec : el, start: el.closest('.pin') ? 'top 45%' : 'top 82%', once: true, onEnter: () => revealEl(el) }); });
    [['.note--3', '.km2'], ['.note--5', '.cards'], ['.note--6', '.km5'], ['.note--7', '.finish__copy']].forEach(([n, t]) => ScrollTrigger.create({ trigger: t, start: 'top 45%', once: true, onEnter: () => showNote($(n), 0.5) }));
    if (!RM) $$('.board').forEach(b => { const num = $('b', b); G.set(b, { rotation: -6 }); ScrollTrigger.create({ trigger: b.closest('section'), start: 'top 60%', once: true, onEnter: () => { G.to(b, { rotation: 0, duration: 0.9, ease: 'power2.out' }); G.fromTo(num, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'power2.out' }); } }); });
  };

  const init = () => {
    initGround(); initStart(); initTimer(); initStrength(); initCards(); initVault(); initFinish(); initScrollReveals();
    initPlan().then(() => ScrollTrigger.refresh());
    G.set($('.note--2'), { visibility: 'visible', autoAlpha: 0 });
    G.ticker.add(tickRun);
    ScrollTrigger.refresh();
    addEventListener('load', () => ScrollTrigger.refresh());
  };

  /* ---- 6.2 load: three, two, one ---- */
  const start = () => {
    if ('pageReady' in html.dataset) return;
    const bands = $$('.load__band'), num = $('.load__num');
    const open = (delay) => {
      html.dataset.pageReady = ''; init();
      $$('[data-reveal]').forEach((el, i) => revealEl(el, delay + (el.dataset.reveal === 'chars' ? 0 : 0.25 + i * 0.08)));
      G.delayedCall(delay + 1.6, () => showNote($('.note--1')));
    };
    if (RM) { html.dataset.loadDone = ''; open(0); return; }
    const first = !sessionStorage.getItem('runco-seen'); try { sessionStorage.setItem('runco-seen', '1'); } catch (e) {}
    const tl = G.timeline();
    if (first) ['3', '2', '1'].forEach(n => tl.call(() => { num.textContent = n; }).fromTo(num, { scale: 1.15 }, { scale: 1, duration: 0.28, ease: 'power2.out' }));
    tl.call(() => { num.textContent = ''; open(0.35); })
      .to(bands, { xPercent: 101, duration: 0.9, ease: 'expo.inOut', stagger: 0.06 })
      .call(() => { html.dataset.loadDone = ''; });
  };
  Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 1500))]).then(start);
}
