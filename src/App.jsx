import { useState, useEffect, useRef } from "react";
import * as THREE from "three";

const GOLD = "#D4A843";
const GOLD_DIM = "rgba(212,168,67,0.06)";
const GOLD_MID = "rgba(212,168,67,0.15)";
const GOLD_GLOW = "rgba(212,168,67,0.35)";
const ICE = "#9CA3AF";
const BG = "#08080A";
const BG_CARD = "#0F0F12";
const TEXT = "#E5E5E8";
const TEXT_DIM = "#55555E";
const BORDER = "rgba(212,168,67,0.08)";
const HEAD = "'Lexend', sans-serif";
const MONO = "'Fira Code', monospace";
const SANS = "'Lexend', sans-serif";

function TypingText({ text, speed = 28, delay = 800 }) {
  const [displayed, setDisplayed] = useState("");
  const [cursor, setCursor] = useState(true);
  useEffect(() => {
    let i = 0, t;
    const start = setTimeout(() => {
      const type = () => { if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; t = setTimeout(type, speed); } else setTimeout(() => setCursor(false), 2000); };
      type();
    }, delay);
    return () => { clearTimeout(start); clearTimeout(t); };
  }, [text, delay, speed]);
  return <span>{displayed}{cursor && <span style={{ animation: "snBlinkF 1s step-end infinite", color: GOLD }}>▊</span>}</span>;
}

function AssemblingBanner() {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const progressRef = useRef(0);
  const [textOpacity, setTextOpacity] = useState(0);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(340);

  useEffect(() => {
    const updateHeight = () => setBannerHeight(window.innerWidth < 768 ? 200 : 340);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    let frame, renderer, assemblyComplete = false, completeTime = 0;
    const el = mountRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const updateHeight = () => setBannerHeight(window.innerWidth < 768 ? 200 : 340);
    window.addEventListener('resize', updateHeight);

    const init = () => {
      const w = el.clientWidth, h = bannerHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
      camera.position.set(0, 0, 12);
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      el.appendChild(renderer.domElement);

      const group = new THREE.Group();
      scene.add(group);

      const fragments = [];
      const primaryColor = new THREE.Color(0xA8A8A8); // Medium light gray
      const secondaryColor = new THREE.Color(0x6B7A94); // Medium bluish gray
      const goldColor = new THREE.Color(0xD4A843); // Gold for accents

      const createHexRing = (radius, count, yOff) => {
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const tx = Math.cos(angle) * radius;
          const ty = Math.sin(angle) * radius + yOff;
          const geo = new THREE.BufferGeometry();
          const size = 0.25 + Math.random() * 0.15;
          const sides = Math.random() > 0.5 ? 6 : Math.random() > 0.5 ? 4 : 3;
          const verts = [];
          for (let s = 0; s < sides; s++) {
            const a1 = (s / sides) * Math.PI * 2;
            const a2 = ((s + 1) / sides) * Math.PI * 2;
            verts.push(0, 0, 0);
            verts.push(Math.cos(a1) * size, Math.sin(a1) * size, 0);
            verts.push(Math.cos(a2) * size, Math.sin(a2) * size, 0);
          }
          geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(verts), 3));
          const isGold = i % 3 === 0 || radius < 0.5;
          const mat = new THREE.MeshBasicMaterial({
            color: isGold ? goldColor : primaryColor,
            transparent: true, opacity: 0.4,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(geo, mat);

          const wireGeo = new THREE.WireframeGeometry(geo);
          const wireMat = new THREE.LineBasicMaterial({
            color: isGold ? goldColor : secondaryColor,
            transparent: true, opacity: 0.6,
          });
          const wire = new THREE.LineSegments(wireGeo, wireMat);
          mesh.add(wire);

          const scatter = 10 + Math.random() * 8;
          const sx = tx + (Math.random() - 0.5) * scatter;
          const sy = ty + (Math.random() - 0.5) * scatter;
          const sz = (Math.random() - 0.5) * 4;
          const sr = (Math.random() - 0.5) * Math.PI * 4;
          mesh.position.set(sx, sy, sz);
          mesh.rotation.z = sr;

          group.add(mesh);
          fragments.push({
            mesh, wire, mat, wireMat,
            targetX: tx, targetY: ty, targetZ: 0, targetRot: 0,
            startX: sx, startY: sy, startZ: sz, startRot: sr,
            isGold,
          });
        }
      };

      const coreGeo = new THREE.CircleGeometry(0.3, 6);
      const coreMat = new THREE.MeshBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);
      const coreWireGeo = new THREE.WireframeGeometry(coreGeo);
      const coreWireMat = new THREE.LineBasicMaterial({ color: goldColor, transparent: true, opacity: 0.0 });
      const coreWire = new THREE.LineSegments(coreWireGeo, coreWireMat);
      core.add(coreWire);
      fragments.push({
        mesh: core, wire: coreWire, mat: coreMat, wireMat: coreWireMat,
        targetX: 0, targetY: 0, targetZ: 0, targetRot: 0,
        startX: (Math.random() - 0.5) * 10, startY: (Math.random() - 0.5) * 10,
        startZ: (Math.random() - 0.5) * 4, startRot: Math.random() * Math.PI * 4,
        isGold: true,
      });

      createHexRing(0, 1, 0);
      createHexRing(1.0, 6, 0);
      createHexRing(2.0, 12, 0);
      createHexRing(3.0, 18, 0);
      createHexRing(4.0, 24, 0);
      createHexRing(5.0, 30, 0);

      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const innerX = Math.cos(angle) * 0.5;
        const innerY = Math.sin(angle) * 0.5;
        const outerX = Math.cos(angle) * 5.0;
        const outerY = Math.sin(angle) * 5.0;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([innerX, innerY, 0, outerX, outerY, 0]), 3));
        const mat = new THREE.LineBasicMaterial({ color: secondaryColor, transparent: true, opacity: 0.0 });
        const line = new THREE.LineSegments(geo, mat);
        group.add(line);
        fragments.push({
          mesh: line, wire: null, mat, wireMat: null,
          targetX: 0, targetY: 0, targetZ: 0, targetRot: 0,
          startX: 0, startY: 0, startZ: 0, startRot: 0,
          isGold: true, isLine: true,
        });
      }

      const mouseRef = { x: 0, y: 0 };
      const onMove = (e) => {
        const rect = el.getBoundingClientRect();
        mouseRef.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseRef.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
      };
      el.addEventListener("mousemove", onMove);

      const onScroll = () => {
        const rect = container.getBoundingClientRect();
        const viewH = window.innerHeight;
        const enterPoint = viewH;
        const exitPoint = -rect.height;
        const totalRange = enterPoint - exitPoint;
        const current = enterPoint - rect.top;
        const raw = Math.max(0, Math.min(1, current / totalRange));
        const eased = raw < 0.5
          ? 4 * raw * raw * raw
          : 1 - Math.pow(-2 * raw + 2, 3) / 2;
        progressRef.current = Math.max(0, Math.min(1, eased * 2.5));
      };
      window.addEventListener("scroll", onScroll);
      onScroll();

      const animate = () => {
        frame = requestAnimationFrame(animate);
        const t = Date.now() * 0.001;
        const p = Math.min(1, progressRef.current);

        fragments.forEach(f => {
          if (f.isLine) {
            f.mat.opacity = p > 0.85 ? (p - 0.85) / 0.15 * 0.3 : 0;
            return;
          }
          const ease = p * p * (3 - 2 * p);
          f.mesh.position.x = f.startX + (f.targetX - f.startX) * ease;
          f.mesh.position.y = f.startY + (f.targetY - f.startY) * ease;
          f.mesh.position.z = f.startZ + (f.targetZ - f.startZ) * ease;
          f.mesh.rotation.z = f.startRot + (f.targetRot - f.startRot) * ease;

          if (p < 1) {
            f.mesh.position.x += mouseRef.x * (1 - p) * 0.3;
            f.mesh.position.y += mouseRef.y * (1 - p) * 0.3;
          }

          const baseOp = 0.15 + p * 0.45;
          const wireOp = 0.2 + p * 0.6;
          f.mat.opacity = baseOp;
          if (f.wireMat) f.wireMat.opacity = wireOp;

          if (p > 0.9 && f.isGold) {
            const pulse = Math.sin(t * 3 + f.targetX * 2 + f.targetY * 2) * 0.15;
            f.mat.opacity = baseOp + pulse;
            if (f.wireMat) f.wireMat.opacity = wireOp + pulse;
          }
        });

        if (p > 0.92 && !assemblyComplete) {
          assemblyComplete = true;
          completeTime = t;
        }

        if (assemblyComplete) {
          const elapsed = t - completeTime;
          const glow = Math.min(1, elapsed / 1.5);
          setGlowIntensity(glow);
          const txtFade = Math.max(0, Math.min(1, (elapsed - 0.8) / 1.0));
          setTextOpacity(txtFade);
        } else {
          setGlowIntensity(0);
          setTextOpacity(0);
          assemblyComplete = false;
        }

        if (p < 0.88) {
          assemblyComplete = false;
          completeTime = 0;
        }

        group.rotation.y = Math.sin(t * 0.2) * 0.15 * (1 - p * 0.7);
        group.rotation.x = Math.sin(t * 0.15) * 0.08 * (1 - p * 0.7);

        renderer.render(scene, camera);
      };
      animate();

      return () => {
        el.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
      };
    };

    const cleanup = init();
    return () => {
      window.removeEventListener('resize', updateHeight);
      cancelAnimationFrame(frame);
      if (cleanup) cleanup();
      if (renderer && el.contains(renderer.domElement)) {
        renderer.dispose();
        el.removeChild(renderer.domElement);
      }
    };
  }, [bannerHeight]);

  return (
    <div ref={containerRef} style={{
      position: "relative",
      borderTop: `1px solid ${BORDER}`,
      borderBottom: `1px solid ${BORDER}`,
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, rgba(74,45,107,${glowIntensity * 0.15}) 0%, transparent 70%)`,
        transition: "background 0.3s",
      }} />
      <div ref={mountRef} style={{ width: "100%", height: bannerHeight, cursor: "crosshair" }} />
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none", gap: "0.5rem",
      }}>
        <div style={{
          fontFamily: HEAD, fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
          fontWeight: 800, letterSpacing: 6, color: GOLD,
          opacity: textOpacity,
          textShadow: `0 0 30px rgba(212,168,67,${textOpacity * 0.5}), 0 0 60px rgba(212,168,67,${textOpacity * 0.2})`,
          transition: "opacity 0.1s",
        }}>SOVEREIGN NEXUS</div>
        <div style={{
          fontFamily: MONO, fontSize: 9, letterSpacing: 5, color: GOLD,
          opacity: textOpacity * 0.7,
          textShadow: `0 0 15px rgba(212,168,67,${textOpacity * 0.3})`,
          transition: "opacity 0.1s",
        }}>SOFTWARE · GOVERNANCE · DELIVERED</div>
      </div>
    </div>
  );
}

function FadeIn({ children, delay = 0, style = {} }) {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`, ...style }}>{children}</div>;
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: "1.125rem 2.5rem",
      background: scrolled ? "rgba(8,8,10,0.94)" : "transparent",
      backdropFilter: scrolled ? "blur(16px)" : "none",
      borderBottom: scrolled ? `1px solid ${BORDER}` : "1px solid transparent",
      transition: "all 0.3s",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <circle cx="9" cy="9" r="2.5" fill={GOLD} />
          <circle cx="9" cy="9" r="7" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.3" />
          <circle cx="3" cy="9" r="1" fill={ICE} opacity="0.5" />
          <circle cx="15" cy="9" r="1" fill={ICE} opacity="0.5" />
          <circle cx="9" cy="3" r="1" fill={GOLD} opacity="0.5" />
        </svg>
        <span style={{ fontFamily: HEAD, fontSize: 15, color: TEXT, fontWeight: 700 }}>Sovereign Nexus</span>
      </div>
      <a href="#contact" style={{
        fontFamily: SANS, fontSize: 12, color: BG, textDecoration: "none", fontWeight: 700,
        padding: "0.45rem 1.25rem", background: GOLD, transition: "opacity 0.2s",
      }}
        onMouseEnter={e => e.target.style.opacity = "0.85"}
        onMouseLeave={e => e.target.style.opacity = "1"}
      >Contact</a>
    </nav>
  );
}

function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { setTimeout(() => setVis(true), 250); }, []);
  return (
    <section style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      justifyContent: "center", maxWidth: 1000, margin: "0 auto", padding: "0 2.5rem",
    }}>
      <div style={{
        fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: "2rem",
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 0.2s",
      }}>SOVEREIGN NEXUS LLC · SOFTWARE DEVELOPMENT</div>
      <h1 style={{
        fontFamily: HEAD, fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
        fontWeight: 800, lineHeight: 1.05, color: TEXT, margin: 0,
        opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(25px)",
        transition: "all 0.8s ease 0.3s",
      }}>
        Software that<br />
        doesn't just <span style={{ color: GOLD }}>function.</span><br />
        It <span style={{ color: GOLD }}>governs.</span>
      </h1>
      <div style={{
        fontFamily: MONO, fontSize: 13, color: TEXT_DIM, marginTop: "2rem",
        maxWidth: 550, lineHeight: 1.8,
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 0.7s",
      }}>
        <span style={{ color: TEXT_DIM }}>{"// "}</span>
        <TypingText text="Full-stack applications shipped into governed environments. Audit trails, state integrity enforcement, cryptographic validation, and formal deployment pipelines." delay={1200} speed={25} />
      </div>
      <div style={{
        marginTop: "3rem",
        opacity: vis ? 1 : 0, transition: "opacity 0.6s ease 1s",
      }}>
        <a href="#contact" style={{
          display: "inline-block", padding: "1rem 2rem", background: GOLD, color: BG,
          fontFamily: SANS, fontSize: 14, fontWeight: 700, textDecoration: "none",
          borderRadius: 4, transition: "all 0.3s",
          boxShadow: `0 4px 20px rgba(212,168,67,0.3)`,
        }}
          onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 6px 25px rgba(212,168,67,0.4)`; }}
          onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 4px 20px rgba(212,168,67,0.3)`; }}
        >Get Started</a>
      </div>
      <style>{`@keyframes snBlinkF { 50% { opacity: 0; } }`}</style>
    </section>
  );
}

function WhatWeBuild() {
  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "6rem 2.5rem" }}>
      <FadeIn>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: "1.5rem" }}>WHAT WE BUILD</div>
      </FadeIn>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: BORDER }}>
        {[
          { title: "Full-Stack Applications", desc: "End-to-end web applications, APIs, and integrations designed from the start to operate under governance constraints." },
          { title: "SaaS Platforms", desc: "Multi-tenant platforms with audit trails and state integrity enforcement built in — not bolted on." },
          { title: "Aletheos Console", desc: "Our primary work: the M20R1 technology platform including the Aletheos governed operations console." },
          { title: "System Integrations", desc: "Connecting systems under a single governed framework. Every data flow auditable. Every connection traceable." },
        ].map((item, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div style={{ background: BG_CARD, padding: "2rem", transition: "background 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#141418"}
              onMouseLeave={e => e.currentTarget.style.background = BG_CARD}
            >
              <h3 style={{ fontFamily: HEAD, fontSize: 17, fontWeight: 700, color: TEXT, margin: "0 0 0.5rem" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.7, color: TEXT_DIM, margin: 0, fontWeight: 400 }}>{item.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Duality() {
  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 2.5rem 6rem", borderTop: `1px solid ${BORDER}` }}>
      <FadeIn>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ fontFamily: HEAD, fontSize: 28, fontWeight: 800, color: TEXT, margin: 0 }}>Two strands. One standard.</h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: TEXT_DIM, marginTop: "0.5rem", fontWeight: 400 }}>
            Code and governance are not separate concerns. They are intertwined.
          </p>
        </div>
        <div style={{ display: "flex", gap: "1px", background: BORDER }}>
          <div style={{ flex: 1, padding: "2.5rem", background: BG_CARD, borderTop: `2px solid ${GOLD}` }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: GOLD, marginBottom: "1.5rem" }}>CODE</div>
            {["Full-stack applications", "SaaS platforms", "System integrations", "Formal deployment pipelines"].map((t, i) => (
              <div key={i} style={{ fontFamily: SANS, fontSize: 14, color: TEXT_DIM, padding: "0.6rem 0", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none", fontWeight: 400 }}>{t}</div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "2.5rem", background: BG_CARD, borderTop: `2px solid ${ICE}` }}>
            <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: 3, color: ICE, marginBottom: "1.5rem" }}>GOVERNANCE</div>
            {["Audit trails at every layer", "State integrity enforcement", "Cryptographic validation", "Traceable deployments"].map((t, i) => (
              <div key={i} style={{ fontFamily: SANS, fontSize: 14, color: TEXT_DIM, padding: "0.6rem 0", borderBottom: i < 3 ? `1px solid ${BORDER}` : "none", fontWeight: 400 }}>{t}</div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Commitment() {
  const lines = [
    "We do not separate development from operations or governance.",
    "The code we write is designed from the start to operate under enforcement.",
    "We own the delivery from design through deployment.",
    "No handoffs to other teams. No 'not my layer' excuses.",
    "If we built it, we ship it, and we stand behind it in production.",
  ];
  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 2.5rem 6rem", borderTop: `1px solid ${BORDER}` }}>
      <FadeIn>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: "2.5rem" }}>OUR COMMITMENT</div>
        <div style={{ maxWidth: 620 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ padding: "1rem 0", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "baseline", gap: "1.25rem" }}>
              <span style={{ fontFamily: MONO, fontSize: 10, color: GOLD, opacity: 0.3, minWidth: 20, textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ fontFamily: SANS, fontSize: 15, color: i === lines.length - 1 ? TEXT : TEXT_DIM, fontWeight: i === lines.length - 1 ? 700 : 400, lineHeight: 1.6 }}>{line}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    { name: "John Doe", role: "CTO, TechCorp", text: "Sovereign Nexus delivered a governed platform that exceeded our compliance requirements. Their end-to-end approach is unparalleled." },
    { name: "Jane Smith", role: "Founder, StartupX", text: "The audit trails and state integrity enforcement gave us the confidence to scale. Highly recommend." },
  ];
  return (
    <section style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 2.5rem 6rem", borderTop: `1px solid ${BORDER}` }}>
      <FadeIn>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: "2.5rem" }}>TESTIMONIALS</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {testimonials.map((t, i) => (
            <FadeIn key={i} delay={i * 0.2}>
              <div style={{ background: BG_CARD, padding: "2rem", border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                <p style={{ fontFamily: SANS, fontSize: 14, color: TEXT_DIM, lineHeight: 1.6, margin: "0 0 1rem", fontStyle: "italic" }}>"{t.text}"</p>
                <div style={{ fontFamily: HEAD, fontSize: 14, fontWeight: 700, color: TEXT }}>{t.name}</div>
                <div style={{ fontFamily: MONO, fontSize: 11, color: ICE }}>{t.role}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [focused, setFocused] = useState(null);
  const inp = (f) => ({
    width: "100%", padding: "0.875rem 1rem", fontFamily: SANS, fontSize: 14, fontWeight: 400,
    background: BG_CARD, border: `1px solid ${focused === f ? GOLD : BORDER}`,
    color: TEXT, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  });
  return (
    <section id="contact" style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 2.5rem 8rem", borderTop: `1px solid ${BORDER}` }}>
      <FadeIn>
        <div style={{ maxWidth: 480 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 3, color: GOLD, marginBottom: "1.5rem" }}>CONTACT</div>
          <h2 style={{ fontFamily: HEAD, fontSize: 26, fontWeight: 800, color: TEXT, margin: "0 0 0.5rem" }}>Reach out.</h2>
          <p style={{ fontFamily: SANS, fontSize: 14, color: TEXT_DIM, lineHeight: 1.7, marginBottom: "2rem", fontWeight: 400 }}>
            Governed software. End-to-end delivery. If that's what you need, we should talk.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={inp("name")} />
            <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} style={inp("email")} />
            <textarea placeholder="Message" rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
              onFocus={() => setFocused("message")} onBlur={() => setFocused(null)} style={{ ...inp("message"), resize: "vertical" }} />
            <button style={{
              alignSelf: "flex-start", padding: "0.7rem 2rem", background: GOLD, border: "none", color: BG,
              fontFamily: SANS, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "opacity 0.2s",
            }}
              onMouseEnter={e => e.target.style.opacity = "0.85"} onMouseLeave={e => e.target.style.opacity = "1"}
            >Send</button>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 2.5rem", borderTop: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: SANS, fontSize: 12, color: TEXT_DIM }}>© {new Date().getFullYear()} Sovereign Nexus LLC</span>
      <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT_DIM, letterSpacing: 2 }}>A NOVE MANI COMPANY</span>
    </footer>
  );
}

export default function SovereignNexusFinal() {
  return (
    <div style={{ background: BG, color: TEXT, minHeight: "100vh", animation: "bgPulse 8s ease-in-out infinite" }}>
      <style>{`html { scroll-behavior: smooth; } @keyframes snBlinkF { 50% { opacity: 0; } } @keyframes bgPulse { 0%, 100% { background: radial-gradient(ellipse at center, rgba(74,45,107,0.05) 0%, transparent 50%); } 50% { background: radial-gradient(ellipse at center, rgba(74,45,107,0.1) 0%, transparent 60%); } }`}</style>
      <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700;800&family=Fira+Code:wght@400;500;600&display=swap" rel="stylesheet" />
      <Nav />
      <Hero />
      <AssemblingBanner />
      <WhatWeBuild />
      <Duality />
      <Commitment />
      <Testimonials />
      <ContactForm />
      <Footer />
    </div>
  );
}
