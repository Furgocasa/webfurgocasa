import * as THREE from "three";

export interface GuiaCamper3dCallbacks {
  onLessonChange: (name: string) => void;
  onXrayChange: (active: boolean) => void;
}

export function initGuiaCamper3dScene(
  canvas: HTMLCanvasElement,
  callbacks: GuiaCamper3dCallbacks,
): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    300,
  );

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const C = (h: number | string) => new THREE.Color(h);
  const smoothstep = (t: number) => t * t * (3 - 2 * t);

  let viewFactor = 1;
  let liftY = 0;
  function computeViewFactor() {
    const a = window.innerWidth / window.innerHeight;
    if (a >= 1.05) {
      viewFactor = 1;
      liftY = 0;
    } else {
      viewFactor = Math.min(2.4, 1 + (1.05 - a) * 2.0);
      liftY = (1.05 - a) * 1.1;
    }
  }
  computeViewFactor();

  const KEYS = [
    { p: 0, sky: C(0x8fcbee), fog: C(0xc4e4f5), sun: C(0xfff4d6), sunI: 3.2, hemi: 0.85, gr: C(0x9db872), star: 0 },
    { p: 0.55, sky: C(0xffc172), fog: C(0xffd9a3), sun: C(0xffb45c), sunI: 2.4, hemi: 0.6, gr: C(0xa39458), star: 0 },
    { p: 0.78, sky: C(0xd96a52), fog: C(0xe08a6e), sun: C(0xff7e45), sunI: 1.4, hemi: 0.38, gr: C(0x6e5a44), star: 0.15 },
    { p: 0.9, sky: C(0x2e2750), fog: C(0x3e3460), sun: C(0xb088b8), sunI: 0.5, hemi: 0.22, gr: C(0x343050), star: 0.6 },
    { p: 1, sky: C(0x0b1024), fog: C(0x101630), sun: C(0x8fa8ff), sunI: 0.2, hemi: 0.13, gr: C(0x151a30), star: 1 },
  ];

  function cyc(p: number) {
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].p) i++;
    const ka = KEYS[i];
    const kb = KEYS[i + 1];
    const t = Math.min(1, Math.max(0, (p - ka.p) / (kb.p - ka.p)));
    return {
      sky: ka.sky.clone().lerp(kb.sky, t),
      fog: ka.fog.clone().lerp(kb.fog, t),
      sun: ka.sun.clone().lerp(kb.sun, t),
      sunI: lerp(ka.sunI, kb.sunI, t),
      hemi: lerp(ka.hemi, kb.hemi, t),
      gr: ka.gr.clone().lerp(kb.gr, t),
      star: lerp(ka.star, kb.star, t),
    };
  }

  scene.fog = new THREE.Fog(0xc4e4f5, 30, 120);

  const sun = new THREE.DirectionalLight(0xfff4d6, 3.2);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -14;
  sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 14;
  sun.shadow.camera.bottom = -6;
  sun.shadow.bias = -0.0004;
  sun.position.set(12, 16, 8);
  scene.add(sun);
  scene.add(sun.target);

  const hemi = new THREE.HemisphereLight(0xc4e4f5, 0x9db872, 0.85);
  scene.add(hemi);

  const grMat = new THREE.MeshStandardMaterial({ color: 0x9db872, roughness: 1, flatShading: true });
  const gnd = new THREE.Mesh(new THREE.CircleGeometry(70, 48), grMat);
  gnd.rotation.x = -Math.PI / 2;
  gnd.position.y = -0.02;
  gnd.receiveShadow = true;
  scene.add(gnd);

  const asf = new THREE.Mesh(
    new THREE.CircleGeometry(11, 48),
    new THREE.MeshStandardMaterial({ color: 0x3c3e46, roughness: 0.95 }),
  );
  asf.rotation.x = -Math.PI / 2;
  asf.receiveShadow = true;
  scene.add(asf);

  const paint = new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.8 });
  for (const x of [-3.2, 3.2]) {
    const l = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.015, 8), paint);
    l.position.set(x, 0.01, 0);
    scene.add(l);
  }

  const trunkM = new THREE.MeshStandardMaterial({ color: 0x6b4a2e, roughness: 1, flatShading: true });
  const leafM = new THREE.MeshStandardMaterial({ color: 0x3e7c3a, roughness: 1, flatShading: true });
  for (let i = 0; i < 22; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 15 + Math.random() * 38;
    const g = new THREE.Group();
    const h = 2.5 + Math.random() * 2;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, h, 6), trunkM);
    tr.position.y = h / 2;
    tr.castShadow = true;
    g.add(tr);
    const lv = new THREE.Mesh(
      new THREE.ConeGeometry(1.1 + Math.random(), 2.4 + Math.random() * 1.6, 7),
      leafM,
    );
    lv.position.y = h + 1;
    lv.castShadow = true;
    g.add(lv);
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    scene.add(g);
  }

  const mtnM = new THREE.MeshStandardMaterial({ color: 0x9a8c9e, roughness: 1, flatShading: true });
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    const m = new THREE.Mesh(
      new THREE.ConeGeometry(14 + Math.random() * 12, 16 + Math.random() * 14, 5),
      mtnM,
    );
    m.position.set(Math.cos(a) * 85, 5, Math.sin(a) * 85);
    scene.add(m);
  }

  const SN = 1400;
  const stG = new THREE.BufferGeometry();
  const stP = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) {
    const a = Math.random() * Math.PI * 2;
    const e = Math.random() * Math.PI * 0.5;
    stP[i * 3] = Math.cos(a) * Math.cos(e) * 150;
    stP[i * 3 + 1] = Math.sin(e) * 120 + 8;
    stP[i * 3 + 2] = Math.sin(a) * Math.cos(e) * 150;
  }
  stG.setAttribute("position", new THREE.BufferAttribute(stP, 3));
  const stM = new THREE.PointsMaterial({
    color: 0xeaf2ff,
    size: 0.45,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  scene.add(new THREE.Points(stG, stM));

  const poleM = new THREE.MeshStandardMaterial({ color: 0x2a6e4e, roughness: 0.6 });
  const pole = new THREE.Group();
  const pp = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.3), poleM);
  pp.position.y = 0.6;
  pp.castShadow = true;
  pole.add(pp);
  const ph = new THREE.Mesh(
    new THREE.BoxGeometry(0.36, 0.3, 0.36),
    new THREE.MeshStandardMaterial({ color: 0xe8e2d0, roughness: 0.5 }),
  );
  ph.position.y = 1.05;
  pole.add(ph);
  pole.position.set(-4.6, 0, 2.2);
  scene.add(pole);

  const tap = new THREE.Group();
  const tp = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 1, 10),
    new THREE.MeshStandardMaterial({ color: 0x4a7bb5, roughness: 0.4, metalness: 0.5 }),
  );
  tp.position.y = 0.5;
  tp.castShadow = true;
  tap.add(tp);
  const tn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.34, 8), tp.material);
  tn.rotation.z = Math.PI / 2;
  tn.position.set(0.16, 0.95, 0);
  tap.add(tn);
  tap.position.set(-4.6, 0, -1.6);
  scene.add(tap);

  const grid = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.03, 1.2),
    new THREE.MeshStandardMaterial({ color: 0x1e2026, roughness: 0.6, metalness: 0.4 }),
  );
  grid.position.set(1.2, 0.012, 1.2);
  scene.add(grid);
  for (let i = 0; i < 5; i++) {
    const bar = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.035, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x55585f, roughness: 0.5, metalness: 0.6 }),
    );
    bar.position.set(1.2, 0.02, 0.8 + i * 0.2);
    scene.add(bar);
  }

  // ---------- LA CAMPER · perfil Ducato gran volumen (con modo rayos X) ----------
  const van = new THREE.Group();
  van.position.set(0, 0, 0);
  scene.add(van);

  const bodyMat = new THREE.MeshPhysicalMaterial({
    color: 0xf4f3ee,
    roughness: 0.32,
    metalness: 0.05,
    clearcoat: 0.6,
    clearcoatRoughness: 0.25,
    transparent: true,
  });
  const naranjaM = new THREE.MeshStandardMaterial({
    color: 0xff6b2c,
    roughness: 0.45,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const vidrioM = new THREE.MeshPhysicalMaterial({
    color: 0x10161f,
    roughness: 0.08,
    metalness: 0.4,
    clearcoat: 1,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const negroM = new THREE.MeshStandardMaterial({ color: 0x16161a, roughness: 0.85 });
  const plastM = new THREE.MeshStandardMaterial({
    color: 0x26282c,
    roughness: 0.92,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const cromM = new THREE.MeshStandardMaterial({ color: 0xb9bdc4, roughness: 0.25, metalness: 0.9 });
  type XrayMat = THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
  const xrayMats: XrayMat[] = [bodyMat, naranjaM, vidrioM, plastM];

  function vb(
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number,
    xray = true,
  ) {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    van.add(m);
    if (xray) m.userData.xray = true;
    return m;
  }

  const P = new THREE.Shape();
  P.moveTo(-3.36, 0.52);
  P.lineTo(-3.44, 1.0);
  P.lineTo(-3.36, 1.5);
  P.quadraticCurveTo(-3.26, 1.66, -2.98, 1.7);
  P.lineTo(-2.62, 1.78);
  P.lineTo(-1.95, 2.45);
  P.quadraticCurveTo(-1.75, 2.6, -1.45, 2.62);
  P.lineTo(2.28, 2.62);
  P.quadraticCurveTo(2.54, 2.6, 2.56, 2.28);
  P.lineTo(2.53, 0.5);
  P.lineTo(-3.36, 0.52);

  const shellGeo = new THREE.ExtrudeGeometry(P, {
    depth: 2.06,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.06,
    bevelSegments: 3,
    curveSegments: 10,
  });
  shellGeo.rotateY(-Math.PI / 2);
  shellGeo.translate(1.08, 0, 0);
  const shell = new THREE.Mesh(shellGeo, bodyMat);
  shell.castShadow = true;
  shell.receiveShadow = true;
  van.add(shell);

  const wN = new THREE.Vector3(0, 1, -1).normalize();
  const wMid = new THREE.Vector3(0, 2.12, -2.27);
  const mask = new THREE.Mesh(new THREE.PlaneGeometry(2.04, 1.06), negroM);
  mask.position.copy(wMid).addScaledVector(wN, 0.075);
  mask.lookAt(mask.position.clone().add(wN));
  van.add(mask);
  const wsh = new THREE.Mesh(new THREE.PlaneGeometry(1.88, 0.92), vidrioM);
  wsh.position.copy(wMid).addScaledVector(wN, 0.085);
  wsh.lookAt(wsh.position.clone().add(wN));
  van.add(wsh);

  function sideMesh(ptsL: number[][], mat: THREE.Material, side: number, ax: number) {
    const pts = side < 0 ? ptsL : ptsL.map((p) => [-p[0], p[1]]).reverse();
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
    m.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    m.position.x = side * ax;
    van.add(m);
    return m;
  }

  const cabW = [
    [-2.45, 1.72],
    [-1.66, 1.72],
    [-1.66, 2.34],
    [-2.12, 2.34],
  ];
  for (const s of [-1, 1]) sideMesh(cabW, vidrioM, s, 1.15);

  const sw1 = [
    [0.2, 0.98],
    [1.7, 1.5],
    [1.7, 1.66],
    [0.2, 1.14],
  ];
  const sw2 = [
    [-0.6, 0.9],
    [0.9, 1.42],
    [0.9, 1.5],
    [-0.6, 0.98],
  ];
  const sw3 = [
    [1.9, 1.62],
    [2.4, 1.8],
    [2.4, 1.92],
    [1.9, 1.74],
  ];
  for (const s of [-1, 1]) {
    sideMesh(sw1, naranjaM, s, 1.155);
    sideMesh(sw2, naranjaM, s, 1.155);
    sideMesh(sw3, naranjaM, s, 1.155);
  }

  const winGlow = new THREE.MeshStandardMaterial({
    color: 0x141a24,
    roughness: 0.12,
    metalness: 0.5,
    emissive: 0xffb35c,
    emissiveIntensity: 0,
    transparent: true,
    side: THREE.DoubleSide,
  });
  xrayMats.push(winGlow);

  function rrect(w: number, h: number, r: number) {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2);
    s.lineTo(w / 2 - r, -h / 2);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r);
    s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  }

  function flushWin(w: number, h: number, side: number, z: number, y: number) {
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(rrect(w + 0.1, h + 0.1, 0.1)), plastM);
    const gl = new THREE.Mesh(new THREE.ShapeGeometry(rrect(w, h, 0.07)), winGlow);
    fr.rotation.y = gl.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
    fr.position.set(side * 1.152, y, z);
    gl.position.set(side * 1.158, y, z);
    van.add(fr);
    van.add(gl);
  }

  flushWin(1.05, 0.55, 1, -1.0, 1.86);
  flushWin(1.15, 0.55, 1, 1.25, 1.86);
  flushWin(1.0, 0.55, -1, -0.1, 1.86);
  flushWin(0.8, 0.5, -1, 1.5, 1.88);

  for (const s of [-1, 1]) {
    const fr = new THREE.Mesh(new THREE.ShapeGeometry(rrect(0.92, 1.05, 0.12)), plastM);
    fr.position.set(s * 0.53, 1.82, 2.665);
    van.add(fr);
    const g = new THREE.Mesh(new THREE.ShapeGeometry(rrect(0.84, 0.96, 0.1)), winGlow);
    g.position.set(s * 0.53, 1.82, 2.672);
    van.add(g);
  }

  for (const [z, w, h, yy] of [
    [-1.92, 0.025, 1.62, 1.32],
    [0.42, 0.025, 1.62, 1.32],
  ] as const) {
    const j = new THREE.Mesh(new THREE.BoxGeometry(0.012, h, w), plastM);
    j.position.set(1.142, yy, z);
    van.add(j);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.07, 2.6), plastM);
  rail.position.set(1.145, 0.78, -0.6);
  van.add(rail);
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.3), negroM);
  handle.position.set(1.15, 1.18, -1.65);
  van.add(handle);
  const sstep = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.95), cromM);
  sstep.position.set(1.17, 0.3, -0.75);
  van.add(sstep);

  for (const [x, z] of [
    [-1.08, -2.35],
    [1.08, -2.35],
    [-1.08, 1.7],
    [1.08, 1.7],
  ] as const) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.055, 8, 24, Math.PI), plastM);
    arch.rotation.y = Math.PI / 2;
    arch.position.set(x, 0.46, z);
    van.add(arch);
  }
  for (const s of [-1, 1]) {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.3, 5.7), plastM);
    skirt.position.set(s * 1.12, 0.58, -0.4);
    van.add(skirt);
  }

  for (const [x, z] of [
    [-1.02, -2.35],
    [1.02, -2.35],
    [-1.02, 1.7],
    [1.02, 1.7],
  ] as const) {
    const g = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24), negroM);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    g.add(tire);
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.31, 16), cromM);
    rim.rotation.z = Math.PI / 2;
    g.add(rim);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.32, 12), naranjaM);
    cap.rotation.z = Math.PI / 2;
    g.add(cap);
    g.position.set(x, 0.45, z);
    van.add(g);
  }

  const fN = new THREE.Vector3(0, 0.16, -1).normalize();
  const fMid = new THREE.Vector3(0, 1.26, -3.4);

  function frontAttach(mesh: THREE.Mesh, lx: number, ly: number, off: number) {
    mesh.position.copy(fMid).addScaledVector(fN, 0.07 + off);
    mesh.lookAt(mesh.position.clone().add(fN));
    mesh.translateX(lx);
    mesh.translateY(ly);
    van.add(mesh);
    return mesh;
  }

  function faceShape(pts: number[][], mat: THREE.Material) {
    const s = new THREE.Shape();
    s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]);
    s.closePath();
    return new THREE.Mesh(new THREE.ShapeGeometry(s), mat);
  }

  frontAttach(
    faceShape(
      [
        [-0.8, 0.2],
        [0.8, 0.2],
        [0.55, -0.26],
        [-0.55, -0.26],
      ],
      negroM,
    ),
    0,
    0,
    0.004,
  );
  frontAttach(new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.024, 8, 24), cromM), 0, -0.03, 0.015);

  const hlM = new THREE.MeshStandardMaterial({
    color: 0xe8ecf2,
    roughness: 0.18,
    metalness: 0.45,
    emissive: 0xfff1b8,
    emissiveIntensity: 0.35,
  });
  const fogG = new THREE.CylinderGeometry(0.07, 0.07, 0.05, 12);
  fogG.rotateX(Math.PI / 2);

  for (const s of [-1, 1]) {
    const marco = [
      [0.4, -0.02],
      [1.07, 0.04],
      [1.07, 0.24],
      [0.4, 0.2],
    ].map((p) => [p[0] * s, p[1]]);
    frontAttach(faceShape(marco, negroM), 0, 0, 0.008);
    const optica = [
      [0.44, 0.01],
      [1.03, 0.06],
      [1.03, 0.21],
      [0.44, 0.17],
    ].map((p) => [p[0] * s, p[1]]);
    frontAttach(faceShape(optica, hlM), 0, 0, 0.014);
  }

  const bumperF = new THREE.Mesh(new THREE.BoxGeometry(2.22, 0.5, 0.3), plastM);
  bumperF.position.set(0, 0.62, -3.33);
  van.add(bumperF);
  for (let i = 0; i < 3; i++) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.035, 0.04), negroM);
    slat.position.set(0, 0.5 + i * 0.08, -3.495);
    van.add(slat);
  }
  for (const s of [-1, 1]) {
    const fog = new THREE.Mesh(fogG, hlM);
    fog.position.set(s * 0.88, 0.55, -3.49);
    van.add(fog);
  }
  const plateF = new THREE.Mesh(
    new THREE.BoxGeometry(0.52, 0.13, 0.02),
    new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.4 }),
  );
  plateF.position.set(0, 0.88, -3.5);
  van.add(plateF);

  for (const s of [-1, 1]) {
    const wip = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.022, 0.02), negroM);
    wip.position.copy(wMid).addScaledVector(wN, 0.095);
    wip.lookAt(wip.position.clone().add(wN));
    wip.translateX(s * 0.4);
    wip.translateY(-0.34);
    wip.rotateZ(s * 0.22);
    van.add(wip);
  }

  const split = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.95, 0.015), plastM);
  split.position.set(0, 1.55, 2.665);
  van.add(split);
  const tailM = new THREE.MeshStandardMaterial({
    color: 0x7a1010,
    roughness: 0.3,
    emissive: 0xff2a2a,
    emissiveIntensity: 0.35,
  });
  const tailHous = new THREE.MeshStandardMaterial({
    color: 0xd8dce2,
    roughness: 0.25,
    metalness: 0.3,
    transparent: true,
  });
  xrayMats.push(tailHous);

  for (const s of [-1, 1]) {
    const hous = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.92, 0.06), tailHous);
    hous.position.set(s * 1.0, 1.02, 2.665);
    van.add(hous);
    const red1 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.065), tailM);
    red1.position.set(s * 1.0, 1.34, 2.667);
    van.add(red1);
    const red2 = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.065), tailM);
    red2.position.set(s * 1.0, 0.78, 2.667);
    van.add(red2);
  }
  const brake3 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 0.05), tailM);
  brake3.position.set(0, 2.5, 2.66);
  van.add(brake3);
  const rHandle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.32, 0.05), negroM);
  rHandle.position.set(0.16, 1.28, 2.69);
  van.add(rHandle);
  const bumperR = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.32, 0.22), plastM);
  bumperR.position.set(0, 0.48, 2.62);
  van.add(bumperR);
  for (const s of [-1, 1]) {
    const corn = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.4, 0.24), plastM);
    corn.position.set(s * 1.0, 0.52, 2.6);
    van.add(corn);
  }
  const step = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.26), negroM);
  step.position.set(0, 0.32, 2.76);
  van.add(step);
  const plateR = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.13, 0.02), plateF.material);
  plateR.position.set(-0.5, 1.05, 2.676);
  van.add(plateR);

  for (const s of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.05, 0.05), negroM);
    arm.position.set(s * 1.24, 2.05, -2.45);
    van.add(arm);
    const mir = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.3, 0.18), negroM);
    mir.position.set(s * 1.4, 2.0, -2.45);
    van.add(mir);
  }
  for (const z of [-1.1, 1.4]) {
    const fr = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.6), bodyMat);
    fr.position.set(0.35, 2.7, z);
    van.add(fr);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.5), vidrioM);
    gl.position.set(0.35, 2.75, z);
    van.add(gl);
  }
  const awning = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.14, 3.5), plastM);
  awning.position.set(1.15, 2.48, 0.1);
  van.add(awning);
  const antena = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.09, 0.1, 10), plastM);
  antena.position.set(-0.7, 2.7, 1.9);
  van.add(antena);

  function sysMat(color: number) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: 0.4,
      emissive: color,
      emissiveIntensity: 0.15,
    });
  }

  type SystemEntry = { mesh: THREE.Mesh; base: number };
  const systems: SystemEntry[] = [];

  function addSystem(mesh: THREE.Mesh) {
    mesh.castShadow = true;
    van.add(mesh);
    const mat = mesh.material as THREE.MeshStandardMaterial;
    systems.push({ mesh, base: mat.emissiveIntensity });
    return mesh;
  }

  const solar = addSystem(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.06, 1.9), sysMat(0x1f4fd0)));
  solar.position.set(-0.4, 2.72, 0.2);
  const bat = addSystem(new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.5), sysMat(0x2a8fe8)));
  bat.position.set(-0.6, 0.65, -1.3);
  const socket = addSystem(new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.2, 0.2), sysMat(0xe8b400)));
  socket.position.set(-1.14, 1.0, 1.6);

  const cableCurve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(-1.14, 1.0, 1.6),
    new THREE.Vector3(-3, 0.25, 1.9),
    new THREE.Vector3(-4.5, 1.0, 2.2),
  );
  const cable = new THREE.Mesh(
    new THREE.TubeGeometry(cableCurve, 32, 0.035, 8),
    new THREE.MeshStandardMaterial({
      color: 0xe8b400,
      roughness: 0.6,
      emissive: 0xe8b400,
      emissiveIntensity: 0.1,
    }),
  );
  scene.add(cable);
  systems.push({ mesh: cable, base: 0.1 });

  const gas = addSystem(
    new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.62, 18), sysMat(0xff7a1a)),
  );
  gas.position.set(0.55, 0.75, 2.2);
  const gasV = addSystem(
    new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 10), sysMat(0xffb35c)),
  );
  gasV.position.set(0.55, 1.13, 2.2);

  addSystem(
    new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.55, 0.9),
      new THREE.MeshStandardMaterial({
        color: 0x9cd2f0,
        roughness: 0.2,
        transparent: true,
        opacity: 0.4,
        emissive: 0x4aa8e8,
        emissiveIntensity: 0.1,
      }),
    ),
  ).position.set(0.6, 0.62, -0.3);

  const waterFill = new THREE.Mesh(
    new THREE.BoxGeometry(0.64, 0.5, 0.84),
    new THREE.MeshStandardMaterial({
      color: 0x2e8fe0,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
      emissive: 0x2e8fe0,
      emissiveIntensity: 0.3,
    }),
  );
  waterFill.position.set(0.6, 0.62, -0.3);
  waterFill.scale.y = 0.25;
  van.add(waterFill);

  const tankGray = addSystem(
    new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.22, 0.9), sysMat(0x6e7480)),
  );
  tankGray.position.set(0, 0.32, 0.8);

  const cassette = addSystem(
    new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.42, 0.5), sysMat(0x3aa86e)),
  );
  cassette.position.set(1.07, 0.85, 1.3);

  const boiler = addSystem(
    new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.4), sysMat(0xe04a3a)),
  );
  boiler.position.set(-0.6, 0.6, 0.4);

  const furnM = new THREE.MeshStandardMaterial({ color: 0x8a6e4e, roughness: 0.8 });
  vb(new THREE.BoxGeometry(0.8, 0.85, 1.6), furnM, 0.65, 1.05, -1.6, false);
  vb(new THREE.BoxGeometry(1.9, 0.4, 1.7), furnM, 0, 1.0, 1.7, false);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.55, 0.035, 12, 48),
    new THREE.MeshBasicMaterial({ color: 0x69e8ff, transparent: true, opacity: 0 }),
  );
  scene.add(ring);
  const spot = new THREE.PointLight(0x69e8ff, 0, 5);
  scene.add(spot);

  type StreamEntry = {
    pts: THREE.Points;
    g: THREE.BufferGeometry;
    v: Float32Array;
    ph: Float32Array;
    n: number;
  };

  function stream(colorHex: number, count: number): StreamEntry {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const v = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3] = 0;
      p[i * 3 + 1] = Math.random();
      p[i * 3 + 2] = 0;
      v[i] = 0.4 + Math.random() * 0.6;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) ph[i] = Math.random();
    const m = new THREE.PointsMaterial({
      color: colorHex,
      size: 0.05,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const pts = new THREE.Points(g, m);
    scene.add(pts);
    return { pts, g, v, ph, n: count };
  }

  const fillStream = stream(0x4ab8f0, 60);
  const drainStream = stream(0x8a9098, 50);

  const farol = new THREE.Group();
  const fp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 3, 8), negroM);
  fp.position.y = 1.5;
  farol.add(fp);
  const fhead = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xfff0c8,
      emissive: 0xffd98c,
      emissiveIntensity: 0,
    }),
  );
  fhead.position.y = 3.05;
  farol.add(fhead);
  const farolLight = new THREE.PointLight(0xffd98c, 0, 12);
  farolLight.position.y = 3;
  farol.add(farolLight);
  farol.position.set(4.8, 0, -3.5);
  scene.add(farol);

  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  type Shot = {
    cam: THREE.Vector3;
    tgt: THREE.Vector3;
    op: number;
    act: number[];
    ring: THREE.Vector3 | null;
  };

  const SHOTS: Shot[] = [
    { cam: V(7.5, 3.2, 9.5), tgt: V(0, 1.3, 0), op: 1, act: [], ring: null },
    { cam: V(3.6, 5.4, 4.6), tgt: V(-0.4, 1.8, -0.4), op: 0.45, act: [0, 1], ring: V(-0.4, 2.82, 0.2) },
    { cam: V(-6.2, 2.2, 4.2), tgt: V(-2.6, 0.9, 1.9), op: 0.85, act: [2, 3], ring: V(-1.14, 1.0, 1.6) },
    { cam: V(2.6, 1.7, 6.6), tgt: V(0.55, 0.9, 2.2), op: 0.3, act: [4, 5], ring: V(0.55, 0.78, 2.2) },
    { cam: V(-4.8, 1.7, -3), tgt: V(0.6, 0.62, -0.3), op: 0.14, act: [6], ring: V(0.6, 0.62, -0.3) },
    { cam: V(4.6, 1.3, 3.6), tgt: V(0.4, 0.4, 0.9), op: 0.14, act: [7], ring: V(0, 0.32, 0.8) },
    { cam: V(4.8, 1.6, 1.2), tgt: V(1.07, 0.85, 1.3), op: 0.6, act: [8], ring: V(1.07, 0.85, 1.3) },
    { cam: V(-5.6, 2.4, -4.4), tgt: V(-0.3, 1.0, 0.2), op: 0.3, act: [9], ring: V(-0.6, 0.6, 0.4) },
    { cam: V(8.5, 3, 10.5), tgt: V(0, 1.5, 0), op: 1, act: [], ring: null },
  ];

  const LNAMES = [
    "Inicio",
    "Noción 1/7 · Energía",
    "Noción 2/7 · 220 V",
    "Noción 3/7 · Gas",
    "Noción 4/7 · Agua limpia",
    "Noción 5/7 · Grises",
    "Noción 6/7 · WC",
    "Noción 7/7 · Calefacción",
    "Fin",
  ];

  let target = 0;
  let smooth = 0;
  function onScroll() {
    const m = document.documentElement.scrollHeight - window.innerHeight;
    target = m > 0 ? window.scrollY / m : 0;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  let mx = 0;
  let my = 0;
  function onPointerMove(e: PointerEvent) {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  }
  window.addEventListener("pointermove", onPointerMove);

  const clock = new THREE.Clock();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let rafId = 0;
  let lastLesson = "";
  let lastXray = false;

  function animate() {
    const t = clock.getElapsedTime();
    smooth += (target - smooth) * (reduced ? 1 : 0.06);

    const f = smooth * (SHOTS.length - 1);
    const i = Math.min(SHOTS.length - 2, Math.floor(f));
    const k = smoothstep(Math.min(1, Math.max(0, f - i)));
    const A = SHOTS[i];
    const B = SHOTS[i + 1];
    const cp = A.cam.clone().lerp(B.cam, k);
    const tg = A.tgt.clone().lerp(B.tgt, k);

    const dir = cp.sub(tg).multiplyScalar(viewFactor);
    camera.position.set(tg.x + dir.x + mx * 0.6, tg.y + dir.y + liftY - my * 0.4, tg.z + dir.z);
    camera.lookAt(tg);

    const op = lerp(A.op, B.op, k);
    xrayMats.forEach((m) => {
      m.opacity = op;
    });
    const xrayActive = op < 0.7;
    if (xrayActive !== lastXray) {
      lastXray = xrayActive;
      callbacks.onXrayChange(xrayActive);
    }

    const seg = k < 0.5 ? i : i + 1;
    const lessonName = LNAMES[seg];
    if (lessonName !== lastLesson) {
      lastLesson = lessonName;
      callbacks.onLessonChange(lessonName);
    }

    const S = SHOTS[seg];
    systems.forEach((s, idx) => {
      const active = S.act.includes(idx);
      const goal = active ? 1.0 + Math.sin(t * 5) * 0.45 : s.base;
      const mat = s.mesh.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = lerp(mat.emissiveIntensity, goal, 0.1);
    });

    const ringMat = ring.material as THREE.MeshBasicMaterial;
    if (S.ring) {
      ring.position.copy(S.ring);
      ring.rotation.x = Math.PI / 2;
      ring.scale.setScalar(1 + Math.sin(t * 3) * 0.1);
      ringMat.opacity = lerp(ringMat.opacity, 0.85, 0.08);
      spot.position.copy(S.ring);
      spot.position.y += 0.8;
      spot.intensity = lerp(spot.intensity, 6, 0.08);
    } else {
      ringMat.opacity = lerp(ringMat.opacity, 0, 0.1);
      spot.intensity = lerp(spot.intensity, 0, 0.1);
    }

    const fillLevel = 0.25 + Math.min(1, Math.max(0, (f - 3.3) / 0.9)) * 0.7;
    waterFill.scale.y = fillLevel;
    waterFill.position.y = 0.62 - (0.5 * (1 - fillLevel)) / 2;

    const fillMat = fillStream.pts.material as THREE.PointsMaterial;
    const fillOn = seg === 4 ? 1 : 0;
    fillMat.opacity = lerp(fillMat.opacity, fillOn * 0.9, 0.1);
    if (fillMat.opacity > 0.02) {
      const arr = fillStream.g.attributes.position.array as Float32Array;
      for (let n = 0; n < fillStream.n; n++) {
        fillStream.ph[n] -= fillStream.v[n] * 0.016;
        if (fillStream.ph[n] < 0) fillStream.ph[n] = 1;
        const tt = 1 - fillStream.ph[n];
        arr[n * 3] = lerp(-4.44, -1.14, tt);
        arr[n * 3 + 1] = lerp(0.95, 1.15, tt) + Math.sin(tt * Math.PI) * 0.3;
        arr[n * 3 + 2] = lerp(-1.6, -0.3, tt);
      }
      fillStream.g.attributes.position.needsUpdate = true;
    }

    const drainMat = drainStream.pts.material as THREE.PointsMaterial;
    const drainOn = seg === 5 ? 1 : 0;
    drainMat.opacity = lerp(drainMat.opacity, drainOn * 0.9, 0.1);
    if (drainMat.opacity > 0.02) {
      const arr = drainStream.g.attributes.position.array as Float32Array;
      for (let n = 0; n < drainStream.n; n++) {
        let y = arr[n * 3 + 1] - drainStream.v[n] * 0.012;
        if (y < 0.02) y = 0.32;
        arr[n * 3] = 1.0 + Math.sin(n) * 0.06;
        arr[n * 3 + 1] = y;
        arr[n * 3 + 2] = 1.0 + Math.cos(n * 1.3) * 0.06;
      }
      drainStream.g.attributes.position.needsUpdate = true;
    }

    const c = cyc(smooth);
    scene.background = c.sky;
    scene.fog!.color.copy(c.fog);
    sun.color.copy(c.sun);
    sun.intensity = c.sunI;
    hemi.intensity = c.hemi;
    hemi.color.copy(c.sky);
    hemi.groundColor.copy(c.gr);
    grMat.color.copy(c.gr);
    stM.opacity = c.star;

    const el = lerp(0.9, -0.1, smooth);
    sun.position.set(Math.sin(smooth * 2.2) * 18, Math.max(2, 22 * el), Math.cos(smooth * 2.2) * 14);

    const night = Math.max(0, (smooth - 0.78) / 0.22);
    winGlow.emissiveIntensity = night * 1.5 + (SHOTS[seg].act.includes(9) ? 0.5 : 0);
    fhead.material.emissiveIntensity = night * 2;
    farolLight.intensity = night * 20;

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(animate);
  }

  animate();

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    computeViewFactor();
  }
  window.addEventListener("resize", onResize);
  window.addEventListener("orientationchange", onResize);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("orientationchange", onResize);
    renderer.dispose();
  };
}
