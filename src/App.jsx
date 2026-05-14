import { useEffect, useRef, useState } from "react";
import "./App.css";

const GOLD = "#D4A843";
const ICE = "#9CA3AF";

const CAPABILITIES = [
  {
    title: "Full-Stack Applications",
    desc: "End-to-end web applications, APIs, and integrations designed from the start to operate under governance constraints.",
  },
  {
    title: "SaaS Platforms",
    desc: "Multi-tenant platforms with audit trails and state integrity enforcement built in, not bolted on later.",
  },
  {
    title: "Aletheos Console",
    desc: "Our primary work: the M20R1 technology platform, including the Aletheos governed operations console.",
  },
  {
    title: "System Integrations",
    desc: "Connecting systems under a single governed framework so every data flow is auditable and every connection is traceable.",
  },
];

const DUALITY_COLUMNS = [
  {
    tone: "gold",
    label: "Code",
    items: [
      "Full-stack applications",
      "SaaS platforms",
      "System integrations",
      "Formal deployment pipelines",
    ],
  },
  {
    tone: "ice",
    label: "Governance",
    items: [
      "Audit trails at every layer",
      "State integrity enforcement",
      "Cryptographic validation",
      "Traceable deployments",
    ],
  },
];

const COMMITMENT_LINES = [
  "We do not separate development from operations or governance.",
  "The code we write is designed from the start to operate under enforcement.",
  "We own the delivery from design through deployment.",
  "No handoffs to other teams. No 'not my layer' excuses.",
  "If we built it, we ship it, and we stand behind it in production.",
];

const SIGNALS = [
  {
    title: "Operational clarity",
    body: "Designed for teams that need confidence in what changed, why it changed, and who approved it.",
  },
  {
    title: "Governed delivery",
    body: "Release flows, auditability, and enforcement rules are considered part of the product, not aftercare.",
  },
  {
    title: "Production ownership",
    body: "The same team shaping the interface is accountable for delivery quality and runtime behavior.",
  },
];

const FITS = [
  {
    title: "Audit-ready applications",
    body: "Custom software for workflows where approvals, role boundaries, and change history need to be visible from the beginning.",
  },
  {
    title: "Governed SaaS platforms",
    body: "Multi-tenant products with traceable releases, durable state models, and operational controls designed into the platform.",
  },
  {
    title: "Secure integrations",
    body: "APIs, portals, and data flows connected under clear ownership so sensitive operations stay accountable.",
  },
];

const HERO_SIGNALS = [
  { label: "Audit trail", value: "Every action traced" },
  { label: "Integrity", value: "State guarded" },
  { label: "Delivery", value: "Owned end to end" },
];

const CONTACT_NOTES = [
  "Governed software delivery from design through deployment.",
  "Built for regulated, operationally sensitive, or high-accountability environments.",
  "Best fit for teams that need software and controls to work as one system.",
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function TypingText({ text, speed = 28, delay = 800 }) {
  const [displayed, setDisplayed] = useState(() => (prefersReducedMotion() ? text : ""));
  const [cursorVisible, setCursorVisible] = useState(() => !prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      return undefined;
    }

    let index = 0;
    let typeTimeoutId;
    let startTimeoutId;
    let cursorTimeoutId;

    const type = () => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index += 1;
        typeTimeoutId = window.setTimeout(type, speed);
        return;
      }

      cursorTimeoutId = window.setTimeout(() => setCursorVisible(false), 2000);
    };

    startTimeoutId = window.setTimeout(type, delay);

    return () => {
      window.clearTimeout(startTimeoutId);
      window.clearTimeout(typeTimeoutId);
      window.clearTimeout(cursorTimeoutId);
    };
  }, [delay, speed, text]);

  return (
    <span>
      {displayed}
      {cursorVisible && <span className="typing-cursor">|</span>}
    </span>
  );
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(() => typeof window !== "undefined" && !("IntersectionObserver" in window));

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return undefined;
    }

    if (visible || !("IntersectionObserver" in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [visible]);

  return (
    <div
      ref={ref}
      className={`${className} ${visible ? "fade-in is-visible" : "fade-in"}`.trim()}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`site-nav ${scrolled ? "is-scrolled" : ""}`} aria-label="Primary navigation">
      <div className="site-nav__brand">
        <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
          <circle cx="9" cy="9" r="2.5" fill={GOLD} />
          <circle cx="9" cy="9" r="7" fill="none" stroke={GOLD} strokeWidth="0.5" opacity="0.3" />
          <circle cx="3" cy="9" r="1" fill={ICE} opacity="0.5" />
          <circle cx="15" cy="9" r="1" fill={ICE} opacity="0.5" />
          <circle cx="9" cy="3" r="1" fill={GOLD} opacity="0.5" />
        </svg>
        <span>Sovereign Nexus</span>
      </div>
      <div className="site-nav__actions">
        <a href="#build" className="site-nav__link">
          Work
        </a>
        <a href="#contact" className="button button--primary button--compact">
          Contact
        </a>
      </div>
    </nav>
  );
}

function Hero() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setVisible(true), 250);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return (
    <section className="hero shell">
      <div className="hero__eyebrow">Sovereign Nexus LLC | Software Development</div>
      <div className={`hero__content ${visible ? "is-visible" : ""}`}>
        <div className="hero__copy">
          <h1>
            Software that
            <br />
            does not just <span>function.</span>
            <br />
            It <span>governs.</span>
          </h1>
          <p className="hero__lede">
            <span className="hero__comment">// </span>
            <TypingText
              text="Full-stack applications shipped into governed environments. Audit trails, state integrity enforcement, cryptographic validation, and formal deployment pipelines."
              delay={1100}
              speed={24}
            />
          </p>
          <div className="hero__actions">
            <a href="#contact" className="button button--primary">
              Start a Build
            </a>
            <a href="#signals" className="button button--ghost">
              See the signals
            </a>
          </div>
        </div>
        <div className="hero__stage" aria-label="Animated governance system preview">
          <div className="hero__stage-frame">
            <video
              className="hero__video"
              src="/SN_Hero_compressed.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/og-image.png"
            />
          </div>
          <div className="hero__signal-row">
            {HERO_SIGNALS.map((signal) => (
              <div key={signal.label} className="hero__signal">
                <span>{signal.label}</span>
                <strong>{signal.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AssemblingBanner() {
  const containerRef = useRef(null);
  const mountRef = useRef(null);
  const overlayRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const progressRef = useRef(0);
  const [bannerHeight, setBannerHeight] = useState(360);

  useEffect(() => {
    const updateHeight = () => setBannerHeight(window.innerWidth < 720 ? 220 : 360);
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const container = containerRef.current;
    const overlay = overlayRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;

    if (!mount || !container || !overlay || !title || !subtitle) {
      return undefined;
    }

    let disposed = false;
    let cleanupScene = () => {};

    const setupScene = async () => {
      const THREE = await import("three");

      if (disposed) {
        return;
      }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / bannerHeight, 0.1, 100);
    camera.position.set(0, 0, 12);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(mount.clientWidth, bannerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);

    const fragments = [];
    const primaryColor = new THREE.Color(0xa8a8a8);
    const secondaryColor = new THREE.Color(0x6b7a94);
    const goldColor = new THREE.Color(0xd4a843);
    const mouse = { x: 0, y: 0 };
    let frameId = 0;
    let assemblyComplete = false;
    let completeTime = 0;

    const createHexRing = (radius, count, yOffset) => {
      for (let index = 0; index < count; index += 1) {
        const angle = (index / count) * Math.PI * 2;
        const targetX = Math.cos(angle) * radius;
        const targetY = Math.sin(angle) * radius + yOffset;
        const geometry = new THREE.BufferGeometry();
        const size = 0.25 + Math.random() * 0.15;
        const sides = Math.random() > 0.5 ? 6 : Math.random() > 0.5 ? 4 : 3;
        const vertices = [];

        for (let side = 0; side < sides; side += 1) {
          const angleA = (side / sides) * Math.PI * 2;
          const angleB = ((side + 1) / sides) * Math.PI * 2;
          vertices.push(0, 0, 0);
          vertices.push(Math.cos(angleA) * size, Math.sin(angleA) * size, 0);
          vertices.push(Math.cos(angleB) * size, Math.sin(angleB) * size, 0);
        }

        geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));

        const isGold = index % 3 === 0 || radius < 0.5;
        const material = new THREE.MeshBasicMaterial({
          color: isGold ? goldColor : primaryColor,
          transparent: true,
          opacity: 0.4,
          side: THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geometry, material);

        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
          color: isGold ? goldColor : secondaryColor,
          transparent: true,
          opacity: 0.6,
        });
        const wire = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        mesh.add(wire);

        const scatter = 10 + Math.random() * 8;
        const startX = targetX + (Math.random() - 0.5) * scatter;
        const startY = targetY + (Math.random() - 0.5) * scatter;
        const startZ = (Math.random() - 0.5) * 4;
        const startRot = (Math.random() - 0.5) * Math.PI * 4;
        mesh.position.set(startX, startY, startZ);
        mesh.rotation.z = startRot;

        group.add(mesh);
        fragments.push({
          mesh,
          mat: material,
          wireGeo: wireframeGeometry,
          wireMat: wireframeMaterial,
          targetX,
          targetY,
          targetZ: 0,
          targetRot: 0,
          startX,
          startY,
          startZ,
          startRot,
          isGold,
        });
      }
    };

    const coreGeometry = new THREE.CircleGeometry(0.3, 6);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: goldColor,
      transparent: true,
      opacity: 0,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    group.add(core);

    const coreWireframeGeometry = new THREE.WireframeGeometry(coreGeometry);
    const coreWireframeMaterial = new THREE.LineBasicMaterial({
      color: goldColor,
      transparent: true,
      opacity: 0,
    });
    const coreWire = new THREE.LineSegments(coreWireframeGeometry, coreWireframeMaterial);
    core.add(coreWire);

    fragments.push({
      mesh: core,
      mat: coreMaterial,
      wireGeo: coreWireframeGeometry,
      wireMat: coreWireframeMaterial,
      targetX: 0,
      targetY: 0,
      targetZ: 0,
      targetRot: 0,
      startX: (Math.random() - 0.5) * 10,
      startY: (Math.random() - 0.5) * 10,
      startZ: (Math.random() - 0.5) * 4,
      startRot: Math.random() * Math.PI * 4,
      isGold: true,
    });

    createHexRing(0, 1, 0);
    createHexRing(1, 6, 0);
    createHexRing(2, 12, 0);
    createHexRing(3, 18, 0);
    createHexRing(4, 24, 0);
    createHexRing(5, 30, 0);

    for (let index = 0; index < 12; index += 1) {
      const angle = (index / 12) * Math.PI * 2;
      const innerX = Math.cos(angle) * 0.5;
      const innerY = Math.sin(angle) * 0.5;
      const outerX = Math.cos(angle) * 5;
      const outerY = Math.sin(angle) * 5;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(new Float32Array([innerX, innerY, 0, outerX, outerY, 0]), 3),
      );

      const material = new THREE.LineBasicMaterial({
        color: secondaryColor,
        transparent: true,
        opacity: 0,
      });

      const line = new THREE.LineSegments(geometry, material);
      group.add(line);
      fragments.push({
        mesh: line,
        mat: material,
        wireMat: null,
        targetX: 0,
        targetY: 0,
        targetZ: 0,
        targetRot: 0,
        startX: 0,
        startY: 0,
        startZ: 0,
        startRot: 0,
        isGold: true,
        isLine: true,
      });
    }

    const updateOverlay = (glow, textOpacity) => {
      overlay.style.opacity = String(glow);
      title.style.opacity = String(textOpacity);
      subtitle.style.opacity = String(textOpacity * 0.72);
      title.style.textShadow = `0 0 30px rgba(212,168,67,${textOpacity * 0.48}), 0 0 60px rgba(212,168,67,${textOpacity * 0.18})`;
      subtitle.style.textShadow = `0 0 15px rgba(212,168,67,${textOpacity * 0.28})`;
    };

    const handlePointerMove = (event) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = -((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const totalRange = viewportHeight + rect.height;
      const current = viewportHeight - rect.top;
      const raw = Math.max(0, Math.min(1, current / totalRange));
      const eased = raw < 0.5 ? 4 * raw * raw * raw : 1 - Math.pow(-2 * raw + 2, 3) / 2;
      progressRef.current = Math.max(0, Math.min(1, eased * 2.5));
    };

    const handleResize = () => {
      const width = mount.clientWidth;
      camera.aspect = width / bannerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, bannerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };

    mount.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    handleScroll();
    updateOverlay(0, 0);

    const animate = () => {
      frameId = window.requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      const progress = Math.min(1, progressRef.current);

      fragments.forEach((fragment) => {
        if (fragment.isLine) {
          fragment.mat.opacity = progress > 0.85 ? ((progress - 0.85) / 0.15) * 0.3 : 0;
          return;
        }

        const eased = progress * progress * (3 - 2 * progress);
        fragment.mesh.position.x = fragment.startX + (fragment.targetX - fragment.startX) * eased;
        fragment.mesh.position.y = fragment.startY + (fragment.targetY - fragment.startY) * eased;
        fragment.mesh.position.z = fragment.startZ + (fragment.targetZ - fragment.startZ) * eased;
        fragment.mesh.rotation.z = fragment.startRot + (fragment.targetRot - fragment.startRot) * eased;

        if (progress < 1) {
          fragment.mesh.position.x += mouse.x * (1 - progress) * 0.3;
          fragment.mesh.position.y += mouse.y * (1 - progress) * 0.3;
        }

        const baseOpacity = 0.15 + progress * 0.45;
        const wireOpacity = 0.2 + progress * 0.6;
        fragment.mat.opacity = baseOpacity;

        if (fragment.wireMat) {
          fragment.wireMat.opacity = wireOpacity;
        }

        if (progress > 0.9 && fragment.isGold) {
          const pulse = Math.sin(time * 3 + fragment.targetX * 2 + fragment.targetY * 2) * 0.15;
          fragment.mat.opacity = baseOpacity + pulse;
          if (fragment.wireMat) {
            fragment.wireMat.opacity = wireOpacity + pulse;
          }
        }
      });

      if (progress > 0.92 && !assemblyComplete) {
        assemblyComplete = true;
        completeTime = time;
      }

      if (progress < 0.88) {
        assemblyComplete = false;
        completeTime = 0;
        updateOverlay(0, 0);
      } else if (assemblyComplete) {
        const elapsed = time - completeTime;
        const glow = Math.min(1, elapsed / 1.5);
        const textOpacity = Math.max(0, Math.min(1, (elapsed - 0.8) / 1));
        updateOverlay(glow, textOpacity);
      }

      group.rotation.y = Math.sin(time * 0.2) * 0.15 * (1 - progress * 0.7);
      group.rotation.x = Math.sin(time * 0.15) * 0.08 * (1 - progress * 0.7);

      renderer.render(scene, camera);
    };

    animate();

      cleanupScene = () => {
      mount.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frameId);

      fragments.forEach((fragment) => {
        fragment.mesh.geometry?.dispose?.();
        fragment.mat.dispose?.();
        fragment.wireGeo?.dispose?.();
        fragment.wireMat?.dispose?.();
      });

      renderer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
    };

    setupScene();

    return () => {
      disposed = true;
      cleanupScene();
    };
  }, [bannerHeight]);

  return (
    <section ref={containerRef} className="assembly-banner" aria-hidden="true">
      <div ref={overlayRef} className="assembly-banner__glow" />
      <div ref={mountRef} className="assembly-banner__canvas" style={{ height: `${bannerHeight}px` }} />
      <div className="assembly-banner__copy" aria-hidden="true">
        <div ref={titleRef} className="assembly-banner__title">
          Sovereign Nexus
        </div>
        <div ref={subtitleRef} className="assembly-banner__subtitle">
          Software | Governance | Delivered
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, body, centered = false }) {
  return (
    <div className={`section-header ${centered ? "is-centered" : ""}`}>
      <div className="section-header__eyebrow">{eyebrow}</div>
      {title ? <h2>{title}</h2> : null}
      {body ? <p>{body}</p> : null}
    </div>
  );
}

function WhatWeBuild() {
  return (
    <section id="build" className="shell section">
      <FadeIn>
        <SectionHeader
          eyebrow="What We Build"
          title="Applications, platforms, and integrations with control built in."
          body="We build production software for teams that need the interface, data model, release path, and operating controls to move together."
        />
      </FadeIn>
      <div className="feature-grid">
        {CAPABILITIES.map((item, index) => (
          <FadeIn key={item.title} delay={index * 0.08}>
            <article className="surface-card feature-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function Duality() {
  return (
    <section className="shell section section--bordered">
      <FadeIn>
        <SectionHeader
          centered
          title="Two strands. One standard."
          body="Code and governance are not separate concerns. They are intertwined."
        />
      </FadeIn>
      <FadeIn delay={0.08}>
        <div className="duality-grid">
          {DUALITY_COLUMNS.map((column) => (
            <article key={column.label} className={`surface-card strand-card strand-card--${column.tone}`}>
              <div className="strand-card__label">{column.label}</div>
              <div className="strand-card__list">
                {column.items.map((item) => (
                  <div key={item}>{item}</div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function Commitment() {
  return (
    <section className="shell section section--bordered">
      <FadeIn>
        <SectionHeader
          eyebrow="Our Commitment"
          title="One team accountable from design to production."
        />
        <div className="commitment-list">
          {COMMITMENT_LINES.map((line, index) => (
            <div key={line} className="commitment-list__item">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <p className={index === COMMITMENT_LINES.length - 1 ? "is-emphasis" : ""}>{line}</p>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}

function Signals() {
  return (
    <section id="signals" className="shell section section--bordered">
      <FadeIn>
        <SectionHeader
          eyebrow="Why It Holds"
          title="Built for high-accountability environments."
          body="The systems we build are shaped for teams that need clear ownership, reliable change history, and confidence under operational pressure."
        />
      </FadeIn>
      <div className="signals-grid">
        {SIGNALS.map((signal, index) => (
          <FadeIn key={signal.title} delay={index * 0.1}>
            <article className="surface-card signal-card">
              <h3>{signal.title}</h3>
              <p>{signal.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function FitSection() {
  return (
    <section className="shell section section--bordered">
      <FadeIn>
        <SectionHeader
          eyebrow="Best Fit"
          title="Custom software for teams that cannot treat control as an afterthought."
          body="Sovereign Nexus is built for organizations that need the product experience and the operating model to reinforce each other."
        />
      </FadeIn>
      <div className="signals-grid">
        {FITS.map((fit, index) => (
          <FadeIn key={fit.title} delay={index * 0.1}>
            <article className="surface-card signal-card">
              <h3>{fit.title}</h3>
              <p>{fit.body}</p>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", message: "", company: "" });
  const [focusedField, setFocusedField] = useState("");
  const [status, setStatus] = useState({ type: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setStatus({ type: "idle", message: "" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Message could not be sent.");
      }

      setForm({ name: "", email: "", message: "", company: "" });
      setStatus({ type: "success", message: "Message sent. Jake will get this in his inbox." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="shell section section--bordered section--contact">
      <FadeIn className="contact-layout">
        <div className="contact-copy">
          <SectionHeader
            eyebrow="Contact"
            title="Reach out."
            body="Governed software. End-to-end delivery."
          />
          <div className="contact-notes">
            {CONTACT_NOTES.map((note) => (
              <div key={note} className="contact-notes__item">
                {note}
              </div>
            ))}
          </div>
        </div>

        <form
          className="surface-card contact-card"
          onSubmit={handleSubmit}
          aria-busy={isSubmitting}
          aria-describedby="contact-form-status"
        >
          <label className="field field--honeypot" aria-hidden="true">
            <span>Company</span>
            <input name="company" tabIndex="-1" value={form.company} onChange={updateField("company")} />
          </label>
          <div className="contact-card__grid">
            <label className="field">
              <span>Name</span>
              <input
                name="name"
                required
                autoComplete="name"
                maxLength={80}
                value={form.name}
                onChange={updateField("name")}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField("")}
                className={focusedField === "name" ? "is-focused" : ""}
                placeholder="Your name"
              />
            </label>
            <label className="field">
              <span>Email</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                maxLength={254}
                value={form.email}
                onChange={updateField("email")}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField("")}
                className={focusedField === "email" ? "is-focused" : ""}
                placeholder="you@company.com"
              />
            </label>
            <label className="field field--full">
              <span>Message</span>
              <textarea
                name="message"
                rows={6}
                required
                minLength={10}
                maxLength={4000}
                value={form.message}
                onChange={updateField("message")}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField("")}
                className={focusedField === "message" ? "is-focused" : ""}
                placeholder="What are you building, and where does governance matter most?"
              />
            </label>
          </div>
          <div className="contact-card__footer">
            <button type="submit" className="button button--primary" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send inquiry"}
            </button>
            <p
              id="contact-form-status"
              className={status.type !== "idle" ? `form-status form-status--${status.type}` : ""}
              role="status"
              aria-live="polite"
            >
              {status.message || "This form sends directly to jake@sovereign-nexus.com."}
            </p>
          </div>
        </form>
      </FadeIn>
    </section>
  );
}

function Footer() {
  return (
    <footer className="shell footer">
      <span>&copy; {new Date().getFullYear()} Sovereign Nexus LLC</span>
      <span>Built for accountable systems</span>
    </footer>
  );
}

export default function App() {
  return (
    <div className="page-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <WhatWeBuild />
        <Duality />
        <AssemblingBanner />
        <Commitment />
        <Signals />
        <FitSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
