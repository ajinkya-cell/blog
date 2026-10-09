const {
  Cam, clamp, facing, fit, open, proj, ringAt, rrect, seg,
  tdone, tset, tval, tween, disposer, mk, pointer, register, rings, prism, solid, put
} = HL;

const N = 7, W = 18, H = 18, Z0 = 0, Z1 = 10, LIFT = 12;
const G_X = 36, G_Y = 40;

// Node definitions
// indices: 0 (root), 1 (L), 2 (R), 3 (LL), 4 (LR), 5 (RL), 6 (RR)
const NODES = [
  { id: 0, p: -1, x: 0, y: 0, level: 0 },
  { id: 1, p: 0, x: -G_X, y: G_Y, level: 1 },
  { id: 2, p: 0, x: G_X, y: G_Y, level: 1 },
  { id: 3, p: 1, x: -G_X * 1.5, y: G_Y * 2, level: 2 },
  { id: 4, p: 1, x: -G_X * 0.5, y: G_Y * 2, level: 2 },
  { id: 5, p: 2, x: G_X * 0.5, y: G_Y * 2, level: 2 },
  { id: 6, p: 2, x: G_X * 1.5, y: G_Y * 2, level: 2 },
];

function isDescendant(childId, ancestorId) {
  let curr = childId;
  while (curr !== -1) {
    if (curr === ancestorId) return true;
    curr = NODES[curr].p;
  }
  return false;
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 2.1);
  fit(C, [
    [-G_X * 2, -10, 0], [G_X * 2, G_Y * 2 + 10, 0],
    [0, 0, Z1 + LIFT]
  ], 200, 166);
  
  const P = proj(C), front = facing(C);
  const gTraces = mk("g", {}, svg);
  const gNodes = mk("g", {}, svg);

  const traces = [];
  const blocks = [];

  // 1. Draw traces on the ground
  for (let i = 1; i < N; i++) {
    const child = NODES[i];
    const parent = NODES[child.p];
    const el = mk("path", { class: "lo nf" }, gTraces);
    traces.push({ i, el, x0: parent.x, y0: parent.y, x1: child.x, y1: child.y });
  }

  // 2. Draw blocks
  for (let i = 0; i < N; i++) {
    const nd = NODES[i];
    const grp = mk("g", {}, gNodes);
    
    const blockSolid = solid(grp);
    // Decorator marks for "machined titanium"
    const mark = mk("path", { class: "lo nf" }, grp);
    
    blocks.push({
      id: i, x: nd.x, y: nd.y, level: nd.level,
      solid: blockSolid, mark, grp,
      zTw: tween(0),
    });
  }

  function hit([sx, sy]) {
    // hit test on resting nodes
    let best = -1, minDist = 20 * 20; // 20px radius
    for (let i = 0; i < N; i++) {
      const nd = NODES[i];
      const p = P(nd.x, nd.y, Z1); // test against top center of resting block
      const dx = sx - p[0], dy = sy - p[1];
      const d2 = dx * dx + dy * dy;
      if (d2 < minDist) { minDist = d2; best = i; }
    }
    return best;
  }

  function drawNode(b, zLift) {
    const [ring, inner] = rings(b.x - W/2, b.y - W/2, b.x + W/2, b.y + W/2, 4, 1.5);
    const shp = prism(P, front, ring, inner, Z0 + zLift, Z1 + zLift);
    put(b.solid, shp);

    // simple cross mark on top
    const tZ = Z1 + zLift;
    const m1 = seg(P(b.x - W/4, b.y, tZ), P(b.x + W/4, b.y, tZ));
    const m2 = seg(P(b.x, b.y - W/4, tZ), P(b.x, b.y + W/4, tZ));
    b.mark.setAttribute("d", m1 + m2);
  }

  function drawTrace(t, cLift, pLift) {
    // trace from parent center to child center, interpolating z
    // to keep it "razor thin" on the ground when resting, but rising if nodes lift
    const p0 = P(t.x0, t.y0, Z0 + pLift);
    const p1 = P(t.x1, t.y1, Z0 + cLift);
    t.el.setAttribute("d", seg(p0, p1));
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    
    // Evaluate tweens
    const lifts = blocks.map(b => {
      if (!tdone(b.zTw, now)) moving = true;
      return tval(b.zTw, now);
    });

    // Draw blocks
    blocks.forEach((b, i) => drawNode(b, lifts[i]));

    // Draw traces
    traces.forEach(t => drawTrace(t, lifts[t.i], lifts[NODES[t.i].p]));

    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now();
    const from = a >= 0 ? a : act;
    act = a;

    blocks.forEach(b => {
      // Lift if it is a descendant of the hovered node (including itself)
      const isLit = a >= 0 && isDescendant(b.id, a);
      const targetZ = isLit ? LIFT : 0;
      
      // Delay based on tree distance from hovered node
      // If a is hovered, distance is level diff
      const dist = isLit ? Math.abs(b.level - NODES[a].level) : Math.abs(b.level - (from >= 0 ? NODES[from].level : 0));
      const delay = dist * stag;
      
      tset(b.zTw, targetZ, now, delay);

      // Rule 04: highlight only the active parts
      b.solid.sil.classList.toggle("hi", isLit);
      b.mark.classList.toggle("m", isLit);
    });

    traces.forEach(t => {
      // highlight trace if both ends are lit
      const isLit = a >= 0 && isDescendant(t.i, a);
      t.el.classList.toggle("hi", isLit);
    });

    read.textContent = a < 0 ? "rest" : "node " + a;
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  // initial draw
  blocks.forEach(b => drawNode(b, 0));
  traces.forEach(t => drawTrace(t, 0, 0));

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}

hairline({
  name: "component-graph",
  means: "A tree of seven blocks: the one under the pointer and its descendants lift, lighting up.",
  rules: [1, 2, 8, 9],
  range: [0, 40, 90],
  mount,
});
