// The Windows transformation (index only). One progress value p in [0, 1] drives everything:
// every transform, row state and caption is a pure function of p, so any point can be jumped to and
// rewinding shows exactly the same frames. p plays by itself like a short film (~9.5 s, again each
// time it comes back on screen after finishing) and can be scrubbed by scrolling (see playback). The CPU graph and core grid wiggle on their own timer; their level
// still follows p. With reduced motion it still plays, but flat: no camera tilt, no depth moves.
(() => {
  const root = document.getElementById("transform");
  if (!root) return;
  const $ = (s) => root.querySelector(s);
  const $$ = (s) => [...root.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const small = matchMedia("(max-width: 1000px)");

  const stage = $(".xf-stage");
  const cam = $(".xf-cam");
  const win = { browser: $(".xf-browser"), launch: $(".xf-launch"), tm: $(".xf-tm"), qs: $(".xf-qs"), ft: $(".xf-ft") };
  const qsSeg = $$(".xf-qs-seg span");
  const coreEls = $$(".xf-cores i");
  const CORE_BASE = [88, 72, 95, 64, 81, 70, 92, 58, 77, 84, 66, 90, 73, 61, 86, 79, 69, 94, 57, 75];
  const caps = $$(".xf-cap");
  const steps = $$(".xf-steps li");
  const rows = $$(".xf-p");
  const bgRows = rows.filter((r) => r.dataset.p === "bg");
  const pauseRow = rows.find((r) => r.dataset.p === "pause");
  const graph = $(".xf-graph");
  const cpuN = $(".xf-cpu-n");
  const memN = $(".xf-mem-n");
  const ringN = $(".xf-ring-n");
  const sub = $(".xf-ft-sub");
  const trails = $(".xf-trails");

  // ---------- keyframes ----------
  // x/y/z in desktop pixels, rx/ry in degrees, s scale, o opacity, d dimming (depth of field)
  const DEF = { x: 0, y: 0, z: 0, rx: 0, ry: 0, s: 1, o: 1, d: 0 };
  const norm = (keys) => {
    let prev = DEF;
    return keys.map(([p, v]) => {
      const full = { ...prev, ...v };
      prev = full;
      return [p, full];
    });
  };
  const TRACKS = {
    cam: norm([
      [0, { s: 0.96 }],
      [0.1, {}],
      [0.3, { s: 1.1, rx: 7, ry: -12, x: -190, y: 18 }],
      [0.42, { s: 1.0, rx: 5, ry: -9, x: -110, y: 6 }],
      [0.7, { s: 1.02, rx: 4, ry: -7, x: -120, y: 0 }],
      [0.84, { s: 0.98, rx: 1, ry: -2, x: -60, y: 0 }],
      [1, { s: 0.93, rx: 3, ry: -6, x: -50, y: 4 }],
    ]),
    // phones: no tilt; the camera crops in on whatever the caption is talking about instead
    camSmall: norm([
      [0, { s: 1 }],
      [0.1, {}],
      [0.3, { s: 1.9, x: -470, y: 40 }],
      [0.42, { s: 1.75, x: -400, y: 30 }],
      [0.74, { s: 1.75, x: -400, y: 30 }],
      [0.86, { s: 1.6, x: -440, y: 10 }],
      [1, { s: 1.5, x: -400, y: 10 }],
    ]),
    browser: norm([
      [0, {}],
      [0.12, {}],
      [0.3, { z: -170, x: -20, d: 0.45 }],
      [0.7, { z: -210, x: -40, d: 0.55 }],
      [0.84, { z: -60, x: -10, d: 0.62, s: 0.97 }],
      [1, { z: -100, d: 0.66 }],
    ]),
    launch: norm([
      [0, { z: 30 }],
      [0.12, {}],
      [0.3, { z: -70, x: -20, y: 16, d: 0.4 }],
      [0.7, { z: -100, d: 0.5 }],
      [0.84, { z: -10, x: -40, y: 24, d: 0.58 }],
      [1, { z: -40, d: 0.6 }],
    ]),
    tm: norm([
      [0, { z: 10 }],
      [0.12, {}],
      [0.3, { z: 190 }],
      [0.42, { z: 120, x: -390 }],
      [0.7, { z: 110, x: -390 }],
      [0.84, { z: 30, x: -410, y: -6, d: 0.16 }],
      [1, { z: 10, x: -420, d: 0.28 }],
    ]),
    // Windows quick settings rises from the taskbar while Game Mode sets Best performance
    qs: norm([
      [0, { y: 70, z: 230, o: 0 }],
      [0.55, {}],
      [0.59, { y: 0, o: 1 }],
      [0.7, {}],
      [0.75, { y: 40, o: 0 }],
      [1, {}],
    ]),
    ft: norm([
      [0, { x: 460, z: 280, o: 0 }],
      [0.33, {}],
      [0.44, { x: 0, z: 200, o: 1 }],
      [0.7, { x: 0, z: 190 }],
      [0.84, { x: -60, z: 120 }],
      [1, { x: -80, z: 170, s: 1.05 }],
    ]),
  };

  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const range = (p, a, b) => clamp((p - a) / (b - a));
  function sample(keys, p) {
    if (p <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [p0, a] = keys[i];
      const [p1, b] = keys[i + 1];
      if (p <= p1) {
        const t = easeIO((p - p0) / (p1 - p0 || 1));
        const o = {};
        for (const k in a) o[k] = lerp(a[k], b[k], t);
        return o;
      }
    }
    return keys[keys.length - 1][1];
  }
  const tf = (v, flat) =>
    `translate3d(${v.x.toFixed(1)}px,${v.y.toFixed(1)}px,${(flat ? v.z * 0.5 : v.z).toFixed(1)}px) rotateX(${flat ? 0 : v.rx.toFixed(2)}deg) rotateY(${flat ? 0 : v.ry.toFixed(2)}deg) scale(${v.s.toFixed(4)})`;

  // ---------- the beats ----------
  const STEP0 = 0.46; // Game Mode starts its checklist
  const STEP_W = 0.04; // each of the 7 steps
  const DONE = STEP0 + STEP_W * 7; // 0.74: verified
  const busy = (p) => 1 - range(p, STEP0 + STEP_W * 2, DONE - STEP_W); // load falls once apps are lowered

  let lastCap = -1;
  let lastSteps = "";
  function render(p) {
    const flat = small.matches || reduce;
    root.classList.toggle("flat", flat);
    // camera + windows
    const c = sample(small.matches ? TRACKS.camSmall : TRACKS.cam, p);
    // the stage sits on the left in Hebrew, so the camera's sideways moves mirror (the desktop itself stays LTR)
    const cx = !small.matches && document.documentElement.dir === "rtl" ? -c.x * 0.35 : c.x;
    cam.style.transform = `translate3d(${cx.toFixed(1)}px,${c.y.toFixed(1)}px,0) rotateX(${flat ? 0 : c.rx.toFixed(2)}deg) rotateY(${flat ? 0 : c.ry.toFixed(2)}deg) scale(${c.s.toFixed(4)})`;
    for (const k of ["browser", "launch", "tm", "qs", "ft"]) {
      const v = sample(TRACKS[k], p);
      const el = win[k];
      el.style.transform = tf(v, flat);
      el.style.opacity = v.o.toFixed(3);
      el.style.setProperty("--xf-dim", v.d.toFixed(3));
      el.style.setProperty("--xf-z", (flat ? v.z * 0.5 : v.z).toFixed(0));
    }
    root.style.setProperty("--xf-shade", range(p, 0.76, 0.9).toFixed(3));
    // the establishing shot is seen through the screen's glass; it clears as the camera pushes in
    root.style.setProperty("--xf-glass", (1 - range(p, 0.04, 0.24)).toFixed(3));
    // FishyTweaks lights up Task Manager's edge once it's working
    root.style.setProperty("--xf-spill", (range(p, 0.44, 0.58) * (1 - 0.5 * range(p, 0.86, 1))).toFixed(3));
    // power mode: the selection slides to Best performance while step 4 runs
    const pos = easeIO(range(p, STEP0 + STEP_W * 3 + 0.004, STEP0 + STEP_W * 4 - 0.004));
    root.style.setProperty("--xf-qs-pos", pos.toFixed(3));
    root.style.setProperty("--xf-qs-by", range(p, STEP0 + STEP_W * 4 - 0.01, STEP0 + STEP_W * 4 + 0.01).toFixed(3));
    qsSeg.forEach((sp, i) => sp.classList.toggle("on", i === (pos > 0.5 ? 2 : 1)));
    root.style.setProperty("--xf-ft-on", (sample(TRACKS.ft, p).o * 0.08).toFixed(3));

    // captions
    const cap = p < 0.2 ? 0 : p < 0.42 ? 1 : p < 0.76 ? 2 : 3;
    if (cap !== lastCap) {
      caps.forEach((el, i) => el.classList.toggle("on", i === cap));
      lastCap = cap;
    }

    // Game Mode checklist
    const done = steps.map((_, i) => p >= STEP0 + STEP_W * (i + 1));
    const nDone = done.filter(Boolean).length;
    const key = done.join();
    if (key !== lastSteps) {
      steps.forEach((li, i) => {
        li.classList.toggle("done", done[i]);
        li.classList.toggle("run", !done[i] && p >= STEP0 + STEP_W * i && p >= STEP0);
      });
      ringN.textContent = `${nDone}/7`;
      sub.textContent = p < STEP0 ? "Waiting for Fortnite" : nDone < 7 ? "Fortnite is starting · applying" : "Ready · the match has the PC";
      lastSteps = key;
    } else {
      // the running step can change without a new "done"
      steps.forEach((li, i) => li.classList.toggle("run", !done[i] && p >= STEP0 + STEP_W * i));
    }
    root.style.setProperty("--xf-ring", (1 - nDone / 7).toFixed(3));
    root.style.setProperty("--xf-foot", range(p, DONE - 0.005, DONE + 0.03).toFixed(3));

    // Task Manager rows react to the steps that touch them
    setRow(pauseRow, done[1], "paused", "Paused by Game Mode");
    bgRows.forEach((r, i) => setRow(r, p >= STEP0 + STEP_W * 2 + (i + 1) * (STEP_W / (bgRows.length + 1)), "managed", "Efficiency mode"));
    const b = busy(p);
    rows.forEach((r) => {
      const a = r.querySelector(".cpu");
      if (a && a.dataset.a) r.classList.toggle("hot", b > 0.5 && !r.classList.contains("managed") && !r.classList.contains("paused") && +a.dataset.a >= 5);
    });
    level = b;
    if (reduce && Math.abs(b - drawnLevel) > 0.02) {
      // no clock with reduced motion: redraw the graph at the new level straight away
      for (let i = 0; i < 60; i++) hist[i] = 22 + b * 58 + Math.sin(i / 2.5) * 4;
      drawnLevel = b;
      drawGraph();
    }
    drawTrails(p);
  }

  // CPU cells carry a small load bar, like the comparison below
  const cpuCell = (el, v) => (el.innerHTML = `<i style="--w:${Math.min(100, v * 3)}%"></i>${v}%`);
  rows.forEach((r) => {
    const c = r.querySelector(".cpu");
    cpuCell(c, c.dataset.a != null ? +c.dataset.a : parseInt(c.textContent, 10));
  });
  function setRow(r, on, cls, label) {
    if (!r || r.classList.contains(cls) === on) return;
    r.classList.toggle(cls, on);
    r.querySelector(".st").textContent = on ? label : "";
    const cpu = r.querySelector(".cpu");
    cpuCell(cpu, on ? +cpu.dataset.b : +cpu.dataset.a);
    if (on) {
      r.classList.remove("flash");
      void r.offsetWidth;
      r.classList.add("flash");
    }
  }

  // ---------- light trails: from "Lower background apps" to every row it changed ----------
  const NS = "http://www.w3.org/2000/svg";
  trails.innerHTML = `<defs><linearGradient id="xf-trail-g" x1="0" x2="1"><stop offset="0" stop-color="#3b82f6" stop-opacity="0.1"/><stop offset="0.5" stop-color="#22d3ee"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0.2"/></linearGradient></defs>`;
  const targets = [pauseRow, ...bgRows];
  const paths = targets.map(() => {
    const el = document.createElementNS(NS, "path");
    el.setAttribute("pathLength", "1");
    el.style.strokeDasharray = "1";
    trails.appendChild(el);
    return el;
  });
  function drawTrails(p) {
    const show = p > STEP0 + STEP_W && p < DONE + 0.08 && !small.matches;
    trails.style.display = show ? "" : "none";
    if (!show) return;
    const base = stage.getBoundingClientRect();
    const from = steps[2].getBoundingClientRect();
    const fade = 1 - range(p, DONE, DONE + 0.07);
    targets.forEach((row, i) => {
      const startP = i === 0 ? STEP0 + STEP_W : STEP0 + STEP_W * 2 + (i * STEP_W) / (bgRows.length + 1);
      const t = range(p, startP - 0.01, startP + 0.03);
      const to = row.querySelector(".st").getBoundingClientRect();
      const x1 = from.left - base.left;
      const y1 = from.top + from.height / 2 - base.top;
      const x2 = to.left - base.left + 4;
      const y2 = to.top + to.height / 2 - base.top;
      const mx = (x1 + x2) / 2;
      paths[i].setAttribute("d", `M${x1.toFixed(1)},${y1.toFixed(1)} C${mx.toFixed(1)},${y1.toFixed(1)} ${mx.toFixed(1)},${y2.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}`);
      paths[i].style.strokeDashoffset = (1 - t).toFixed(3);
      paths[i].style.opacity = (fade * (t > 0 ? 1 : 0)).toFixed(3);
    });
  }

  // ---------- the CPU graph (illustration): level follows p, the wiggle runs on a clock ----------
  let level = 1;
  let drawnLevel = -1;
  const hist = Array.from({ length: 60 }, (_, i) => 70 + Math.sin(i / 3) * 8);
  const g = graph.getContext("2d");
  function sizeGraph() {
    const dpr = Math.min(2, devicePixelRatio || 1);
    graph.width = 440 * dpr;
    graph.height = 120 * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function tick() {
    const target = 22 + level * 58;
    const noise = (Math.random() - 0.5) * (6 + level * 16);
    const prev = hist[hist.length - 1];
    hist.push(clamp(prev + (target - prev) * 0.35 + noise, 3, 99));
    hist.shift();
    drawGraph();
  }
  function drawGraph() {
    const W = 440;
    const H = 120;
    g.clearRect(0, 0, W, H);
    g.strokeStyle = "rgba(255,255,255,0.05)";
    g.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      g.beginPath();
      g.moveTo(0, (H / 4) * i + 0.5);
      g.lineTo(W, (H / 4) * i + 0.5);
      g.stroke();
    }
    const warm = level > 0.5;
    const col = warm ? [245, 158, 11] : [59, 130, 246];
    const pts = hist.map((v, i) => [(i / (hist.length - 1)) * W, H - (v / 100) * H]);
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.lineTo(W, H);
    g.lineTo(0, H);
    const fill = g.createLinearGradient(0, 0, 0, H);
    fill.addColorStop(0, `rgba(${col},0.32)`);
    fill.addColorStop(1, `rgba(${col},0.02)`);
    g.fillStyle = fill;
    g.fill();
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.strokeStyle = `rgb(${col})`;
    g.lineWidth = 1.6;
    g.stroke();
    const now = Math.round(hist[hist.length - 1]);
    cpuN.textContent = `${now}%`;
    coreEls.forEach((el, i) => el.style.setProperty("--u", clamp(10 + level * CORE_BASE[i] * 0.95 + (Math.random() - 0.5) * 14 * (0.4 + level), 4, 100).toFixed(0)));
    root.style.setProperty("--xf-core-c", warm ? "#f59e0b" : "#3b82f6");
    root.style.setProperty("--xf-cpu-c", warm ? "#f59e0b" : "#60a5fa");
    const mem = 10.9 + level * 1.5;
    memN.textContent = `${mem.toFixed(1)} / 16 GB`;
    root.style.setProperty("--xf-mem", `${((mem / 16) * 100).toFixed(1)}%`);
  }

  // ---------- fit the 1280×780 desktop into the stage ----------
  function fit() {
    const r = stage.getBoundingClientRect();
    const s = Math.min(r.width / 1280, r.height / 780) * (small.matches ? 1 : 0.97);
    root.style.setProperty("--xf-s", s.toFixed(4));
  }

  sizeGraph();
  root.classList.add("live");
  fit();

  // ---------- playback: a short film you can also scrub ----------
  // The section is pinned for a short scroll. The first time its picture is half on screen the film
  // plays by itself (~15 s). Scrolling inside the pinned part moves the playhead by the same amount
  // (down = forward, up = rewind) and holds autoplay while you scroll; leaving the bottom finishes
  // the film. A light smoothing makes wheel notches glide.
  const DUR = 9500;
  const track = $(".xf-track");
  let goal = 0; // where the playhead is heading
  let shown = 0; // what's on screen (eases toward goal)
  let playing = false;
  let autoPaused = false;
  let started = false;
  let leftAfterEnd = false;
  let finished = false; // reached the end at least once since the last (re)play
  let last = 0;
  let raf = 0;
  let scrollHold = 0;
  const scrollP = () => {
    const r = track.getBoundingClientRect();
    return clamp(-r.top / Math.max(1, r.height - innerHeight));
  };
  let prevScroll = scrollP();
  const paint = () => {
    render(shown);
    root.dataset.state = playing ? "playing" : goal >= 1 ? "done" : "paused";
  };
  const loop = (now) => {
    if (playing && now > scrollHold) goal = Math.min(1, goal + (now - last) / DUR);
    last = now;
    if (goal >= 1) {
      playing = false;
      finished = true;
    }
    shown += (goal - shown) * (reduce ? 1 : 0.16);
    if (Math.abs(goal - shown) < 0.0003) shown = goal;
    paint();
    raf = playing || shown !== goal ? requestAnimationFrame(loop) : 0;
    root.classList.toggle("moving", !!raf);
  };
  const kick = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  };
  const play = () => {
    if (goal >= 1 || finished) goal = shown = 0;
    finished = false;
    playing = true;
    autoPaused = false;
    kick();
    paint();
  };
  const pause = (auto) => {
    if (!playing) return;
    playing = false;
    autoPaused = !!auto;
    paint();
  };
  addEventListener(
    "scroll",
    () => {
      const sp = scrollP();
      const d = sp - prevScroll;
      prevScroll = sp;
      if (!d) return;
      goal = sp >= 0.999 ? 1 : clamp(goal + d);
      scrollHold = performance.now() + 700; // autoplay waits while you scroll
      kick();
    },
    { passive: true }
  );
  addEventListener("resize", () => {
    fit();
    prevScroll = scrollP();
    paint();
  });
  small.addEventListener("change", () => {
    fit();
    paint();
  });
  // for the QA frame tools (tools/xform-frames.cjs): jump to an exact moment and hold it
  root.xfSeek = (v) => {
    playing = false;
    started = true;
    goal = shown = clamp(v);
    paint();
  };
  // arriving from a link below (or a reload further down) shows the finished state, not the start
  if (scrollP() >= 0.999) goal = shown = 1;
  paint();

  // start when at least half of the picture is on screen; pause off screen or in a background tab
  const visible = () => {
    const r = stage.getBoundingClientRect();
    return r.top < innerHeight * 0.5 && r.bottom > innerHeight * 0.5;
  };
  new IntersectionObserver(
    ([e]) => {
      const on = e.isIntersecting && e.intersectionRatio >= 0.5;
      if (on && !document.hidden) {
        if (!started) {
          started = true;
          if (goal < 1) setTimeout(() => visible() && play(), 300);
        } else if (autoPaused) play();
        else if (leftAfterEnd) setTimeout(() => visible() && play(), 300);
        leftAfterEnd = false;
      } else if (!on) {
        if (finished) leftAfterEnd = true;
        pause(true);
      }
    },
    { threshold: [0, 0.5] }
  ).observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pause(true);
    else if (autoPaused && visible()) play();
  });

  // the graph only ticks while the section is on screen and the tab is visible
  let timer = 0;
  const run = (on) => {
    clearInterval(timer);
    timer = on && !reduce ? setInterval(tick, 140) : 0;
  };
  new IntersectionObserver(([e]) => run(e.isIntersecting && !document.hidden)).observe(root);
  document.addEventListener("visibilitychange", () => run(!document.hidden && root.getBoundingClientRect().bottom > 0 && root.getBoundingClientRect().top < innerHeight));
  drawGraph();
})();

// Before / after slider: pointer drag anywhere on the box, touch (vertical scrolling still works),
// keyboard (arrows, Shift for bigger steps, Home/End), and a soft snap to the edges and the middle.
(() => {
  const box = document.querySelector(".ba-box");
  if (!box) return;
  const handle = box.querySelector(".ba-handle");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let v = 50;
  const set = (n, snap) => {
    v = Math.min(100, Math.max(0, n));
    box.classList.toggle("snap", !!snap && !reduce);
    box.style.setProperty("--ba", v.toFixed(2));
    handle.setAttribute("aria-valuenow", String(Math.round(v)));
  };
  const at = (e) => {
    const r = box.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  };
  let drag = null;
  box.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, live: e.pointerType === "mouse" };
    if (drag.live) {
      box.setPointerCapture(e.pointerId);
      box.classList.add("drag");
      set(at(e), true);
    }
  });
  box.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    // on touch, only take over once the finger clearly moves sideways, so the page still scrolls
    if (!drag.live) {
      const dx = Math.abs(e.clientX - drag.x);
      const dy = Math.abs(e.clientY - drag.y);
      if (dy > dx && dy > 6) {
        drag = null;
        return;
      }
      if (dx < 6) return;
      drag.live = true;
      box.setPointerCapture(e.pointerId);
      box.classList.add("drag");
    }
    set(at(e), false);
  });
  const end = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.live) set(at(e), true); // a tap jumps there
    drag = null;
    box.classList.remove("drag");
    const snapTo = [0, 50, 100].find((s) => Math.abs(s - v) < 4);
    if (snapTo != null && snapTo !== v) {
      set(snapTo, true);
      if (navigator.vibrate) navigator.vibrate(6);
    }
  };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 10 : 2;
    const k = { ArrowLeft: -step, ArrowDown: -step, ArrowRight: step, ArrowUp: step, PageDown: -10, PageUp: 10 }[e.key];
    if (k != null) set(v + k, true);
    else if (e.key === "Home") set(0, true);
    else if (e.key === "End") set(100, true);
    else return;
    e.preventDefault();
  });
  // the first time it scrolls into view, nudge the handle once so it reads as draggable
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([en]) => {
        if (!en.isIntersecting) return;
        io.disconnect();
        setTimeout(() => set(64, true), 500);
        setTimeout(() => set(50, true), 1000);
      },
      { threshold: 0.6 }
    );
    io.observe(box);
  }
})();

// Hero window: a resting tilt that flattens over the first ~60% of a screen of scrolling, plus a
// few degrees toward the mouse on a fine pointer. Eased on rAF; stops when it settles.
(() => {
  const shot = document.querySelector(".hero-shot");
  const win = shot && shot.querySelector(".window");
  if (!win || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const fine = matchMedia("(pointer: fine)").matches;
  const REST = 11;
  let mx = 0;
  let my = 0;
  const cur = { x: REST, y: 0 };
  let raf = 0;
  const goal = () => {
    const flat = Math.min(1, scrollY / (innerHeight * 0.6));
    return { x: REST * (1 - flat) + my * -2.5, y: mx * 3 };
  };
  const loop = () => {
    const g = goal();
    cur.x += (g.x - cur.x) * 0.12;
    cur.y += (g.y - cur.y) * 0.12;
    win.style.setProperty("--hx", `${cur.x.toFixed(3)}deg`);
    win.style.setProperty("--hy", `${cur.y.toFixed(3)}deg`);
    raf = Math.abs(g.x - cur.x) + Math.abs(g.y - cur.y) > 0.01 ? requestAnimationFrame(loop) : 0;
  };
  const kick = () => {
    if (!raf) raf = requestAnimationFrame(loop);
  };
  addEventListener("scroll", kick, { passive: true });
  if (fine) {
    shot.addEventListener("pointermove", (e) => {
      const r = win.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      win.style.setProperty("--gx", `${((mx + 1) * 50).toFixed(1)}%`);
      win.style.setProperty("--gy", `${((my + 1) * 50).toFixed(1)}%`);
      kick();
    });
    shot.addEventListener("pointerleave", () => {
      mx = my = 0;
      kick();
    });
  }
  // the CSS entrance animates transform; take over once it has finished
  win.addEventListener("animationend", () => {
    win.style.animation = "none";
    kick();
  }, { once: true });
  win.style.setProperty("--hx", `${REST}deg`);
})();
