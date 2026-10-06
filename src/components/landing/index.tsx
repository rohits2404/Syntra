import Link from "next/link";
import { ThemeToggle } from "../theme-toggle";

const CODE_LINES = [
    { cls: "code-comment", text: "// AI Codebase Auditor" },
    { cls: "code-key", text: 'project.connect("github.com/you/app")' },
    { cls: "", text: "" },
    { cls: "code-ok", text: "→ reading files.............. done" },
    { cls: "code-ok", text: "→ detecting framework........ Next.js" },
    { cls: "code-ok", text: "→ creating code knowledge.... 148 chunks" },
    { cls: "code-ok", text: "→ running analysis........... ok" },
    { cls: "code-ok", text: "→ generating report.......... ready" },
    { cls: "", text: "" },
    { cls: "code-key", text: "health.score = 82" },
    { cls: "code-key", text: "issues.critical = 1" },
    { cls: "code-key", text: 'ask("Explain the auth flow")' },
    { cls: "", text: "" },
];

const FLOW = [
    {
        step: "01",
        title: "Connect A Repository",
        text: "Link GitHub Or Upload A ZIP. We Filter Noise And Keep The Source That Matters.",
    },
    {
        step: "02",
        title: "Build Code Knowledge",
        text: "Tree-Sitter Chunks Your JS/TS, Embeddings Land In A Vector Store, Ready For Retrieval.",
    },
    {
        step: "03",
        title: "Ask, Review, Improve",
        text: "Chat With Citations, Scan A Health Report, And Walk A Priority Roadmap Of Issues.",
    },
];

const OUTCOMES = [
    {
        title: "Health Report",
        text: "Architecture, Security, Performance, Quality, And Testing — Scored Clearly.",
    },
    {
        title: "Grounded Chat",
        text: "Answers Cite Real Files And Line Ranges From Your Project, Not Generic Advice.",
    },
    {
        title: "Issues & Roadmap",
        text: "Filter Findings By Severity And Category, Then Tackle What Matters First.",
    },
];

const NAV_LINKS = [
    { href: "#why", label: "Why" },
    { href: "#how", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#demo", label: "Demo" },
];

function CodePlane() {
    const lines = [...CODE_LINES, ...CODE_LINES, ...CODE_LINES];
    return (
        <div
            className="landing-code-plane landing-reveal landing-reveal-delay-2"
            aria-hidden
        >
            <div className="landing-code-fade" />
            <pre>
                {lines.map((line, index) => (
                    <span
                        key={`${line.text}-${index}`}
                        className={line.cls || undefined}
                    >
                        {line.text}
                        {"\n"}
                    </span>
                ))}
            </pre>
        </div>
    );
}

export function LandingPage() {
    return (
        <div className="landing-shell">
            <section id="top" className="landing-hero">
                <div className="landing-hero-glow" aria-hidden />

                <div className="relative z-40 mx-auto w-full max-w-6xl px-6 pt-6 sm:px-10">
                    <header className="landing-header landing-reveal flex items-center justify-between gap-3 rounded-2xl px-4 py-3 sm:gap-4 sm:px-5">
                        <a
                            href="#top"
                            className="landing-brand shrink-0 text-sm text-(--landing-ink)"
                        >
                            Syntra - AI Codebase Auditor
                        </a>
                        <nav
                            aria-label="Landing sections"
                            className="hidden items-center gap-1 md:flex lg:gap-2"
                        >
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.href}
                                    href={link.href}
                                    className="landing-nav-link"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>
                        <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
                            <ThemeToggle className="border-(--landing-line) bg-transparent hover:bg-(--landing-fog)" />
                            <Link
                                href="/login"
                                className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                            >
                                Sign In
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-(--landing-ink) px-3.5 py-2 font-medium text-(--landing-paper) transition-opacity hover:opacity-90"
                            >
                                Get Started
                            </Link>
                        </div>
                    </header>
                </div>

                <div className="relative z-10 mx-auto grid min-h-[calc(100svh-5.5rem)] w-full max-w-6xl items-center gap-10 px-6 pb-16 pt-10 sm:px-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12 lg:gap-14">
                    <div className="py-6 sm:py-10">
                        <h1 className="landing-reveal landing-reveal-delay-1 landing-title text-5xl text-(--landing-ink) sm:text-6xl lg:text-[4.75rem]">
                            Syntra - AI Codebase
                            <span className="block">Auditor</span>
                        </h1>
                        <p className="landing-reveal landing-reveal-delay-2 mt-6 text-2xl font-semibold tracking-tight text-(--landing-ink) sm:text-3xl">
                            An AI Senior Developer For Your Repository.
                        </p>
                        <p className="landing-reveal landing-reveal-delay-3 mt-5 max-w-md text-base leading-relaxed text-(--landing-muted) sm:text-lg">
                            Connect A Project, Get A Health Report, And Ask
                            Precise Questions Grounded In Your Real Code.
                        </p>
                        <div className="landing-reveal landing-reveal-delay-4 mt-10 flex flex-wrap items-center gap-3">
                            <Link
                                href="/login"
                                className="landing-btn-primary rounded-xl px-5 py-3.5 text-sm font-semibold"
                            >
                                Analyze My Repository
                            </Link>
                            <a
                                href="#demo"
                                className="landing-btn-secondary rounded-xl px-5 py-3.5 text-sm font-semibold"
                            >
                                View Demo
                            </a>
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <CodePlane />
                    </div>
                </div>
            </section>

            <section
                id="why"
                className="landing-band scroll-mt-28 px-6 py-24 sm:px-10"
            >
                <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                    <div>
                        <p className="landing-kicker">Why it exists</p>
                        <h2 className="landing-title mt-5 text-3xl sm:text-5xl">
                            Stop Guessing Through Unfamiliar Code.
                        </h2>
                    </div>
                    <p className="max-w-md text-base leading-relaxed text-(--landing-muted) sm:text-lg">
                        Static Linters Catch Patterns. This Product Builds A
                        Searchable Understanding Of Your Codebase — Then Reasons
                        Over It Like A Senior Engineer Sitting Beside You.
                    </p>
                </div>
            </section>

            <section id="how" className="scroll-mt-28 px-6 py-24 sm:px-10">
                <div className="mx-auto max-w-6xl">
                    <h2 className="landing-title text-3xl sm:text-5xl">
                        From Repository To Insight
                    </h2>
                    <p className="mt-5 max-w-xl text-base text-(--landing-muted) sm:text-lg">
                        One Clear Path. No Dashboard Clutter In The First Five
                        Minutes.
                    </p>
                    <ol className="mt-14 space-y-0 border-t border-(--landing-line)">
                        {FLOW.map((item) => (
                            <li
                                key={item.step}
                                className="grid gap-4 border-b border-(--landing-line) py-10 sm:grid-cols-[96px_1fr]"
                            >
                                <span className="font-mono text-sm font-medium text-(--landing-accent)">
                                    {item.step}
                                </span>
                                <div>
                                    <h3 className="landing-title text-2xl">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 max-w-2xl text-base leading-relaxed text-(--landing-muted)">
                                        {item.text}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section
                id="features"
                className="landing-band scroll-mt-28 px-6 py-24 sm:px-10"
            >
                <div className="mx-auto max-w-6xl">
                    <h2 className="landing-title text-3xl sm:text-5xl">
                        Built For Real Review Sessions
                    </h2>
                    <p className="mt-5 max-w-xl text-base text-(--landing-muted) sm:text-lg">
                        Everything A Course Viewer Expects To Demo — And A
                        Developer Wants To Keep Using.
                    </p>
                    <div className="mt-14 grid gap-x-10 gap-y-12 border-t border-(--landing-line) pt-12 md:grid-cols-3">
                        {OUTCOMES.map((item) => (
                            <div key={item.title}>
                                <h3 className="landing-title text-xl">
                                    {item.title}
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-(--landing-muted) sm:text-base">
                                    {item.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="demo" className="scroll-mt-28 px-6 py-24 sm:px-10">
                <div className="mx-auto max-w-6xl">
                    <h2 className="landing-title text-3xl sm:text-5xl">
                        A Product You Can Show On Camera
                    </h2>
                    <p className="mt-5 max-w-xl text-base text-(--landing-muted) sm:text-lg">
                        Progress, Report, Chat, And Explorer — The Full Loop
                        Looks Polished In A YouTube Walkthrough.
                    </p>

                    <div className="landing-demo mt-12 overflow-hidden rounded-3xl p-6 text-white sm:p-10">
                        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                            <div>
                                <p className="font-mono text-xs tracking-[0.18em] text-(--landing-glow) uppercase">
                                    Project / Payment-API
                                </p>
                                <p className="landing-score landing-title mt-5 text-6xl sm:text-7xl">
                                    82
                                    <span className="text-2xl text-white/45">
                                        {" "}
                                        / 100
                                    </span>
                                </p>
                                <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/70">
                                    Health Score With Architecture, Security,
                                    Performance, Quality, And Testing.
                                </p>
                            </div>
                            <div className="space-y-3 font-mono text-xs sm:text-sm">
                                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                                    <p className="text-(--landing-glow)">You</p>
                                    <p className="mt-2 text-white/90">
                                        Explain The Authentication Flow.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4">
                                    <p className="text-(--landing-glow)">
                                        AI Engineer
                                    </p>
                                    <p className="mt-2 leading-relaxed text-white/85">
                                        Auth Starts In{" "}
                                        <span className="text-(--landing-glow)">
                                            src/lib/auth.ts
                                        </span>
                                        . Sessions Are Issued After Credential
                                        Checks, Then The Proxy Guards Dashboard
                                        Routes.
                                    </p>
                                    <p className="mt-3 text-white/40">
                                        Sources: src/lib/auth.ts · src/proxy.ts
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="landing-cta px-6 py-24 sm:px-10">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl">
                        <h2 className="landing-title text-3xl text-white sm:text-5xl">
                            Build It. Demo It. Ship The Understanding.
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
                            Free To Try With Daily Analysis Limits. Upgrade To
                            Premium In Settings When You Need More Runs,
                            Projects, And Chat Capacity.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/register"
                            className="landing-btn-primary rounded-xl px-5 py-3.5 text-sm font-semibold"
                        >
                            Create Account
                        </Link>
                        <Link
                            href="/login"
                            className="rounded-xl border border-white/20 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white"
                        >
                            Analyze My Repository
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-(--landing-line) px-6 py-14 sm:px-10">
                <div className="mx-auto max-w-6xl">
                    <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
                        {/* Brand */}
                        <div>
                            <Link
                                href="#top"
                                className="landing-brand text-base text-(--landing-ink)"
                            >
                                Syntra
                            </Link>

                            <p className="mt-4 max-w-xs text-sm leading-relaxed text-(--landing-muted)">
                                AI-Powered Codebase Analysis That Helps
                                Developers Understand, Review, And Improve Their
                                Projects Faster.
                            </p>

                            <Link
                                href="/register"
                                className="mt-6 inline-flex rounded-xl bg-(--landing-ink) px-4 py-2.5 text-sm font-semibold text-(--landing-paper) transition-opacity hover:opacity-90"
                            >
                                Get Started
                            </Link>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="text-sm font-semibold text-(--landing-ink)">
                                Product
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm">
                                <li>
                                    <a
                                        href="#features"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#how"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        How It Works
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#demo"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Demo
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/register"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Get Started
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h3 className="text-sm font-semibold text-(--landing-ink)">
                                Resources
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm">
                                <li>
                                    <a
                                        href="#why"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Why Syntra
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        href="/login"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Sign In
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href="mailto:support@syntra.dev"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-sm font-semibold text-(--landing-ink)">
                                Company
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm">
                                <li>
                                    <a
                                        href="#top"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/privacy"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Privacy
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/terms"
                                        className="text-(--landing-muted) transition-colors hover:text-(--landing-ink)"
                                    >
                                        Terms
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-12 flex flex-col gap-4 border-t border-(--landing-line) pt-6 text-xs text-(--landing-muted) sm:flex-row sm:items-center sm:justify-between">
                        <p>
                            © {new Date().getFullYear()} Syntra. All Rights
                            Reserved.
                        </p>

                        <div className="flex items-center gap-4">
                            <span>Built For Developers</span>
                            <span className="text-(--landing-line)">•</span>
                            <span>AI Codebase Intelligence</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
