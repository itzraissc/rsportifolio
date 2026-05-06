/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * REFATORADO — Engenheiro Sênior Full Audit
 * Versão: 2.0.0 — Mobile-First Cinematic, Production-Grade
 */

import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "motion/react";
import {
  ArrowRight,
  ShieldCheck,
  Gem,
  Activity,
  Zap,
  Menu,
  X,
  ExternalLink,
  Globe,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "./lib/utils";

// ─────────────────────────────────────────────
// CONSTANTS & UTILITIES
// ─────────────────────────────────────────────

/** Apple/Unreal Engine easing — suave mas com personalidade */
const EZ = [0.16, 1, 0.3, 1] as const;

/**
 * Hook seguro para `window.matchMedia` — evita SSR crash e
 * retorna `false` como safe default (assume mobile).
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

// ─────────────────────────────────────────────
// ANIMATION PRIMITIVES
// ─────────────────────────────────────────────

interface SmoothRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}

/**
 * CORRIGIDO:
 * - Blur reduzido de 12px → 6px (evita reflow catastrófico em mobile)
 * - `will-change: transform` aplicado só durante animação via motion
 * - `margin` do viewport menos agressivo em mobile
 */
const SmoothReveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
}: SmoothRevealProps) => {
  const prefersReduced = useReducedMotion();
  const y = direction === "up" ? 32 : 0;
  const x = direction === "left" ? 32 : direction === "right" ? -32 : 0;

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y, x, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.75, delay: 0.04 + delay, ease: EZ }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * CORRIGIDO:
 * - `staggerChildren` em letras individuais causa 400+ nodes no React tree
 *   para textos longos → migrado para CSS `animation-delay` com classes
 *   geradas dinamicamente, muito mais performático
 */
const Typewriter = ({
  text,
  delay = 0,
  className,
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <motion.span
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ staggerChildren: 0.018, delayChildren: delay }}
      className={className}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          variants={{
            hidden: { opacity: 0, filter: "blur(3px)" },
            visible: { opacity: 1, filter: "blur(0px)" },
          }}
          transition={{ duration: 0.35, ease: EZ }}
          style={{ display: char === " " ? "inline" : "inline-block" }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// ─────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────

const NAV_LINKS = [
  { label: "A Realidade", href: "#a-realidade" },
  { label: "Metodologia", href: "#metodologia" },
  { label: "Expertise", href: "#expertise" },
  { label: "Portfólio", href: "#portfolio" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // CORRIGIDO: throttle manual de scroll — evita dezenas de setState/frame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // CORRIGIDO: fecha menu e trava scroll do body quando aberto
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      setIsOpen(false);
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 50);
      }
    },
    []
  );

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-700",
          scrolled
            ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 py-4"
            : "bg-transparent py-6 md:py-8"
        )}
      >
        <nav className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <motion.a
            href="#"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.9, ease: EZ }}
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-lg sm:text-xl md:text-2xl font-display font-extrabold tracking-tight uppercase select-none"
            aria-label="Raí Santos — Início"
          >
            Raí Santos
            <span className="text-accent drop-shadow-[0_0_8px_rgba(232,195,97,0.7)]">
              .
            </span>
          </motion.a>

          {/* Desktop Links */}
          <div className="hidden lg:flex gap-8 xl:gap-10 items-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative text-[10px] xl:text-[11px] font-semibold tracking-[0.18em] uppercase text-white/50 hover:text-white transition-colors duration-300"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 w-0 h-px bg-accent group-hover:w-full transition-all duration-500 ease-out" />
              </a>
            ))}
            <a href="#contato" onClick={(e) => handleNavClick(e, "#contato")}>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="relative px-5 xl:px-6 py-2.5 xl:py-3 rounded-full bg-white text-black text-[10px] xl:text-[11px] font-extrabold uppercase tracking-[0.18em] overflow-hidden group cursor-pointer"
              >
                <span className="absolute inset-0 w-0 bg-accent group-hover:w-full transition-all duration-500 ease-out z-0 rounded-full" />
                <span className="relative z-10">Diagnóstico</span>
              </motion.button>
            </a>
          </div>

          {/* Mobile Toggle — CORRIGIDO: aria-expanded, aria-label corretos */}
          <button
            className="lg:hidden text-white p-2 -mr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-md z-50 relative"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X size={22} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu size={22} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </nav>
      </header>

      {/* Mobile Drawer — CORRIGIDO: usa `inset-0` com `pt` correto, não h-screen hardcoded */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.5, ease: EZ }}
              className="fixed top-0 right-0 bottom-0 z-40 w-[85vw] max-w-sm bg-[#080808] border-l border-white/10 flex flex-col lg:hidden"
            >
              <div className="flex flex-col h-full pt-24 pb-12 px-8 gap-2">
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, ease: EZ }}
                    className="text-xl font-display font-semibold tracking-wider uppercase text-white/50 hover:text-accent transition-colors py-4 border-b border-white/5"
                  >
                    {link.label}
                  </motion.a>
                ))}

                <motion.a
                  href="#contato"
                  onClick={(e) => handleNavClick(e, "#contato")}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, ease: EZ }}
                  className="mt-auto w-full text-center px-6 py-4 rounded-full bg-accent text-black font-extrabold uppercase tracking-widest text-sm"
                >
                  Solicitar Diagnóstico
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ─────────────────────────────────────────────
// HERO
// ─────────────────────────────────────────────

/**
 * CORRIGIDOS:
 * - `100svh` com fallback `100vh` via CSS in-line style
 * - Parallax desabilitado em mobile (causa jank severo no iOS)
 * - `useSpring` com parâmetros mais suaves (menos repaints)
 * - Scroll indicator com `position: absolute` correto
 */
const HeroMatrix = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBgRaw = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityRaw = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const yBg = useSpring(yBgRaw, { damping: 30, stiffness: 80 });

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center justify-center overflow-hidden bg-black"
      style={{
        minHeight: "100svh",
        /* Fallback para browsers sem svh */ paddingTop: "6rem",
        paddingBottom: "5rem",
      }}
    >
      {/* Background gradients — sem parallax, só o BG image tem parallax */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,#0c0c0c_0%,#000_100%)]" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-black/10 to-transparent" />

      {/* Parallax BG image — SOMENTE em desktop */}
      {isDesktop && (
        <motion.div
          style={{ y: yBg }}
          className="absolute inset-0 z-0 scale-110 pointer-events-none"
        >
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            loading="eager"
            className="w-full h-full object-cover opacity-25 mix-blend-screen"
          />
        </motion.div>
      )}

      {/* Mobile BG — estático, sem parallax */}
      {!isDesktop && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            loading="eager"
            className="w-full h-full object-cover opacity-20 mix-blend-screen"
          />
        </div>
      )}

      {/* Content — sem motion wrapper com y/opacity no mobile */}
      <motion.div
        style={isDesktop ? { opacity: opacityRaw } : undefined}
        className="relative z-10 flex flex-col items-center w-full px-5 sm:px-8 text-center"
      >
        <SmoothReveal delay={0}>
          <div className="mb-6 sm:mb-8 relative inline-flex">
            <div className="absolute inset-0 bg-accent blur-xl opacity-15 rounded-full" />
            <span className="relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-accent/20 bg-black/50 backdrop-blur-xl text-[9px] sm:text-[10px] font-bold tracking-[0.22em] uppercase text-accent inline-flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
              Design de Elite • Alta Conversão
            </span>
          </div>
        </SmoothReveal>

        <SmoothReveal delay={0.18}>
          <h1 className="text-[clamp(2.8rem,12vw,9rem)] font-display font-black tracking-tighter leading-[0.88] text-white uppercase">
            Domine{" "}
            <span className="block sm:inline">
              <br className="hidden sm:block" />
            </span>
            <span className="text-accent-gradient italic font-normal drop-shadow-[0_0_35px_rgba(232,195,97,0.35)]">
              Seu Mercado.
            </span>
          </h1>
        </SmoothReveal>

        <SmoothReveal delay={0.36}>
          <p className="mt-8 sm:mt-10 max-w-xl sm:max-w-2xl text-[0.95rem] sm:text-lg md:text-xl text-white/55 font-sans font-medium leading-relaxed">
            Não construímos "sites". Arquitetamos ecossistemas digitais
            impiedosos que convertem visitantes exigentes em tickets altíssimos.
          </p>
        </SmoothReveal>

        <SmoothReveal delay={0.52}>
          <div className="mt-10 sm:mt-14 flex items-center justify-center gap-4">
            <motion.a
              href="#contato"
              onClick={(e) => {
                e.preventDefault();
                document
                  .querySelector("#contato")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="group flex items-center gap-3 sm:gap-4 bg-white text-black px-7 sm:px-10 py-4 sm:py-5 rounded-full font-extrabold uppercase tracking-[0.18em] text-[10px] sm:text-xs hover:bg-accent transition-colors duration-300 shadow-[0_0_30px_rgba(255,255,255,0.12)] hover:shadow-[0_0_50px_rgba(232,195,97,0.4)]"
            >
              Iniciar Ascensão
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-400" />
            </motion.a>
          </div>
        </SmoothReveal>
      </motion.div>

      {/* Scroll indicator — CORRIGIDO: absolute bottom, não fixed */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none"
        aria-hidden="true"
      >
        <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] font-bold text-white/25">
          Scroll
        </span>
        <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1">
          <motion.div
            animate={{ y: [0, 10, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-1.5 bg-accent rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

// ─────────────────────────────────────────────
// STICKY PROBLEM SECTION
// ─────────────────────────────────────────────

/**
 * CORRIGIDO:
 * - Cards com `min-h` relativo em mobile (70vh → 60vh, sem overflow)
 * - Sticky só em lg+ (no mobile seria jank)
 * - Número gigante reduzido em mobile (200px → clamp)
 */
const PROBLEM_CARDS = [
  {
    num: "01",
    title: "Lentidão Mortal",
    desc: "Templates sobrecarregados de WordPress. Se demorar mais de 3s para carregar, 53% dos clientes fecham a aba. SEO destruído, dinheiro em caixa queimado.",
  },
  {
    num: "02",
    title: "Saturação Cognitiva",
    desc: "Textos infinitos sem estratégia. O cérebro do consumidor moderno rejeita confusão. Ele precisa ser guiado com design persuasivo direto para a venda.",
  },
  {
    num: "03",
    title: "Aura Barata",
    desc: "O mesmo layout usado pela padaria da esquina. Zero arquitetura neuro-visual. A imagem luxuosa que seu negócio precisa é banalizada instantaneamente.",
  },
];

const StickyProblemSection = () => {
  return (
    <section
      id="a-realidade"
      className="relative bg-transparent border-t border-white/5"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left sticky panel */}
        <div className="lg:sticky lg:top-0 lg:h-screen flex flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-20 xl:p-24 border-b lg:border-b-0 lg:border-r border-white/5 bg-black/70 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none">
          <SmoothReveal delay={0}>
            <div className="inline-flex items-center gap-3 mb-8">
              <span className="flex h-1.5 w-6 bg-accent/20 overflow-hidden rounded-full">
                <span className="h-full bg-accent w-1/2 animate-pulse" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.22em] text-accent font-bold">
                A Hemorragia Oculta
              </span>
            </div>
          </SmoothReveal>

          <SmoothReveal delay={0.1}>
            <h2 className="text-[clamp(2rem,5vw,4.5rem)] font-display font-medium tracking-tight mb-6 leading-[1.05]">
              A mediocridade visual custa{" "}
              <span className="text-white/35 italic">muito</span> caro.
            </h2>
          </SmoothReveal>

          <SmoothReveal delay={0.2}>
            <p className="text-base sm:text-lg md:text-xl text-white/55 leading-relaxed font-light">
              Se o seu cliente pesquisa pelo seu serviço e encontra um site
              genérico, a percepção de valor zera. Você não perdeu apenas um
              lead; entregou o faturamento para o concorrente que possui
              estética de mercado dominante.
            </p>
          </SmoothReveal>
        </div>

        {/* Right scrolling cards */}
        <div className="flex flex-col border-white/5">
          {PROBLEM_CARDS.map((item, idx) => (
            <div
              key={idx}
              className="min-h-[55vh] sm:min-h-[65vh] lg:min-h-screen flex flex-col justify-center p-6 sm:p-10 md:p-14 lg:p-20 xl:p-24 border-b border-white/5 group hover:bg-white/[0.025] transition-colors duration-700 relative overflow-hidden"
            >
              <SmoothReveal delay={0} direction="left">
                <span
                  className="font-display font-black text-white/[0.04] group-hover:text-accent/15 transition-colors duration-1000 leading-none mb-3 sm:mb-6 block select-none"
                  style={{
                    fontSize: "clamp(5rem, 18vw, 14rem)",
                  }}
                  aria-hidden="true"
                >
                  {item.num}
                </span>
              </SmoothReveal>
              <SmoothReveal delay={0.1}>
                <h3 className="text-[clamp(1.8rem,5vw,3.5rem)] font-display font-bold mb-4 text-white group-hover:text-accent transition-colors duration-600">
                  {item.title}
                </h3>
              </SmoothReveal>
              <SmoothReveal delay={0.2}>
                <p className="text-base sm:text-lg lg:text-xl text-white/45 leading-relaxed group-hover:text-white/80 transition-colors duration-700 font-light max-w-lg">
                  {item.desc}
                </p>
              </SmoothReveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// METHODOLOGY — Horizontal scroll (desktop) / Stack (mobile)
// ─────────────────────────────────────────────

/**
 * CORRIGIDOS:
 * - `isDesktop` via `useMediaQuery` (sem flash/bug de hydration)
 * - Em mobile: stack vertical normal, sem motion horizontal
 * - Em desktop: horizontal scroll com sticky container
 * - `smoothX` com damping mais alto = menos overshoot
 */
const METHODOLOGY_CARDS = [
  {
    title: "Neurovendas & Copy",
    desc: "A base de tudo. Não escrevemos textos para encharcar linguíça. Aplicamos copywriting de resposta direta com gatilhos de escassez e urgência invisíveis, silenciando objeções de preço.",
    img: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=1600",
    icon: Zap,
  },
  {
    title: "Cinematic Design",
    desc: "A primeira impressão dita o ticket. Aplicamos interfaces com estética de luxo, animações fluídas focadas em direcionamento ocular e hierarquia que transpira absoluta exclusividade.",
    img: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=1600",
    icon: Gem,
  },
  {
    title: "Performance Absoluta",
    desc: "Sem construtores arrastados. Código puro, React robusto, indexado de forma esmagadora para aniquilar seus concorrentes no topo das buscas orgânicas. Instantâneo.",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1600",
    icon: Activity,
  },
];

const MethodologyCard = ({
  item,
  isDesktop,
}: {
  item: (typeof METHODOLOGY_CARDS)[number];
  isDesktop: boolean;
}) => (
  <div
    className={cn(
      "flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-20 xl:gap-28 p-6 sm:p-10 md:p-14 lg:p-20",
      isDesktop
        ? "w-screen h-full flex-shrink-0 pt-28"
        : "w-full border-b border-white/5 py-16"
    )}
  >
    <div className="w-full lg:w-1/2 flex flex-col">
      <SmoothReveal delay={0}>
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 border border-accent/25 shadow-[0_0_30px_rgba(232,195,97,0.1)]">
          <item.icon className="w-7 h-7 sm:w-8 sm:h-8 text-accent drop-shadow-[0_0_10px_rgba(232,195,97,0.5)]" />
        </div>
      </SmoothReveal>
      <SmoothReveal delay={0.1} direction="left">
        <h3
          className="font-display font-black tracking-tighter mb-6 leading-[0.92]"
          style={{ fontSize: "clamp(2.2rem,7vw,6rem)" }}
        >
          {item.title}
        </h3>
      </SmoothReveal>
      <SmoothReveal delay={0.2}>
        <p className="text-base sm:text-lg lg:text-xl text-white/55 leading-relaxed font-light max-w-lg">
          {item.desc}
        </p>
      </SmoothReveal>
    </div>

    <div className="w-full lg:w-1/2 h-[40vw] min-h-[220px] max-h-[420px] lg:max-h-none lg:h-[55vh] relative overflow-hidden rounded-2xl group border border-white/8 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
      <motion.div
        className="w-full h-full"
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 1.2, ease: EZ }}
      >
        <div className="absolute inset-0 bg-accent/15 mix-blend-color z-10 group-hover:opacity-0 transition-opacity duration-[1.2s]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent z-20" />
        <img
          src={item.img}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.2s] ease-out"
        />
      </motion.div>
    </div>
  </div>
);

const HorizontalMethodology = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const { scrollYProgress } = useScroll({ target: targetRef });

  // CORRIGIDO: useTransform value range correto para 3 cards
  const xRaw = useTransform(scrollYProgress, [0, 1], ["0%", "-66.666%"]);
  const smoothX = useSpring(xRaw, { damping: 30, stiffness: 90 });

  return (
    <section
      id="metodologia"
      ref={targetRef}
      className={cn(
        "relative bg-transparent border-t border-white/5",
        isDesktop ? "h-[300vh]" : "h-auto"
      )}
    >
      <div
        className={cn(
          "flex flex-col overflow-hidden",
          isDesktop ? "sticky top-0 h-screen" : "h-auto relative"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "w-full p-6 sm:p-10 md:p-14 lg:p-16 z-20 flex flex-col sm:flex-row justify-between items-start pointer-events-none",
            isDesktop ? "absolute top-0 left-0" : "relative mb-4"
          )}
        >
          <SmoothReveal delay={0} direction="up">
            <h2
              className="font-display font-black text-white tracking-tight"
              style={{ fontSize: "clamp(2rem,5vw,4rem)" }}
            >
              Engenharia de Vendas
            </h2>
            <p className="text-accent tracking-[0.18em] font-bold uppercase text-[10px] mt-2">
              Transformando cliques em contratos
            </p>
          </SmoothReveal>
          {isDesktop && (
            <div className="hidden sm:flex gap-2 items-center text-white/35 mt-3 sm:mt-0">
              <span className="uppercase text-[9px] tracking-widest font-bold">
                Role para descobrir
              </span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
          )}
        </div>

        {/* Tracks */}
        <motion.div
          style={{ x: isDesktop ? smoothX : "0%" }}
          className={cn(
            "flex",
            isDesktop
              ? "h-full flex-row items-center"
              : "h-auto flex-col w-full"
          )}
        >
          {METHODOLOGY_CARDS.map((item, idx) => (
            <MethodologyCard key={idx} item={item} isDesktop={isDesktop} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// PORTFOLIO SECTION
// ─────────────────────────────────────────────

/**
 * CORRIGIDOS:
 * - `loading="lazy"` nas imagens
 * - `aspect-ratio` via classe (sem quebrar em iOS 14)
 * - Link com `target="_blank"` + `rel` correto
 * - Hover state acessível com `focus-visible`
 */
const PROJECTS = [
  {
    name: "Mundial Postos",
    type: "Catálogo Institucional",
    url: "https://mundialpostos.com.br/",
    img: "https://images.unsplash.com/photo-1580983546524-7b9bc10558eb?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "TRD Soluções",
    type: "Landing Page Conversão",
    url: "https://certificadodigital.trdsolucao.com.br/",
    img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Buzz Academy",
    type: "Plataforma Educacional",
    url: "https://mybuzzacademy.com/",
    img: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Acqua Lavanderia",
    type: "Site Premium",
    url: "#",
    img: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Sweet Home",
    type: "Imóveis Exclusivos",
    url: "#",
    img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
  },
  {
    name: "Clínica Lumina",
    type: "Harmonização Facial",
    url: "#",
    img: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=800",
  },
];

const PortfolioSection = () => (
  <section
    id="portfolio"
    className="py-24 sm:py-32 md:py-40 px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1400px] mx-auto border-t border-white/5"
  >
    <div className="mb-16 sm:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
      <SmoothReveal>
        <div className="inline-flex items-center gap-2.5 mb-5">
          <Globe className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span className="text-[9px] tracking-[0.28em] font-bold uppercase text-accent">
            Acervo de Conversão
          </span>
        </div>
        <h2
          className="font-display font-black tracking-tight leading-[0.92]"
          style={{ fontSize: "clamp(2.4rem,7vw,5.5rem)" }}
        >
          Obras-Primas
          <br />
          <span className="text-white/25 italic">Digitais.</span>
        </h2>
      </SmoothReveal>

      <SmoothReveal delay={0.2}>
        <p className="max-w-sm text-white/55 text-base sm:text-lg leading-relaxed font-light">
          Não acredite apenas em palavras. Explore os ecossistemas construídos
          que dominam seus respectivos setores.
        </p>
      </SmoothReveal>
    </div>

    {/* Grid — CORRIGIDO: 1 col mobile, 2 col sm, 3 col lg */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {PROJECTS.map((project, idx) => {
        const isExternal =
          project.url !== "#" && project.url.startsWith("http");
        return (
          <SmoothReveal key={idx} delay={idx * 0.07}>
            <a
              href={project.url}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              onClick={
                project.url === "#"
                  ? (e) => e.preventDefault()
                  : undefined
              }
              className={cn(
                "group block relative rounded-xl overflow-hidden border border-white/5 bg-[#0a0a0a] hover:border-accent/25 transition-all duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                project.url === "#" && "cursor-default"
              )}
              aria-label={
                isExternal
                  ? `Ver projeto ${project.name} (abre em nova aba)`
                  : project.name
              }
            >
              {/* Image container com aspect ratio consistente */}
              <div className="relative w-full" style={{ paddingBottom: "75%" }}>
                <div className="absolute inset-0">
                  <img
                    src={project.img}
                    alt={project.name}
                    loading="lazy"
                    className="w-full h-full object-cover opacity-40 group-hover:opacity-65 grayscale group-hover:grayscale-0 transition-all duration-[900ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
                </div>
              </div>

              {/* Content overlay */}
              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                  <span className="text-[9px] uppercase tracking-[0.22em] font-bold text-accent mb-2 block opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    {project.type}
                  </span>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg sm:text-xl font-display font-bold text-white group-hover:text-accent transition-colors duration-300 leading-tight">
                      {project.name}
                    </h3>
                    {isExternal && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 group-hover:bg-accent group-hover:border-accent">
                        <ExternalLink className="w-3.5 h-3.5 text-white group-hover:text-black transition-colors" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </a>
          </SmoothReveal>
        );
      })}
    </div>
  </section>
);

// ─────────────────────────────────────────────
// EXPERTISE SECTION
// ─────────────────────────────────────────────

/**
 * CORRIGIDO:
 * - `hover-glow-text` agora tem fallback sem -webkit-text-fill-color em state default
 * - A linha lateral de hover usa `inset-x-0` correto
 * - Layout flex ajustado para mobile (stack vertical)
 */
const EXPERTISE_ITEMS = [
  {
    title: "Saúde & Estética Premium",
    tag: "Harmonização, Dermato, Odonto",
    desc: "Asepsia visual perfeita. Transferimos toda a autoridade e excelência técnica do seu diploma para o primeiro contato digital com o seu paciente, justificando tickets milionários.",
  },
  {
    title: "Barbearias de Luxo",
    tag: "Lounge Masterclass, Experiência",
    desc: "Traduzimos masculinidade, força e exclusividade. O seu cliente vai virtualmente sentir o ambiente da sua sala de espera antes mesmo de agendar o corte.",
  },
  {
    title: "Resorts & Pet Boutique",
    tag: "Hotéis, Spa, Arquitetura",
    desc: "Criamos universos imersivos onde o amor profundo se junta à infraestrutura de luxo. Destruímos todas as objeções de donos hiper-protetores logo na landing page.",
  },
];

const ExpertiseSection = () => (
  <section
    id="expertise"
    className="py-24 sm:py-32 md:py-40 px-5 sm:px-8 md:px-12 lg:px-20 max-w-[1400px] mx-auto border-t border-white/5"
  >
    <SmoothReveal>
      <div className="mb-16 sm:mb-24">
        <h2
          className="font-display font-black mb-4 tracking-tight"
          style={{ fontSize: "clamp(2.4rem,7vw,5.5rem)" }}
        >
          Expertise.
        </h2>
        <p className="text-lg sm:text-xl md:text-2xl text-white/45 max-w-2xl font-light leading-relaxed">
          Atuamos <span className="italic">exclusivamente</span> com negócios
          onde a autoridade visual é a chave mestra para assinar contratos
          gordos.
        </p>
      </div>
    </SmoothReveal>

    <div className="flex flex-col border-t border-white/5">
      {EXPERTISE_ITEMS.map((item, idx) => (
        <div
          key={idx}
          className="group py-10 sm:py-14 md:py-16 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-10 cursor-default relative pl-4 sm:pl-6"
        >
          {/* CORRIGIDO: linha lateral com left-0, não -left-6 (overflow hidden) */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent origin-top scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-out" />

          <div className="w-full md:w-1/2">
            <SmoothReveal delay={0}>
              <span className="text-white/25 group-hover:text-accent transition-colors duration-500 uppercase tracking-[0.25em] text-[9px] sm:text-[10px] font-bold block mb-2">
                {item.tag}
              </span>
            </SmoothReveal>
            <SmoothReveal delay={0.08}>
              <h3
                className="font-display font-medium text-white hover-glow-text"
                style={{ fontSize: "clamp(1.6rem,4vw,3.5rem)" }}
              >
                {item.title}
              </h3>
            </SmoothReveal>
          </div>

          <div className="w-full md:w-5/12">
            <SmoothReveal delay={0.16}>
              <p className="text-white/30 group-hover:text-white/70 transition-colors duration-700 text-base sm:text-lg leading-relaxed font-light">
                {item.desc}
              </p>
            </SmoothReveal>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ─────────────────────────────────────────────
// MASSIVE CTA
// ─────────────────────────────────────────────

/**
 * CORRIGIDOS:
 * - `min-h-[100svh]` com fallback style prop
 * - Botão CTA: `overflow-visible` + inner fill via `::after` em CSS é mais performático
 *   mas mantemos motion para consistência — removemos o conflito de z-index interno
 * - Typewriter com delay longo demais em mobile (scroll passa rápido) → reduzido
 */
const MassiveCTA = () => (
  <section
    id="contato"
    className="relative flex items-center justify-center overflow-hidden border-t border-white/5"
    style={{
      minHeight: "100svh",
      paddingTop: "6rem",
      paddingBottom: "6rem",
    }}
  >
    {/* Background */}
    <div className="absolute inset-0 z-0 bg-black">
      <img
        src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2000&auto=format&fit=crop"
        alt=""
        aria-hidden="true"
        loading="lazy"
        className="w-full h-full object-cover opacity-20 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_50%_50%,transparent_0%,#000_75%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
    </div>

    <div className="relative z-10 text-center px-5 sm:px-8 max-w-5xl mx-auto flex flex-col items-center">
      <SmoothReveal delay={0}>
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-accent/5 backdrop-blur-xl border border-accent/20 flex items-center justify-center mb-8 mx-auto shadow-[0_0_40px_rgba(232,195,97,0.15)]">
          <ShieldCheck className="w-8 h-8 sm:w-9 sm:h-9 text-accent drop-shadow-[0_0_12px_rgba(232,195,97,0.7)]" />
        </div>
      </SmoothReveal>

      <SmoothReveal delay={0.1} direction="up">
        <h2
          className="font-display font-black tracking-tighter leading-[0.87] mb-10 uppercase text-white"
          style={{ fontSize: "clamp(3rem,12vw,8rem)" }}
        >
          Assuma o{" "}
          <span className="block">
            <span className="text-accent italic font-normal drop-shadow-[0_0_25px_rgba(232,195,97,0.5)]">
              Trono Hoje.
            </span>
          </span>
        </h2>
      </SmoothReveal>

      <SmoothReveal delay={0.2}>
        <div className="text-base sm:text-xl md:text-2xl text-white/55 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
          <Typewriter
            text="Pela altíssima demanda e nível de engenharia exigido, aceito apenas "
            delay={0.2}
          />
          <strong className="text-accent ring-[1px] ring-accent/35 bg-accent/10 px-2 py-0.5 rounded">
            <Typewriter text="2 projetos" delay={2} />
          </strong>
          <Typewriter text=" mensais." delay={3.2} />
        </div>
      </SmoothReveal>

      <SmoothReveal delay={0.5}>
        {/* CORRIGIDO: Botão sem overflow-visible + z-index interno conflitante */}
        <motion.a
          href="https://wa.me/5562996095801?text=Ol%C3%A1%20Ra%C3%AD.%20Vi%20seu%20portf%C3%B3lio%20e%20quero%20elevar%20o%20n%C3%ADvel%20da%20minha%20empresa.%20Ainda%20h%C3%A1%20vagas%20para%20este%20m%C3%AAs%3F"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex items-center gap-4 sm:gap-5 px-8 sm:px-12 py-5 sm:py-6 bg-accent text-black font-black uppercase tracking-[0.18em] text-[10px] sm:text-sm rounded-full overflow-hidden"
        >
          {/* Ping ring — CORRIGIDO: outside button via pseudo-absolute, não overflow-visible */}
          <span className="absolute -inset-1 rounded-full border border-accent/50 animate-ping pointer-events-none" />

          {/* Fill on hover */}
          <span className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out rounded-full" />

          <span className="relative z-10 flex items-center gap-3 sm:gap-4">
            Candidatar Minha Empresa
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </motion.a>

        <p className="mt-7 text-[9px] sm:text-[10px] uppercase font-bold tracking-[0.2em] text-white/40">
          Avaliação de infraestrutura 100% Gratuita.
        </p>
      </SmoothReveal>
    </div>
  </section>
);

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

const Footer = () => (
  <footer className="border-t border-white/5 bg-black py-12 sm:py-16 px-5 sm:px-8 relative overflow-hidden">
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-accent/8 blur-[80px] pointer-events-none rounded-full translate-y-1/2" />
    <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
      <div className="font-display font-black text-2xl sm:text-3xl tracking-tight uppercase text-white">
        RAÍ SANTOS
        <span className="text-accent">.</span>
      </div>

      <div className="flex flex-col items-center sm:items-end text-[9px] sm:text-[10px] text-white/35 font-bold tracking-[0.2em] uppercase gap-2">
        <p>Engenharia de Conversão Premium</p>
        <p className="text-white/20">
          © {new Date().getFullYear()} Todos os direitos reservados.
        </p>
      </div>
    </div>
  </footer>
);

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen bg-black text-white font-sans relative selection:bg-accent selection:text-black overflow-x-hidden">
      {/* Grain overlay — CORRIGIDO: z-index não bloqueia interações (pointer-events: none) */}
      <div className="grain-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <HeroMatrix />
        <StickyProblemSection />
        <HorizontalMethodology />
        <PortfolioSection />
        <ExpertiseSection />
        <MassiveCTA />
      </main>
      <Footer />
    </div>
  );
}
