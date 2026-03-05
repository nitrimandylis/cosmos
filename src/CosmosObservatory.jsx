import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as THREE from "three";

// ─── CONFIG & DATA ───────────────────────────────────────────────
const COLORS = {
  bg: "#06060e",
  bgAlt: "#0a0a18",
  accent1: "#00e5ff",
  accent2: "#ff6b35",
  accent3: "#a855f7",
  text: "#e8e6e3",
  textMuted: "#8a8690",
  glass: "rgba(255,255,255,0.04)",
  glassBorder: "rgba(255,255,255,0.08)",
};

const MISSIONS = [
  { id: 1, name: "ARTEMIS-7", status: "ACTIVE", distance: "384,400 km", target: "Lunar Orbit", crew: 4, progress: 78, icon: "◐" },
  { id: 2, name: "HELIOS-X", status: "TRANSIT", distance: "225M km", target: "Mars Transfer", crew: 6, progress: 42, icon: "☉" },
  { id: 3, name: "VOIDWALKER", status: "DEPLOYED", distance: "4.2B km", target: "Deep Space", crew: 0, progress: 91, icon: "◈" },
  { id: 4, name: "NEXUS-12", status: "DOCKING", distance: "408 km", target: "ISS-2", crew: 3, progress: 95, icon: "⬡" },
];

const STATS = [
  { label: "Light-Years Mapped", value: 14200, suffix: "+", icon: "✧" },
  { label: "Active Satellites", value: 847, suffix: "", icon: "◉" },
  { label: "Exoplanets Found", value: 5632, suffix: "", icon: "⊕" },
  { label: "Signal Sources", value: 23, suffix: "M", icon: "〜" },
];

const DISCOVERIES = [
  { title: "Gravitational Lens GN-z14", subtitle: "Redshift z=14.3 — earliest galaxy observed", date: "2026.02", tag: "BREAKTHROUGH" },
  { title: "Subsurface Ocean on Europa", subtitle: "Thermal signatures confirm liquid water at 12km depth", date: "2026.01", tag: "CONFIRMED" },
  { title: "Fast Radio Burst Pattern", subtitle: "Repeating FRB with 16.3-day periodicity from M81 group", date: "2025.11", tag: "MONITORING" },
  { title: "Proxima d Atmosphere", subtitle: "Spectral analysis reveals nitrogen-oxygen composition", date: "2025.09", tag: "ANALYSIS" },
];

// ─── THREE.JS SCENE ──────────────────────────────────────────────
function useThreeScene(canvasRef, scrollY) {
  const sceneRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // Particle field — stars
    const starCount = 3000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 40;
      starSizes[i] = Math.random() * 2 + 0.5;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("size", new THREE.BufferAttribute(starSizes, 1));

    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.06,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Nebula particle cloud
    const nebulaCount = 800;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPos = new Float32Array(nebulaCount * 3);
    for (let i = 0; i < nebulaCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 3 + Math.random() * 5;
      nebulaPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      nebulaPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      nebulaPos[i * 3 + 2] = r * Math.cos(phi);
    }
    nebulaGeo.setAttribute("position", new THREE.BufferAttribute(nebulaPos, 3));
    const nebulaMat = new THREE.PointsMaterial({
      color: 0x00e5ff,
      size: 0.08,
      transparent: true,
      opacity: 0.3,
      sizeAttenuation: true,
    });
    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // Accent nebula
    const accent2Geo = new THREE.BufferGeometry();
    const accent2Pos = new Float32Array(400 * 3);
    for (let i = 0; i < 400; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const r = 4 + Math.random() * 4;
      accent2Pos[i * 3] = r * Math.sin(phi) * Math.cos(theta) + 3;
      accent2Pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) - 2;
      accent2Pos[i * 3 + 2] = r * Math.cos(phi);
    }
    accent2Geo.setAttribute("position", new THREE.BufferAttribute(accent2Pos, 3));
    const accent2Mat = new THREE.PointsMaterial({
      color: 0xff6b35,
      size: 0.06,
      transparent: true,
      opacity: 0.2,
      sizeAttenuation: true,
    });
    const nebula2 = new THREE.Points(accent2Geo, accent2Mat);
    scene.add(nebula2);

    // Wire sphere
    const sphereGeo = new THREE.IcosahedronGeometry(1.5, 2);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00e5ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireSphere = new THREE.Mesh(sphereGeo, wireMat);
    wireSphere.position.set(0, 0, 0);
    scene.add(wireSphere);

    // Orbital ring
    const ringGeo = new THREE.TorusGeometry(2.2, 0.008, 8, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.3,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 3;
    scene.add(ring);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.005, 8, 120),
      new THREE.MeshBasicMaterial({ color: 0xff6b35, transparent: true, opacity: 0.15 })
    );
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 6;
    scene.add(ring2);

    sceneRef.current = { renderer, scene, camera, stars, nebula, nebula2, wireSphere, ring, ring2 };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = Date.now() * 0.0003;
      const sy = scrollY.current || 0;
      const scrollFactor = sy * 0.0003;

      stars.rotation.y = t * 0.3 + scrollFactor;
      stars.rotation.x = scrollFactor * 0.5;
      nebula.rotation.y = -t * 0.15;
      nebula.rotation.x = t * 0.1;
      nebula2.rotation.y = t * 0.2;
      wireSphere.rotation.y = t * 0.8;
      wireSphere.rotation.x = t * 0.3;
      wireSphere.scale.setScalar(1 + Math.sin(t * 2) * 0.05);
      ring.rotation.z = t * 0.5;
      ring2.rotation.z = -t * 0.3;

      camera.position.y = -scrollFactor * 0.8;
      camera.position.z = 5 + Math.sin(t) * 0.3;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
    };
  }, []);
}

// ─── INTERSECTION OBSERVER HOOK ──────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ─── ANIMATED COUNTER ────────────────────────────────────────────
function Counter({ target, suffix, duration = 2000, active }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(interval); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [active, target, duration]);
  return <>{val.toLocaleString()}{suffix}</>;
}

// ─── PARALLAX LAYER ──────────────────────────────────────────────
function ParallaxLayer({ children, speed = 0.5, scrollY, className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf;
    const update = () => {
      const y = scrollY.current || 0;
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      raf = requestAnimationFrame(update);
    };
    update();
    return () => cancelAnimationFrame(raf);
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform" }}>{children}</div>;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────
export default function CosmosObservatory() {
  const canvasRef = useRef(null);
  const scrollYRef = useRef(0);
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [activeSection, setActiveSection] = useState(0);

  useThreeScene(canvasRef, scrollYRef);

  // Scroll tracking
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => { scrollYRef.current = container.scrollTop; };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // Mouse tracking for subtle parallax
  useEffect(() => {
    const onMove = (e) => {
      setMousePos({ x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Section observers
  const [heroRef, heroVis] = useReveal(0.3);
  const [missionRef, missionVis] = useReveal(0.1);
  const [statsRef, statsVis] = useReveal(0.2);
  const [discRef, discVis] = useReveal(0.1);
  const [ctaRef, ctaVis] = useReveal(0.3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
          --bg: ${COLORS.bg};
          --bg-alt: ${COLORS.bgAlt};
          --accent1: ${COLORS.accent1};
          --accent2: ${COLORS.accent2};
          --accent3: ${COLORS.accent3};
          --text: ${COLORS.text};
          --text-muted: ${COLORS.textMuted};
          --glass: ${COLORS.glass};
          --glass-border: ${COLORS.glassBorder};
          --font-display: 'Syne', sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
          --font-body: 'DM Sans', sans-serif;
        }

        .cosmos-root {
          width: 100vw; height: 100vh; overflow-y: auto; overflow-x: hidden;
          background: var(--bg); color: var(--text);
          font-family: var(--font-body); scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        .cosmos-root::-webkit-scrollbar { width: 6px; }
        .cosmos-root::-webkit-scrollbar-track { background: transparent; }
        .cosmos-root::-webkit-scrollbar-thumb { background: rgba(0,229,255,0.2); border-radius: 3px; }

        .three-canvas {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: 0; pointer-events: none;
        }

        /* ─── NAV ─── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px;
          background: linear-gradient(180deg, rgba(6,6,14,0.9) 0%, transparent 100%);
          backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
        }
        .nav-logo {
          font-family: var(--font-display); font-weight: 800; font-size: 18px;
          letter-spacing: 4px; text-transform: uppercase;
          background: linear-gradient(135deg, var(--accent1), var(--accent3));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .nav-links { display: flex; gap: 32px; }
        .nav-link {
          font-family: var(--font-mono); font-size: 11px; font-weight: 400;
          letter-spacing: 2px; text-transform: uppercase; color: var(--text-muted);
          text-decoration: none; cursor: pointer; transition: color 0.3s;
          background: none; border: none;
        }
        .nav-link:hover { color: var(--accent1); }
        .nav-status {
          display: flex; align-items: center; gap: 8px;
          font-family: var(--font-mono); font-size: 10px; color: var(--accent1);
          letter-spacing: 1px;
        }
        .status-dot {
          width: 6px; height: 6px; border-radius: 50%; background: var(--accent1);
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; box-shadow: 0 0 4px var(--accent1); }
          50% { opacity: 0.4; box-shadow: 0 0 12px var(--accent1); }
        }

        /* ─── HERO ─── */
        .hero {
          position: relative; z-index: 1; min-height: 100vh;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 120px 40px 80px;
          overflow: hidden;
        }
        .hero-overline {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 6px;
          text-transform: uppercase; color: var(--accent1); margin-bottom: 24px;
          opacity: 0; animation: fadeSlideUp 1s 0.3s forwards;
        }
        .hero-title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(42px, 8vw, 120px); line-height: 0.95;
          text-align: center; letter-spacing: -2px;
          margin-bottom: 24px;
          opacity: 0; animation: fadeSlideUp 1s 0.5s forwards;
        }
        .hero-title .gradient-text {
          background: linear-gradient(135deg, var(--accent1) 0%, var(--accent3) 50%, var(--accent2) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; background-size: 200% 200%;
          animation: gradientShift 6s ease infinite;
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .hero-subtitle {
          font-family: var(--font-body); font-size: clamp(14px, 1.5vw, 18px);
          color: var(--text-muted); text-align: center; max-width: 520px;
          line-height: 1.7; font-weight: 300; letter-spacing: 0.3px;
          opacity: 0; animation: fadeSlideUp 1s 0.7s forwards;
        }
        .hero-cta-group {
          display: flex; gap: 16px; margin-top: 48px;
          opacity: 0; animation: fadeSlideUp 1s 0.9s forwards;
        }
        .btn-primary {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; padding: 14px 32px;
          background: linear-gradient(135deg, var(--accent1), rgba(0,229,255,0.6));
          color: var(--bg); border: none; border-radius: 2px; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-primary:hover { box-shadow: 0 0 30px rgba(0,229,255,0.3); transform: translateY(-1px); }
        .btn-secondary {
          font-family: var(--font-mono); font-size: 11px; letter-spacing: 2px;
          text-transform: uppercase; padding: 14px 32px;
          background: transparent; color: var(--text);
          border: 1px solid var(--glass-border); border-radius: 2px; cursor: pointer;
          transition: all 0.3s;
        }
        .btn-secondary:hover { border-color: var(--accent1); color: var(--accent1); }

        .hero-scroll-indicator {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 8px;
          opacity: 0; animation: fadeIn 1s 1.5s forwards;
        }
        .scroll-line {
          width: 1px; height: 40px; background: linear-gradient(to bottom, var(--accent1), transparent);
          animation: scrollPulse 2s infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.3; height: 40px; }
          50% { opacity: 1; height: 60px; }
        }
        .scroll-text {
          font-family: var(--font-mono); font-size: 9px; letter-spacing: 3px;
          color: var(--text-muted); text-transform: uppercase;
        }

        .hero-grid-overlay {
          position: absolute; top: 0; left: 0; right: 0; bottom: 0;
          background-image:
            linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px; pointer-events: none;
          mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 20%, transparent 70%);
        }

        /* ─── SECTION COMMONS ─── */
        .section {
          position: relative; z-index: 1; padding: 120px 40px;
        }
        .section-inner { max-width: 1200px; margin: 0 auto; }
        .section-label {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 4px;
          text-transform: uppercase; color: var(--accent1); margin-bottom: 12px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-label::before {
          content: ''; display: block; width: 24px; height: 1px; background: var(--accent1);
        }
        .section-title {
          font-family: var(--font-display); font-weight: 700;
          font-size: clamp(28px, 4vw, 52px); letter-spacing: -1px;
          line-height: 1.1; margin-bottom: 16px;
        }
        .section-desc {
          font-size: 15px; color: var(--text-muted); max-width: 480px;
          line-height: 1.7; font-weight: 300;
        }

        /* ─── REVEAL ANIMATIONS ─── */
        .reveal { opacity: 0; transform: translateY(40px); transition: all 0.8s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-delay-1 { transition-delay: 0.1s; }
        .reveal-delay-2 { transition-delay: 0.2s; }
        .reveal-delay-3 { transition-delay: 0.3s; }
        .reveal-delay-4 { transition-delay: 0.4s; }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ─── DIVIDER ─── */
        .section-divider {
          position: relative; z-index: 1; height: 1px; margin: 0 40px;
          background: linear-gradient(90deg, transparent, var(--glass-border), transparent);
        }

        /* ─── MISSIONS ─── */
        .missions-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px; margin-top: 48px;
        }
        .mission-card {
          background: var(--glass); border: 1px solid var(--glass-border);
          border-radius: 4px; padding: 28px; position: relative;
          overflow: hidden; transition: all 0.4s;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .mission-card:hover {
          border-color: var(--accent1);
          box-shadow: 0 8px 40px rgba(0,229,255,0.08);
          transform: translateY(-4px);
        }
        .mission-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, var(--accent1), var(--accent3));
          opacity: 0; transition: opacity 0.4s;
        }
        .mission-card:hover::before { opacity: 1; }
        .mission-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .mission-icon { font-size: 28px; opacity: 0.6; }
        .mission-status {
          font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
          padding: 4px 10px; border-radius: 2px; text-transform: uppercase;
        }
        .status-ACTIVE { background: rgba(0,229,255,0.15); color: var(--accent1); }
        .status-TRANSIT { background: rgba(168,85,247,0.15); color: var(--accent3); }
        .status-DEPLOYED { background: rgba(255,107,53,0.15); color: var(--accent2); }
        .status-DOCKING { background: rgba(0,229,255,0.1); color: var(--accent1); }
        .mission-name {
          font-family: var(--font-display); font-size: 18px; font-weight: 700;
          letter-spacing: 1px; margin-bottom: 4px;
        }
        .mission-target {
          font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);
          letter-spacing: 1px;
        }
        .mission-meta {
          display: flex; justify-content: space-between; align-items: center;
          margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--glass-border);
        }
        .mission-distance {
          font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
        }
        .mission-progress-bar {
          width: 80px; height: 3px; background: rgba(255,255,255,0.06);
          border-radius: 2px; overflow: hidden;
        }
        .mission-progress-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, var(--accent1), var(--accent3));
          transition: width 1.5s cubic-bezier(0.16,1,0.3,1);
        }

        /* ─── STATS ─── */
        .stats-section { background: var(--bg-alt); }
        .stats-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 40px; margin-top: 48px;
        }
        .stat-item { text-align: left; }
        .stat-icon {
          font-size: 24px; margin-bottom: 12px; color: var(--accent1); opacity: 0.6;
        }
        .stat-value {
          font-family: var(--font-display); font-size: clamp(36px, 4vw, 56px);
          font-weight: 800; letter-spacing: -2px; line-height: 1;
          background: linear-gradient(135deg, var(--text) 60%, var(--accent1));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .stat-label {
          font-family: var(--font-mono); font-size: 10px; letter-spacing: 2px;
          text-transform: uppercase; color: var(--text-muted); margin-top: 8px;
        }

        /* ─── DISCOVERIES ─── */
        .disc-list { margin-top: 48px; display: flex; flex-direction: column; gap: 2px; }
        .disc-item {
          display: grid; grid-template-columns: 100px 1fr auto;
          align-items: center; gap: 24px; padding: 24px 20px;
          border-bottom: 1px solid var(--glass-border);
          transition: all 0.3s; cursor: default;
        }
        .disc-item:hover { background: var(--glass); padding-left: 28px; }
        .disc-date {
          font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);
        }
        .disc-content {}
        .disc-title {
          font-family: var(--font-display); font-size: 17px; font-weight: 600;
          margin-bottom: 4px; transition: color 0.3s;
        }
        .disc-item:hover .disc-title { color: var(--accent1); }
        .disc-subtitle {
          font-size: 13px; color: var(--text-muted); font-weight: 300;
        }
        .disc-tag {
          font-family: var(--font-mono); font-size: 9px; letter-spacing: 2px;
          padding: 4px 12px; border: 1px solid var(--glass-border);
          border-radius: 2px; color: var(--text-muted); white-space: nowrap;
        }

        /* ─── CTA ─── */
        .cta-section {
          text-align: center; display: flex; flex-direction: column;
          align-items: center; justify-content: center; min-height: 60vh;
        }
        .cta-title {
          font-family: var(--font-display); font-weight: 800;
          font-size: clamp(32px, 5vw, 72px); letter-spacing: -1px;
          line-height: 1.05; margin-bottom: 20px;
        }
        .cta-desc {
          font-size: 16px; color: var(--text-muted); max-width: 440px;
          line-height: 1.7; margin-bottom: 40px; font-weight: 300;
        }

        /* ─── FOOTER ─── */
        .footer {
          position: relative; z-index: 1; padding: 40px;
          border-top: 1px solid var(--glass-border);
          display: flex; justify-content: space-between; align-items: center;
        }
        .footer-left {
          font-family: var(--font-mono); font-size: 10px;
          color: var(--text-muted); letter-spacing: 1px;
        }
        .footer-right { display: flex; gap: 24px; }
        .footer-link {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-muted);
          text-decoration: none; letter-spacing: 1px; transition: color 0.3s;
          cursor: pointer; background: none; border: none;
        }
        .footer-link:hover { color: var(--accent1); }

        /* ─── FLOATING DECORATIONS ─── */
        .float-orb {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(60px); opacity: 0.15;
        }
        .orb-1 {
          width: 400px; height: 400px; background: var(--accent1);
          top: 20%; right: -100px; animation: orbFloat1 12s ease-in-out infinite;
        }
        .orb-2 {
          width: 300px; height: 300px; background: var(--accent3);
          top: 60%; left: -80px; animation: orbFloat2 15s ease-in-out infinite;
        }
        .orb-3 {
          width: 250px; height: 250px; background: var(--accent2);
          top: 40%; right: 20%; animation: orbFloat3 10s ease-in-out infinite;
        }
        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-40px, 30px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -40px); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(20px, 20px); }
          66% { transform: translate(-20px, 10px); }
        }

        /* ─── MARQUEE ─── */
        .marquee-wrap {
          position: relative; z-index: 1; overflow: hidden;
          padding: 20px 0; border-top: 1px solid var(--glass-border);
          border-bottom: 1px solid var(--glass-border);
        }
        .marquee-track {
          display: flex; width: max-content; animation: marquee 30s linear infinite;
        }
        .marquee-item {
          font-family: var(--font-display); font-size: clamp(24px, 3vw, 40px);
          font-weight: 700; white-space: nowrap; padding: 0 40px;
          color: rgba(255,255,255,0.06); letter-spacing: 2px;
        }
        .marquee-item .accent { color: rgba(0,229,255,0.15); }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ─── NOISE OVERLAY ─── */
        .noise-overlay {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          z-index: 99; pointer-events: none; opacity: 0.035;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat;
        }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 768px) {
          .nav { padding: 16px 20px; }
          .nav-links { display: none; }
          .hero { padding: 100px 20px 60px; }
          .section { padding: 80px 20px; }
          .hero-cta-group { flex-direction: column; width: 100%; max-width: 280px; }
          .btn-primary, .btn-secondary { width: 100%; text-align: center; }
          .missions-grid { grid-template-columns: 1fr; }
          .disc-item { grid-template-columns: 1fr; gap: 8px; }
          .disc-date { order: -1; }
          .disc-tag { justify-self: start; }
          .footer { flex-direction: column; gap: 16px; text-align: center; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 32px; }
          .section-divider { margin: 0 20px; }
        }

        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr; }
          .hero-title { letter-spacing: -1px; }
        }
      `}</style>

      <div className="cosmos-root" ref={containerRef}>
        {/* Three.js Background */}
        <canvas ref={canvasRef} className="three-canvas" />

        {/* Noise texture overlay */}
        <div className="noise-overlay" />

        {/* ─── NAV ─── */}
        <nav className="nav">
          <div className="nav-logo">Cosmos</div>
          <div className="nav-links">
            <button className="nav-link">Missions</button>
            <button className="nav-link">Observatory</button>
            <button className="nav-link">Data</button>
            <button className="nav-link">Research</button>
          </div>
          <div className="nav-status">
            <span className="status-dot" />
            Systems Online
          </div>
        </nav>

        {/* ─── HERO ─── */}
        <section className="hero" ref={heroRef}>
          <div className="hero-grid-overlay" />
          <div className="float-orb orb-1" />
          <div className="float-orb orb-2" />

          <ParallaxLayer speed={-0.08} scrollY={scrollYRef}>
            <div className="hero-overline">Deep Space Observation Network — Est. 2024</div>
          </ParallaxLayer>

          <ParallaxLayer speed={-0.15} scrollY={scrollYRef}>
            <h1 className="hero-title">
              <span className="gradient-text">Mapping the</span><br />
              Unknown
            </h1>
          </ParallaxLayer>

          <ParallaxLayer speed={-0.05} scrollY={scrollYRef}>
            <p className="hero-subtitle">
              Real-time telemetry from humanity's farthest instruments.
              Observe. Discover. Understand the cosmos at the edge of perception.
            </p>
          </ParallaxLayer>

          <div className="hero-cta-group">
            <button className="btn-primary">Launch Console</button>
            <button className="btn-secondary">View Telemetry</button>
          </div>

          <div className="hero-scroll-indicator">
            <div className="scroll-line" />
            <span className="scroll-text">Scroll</span>
          </div>
        </section>

        {/* ─── MARQUEE ─── */}
        <div className="marquee-wrap">
          <div className="marquee-track">
            {[...Array(2)].map((_, i) => (
              <span key={i} style={{ display: "contents" }}>
                <span className="marquee-item">Deep Field Imaging</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
                <span className="marquee-item">Gravitational Waves</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
                <span className="marquee-item">Exoplanet Transit</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
                <span className="marquee-item">Spectral Analysis</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
                <span className="marquee-item">Cosmic Microwave Background</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
                <span className="marquee-item">Quantum Telemetry</span>
                <span className="marquee-item"><span className="accent">◈</span></span>
              </span>
            ))}
          </div>
        </div>

        {/* ─── MISSIONS ─── */}
        <section className="section" ref={missionRef}>
          <div className="section-inner">
            <div className={`reveal ${missionVis ? "visible" : ""}`}>
              <div className="section-label">Active Missions</div>
              <div className="section-title">Fleet Status</div>
              <div className="section-desc">
                Real-time tracking of crewed and autonomous missions across the solar system.
              </div>
            </div>
            <div className="missions-grid">
              {MISSIONS.map((m, i) => (
                <div
                  key={m.id}
                  className={`mission-card reveal ${missionVis ? "visible" : ""} reveal-delay-${i + 1}`}
                >
                  <div className="mission-header">
                    <span className="mission-icon">{m.icon}</span>
                    <span className={`mission-status status-${m.status}`}>{m.status}</span>
                  </div>
                  <div className="mission-name">{m.name}</div>
                  <div className="mission-target">{m.target}</div>
                  <div className="mission-meta">
                    <span className="mission-distance">{m.distance}</span>
                    <div className="mission-progress-bar">
                      <div
                        className="mission-progress-fill"
                        style={{ width: missionVis ? `${m.progress}%` : "0%" }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="float-orb orb-3" />
        </section>

        <div className="section-divider" />

        {/* ─── STATS ─── */}
        <section className="section stats-section" ref={statsRef}>
          <div className="section-inner">
            <div className={`reveal ${statsVis ? "visible" : ""}`}>
              <div className="section-label">Observatory Data</div>
              <div className="section-title">By The Numbers</div>
            </div>
            <div className="stats-grid">
              {STATS.map((s, i) => (
                <div key={i} className={`stat-item reveal ${statsVis ? "visible" : ""} reveal-delay-${i + 1}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-value">
                    <Counter target={s.value} suffix={s.suffix} active={statsVis} />
                  </div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ─── DISCOVERIES ─── */}
        <section className="section" ref={discRef}>
          <div className="section-inner">
            <div className={`reveal ${discVis ? "visible" : ""}`}>
              <div className="section-label">Latest Discoveries</div>
              <div className="section-title">Signal Log</div>
              <div className="section-desc">
                Notable findings from active observation campaigns and deep-space probes.
              </div>
            </div>
            <div className="disc-list">
              {DISCOVERIES.map((d, i) => (
                <div
                  key={i}
                  className={`disc-item reveal ${discVis ? "visible" : ""} reveal-delay-${i + 1}`}
                >
                  <span className="disc-date">{d.date}</span>
                  <div className="disc-content">
                    <div className="disc-title">{d.title}</div>
                    <div className="disc-subtitle">{d.subtitle}</div>
                  </div>
                  <span className="disc-tag">{d.tag}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="float-orb orb-2" style={{ top: "30%", left: "auto", right: "-60px" }} />
        </section>

        <div className="section-divider" />

        {/* ─── CTA ─── */}
        <section className="section cta-section" ref={ctaRef}>
          <div className={`reveal ${ctaVis ? "visible" : ""}`}>
            <div className="section-label" style={{ justifyContent: "center" }}>Join The Network</div>
          </div>
          <div className={`reveal ${ctaVis ? "visible" : ""} reveal-delay-1`}>
            <div className="cta-title">
              <span className="gradient-text">Look Further.</span>
            </div>
          </div>
          <div className={`reveal ${ctaVis ? "visible" : ""} reveal-delay-2`}>
            <p className="cta-desc">
              Access raw telemetry streams, contribute to observation campaigns,
              and connect with research teams worldwide.
            </p>
          </div>
          <div className={`reveal ${ctaVis ? "visible" : ""} reveal-delay-3`}>
            <button className="btn-primary" style={{ fontSize: "12px", padding: "16px 40px" }}>
              Request Access
            </button>
          </div>
        </section>

        {/* ─── FOOTER ─── */}
        <footer className="footer">
          <div className="footer-left">© 2026 Cosmos Observatory — All Systems Nominal</div>
          <div className="footer-right">
            <button className="footer-link">Privacy</button>
            <button className="footer-link">Terms</button>
            <button className="footer-link">API Docs</button>
            <button className="footer-link">Status</button>
          </div>
        </footer>
      </div>
    </>
  );
}
