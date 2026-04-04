/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, useScroll, useTransform, AnimatePresence, useSpring, useMotionValue, animate } from "motion/react";
import { 
  Menu, 
  X, 
  ArrowRight, 
  ChevronRight, 
  Shield, 
  Cpu, 
  Zap, 
  Globe,
  Search,
  ArrowUpRight,
  ChevronDown,
  Twitter
} from "lucide-react";
import { useState, useEffect, useRef, useMemo } from "react";
import gsap from "gsap";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const progressValue = useMotionValue(0);
  const [displayProgress, setDisplayProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const controls = animate(progressValue, 100, {
      duration: 3,
      ease: [0.45, 0, 0.55, 1], // Custom smooth ease
      onUpdate: (latest) => setDisplayProgress(Math.floor(latest)),
      onComplete: () => {
        setIsExiting(true);
        setTimeout(onComplete, 500);
      }
    });
    return () => controls.stop();
  }, [onComplete, progressValue]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className={`fixed inset-0 z-[100] bg-bg-dark flex flex-col items-center justify-center p-6 font-mono ${isExiting ? 'pointer-events-none' : ''}`}
    >
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 w-40 h-40 border-t border-l border-white/5" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 border-b border-r border-white/5" />
        
        <div className="flex justify-between items-end mb-4">
          <div className="flex flex-col">
            <motion.span 
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[8px] font-bold tracking-[0.4em] text-white/40 uppercase mb-1"
            >
              Establishing Connection
            </motion.span>
            <span className="text-xl font-bold tracking-tighter text-white">AKITO_HATTORI_HP</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-4xl font-bold font-display tracking-tighter tabular-nums">
              {displayProgress.toString().padStart(3, '0')}
            </span>
          </div>
        </div>

        <div className="relative h-[1px] w-full bg-white/10 overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 left-0 bg-white"
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <div className="h-[2px] w-8 bg-white/20" />
            <span className="text-[6px] text-white/20 uppercase tracking-widest">Memory: 64GB LPDDR5X</span>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <div className="h-[2px] w-8 bg-white/20" />
            <span className="text-[6px] text-white/20 uppercase tracking-widest">Status: Nominal</span>
          </div>
        </div>

        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20">
          <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          <span className="text-[8px] tracking-[0.5em] uppercase">Loading Assets</span>
        </div>
      </div>
    </motion.div>
  );
};

const LineFadeInText = ({ text, className = "" }: { text: string, className?: string }) => {
  const lines = useMemo(() => text.split("\n"), [text]);
  
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <div key={i} className="overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              delay: i * 0.05,
              ease: [0.215, 0.61, 0.355, 1]
            }}
          >
            {line}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

const translations = {
  en: {
    nav: {
      about: "ABOUT ME",
      works: "WORKS",
      skills: "SKILLS",
      careers: "CAREERS",
      contact: "CONTACT"
    },
    hero: {
      description: "B. 2008. A system-level creator bridging technology,\ndesign, and society to build from scratch.\nImplementing across domains from hardware\nprototyping to web development, video,\nand music production.",
      viewProjects: "VIEW PROJECTS",
      aboutMe: "ABOUT ME",
      scroll: "SCROLL"
    },
    skills: {
      title: "SKILLS & EXPERTISE.",
      description: "A cross-disciplinary tech stack and\npractical prototyping capabilities.",
      viewAll: "VIEW ALL SKILLS",
      coding: "CODING",
      hardware: "HARDWARE & 3D",
      video: "VIDEO",
      sound: "MUSIC",
      design: "DESIGN"
    },
    projects: {
      title: "MY PROJECTS.",
      description: "A record of challenges across\nhardware, software, and space.",
      viewAll: "VIEW ALL PROJECTS",
      showMore: "Show more",
      bedrockDesc1: "BUILD A FLOURISHING",
      bedrockDesc2: "CIVILIZATION IN SPACE.",
      bedrockRole: "Hardware engineer",
      bedrockText: "An ambitious space startup with an average age of 19."
    },
    news: {
      title: "SOARA",
      allArticles: "ALL ARTICLES",
      soaraTitle: "The Japan Birdman Rally.",
      soaraDesc: "I'm in charge of developing the flight control system for a voluntary group aiming to be the first-ever high school team to compete in the Birdman Rally.",
      readMore: "READ MORE"
    },
    reboot: {
      guinness: "Guinness World Record",
      band: "Keyboard Design",
      readMore: "READ MORE"
    },
    cta: {
      title: "INITIATE CONTACT.",
      description: "Always open to entrepreneurship, joint development,\nand launching new projects. Looking forward to contacts\nfor creating systems from scratch together,\nrather than just consuming.",
      getInTouch: "GET IN TOUCH",
      followX: "FOLLOW ON X"
    },
    footer: {
      desc: "Akito Hattori is a system-level creator bridging technology, design, and society to build from scratch.",
      company: "Company",
      capabilities: "Capabilities",
      hardware: "Hardware Prototyping",
      web: "Web Development",
      design: "3D CAD & Fabrication",
      visual: "Visual & Motion Design"
    }
  },
  jp: {
    nav: {
      about: "ABOUT ME",
      works: "WORKS",
      skills: "SKILLS",
      careers: "CAREERS",
      contact: "CONTACT"
    },
    hero: {
      description: "2008年生まれ。テクノロジー、デザイン、社会を掛け合わせ、\nゼロから仕組みを創り出す。\nハードウェアのプロトタイピングからWeb開発、\n映像・音楽制作まで、領域を横断して実装する\nシステムレベル・クリエイター。",
      viewProjects: "VIEW PROJECTS",
      aboutMe: "ABOUT ME",
      scroll: "SCROLL"
    },
    skills: {
      title: "SKILLS & EXPERTISE.",
      description: "分野を横断する技術スタックと、\n実践的なプロトタイピング能力。",
      viewAll: "VIEW ALL SKILLS",
      coding: "CODING",
      hardware: "HARDWARE & 3D",
      video: "VIDEO",
      sound: "MUSIC",
      design: "DESIGN"
    },
    projects: {
      title: "MY PROJECTS.",
      description: "ハードウェア、ソフトウェア、そして宇宙。\n領域を超えた挑戦の記録。",
      viewAll: "VIEW ALL PROJECTS",
      showMore: "Show more",
      bedrockDesc1: "BUILD A FLOURISHING",
      bedrockDesc2: "CIVILIZATION IN SPACE.",
      bedrockRole: "Hardware engineer",
      bedrockText: "平均年齢19歳。志の高い宇宙系スタートアップ企業"
    },
    news: {
      title: "SOARA",
      allArticles: "ALL ARTICLES",
      soaraTitle: "史上初の高校生チームとして鳥人間コンテストの出場を目指す有志団体で制御システムを開発",
      soaraDesc: "I'm in charge of developing the flight control system for a voluntary group aiming to be the first-ever high school team to compete in the Birdman Rally.",
      readMore: "READ MORE"
    },
    reboot: {
      guinness: "Guinness World Record",
      band: "Keyboard Design",
      readMore: "READ MORE"
    },
    cta: {
      title: "INITIATE CONTACT.",
      description: "起業、共同開発、新しいプロジェクトの立ち上げに\n常にオープンです。消費する側ではなく、\n共にゼロから仕組みを創り出すための\nコンタクトをお待ちしています。",
      getInTouch: "GET IN TOUCH",
      followX: "FOLLOW ON X"
    },
    footer: {
      desc: "テクノロジー、デザイン、社会を掛け合わせ、ゼロから仕組みを創り出す。システムレベル・クリエイター。",
      company: "Company",
      capabilities: "Capabilities",
      hardware: "Hardware Prototyping",
      web: "Web Development",
      design: "3D CAD & Fabrication",
      visual: "Visual & Motion Design"
    }
  }
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const currentScale = useRef(1);
  const targetScale = useRef(1);
  const [isActive, setIsActive] = useState(false);
  const speed = 0.15;

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const xSet = gsap.quickSetter(cursor, "x", "px");
    const ySet = gsap.quickSetter(cursor, "y", "px");
    const scaleXSet = gsap.quickSetter(cursor, "scaleX");
    const scaleYSet = gsap.quickSetter(cursor, "scaleY");
    const rotationSet = gsap.quickSetter(cursor, "rotation", "deg");

    // Initial state
    gsap.set(cursor, { 
      x: pos.current.x - 10, 
      y: pos.current.y - 10,
      scale: 1,
      opacity: 0 
    });

    const activateCursor = (e: MouseEvent) => {
      if (!isActive) {
        setIsActive(true);
        gsap.to(cursor, { opacity: 1, duration: 0.3 });
      }
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleResize = () => {
      if (!isActive) {
        pos.current.x = window.innerWidth / 2;
        pos.current.y = window.innerHeight / 2;
        mouse.current.x = window.innerWidth / 2;
        mouse.current.y = window.innerHeight / 2;
        gsap.set(cursor, { x: pos.current.x - 10, y: pos.current.y - 10 });
      }
    };

    window.addEventListener("mousemove", activateCursor);
    window.addEventListener("mousedown", activateCursor);
    window.addEventListener("mouseenter", activateCursor);
    window.addEventListener("resize", handleResize);

    let lastX = mouse.current.x;
    let lastY = mouse.current.y;

    const updateCursor = () => {
      const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());
      
      pos.current.x += (mouse.current.x - pos.current.x) * dt;
      pos.current.y += (mouse.current.y - pos.current.y) * dt;

      xSet(pos.current.x - 10);
      ySet(pos.current.y - 10);

      const dx = mouse.current.x - lastX;
      const dy = mouse.current.y - lastY;
      const velocity = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const stretch = Math.min(velocity * 0.05, 1);
      
      // Smoothly interpolate scale
      currentScale.current += (targetScale.current - currentScale.current) * dt;

      scaleXSet(currentScale.current * (1 + stretch));
      scaleYSet(currentScale.current * (1 - stretch * 0.5));
      rotationSet(angle);

      lastX = mouse.current.x;
      lastY = mouse.current.y;
    };

    gsap.ticker.add(updateCursor);

    const initMagnetic = () => {
      const magneticElements = document.querySelectorAll("a, .magnetic, button, .cursor-pointer");
      magneticElements.forEach((el) => {
        const element = el as HTMLElement;
        if (element.dataset.magneticInit) return;
        element.dataset.magneticInit = "true";
        
        const onMouseMove = (e: MouseEvent) => {
          if (window.innerWidth < 768) return;
          const rect = element.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const dx = e.clientX - centerX;
          const dy = e.clientY - centerY;

          gsap.to(element, {
            x: dx * 0.35,
            y: dy * 0.35,
            duration: 0.6,
            ease: "power3.out",
          });
        };

        const onMouseEnter = () => {
          targetScale.current = 2;
        };

        const onMouseLeave = () => {
          gsap.to(element, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.3)",
          });
          targetScale.current = 1;
        };

        element.addEventListener("mousemove", onMouseMove);
        element.addEventListener("mouseenter", onMouseEnter);
        element.addEventListener("mouseleave", onMouseLeave);
      });
    };

    initMagnetic();
    const interval = setInterval(initMagnetic, 500);

    return () => {
      window.removeEventListener("mousemove", activateCursor);
      window.removeEventListener("mousedown", activateCursor);
      window.removeEventListener("mouseenter", activateCursor);
      window.removeEventListener("resize", handleResize);
      gsap.ticker.remove(updateCursor);
      clearInterval(interval);
    };
  }, [isActive]);

  return (
    <div 
      id="custom-cursor" 
      ref={cursorRef} 
      className="fixed top-0 left-0 w-5 h-5 bg-white rounded-full pointer-events-none mix-blend-difference z-[2147483647] hidden md:block" 
      style={{ opacity: 0 }}
    />
  );
};

const Navbar = ({ lang, setLang }: { lang: 'en' | 'jp', setLang: (l: 'en' | 'jp') => void }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const t = translations[lang].nav;

  const navLinks = [
    { name: t.about, href: "#" },
    { name: t.works, href: "#" },
    { name: t.skills, href: "#" },
    { name: t.careers, href: "#" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass-nav py-4" : "bg-transparent py-6"}`}>
      <div className="full-width-container flex items-center justify-between">
        <div className="flex items-center gap-8">
          <a href="#" className="text-2xl font-bold tracking-tighter font-display magnetic">
            AKITO
          </a>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium tracking-wide text-white/70">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="hover:text-white transition-colors nav-link-hover magnetic">
                {link.name}
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setLang(lang === 'en' ? 'jp' : 'en')}
            className="text-[10px] md:text-xs font-bold tracking-widest border border-white/20 px-2 py-1 md:px-3 md:py-1 hover:bg-white/10 transition-colors magnetic"
          >
            {lang === 'en' ? 'JP' : 'EN'}
          </button>
          <button className="flex items-center gap-1 md:gap-2 text-[10px] md:text-sm font-bold bg-white text-black px-3 py-1.5 md:px-5 md:py-2 hover:bg-white/90 transition-colors magnetic whitespace-nowrap">
            {t.contact} <ArrowRight size={12} className="md:w-4 md:h-4" />
          </button>
          <button 
            className="md:hidden text-white ml-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 bg-black border-b border-white/10 p-6 flex flex-col gap-6 md:hidden"
        >
          {navLinks.map((link) => (
            <a key={link.name} href={link.href} className="text-xl font-display">{link.name}</a>
          ))}
          <button className="w-full bg-white text-black py-4 font-bold">{t.contact}</button>
        </motion.div>
      )}
    </nav>
  );
};

const Hero = ({ lang, show }: { lang: 'en' | 'jp', show: boolean }) => {
  const t = translations[lang].hero;

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden flex items-start pt-28 md:pt-48">
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ opacity: 0 }}
          animate={show ? { opacity: 0.4 } : {}}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ opacity: 0 }}
          src="https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=2000" 
          alt="Background" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-bg-dark" />
      </div>

      <div className="relative z-10 full-width-container w-full flex flex-col md:flex-row items-start justify-between gap-8 md:gap-12 pb-20 md:pb-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: [0.215, 0.61, 0.355, 1] }}
          style={{ opacity: 0 }}
          className="flex-1 text-left relative z-10"
        >
          <div className="relative w-full">
            {/* Mobile Hero Layout */}
            <div className="md:hidden w-full">
              <div className="flex items-end w-full mb-4">
                <span className="text-6xl font-bold font-display leading-none tracking-tighter uppercase">AKITO</span>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={show ? { opacity: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.3, ease: [0.215, 0.61, 0.355, 1] }}
                  style={{ opacity: 0 }}
                  className="flex-1 ml-4 aspect-square rounded-sm overflow-hidden border border-white/10 transition-all duration-1000"
                >
                  <img 
                    src="https://github.com/manmamixia01/Web-public/blob/main/IMG_9622%20(%E4%B8%AD).JPG?raw=true" 
                    alt="Akito Hattori" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </div>
              <h1 className="text-6xl font-bold font-display leading-[0.8] tracking-tighter mb-6 uppercase">
                HATTORI <br />
                <span className="text-white/20 text-lg block mt-4 font-sans tracking-widest">服部明人</span>
              </h1>
            </div>

            {/* Desktop Hero Layout */}
            <h1 className="hidden md:block text-[12rem] font-bold font-display leading-[0.8] tracking-tighter mb-8 max-w-4xl uppercase">
              AKITO <br />
              HATTORI <br />
              <span className="text-white/20 text-2xl block mt-6 font-sans tracking-widest">服部明人</span>
            </h1>
          </div>

          <div className="text-sm md:text-xl text-white/60 max-w-xl mb-8 md:mb-10 leading-relaxed text-left min-h-[3em]">
            <LineFadeInText text={t.description} />
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-start gap-3 md:gap-4"
          >
            <button className="bg-white text-black px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold flex items-center gap-2 hover:bg-white/90 transition-colors magnetic">
              {t.viewProjects} <ChevronRight size={18} />
            </button>
            <button className="border border-white/20 hover:bg-white/10 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base font-bold transition-colors magnetic">
              {t.aboutMe}
            </button>
          </motion.div>
        </motion.div>

        {/* Desktop Portrait */}
        <motion.div 
          initial={{ opacity: 0, scale: 1.05 }}
          animate={show ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1.5, delay: 0.2, ease: [0.215, 0.61, 0.355, 1] }}
          style={{ opacity: 0 }}
          className="relative hidden md:block w-[450px] aspect-[3/4] overflow-hidden rounded-sm transition-all duration-700 border border-white/10 self-start md:self-auto"
        >
          <img 
            src="https://github.com/manmamixia01/Web-public/blob/main/IMG_9622%20(%E4%B8%AD).JPG?raw=true" 
            alt="Akito Hattori" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 1, delay: 1.5 }}
        style={{ opacity: 0 }}
        className="absolute bottom-4 left-0 right-0 z-10 flex flex-col items-center gap-1 md:bottom-10"
      >
        <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] text-white/40 uppercase">{t.scroll}</p>
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={20} className="text-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
};

const ProductCard = ({ title, category, image, size = "small" }: { title: string, category: string, image: string, size?: "small" | "large" | "wide" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{ opacity: 0 }}
      className={`bento-card group ${size === "large" ? "md:col-span-2 md:row-span-2" : size === "wide" ? "md:col-span-2" : ""}`}
    >
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        referrerPolicy="no-referrer"
      />
      <div className="gradient-overlay" />
      <div className="absolute bottom-0 left-0 p-8 w-full">
        <p className="text-xs font-bold tracking-widest text-white/50 mb-2 uppercase">{category}</p>
        <h3 className="text-2xl md:text-3xl font-bold font-display mb-4 group-hover:translate-x-2 transition-transform duration-300 flex items-center gap-2">
          {title} <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 transition-opacity" />
        </h3>
        <div className="h-[1px] w-0 group-hover:w-full bg-white/30 transition-all duration-500" />
      </div>
    </motion.div>
  );
};

const GridSection = ({ lang }: { lang: 'en' | 'jp' }) => {
  const t = translations[lang].skills;
  return (
    <section className="py-24 full-width-container">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tighter mb-6 uppercase">
            {t.title}
          </h2>
          <div className="text-white/60 text-lg min-h-[2em]">
            <LineFadeInText text={t.description} />
          </div>
        </div>
        <a href="#" className="flex items-center gap-2 font-bold text-sm tracking-widest hover:text-white/70 transition-colors magnetic">
          {t.viewAll} <ArrowRight size={16} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
        <ProductCard 
          title={t.coding} 
          category="HTML/CSS/JS, Node.js, Express" 
          image="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000" 
          size="large"
        />
        <ProductCard 
          title={t.hardware} 
          category="3D Printing, Laser Cutting, Fusion360" 
          image="https://github.com/manmamixia01/Web-public/blob/main/3Dprinter.jpg?raw=true" 
        />
        <ProductCard 
          title={t.video} 
          category="Premiere Pro, After Effects, Blender" 
          image="https://github.com/manmamixia01/Web-public/blob/main/video.jpg?raw=true" 
        />
        <ProductCard 
          title={t.sound} 
          category="DTM, Piano, Violin, Band Ensemble" 
          image="https://github.com/manmamixia01/Web-public/blob/main/IMG_9569%20-%20%E3%82%B3%E3%83%94%E3%83%BC%20(%E5%B0%8F).JPG?raw=true" 
        />
        <ProductCard 
          title={t.design} 
          category="UI/UX" 
          image="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000" 
          size="wide"
        />
      </div>
    </section>
  );
};

const Arsenal1Section = ({ lang }: { lang: 'en' | 'jp' }) => {
  const t = translations[lang].projects;
  return (
    <section className="py-24 full-width-container bg-[#111] border-t border-white/10">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold font-display tracking-tighter mb-6 uppercase">
            {t.title}
          </h2>
          <div className="text-white/60 text-lg min-h-[2em]">
            <LineFadeInText text={t.description} />
          </div>
        </div>
        <a href="#" className="flex items-center gap-2 font-bold text-sm tracking-widest hover:text-white/70 transition-colors magnetic">
          {t.viewAll} <ArrowRight size={16} />
        </a>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-4xl font-bold font-display tracking-tighter uppercase">BEDROCK SPACE</h2>
        <a href="#" className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/50 hover:text-white transition-colors magnetic">
          {t.showMore} <ArrowUpRight size={14} />
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 aspect-auto md:aspect-[21/9] w-full mb-12">
        <div className="relative overflow-hidden rounded-sm group h-[300px] md:h-full">
          <img 
            src="https://github.com/manmamixia01/Web-public/blob/main/A1_04043_1%20(%E4%B8%AD).jpg?raw=true" 
            alt="Project 1" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative overflow-hidden rounded-sm group h-[300px] md:h-full">
          <img 
            src="https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000" 
            alt="Project 2" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
        <div className="relative overflow-hidden rounded-sm group h-[300px] md:h-full">
          <img 
            src="https://github.com/manmamixia01/Web-public/blob/main/hygine.jpg?raw=true" 
            alt="Project 3" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase mb-2">{t.bedrockDesc1}</p>
          <p className="text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">{t.bedrockDesc2}</p>
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-white/50 mb-2 uppercase">{t.bedrockRole}</p>
          <p className="text-xl text-white/80 leading-relaxed">
            {t.bedrockText}
          </p>
        </div>
      </div>
    </section>
  );
};

const NewsSection = ({ lang }: { lang: 'en' | 'jp' }) => {
  const t = translations[lang].news;
  return (
    <section className="py-24 full-width-container bg-[#0a0a0a] border-t border-white/10">
      <div className="flex justify-between items-center mb-16">
        <h2 className="text-4xl font-bold font-display tracking-tighter uppercase">{t.title}</h2>
        <a href="#" className="flex items-center gap-2 text-xs font-bold tracking-widest text-white/50 hover:text-white transition-colors magnetic">
          {t.allArticles} <ArrowUpRight size={14} />
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold tracking-widest text-white/30 mb-4">7/26/2026</p>
          <h3 className="text-3xl md:text-4xl font-bold font-display leading-tight mb-6 hover:text-white/80 transition-colors">
            {t.soaraTitle}
          </h3>
          <div className="text-white/50 mb-8 max-w-md">
            <LineFadeInText text={t.soaraDesc} />
          </div>
          {t.readMore && (
            <div className="flex">
              <a href="#" className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-white/70 hover:text-white transition-colors magnetic py-2 pr-4">
                {t.readMore} <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </div>
        <div className="aspect-video overflow-hidden rounded-sm">
          <img 
            src="https://github.com/manmamixia01/Web-public/blob/main/birdman%20(%E4%B8%AD).jpg?raw=true" 
            alt="YFQ-44A" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </section>
  );
};

const RebootingRebuildSection = ({ lang }: { lang: 'en' | 'jp' }) => {
  const t = translations[lang].reboot;
  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {/* Rebooting The Arsenal */}
      <div className="relative aspect-square md:aspect-auto md:h-[800px] overflow-hidden group border-r border-white/10">
        <img 
          src="https://github.com/manmamixia01/Web-public/blob/main/guiness2019.jpg?raw=true" 
          alt="Rebooting The Arsenal" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <div className="absolute top-0 left-0 p-12 w-full flex justify-between items-start">
          <h2 className="text-4xl font-bold font-display tracking-tighter uppercase">{t.guinness}</h2>
          <a href="#" className="flex items-center gap-2 text-xs font-bold tracking-widest text-white hover:text-white/70 transition-colors magnetic">
            {t.readMore} <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="absolute bottom-12 right-12">
          <p className="text-6xl md:text-8xl font-bold font-display tracking-tighter text-white/90">
            LG — 2019
          </p>
        </div>
      </div>

      {/* Rebuild The Arsenal */}
      <div className="relative aspect-square md:aspect-auto md:h-[800px] overflow-hidden group">
        <img 
          src="https://github.com/manmamixia01/Web-public/blob/main/keybord.jpg?raw=true" 
          alt="Rebuild The Arsenal" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
        <div className="absolute top-0 left-0 p-12 w-full flex justify-between items-start">
          <h2 className="text-4xl font-bold font-display tracking-tighter uppercase">{t.band}</h2>
          <a href="#" className="flex items-center gap-2 text-xs font-bold tracking-widest text-white hover:text-white/70 transition-colors magnetic">
            {t.readMore} <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="absolute bottom-12 right-12">
          <p className="text-6xl md:text-8xl font-bold font-display tracking-tighter text-white/90">
            Ac — 2025
          </p>
        </div>
      </div>
    </section>
  );
};

const Footer = ({ lang }: { lang: 'en' | 'jp' }) => {
  const t = translations[lang].footer;
  return (
    <footer className="bg-bg-dark border-t border-white/10 py-12 md:py-20 px-6 min-h-screen md:min-h-0 flex flex-col justify-center">
      <div className="full-width-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-12 md:mb-20">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold font-display tracking-tighter mb-4 md:mb-6 uppercase">AKITO</h2>
            <p className="text-white/40 max-w-sm mb-6 md:mb-8 text-sm md:text-base">
              {t.desc}
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
                <Globe size={18} className="relative z-10" />
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
                <Twitter size={18} className="relative z-10" />
              </a>
              <a href="#" className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 group relative overflow-hidden">
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-expo" />
                <Search size={18} className="relative z-10" />
              </a>
            </div>
          </div>
          
          {/* Side-by-side on mobile */}
          <div className="grid grid-cols-2 md:grid-cols-1 col-span-1 md:col-span-2 gap-8 md:gap-12">
            <div>
              <h4 className="font-bold mb-4 md:mb-6 text-[10px] md:text-sm tracking-widest uppercase">{t.company}</h4>
              <ul className="space-y-2 md:space-y-4 text-white/50 text-xs md:text-sm">
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">About Me</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">Skills</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 md:mb-6 text-[10px] md:text-sm tracking-widest uppercase">{t.capabilities}</h4>
              <ul className="space-y-2 md:space-y-4 text-white/50 text-xs md:text-sm">
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">{t.hardware}</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">{t.web}</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">{t.design}</a></li>
                <li><a href="#" className="hover:text-white transition-colors nav-link-hover magnetic">{t.visual}</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 md:pt-12 border-t border-white/5 text-[8px] md:text-xs font-bold tracking-widest text-white/20">
          <p>© 2026 AkitoHattori. PORTFOLIO WEBSITE.</p>
          <div className="flex gap-4 md:gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors magnetic uppercase">Privacy</a>
            <a href="#" className="hover:text-white transition-colors magnetic uppercase">Terms</a>
            <a href="#" className="hover:text-white transition-colors magnetic uppercase">Supply</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'jp'>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isLoading]);

  return (
    <div className="min-h-screen">
      <AnimatePresence>
        {isLoading && (
          <LoadingScreen 
            onComplete={() => {
              setIsLoading(false);
              setTimeout(() => setShowContent(true), 100);
            }} 
          />
        )}
      </AnimatePresence>
      
      <CustomCursor />
      <Navbar lang={lang} setLang={setLang} />
      <main>
        <Hero lang={lang} show={showContent} />
        <GridSection lang={lang} />
        <Arsenal1Section lang={lang} />
        <NewsSection lang={lang} />
        <RebootingRebuildSection lang={lang} />
        
        {/* CTA Section */}
        <section className="py-32 px-6 text-center border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-7xl font-bold font-display tracking-tighter mb-8 uppercase">
              {translations[lang].cta.title}
            </h2>
            <div className="text-xl text-white/50 mb-12 max-w-2xl mx-auto min-h-[3em]">
              <LineFadeInText text={translations[lang].cta.description} />
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="bg-white text-black px-10 py-5 font-bold text-lg hover:bg-white/90 transition-colors magnetic">
                {translations[lang].cta.getInTouch}
              </button>
              <button className="border border-white/20 px-10 py-5 font-bold text-lg hover:bg-white/10 transition-colors magnetic">
                {translations[lang].cta.followX}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
