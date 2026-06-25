import { useEffect, useMemo, useRef, useState } from "react";
import { useApp, type Project, type Room, resolvePrice } from "@/lib/spark/store";
import {
  CATALOG,
  ROOM_TEMPLATES,
  type RoomType,
} from "@/lib/spark/catalog";
import { rollupProject, computeDeal, fmtMoney, fmtMoney2 } from "@/lib/spark/calc";
import { exportProjectZip, compressImage } from "@/lib/spark/export";
import { ocrSerial, type OcrCandidate } from "@/lib/spark/ocr";
import sparkLogo from "@/assets/spark-logo.png";
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Camera,
  Trash2,
  Pencil,
  Settings as SettingsIcon,
  Download,
  Check,
  X,
  Home as HomeIcon,
  Wallet,
  FileSpreadsheet,
  Images,
  ClipboardList,
  FolderPlus,
  ChevronRight,
  GripVertical,
  RefreshCw,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  Zap,
  PartyPopper,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function useBounce(trigger: number) {
  const [on, setOn] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setOn(true);
    const t = setTimeout(() => setOn(false), 450);
    return () => clearTimeout(t);
  }, [trigger]);
  return on;
}

/* ----------------------------- Welcome ----------------------------- */
function WelcomeFlow() {
  const [step, setStep] = useState<"intro" | "address">("intro");
  const [addr, setAddr] = useState("");
  const createProject = useApp((s) => s.createProject);
  const setOnboarded = useApp((s) => s.setOnboarded);
  const finish = () => {
    const name = addr.trim() || "First Walkthrough";
    const id = createProject(name);
    if (addr.trim()) {
      useApp.setState((s) => {
        const p = s.projects[id];
        if (!p) return s;
        return { projects: { ...s.projects, [id]: { ...p, address: addr.trim() } } };
      });
    }
    setOnboarded(true);
  };
  return (
    <div className="min-h-[100dvh] bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {step === "intro" ? (
          <div className="text-center animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-3xl shadow-lift grad-hero grid place-items-center mb-6 animate-glow-pulse">
              <img src={sparkLogo} alt="Spark" className="h-12 w-12" />
            </div>
            <div className="text-[11px] tracking-[0.28em] font-semibold text-muted-foreground">
              SPARK ESTIMATOR
            </div>
            <h1 className="grad-hero-number text-4xl font-black tracking-tight mt-2">
              Know the deal
              <br />before you leave.
            </h1>
            <p className="text-sm text-muted-foreground mt-3">
              Walk the property one-handed. Get a live repair total and your Maximum
              Allowable Offer in seconds.
            </p>
            <button
              onClick={() => setStep("address")}
              className="mt-8 w-full py-4 rounded-2xl grad-hero text-navy-foreground font-semibold deal-glow text-base"
            >
              Start your first walkthrough
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep("intro")}
              className="text-sm text-muted-foreground flex items-center gap-1 mb-4"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
            <h2 className="text-3xl font-black text-navy tracking-tight">What's the property address?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              You can change this later.
            </p>
            <input
              autoFocus
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              placeholder="123 Main St, Tulsa OK"
              className="mt-5 w-full px-4 py-3.5 rounded-xl border bg-card text-base"
              onKeyDown={(e) => { if (e.key === "Enter") finish(); }}
            />
            <button
              onClick={finish}
              className="mt-4 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
            >
              {addr.trim() ? "Start walkthrough" : "Skip for now"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function useCountUp(target: number, duration = 500) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    const from = fromRef.current;
    const to = target;
    if (from === to) return;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}

type Tab = "estimate" | "deal" | "export" | "photos" | "review";

export function SparkApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 850);
    return () => clearTimeout(t);
  }, []);
  if (!mounted) {
    return <SplashScreen />;
  }
  return <AppInner />;
}

function SplashScreen() {
  return (
    <div className="min-h-[100dvh] grad-navy flex flex-col items-center justify-center text-navy-foreground relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, oklch(0.55 0.22 264 / 0.5), transparent 60%), radial-gradient(ellipse at 80% 90%, oklch(0.78 0.16 70 / 0.35), transparent 55%)",
        }}
      />
      <div className="relative grid place-items-center">
        <div className="absolute h-32 w-32 rounded-3xl border border-white/30 animate-splash-ring" />
        <div
          className="absolute h-32 w-32 rounded-3xl border border-white/20 animate-splash-ring"
          style={{ animationDelay: "0.6s" }}
        />
        <img
          src={sparkLogo}
          alt="Spark Estimator"
          className="relative h-20 w-20 rounded-3xl shadow-float animate-splash-pulse"
        />
      </div>
      <div className="relative mt-8 text-[10px] tracking-[0.4em] font-bold opacity-80">
        SPARK ESTIMATOR
      </div>
      <div className="relative mt-2 text-xs opacity-60">Tulsa-market repair pricing</div>
      <div className="relative mt-6 h-1 w-32 overflow-hidden rounded-full bg-white/15">
        <div className="h-full w-1/3 bg-white/70 rounded-full animate-[spark-shimmer_1.2s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}

function AppInner() {
  const projects = useApp((s) => s.projects);
  const currentId = useApp((s) => s.currentId);
  const createProject = useApp((s) => s.createProject);
  const hasOnboarded = useApp((s) => s.hasOnboarded);
  const [tab, setTab] = useState<Tab>("estimate");

  // Ensure at least one project
  useEffect(() => {
    if (!hasOnboarded) return;
    if (!currentId || !projects[currentId]) {
      if (Object.keys(projects).length === 0) createProject("123 Main St");
      else useApp.getState().selectProject(Object.keys(projects)[0]);
    }
  }, [currentId, projects, createProject, hasOnboarded]);

  if (!hasOnboarded) return <WelcomeFlow />;

  const project = currentId ? projects[currentId] : null;
  if (!project) return null;

  return (
    <div className="min-h-[100dvh] bg-background pb-32 text-foreground">
      <TopBar project={project} onOpenTab={setTab} />
      <main className="px-5 pt-5 space-y-6">
        {tab === "estimate" && <EstimateTab project={project} onGoDeal={() => setTab("deal")} />}
        {tab === "deal" && <DealTab project={project} />}
        {tab === "export" && <ExportTab project={project} />}
        {tab === "photos" && <PhotosTab project={project} />}
        {tab === "review" && <ReviewTab project={project} />}
      </main>
      <BottomNav tab={tab} setTab={setTab} />
      <div className="pointer-events-none fixed bottom-1 left-0 right-0 z-10 text-center text-[10px] tracking-[0.18em] font-semibold text-muted-foreground/60 uppercase">
        Built for Spark Homes
      </div>
    </div>
  );
}

/* ----------------------------- Top bar ----------------------------- */
function TopBar({ project, onOpenTab }: { project: Project; onOpenTab: (t: Tab) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/60">
      <div className="flex items-center gap-3 px-5 py-3.5">
        <img src={sparkLogo} alt="Spark" className="h-10 w-10 rounded-2xl shadow-card" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] tracking-[0.28em] font-bold text-muted-foreground">
            SPARK ESTIMATOR
          </div>
          <div className="text-[15px] font-bold text-navy truncate tracking-tight">{project.name}</div>
        </div>
        <button
          aria-label="Projects & settings"
          onClick={() => setOpen(true)}
          className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary text-navy"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
        <button
          aria-label="Export"
          onClick={() => onOpenTab("export")}
          className="h-10 w-10 grid place-items-center rounded-xl hover:bg-secondary text-navy"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
      {open && <ProjectsSheet onClose={() => setOpen(false)} />}
    </header>
  );
}

/* ------------------------- Projects sheet ------------------------- */
function ProjectsSheet({ onClose }: { onClose: () => void }) {
  const projects = useApp((s) => s.projects);
  const currentId = useApp((s) => s.currentId);
  const { createProject, selectProject, deleteProject, renameProject } = useApp.getState();
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameVal, setRenameVal] = useState("");
  const list = Object.values(projects).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-navy tracking-tight">Walkthroughs</h2>
          <button onClick={onClose} className="text-muted-foreground p-1">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. 412 Oak Ave"
            className="flex-1 px-3 py-2 rounded-lg border bg-card text-sm"
          />
          <button
            onClick={() => {
              createProject(newName || "Untitled");
              setNewName("");
            }}
            className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium flex items-center gap-1"
          >
            <FolderPlus className="h-4 w-4" /> New
          </button>
        </div>
        <div className="space-y-2">
          {list.map((p) => (
            <div
              key={p.id}
              className={`rounded-xl border p-3 ${p.id === currentId ? "border-primary bg-primary/5" : "bg-card"}`}
            >
              {renaming === p.id ? (
                <div className="flex gap-2">
                  <input
                    value={renameVal}
                    onChange={(e) => setRenameVal(e.target.value)}
                    className="flex-1 px-2 py-1 rounded border text-sm"
                  />
                  <button
                    onClick={() => {
                      renameProject(p.id, renameVal || p.name);
                      setRenaming(null);
                    }}
                    className="px-2 py-1 rounded bg-primary text-primary-foreground text-xs"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      selectProject(p.id);
                      onClose();
                    }}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-sm text-navy truncate">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {p.address || "No address"} · {new Date(p.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setRenaming(p.id);
                      setRenameVal(p.name);
                    }}
                    className="p-2 text-muted-foreground"
                    aria-label="Rename"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {list.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete "${p.name}"? This cannot be undone.`)) deleteProject(p.id);
                      }}
                      className="p-2 text-danger"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Bottom nav --------------------------- */
function BottomNav({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const items: Array<{ id: Tab; label: string; icon: React.ReactNode }> = [
    { id: "estimate", label: "Estimate", icon: <HomeIcon className="h-5 w-5" /> },
    { id: "deal", label: "Deal", icon: <Wallet className="h-5 w-5" /> },
    { id: "export", label: "Export", icon: <FileSpreadsheet className="h-5 w-5" /> },
    { id: "photos", label: "Photos", icon: <Images className="h-5 w-5" /> },
    { id: "review", label: "Review", icon: <ClipboardList className="h-5 w-5" /> },
  ];
  return (
    <nav className="fixed inset-x-0 z-30 bottom-0 pointer-events-none pb-[max(env(safe-area-inset-bottom),12px)] px-4">
      <div className="pointer-events-auto mx-auto max-w-md rounded-[28px] bg-background/85 backdrop-blur-xl border border-border/70 shadow-float px-2 py-1.5">
        <div className="grid grid-cols-5">
          {items.map((it) => {
            const active = tab === it.id;
            return (
              <button
                key={it.id}
                onClick={() => setTab(it.id)}
                className={`flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-2xl transition-colors ${
                  active ? "text-primary-foreground" : "text-muted-foreground hover:text-navy"
                }`}
              >
                <div
                  className={`h-10 w-10 grid place-items-center rounded-2xl transition-all duration-300 ${
                    active
                      ? "grad-hero shadow-lift scale-105"
                      : "bg-transparent"
                  }`}
                >
                  {it.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold tracking-wide ${active ? "text-navy" : ""}`}
                >
                  {it.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/* --------------------------- Estimate tab --------------------------- */
function EstimateTab({ project, onGoDeal }: { project: Project; onGoDeal: () => void }) {
  const globals = useApp((s) => s.globalPrices);
  const { total, reviewed, totalGroups, lineItemCount, rollups } = useMemo(
    () => rollupProject(project, globals),
    [project, globals],
  );
  const deal = useMemo(() => computeDeal(total, project.deal), [total, project.deal]);
  const animatedTotal = useCountUp(total);
  const totalBounce = useBounce(total);
  const dealValue =
    project.deal.arv > 0
      ? project.deal.purchasePrice > 0
        ? deal.profit ?? 0
        : Math.max(0, deal.mao)
      : 0;
  const animatedDeal = useCountUp(dealValue);
  const [activeRoomId, setActiveRoomId] = useState<string>(project.rooms[0]?.id ?? "");
  useEffect(() => {
    if (!project.rooms.find((r) => r.id === activeRoomId))
      setActiveRoomId(project.rooms[0]?.id ?? "");
  }, [project.rooms, activeRoomId]);
  const activeRoom = project.rooms.find((r) => r.id === activeRoomId);
  const pct = totalGroups ? Math.round((reviewed / totalGroups) * 100) : 0;
  const [editAddr, setEditAddr] = useState(false);
  const [addAddr, setAddAddr] = useState(project.address);
  useEffect(() => setAddAddr(project.address), [project.address]);
  const [quickScan, setQuickScan] = useState(false);
  const [celebrated, setCelebrated] = useState(false);
  const complete = totalGroups > 0 && reviewed === totalGroups;
  useEffect(() => {
    if (complete) setCelebrated(true);
    else setCelebrated(false);
  }, [complete]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-2xl hero-surface shadow-lift border border-border/60 p-5 relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, var(--amber), transparent 70%)" }}
        />
        <div className="text-[10px] tracking-[0.22em] font-semibold text-muted-foreground">
          REPAIR ESTIMATE
        </div>
        <div
          className={`grad-hero-number text-6xl sm:text-7xl font-black tracking-tighter tabular-nums mt-1 leading-none drop-shadow-sm origin-left ${totalBounce ? "animate-spark-bounce" : ""}`}
        >
          {fmtMoney(animatedTotal)}
        </div>
        <div className="mt-2 flex items-center gap-2">
          {editAddr ? (
            <>
              <input
                autoFocus
                value={addAddr}
                onChange={(e) => setAddAddr(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    useApp.getState().setAddress(addAddr);
                    setEditAddr(false);
                  }
                  if (e.key === "Escape") {
                    setAddAddr(project.address);
                    setEditAddr(false);
                  }
                }}
                onBlur={() => {
                  useApp.getState().setAddress(addAddr);
                  setEditAddr(false);
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-primary/40 bg-background text-sm font-medium text-navy outline-none ring-2 ring-primary/20"
                placeholder="Property address"
              />
            </>
          ) : (
            <button
              onClick={() => setEditAddr(true)}
              className="group flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-navy transition-colors max-w-full"
              aria-label="Edit property address"
            >
              <span className="truncate">{project.address || "Add property address"}</span>
              <Pencil className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Groups reviewed</span>
            <span className="tabular-nums">
              {reviewed}/{totalGroups}
            </span>
          </div>
          <div className="relative h-5 rounded-full bg-secondary overflow-hidden ring-1 ring-border/60">
            <div
              className="h-full grad-hero rounded-full transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums text-foreground/90 mix-blend-luminosity">
              {pct}%
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard label="Progress" value={`${pct}%`} sub={`${reviewed}/${totalGroups} groups`} />
          <StatCard label="Line items" value={`${lineItemCount}`} sub="checked" />
        </div>

        {/* Deal chip */}
        <button
          onClick={onGoDeal}
          className="mt-4 w-full grad-hero text-navy-foreground rounded-2xl p-4 flex items-center justify-between text-left deal-glow relative overflow-hidden transition-transform active:scale-[0.99]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background:
                "radial-gradient(120% 80% at 100% 0%, var(--amber), transparent 55%)",
            }}
          />
          <div>
            <div className="text-[11px] tracking-[0.22em] font-semibold opacity-85">
              {project.deal.purchasePrice > 0 ? "PROJECTED PROFIT" : "MAX ALLOWABLE OFFER"}
            </div>
            <div className="text-3xl font-black tabular-nums tracking-tight mt-0.5">
              {project.deal.arv > 0 ? fmtMoney(animatedDeal) : "Set ARV"}
            </div>
          </div>
          <VerdictBadge verdict={deal.verdict} label={deal.verdictLabel} />
        </button>
      </section>

      {/* Room tabs */}
      <RoomTabs
        rooms={project.rooms}
        activeId={activeRoomId}
        onChange={setActiveRoomId}
        rollups={rollups}
        onQuickToggle={() => setQuickScan((v) => !v)}
      />

      {/* Quick Scan + completion banner */}
      <div className="flex items-center justify-between gap-3 -mt-1">
        <button
          onClick={() => setQuickScan((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all border ${
            quickScan
              ? "bg-[var(--amber)] text-white border-transparent shadow-card"
              : "bg-card text-navy border-border hover:border-primary/50"
          }`}
          aria-pressed={quickScan}
          title="Long-press or double-tap a room tab to toggle"
        >
          <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
          {quickScan ? "Quick Scan ON" : "Quick Scan"}
        </button>
        {quickScan && (
          <span className="text-[10px] text-muted-foreground">
            All groups expanded · checkbox + name only
          </span>
        )}
      </div>

      {complete && celebrated && (
        <CompletionBanner onExport={() => {}} />
      )}

      {/* Groups for active room */}
      {activeRoom && (
        <div key={activeRoom.id} className="animate-fade-in">
          <RoomGroups room={activeRoom} project={project} rollups={rollups} quickScan={quickScan} />
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-card">
      <div className="text-[10px] tracking-[0.18em] font-semibold text-muted-foreground">
        {label.toUpperCase()}
      </div>
      <div className="text-2xl font-bold text-navy tabular-nums mt-0.5">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function VerdictBadge({
  verdict,
  label,
}: {
  verdict: "strong" | "thin" | "pass" | "none";
  label: string;
}) {
  const map = {
    strong: "bg-success/90 text-white",
    thin: "bg-warning text-amber-foreground",
    pass: "bg-danger text-white",
    none: "bg-white/15 text-white",
  } as const;
  const icon = verdict === "pass" ? "✕" : verdict === "thin" ? "≈" : verdict === "strong" ? "✓" : "·";
  return (
    <div
      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 ${map[verdict]}`}
    >
      <span>{icon}</span>
      <span className="whitespace-nowrap">{label}</span>
    </div>
  );
}

/* --------------------------- Room tabs --------------------------- */
function RoomTabs({
  rooms,
  activeId,
  onChange,
  rollups,
  onQuickToggle,
}: {
  rooms: Room[];
  activeId: string;
  onChange: (id: string) => void;
  rollups: ReturnType<typeof rollupProject>["rollups"];
  onQuickToggle?: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const lastTapRef = useRef<{ id: string; t: number }>({ id: "", t: 0 });
  const lpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpFired = useRef(false);
  const handleTap = (id: string) => {
    const now = Date.now();
    if (lastTapRef.current.id === id && now - lastTapRef.current.t < 320) {
      onQuickToggle?.();
      lastTapRef.current = { id: "", t: 0 };
      return true;
    }
    lastTapRef.current = { id, t: now };
    return false;
  };
  return (
    <div className="-mx-4 px-4">
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
        {rooms.map((r) => {
          const active = r.id === activeId;
          const roomRollups = rollups.filter((x) => x.roomId === r.id);
          const allReviewed =
            roomRollups.length > 0 && roomRollups.every((x) => x.reviewed);
          return (
            <button
              key={r.id}
              onClick={() => {
                if (lpFired.current) { lpFired.current = false; return; }
                if (handleTap(r.id)) return;
                onChange(r.id);
              }}
              onPointerDown={() => {
                lpFired.current = false;
                if (lpTimer.current) clearTimeout(lpTimer.current);
                lpTimer.current = setTimeout(() => {
                  lpFired.current = true;
                  onQuickToggle?.();
                }, 500);
              }}
              onPointerUp={() => { if (lpTimer.current) clearTimeout(lpTimer.current); }}
              onPointerLeave={() => { if (lpTimer.current) clearTimeout(lpTimer.current); }}
              className={`shrink-0 px-4 py-2 text-sm font-semibold rounded-full transition-all flex items-center gap-1.5 ${
                active
                  ? "bg-navy text-navy-foreground shadow-lift"
                  : "bg-secondary/60 text-muted-foreground hover:text-navy"
              }`}
            >
              <span>{r.label}</span>
              {allReviewed && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-success"}`}
                  aria-label="All reviewed"
                />
              )}
            </button>
          );
        })}
        <button
          onClick={() => setAdding(true)}
          className="shrink-0 px-3 py-2 text-sm font-semibold text-primary flex items-center gap-1 rounded-full border-2 border-dashed border-primary/40 hover:bg-primary/5"
        >
          <Plus className="h-4 w-4" /> Room
        </button>
      </div>
      {adding && <AddRoomSheet onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddRoomSheet({ onClose }: { onClose: () => void }) {
  const addRoom = useApp((s) => s.addRoom);
  const opts: Array<{ type: RoomType; label: string; desc: string }> = [
    { type: "bathroom", label: "Bathroom", desc: "Add another bathroom" },
    { type: "bedroom", label: "Bedroom", desc: "Separate finish costs" },
    { type: "living", label: "Living / Common", desc: "Family, dining, hall" },
  ];
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-end" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-navy mb-3">Add a room</h3>
        <div className="space-y-2">
          {opts.map((o) => (
            <button
              key={o.type}
              onClick={() => {
                addRoom(o.type);
                onClose();
              }}
              className="w-full text-left rounded-xl border p-3 bg-card hover:bg-secondary flex items-center justify-between"
            >
              <div>
                <div className="font-medium text-navy">{o.label}</div>
                <div className="text-xs text-muted-foreground">{o.desc}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------------------------- Room groups --------------------------- */
function RoomGroups({
  room,
  project,
  rollups,
  quickScan,
}: {
  room: Room;
  project: Project;
  rollups: ReturnType<typeof rollupProject>["rollups"];
  quickScan?: boolean;
}) {
  const tpl = ROOM_TEMPLATES[room.type];
  const removeRoom = useApp((s) => s.removeRoom);
  const renameRoom = useApp((s) => s.renameRoom);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(room.label);
  useEffect(() => setNameVal(room.label), [room.label]);
  const canRemove =
    room.type === "bathroom" || room.type === "bedroom" || room.type === "living";
  return (
    <section className="space-y-3">
      {canRemove && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {editingName ? (
            <div className="flex gap-1 flex-1">
              <input
                value={nameVal}
                onChange={(e) => setNameVal(e.target.value)}
                className="flex-1 px-2 py-1 rounded border text-sm"
              />
              <button
                onClick={() => {
                  renameRoom(room.id, nameVal || room.label);
                  setEditingName(false);
                }}
                className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground"
              >
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-1"
            >
              Rename room <Pencil className="h-3 w-3" />
            </button>
          )}
          <button
            onClick={() => {
              if (confirm(`Remove ${room.label}?`)) removeRoom(room.id);
            }}
            className="text-danger flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      )}
      {tpl.groups.map((g) => {
        const rollup = rollups.find(
          (r) => r.roomId === room.id && r.groupId === g.id,
        )!;
        return <GroupCard key={g.id} room={room} groupId={g.id} groupName={g.name} rollup={rollup} project={project} itemIds={g.itemIds} quickScan={quickScan} />;
      })}
    </section>
  );
}

function GroupCard({
  room,
  groupId,
  groupName,
  rollup,
  project,
  itemIds,
  quickScan,
}: {
  room: Room;
  groupId: string;
  groupName: string;
  rollup: ReturnType<typeof rollupProject>["rollups"][number];
  project: Project;
  itemIds: string[];
  quickScan?: boolean;
}) {
  const [openSelf, setOpen] = useState(false);
  const open = quickScan ? true : openSelf;
  const setNoAction = useApp((s) => s.setNoAction);
  const groupState = project.state[room.id]?.[groupId];
  const visibleCount =
    itemIds.filter((id) => !groupState?.deletedItems?.includes(id)).length +
    (groupState?.customItems.length ?? 0);
  return (
    <div
      className={`rounded-2xl border border-border/70 card-surface shadow-card hover-lift overflow-hidden ${
        rollup.reviewed ? "border-primary/50" : ""
      }`}
    >
      <button
        onClick={() => !quickScan && setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-navy">{groupName}</div>
            {rollup.reviewed && (
              <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-success/15 text-success font-bold tracking-wide animate-scale-in">
                <Check className="h-3 w-3" strokeWidth={3} /> REVIEWED
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {rollup.checkedCount}/{visibleCount} checked · {fmtMoney(rollup.subtotal)}
          </div>
        </div>
        {open ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="border-t">
          {!quickScan && (
            <label className="flex items-center justify-between px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">No action needed</span>
              <Toggle
                checked={!!groupState?.noAction}
                onChange={(v) => setNoAction(room.id, groupId, v)}
              />
            </label>
          )}
          <div className="divide-y">
            {itemIds
              .filter((id) => !groupState?.deletedItems?.includes(id))
              .map((id) => (
                <LineItemRow
                  key={id}
                  room={room}
                  groupId={groupId}
                  itemId={id}
                  compact={quickScan}
                />
              ))}
            {(groupState?.customItems ?? []).map((ci) => (
              <LineItemRow
                key={ci.id}
                room={room}
                groupId={groupId}
                itemId={ci.id}
                custom={ci}
                compact={quickScan}
              />
            ))}
          </div>
          {!quickScan && <AddCustomItem room={room} groupId={groupId} />}
        </div>
      )}
    </div>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-secondary"
      }`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function LineItemRow({
  room,
  groupId,
  itemId,
  custom,
  compact,
}: {
  room: Room;
  groupId: string;
  itemId: string;
  custom?: { id: string; name: string; cost: number; unit: string };
  compact?: boolean;
}) {
  const project = useApp((s) => (s.currentId ? s.projects[s.currentId] : null));
  const globals = useApp((s) => s.globalPrices);
  const toggleItem = useApp((s) => s.toggleItem);
  const setQty = useApp((s) => s.setQty);
  const setSerial = useApp((s) => s.setSerial);
  const setItemOverride = useApp((s) => s.setItemOverride);
  const removeCustomItem = useApp((s) => s.removeCustomItem);
  const deleteCatalogItem = useApp((s) => s.deleteCatalogItem);

  if (!project) return null;
  const isCustom = !!custom;
  const item = isCustom
    ? { id: custom!.id, name: custom!.name, cost: custom!.cost, unit: custom!.unit, serial: false }
    : CATALOG[itemId];
  if (!item) return null;
  const state = isCustom
    ? project.state[room.id]?.[groupId]?.customItemState[itemId]
    : project.state[room.id]?.[groupId]?.items[itemId];
  const checked = state?.checked ?? false;
  const qty = state?.qty ?? 1;
  const price = isCustom ? item.cost : resolvePrice(itemId, project, globals);
  const overridden = !isCustom && project.itemOverrides[itemId] !== undefined;
  const total = checked ? price * qty : 0;

  const [showPrice, setShowPrice] = useState(false);
  const [priceInput, setPriceInput] = useState(price.toString());
  useEffect(() => setPriceInput(price.toString()), [price]);

  return (
    <div
      className={`px-4 py-3 border-l-[3px] transition-colors duration-300 ${
        checked ? "border-primary bg-primary/[0.04]" : "border-transparent"
      } ${compact ? "py-2" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => toggleItem(room.id, groupId, itemId)}
          className={`mt-0.5 h-6 w-6 rounded-md border-2 grid place-items-center shrink-0 transition-all duration-200 ${
            checked ? "bg-primary border-primary scale-100" : "border-muted-foreground/40 hover:border-primary/60"
          }`}
          aria-label={checked ? "Uncheck" : "Check"}
        >
          {checked && (
            <Check className="h-4 w-4 text-primary-foreground animate-check-pop" strokeWidth={3.5} />
          )}
        </button>
        {compact ? (
          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
            <div className="text-[14px] text-navy font-medium leading-tight truncate">
              {item.name}
            </div>
            {checked && (
              <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
                {fmtMoney(total)}
              </span>
            )}
          </div>
        ) : (
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <div className="text-[14px] text-navy font-medium leading-tight">
              {item.name}
              {isCustom && (
                <span className="ml-1 text-[10px] uppercase tracking-wider text-amber font-semibold">
                  custom
                </span>
              )}
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setShowPrice((v) => !v)}
              className={`tabular-nums ${overridden ? "text-primary font-medium" : ""}`}
            >
              {fmtMoney2(price)} / {item.unit}
              {overridden && " *"}
            </button>
            {checked && (
              <span className="text-foreground font-semibold tabular-nums">
                = {fmtMoney(total)}
              </span>
            )}
          </div>

          {checked && (
            <div className="mt-2 flex items-center gap-3">
              <QtyStepper
                value={qty}
                onChange={(n) => setQty(room.id, groupId, itemId, n)}
              />
              <span className="text-[11px] text-muted-foreground">{item.unit}</span>
              {!isCustom && CATALOG[itemId]?.serial && (
                <SerialScanner
                  value={state?.serial ?? ""}
                  onChange={(v) => setSerial(room.id, groupId, itemId, v)}
                />
              )}
            </div>
          )}

          {showPrice && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Override $</span>
              <input
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                type="number"
                step="0.01"
                className="flex-1 min-w-0 px-2 py-1 rounded border text-xs tabular-nums"
              />
              {!isCustom && (
                <>
                  <button
                    onClick={() => {
                      const n = parseFloat(priceInput);
                      if (!isNaN(n)) setItemOverride(itemId, n);
                      setShowPrice(false);
                    }}
                    className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground"
                  >
                    Save
                  </button>
                  {overridden && (
                    <button
                      onClick={() => {
                        setItemOverride(itemId, null);
                        setShowPrice(false);
                      }}
                      className="text-xs px-2 py-1 rounded border"
                    >
                      Reset
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (isCustom) removeCustomItem(room.id, groupId, itemId);
            else if (confirm("Remove this item from this project?"))
              deleteCatalogItem(room.id, groupId, itemId);
          }}
          className="text-muted-foreground/60 p-1"
          aria-label="Remove"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function QtyStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center bg-secondary rounded-lg overflow-hidden">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="h-9 w-9 grid place-items-center text-primary"
        aria-label="Decrease"
      >
        <Minus className="h-4 w-4" />
      </button>
      <input
        value={value}
        onChange={(e) => {
          const n = parseFloat(e.target.value);
          if (!isNaN(n)) onChange(n);
          else if (e.target.value === "") onChange(0);
        }}
        inputMode="decimal"
        className="w-14 h-9 text-center bg-transparent tabular-nums font-medium text-navy outline-none"
      />
      <button
        onClick={() => onChange(value + 1)}
        className="h-9 w-9 grid place-items-center text-primary"
        aria-label="Increase"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddCustomItem({ room, groupId }: { room: Room; groupId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [unit, setUnit] = useState("ea.");
  const addCustomItem = useApp((s) => s.addCustomItem);
  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-2.5 text-sm text-primary font-medium flex items-center gap-1 border-t"
      >
        <Plus className="h-4 w-4" /> Add custom line item
      </button>
    );
  return (
    <div className="border-t p-4 space-y-2 bg-secondary/30">
      <input
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-2 py-2 rounded border text-sm"
      />
      <div className="flex gap-2">
        <input
          placeholder="Cost"
          type="number"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          className="flex-1 px-2 py-2 rounded border text-sm tabular-nums"
        />
        <input
          placeholder="Unit"
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="w-24 px-2 py-2 rounded border text-sm"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => {
            const c = parseFloat(cost);
            if (!name || isNaN(c)) return;
            addCustomItem(room.id, groupId, { name, cost: c, unit: unit || "ea." });
            setName("");
            setCost("");
            setOpen(false);
          }}
          className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm"
        >
          Add
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 rounded border text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Deal tab ----------------------------- */
function DealTab({ project }: { project: Project }) {
  const globals = useApp((s) => s.globalPrices);
  const { total } = useMemo(() => rollupProject(project, globals), [project, globals]);
  const setDeal = useApp((s) => s.setDeal);
  const d = project.deal;
  const deal = useMemo(() => computeDeal(total, d), [total, d]);
  const animatedMao = useCountUp(Math.max(0, deal.mao));
  const maoBounce = useBounce(Math.max(0, deal.mao));
  const [copied, setCopied] = useState(false);
  const verdictClass =
    deal.verdict === "strong"
      ? "verdict-strong"
      : deal.verdict === "thin"
        ? "verdict-thin"
        : deal.verdict === "pass"
          ? "verdict-pass"
          : "verdict-none";
  const verdictHeadline =
    deal.verdict === "strong"
      ? "STRONG DEAL"
      : deal.verdict === "thin"
        ? "THIN MARGIN"
        : deal.verdict === "pass"
          ? "PASS"
          : "NEEDS ARV";
  const targetMargin = d.targetMargin || 20;
  const currentMargin = deal.marginOnArv ?? 0;
  const gaugePct = Math.max(0, Math.min(150, (currentMargin / targetMargin) * 100));
  const copyMao = async () => {
    try {
      await navigator.clipboard.writeText(fmtMoney(Math.max(0, deal.mao)));
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  return (
    <div className="space-y-5">
      {/* Verdict banner */}
      <section className={`rounded-2xl p-4 shadow-lift ${verdictClass}`}>
        <div className="text-[10px] tracking-[0.28em] font-semibold opacity-80">VERDICT</div>
        <div className="text-4xl font-black tracking-tight mt-0.5">{verdictHeadline}</div>
        <div className="text-sm opacity-90 mt-1">{deal.verdictLabel}</div>
      </section>

      {/* MAO hero */}
      <section className="rounded-2xl shadow-lift hero-surface border border-border/60 p-5 relative overflow-hidden deal-glow">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl opacity-40"
          style={{ background: "radial-gradient(circle, var(--amber), transparent 70%)" }}
        />
        <div className="text-[10px] tracking-[0.22em] font-semibold text-muted-foreground">
          MAXIMUM ALLOWABLE OFFER
        </div>
        <div
          className={`grad-hero-number font-black tabular-nums tracking-tighter leading-none mt-1 origin-left ${maoBounce ? "animate-spark-bounce" : ""}`}
          style={{ fontSize: "clamp(3.5rem, 14vw, 5rem)" }}
        >
          {fmtMoney(animatedMao)}
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          using {d.rule === "margin" ? `${d.targetMargin}% target margin` : "the 70% rule"}
        </div>
        <div className="mt-3 flex gap-2">
          <RuleChip
            active={d.rule === "margin"}
            onClick={() => setDeal({ rule: "margin" })}
            label="Target margin"
          />
          <RuleChip
            active={d.rule === "seventy"}
            onClick={() => setDeal({ rule: "seventy" })}
            label="70% rule"
          />
        </div>
        <button
          onClick={copyMao}
          className="mt-4 w-full py-2.5 rounded-xl bg-navy text-navy-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="h-4 w-4" /> : <ClipboardList className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy MAO to clipboard"}
        </button>
      </section>

      {/* Margin gauge */}
      {d.purchasePrice > 0 && d.arv > 0 && (
        <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold">
              MARGIN VS TARGET
            </div>
            <div className="tabular-nums text-sm">
              <span className="font-bold text-navy">{currentMargin.toFixed(1)}%</span>
              <span className="text-muted-foreground"> / {targetMargin}%</span>
            </div>
          </div>
          <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                deal.verdict === "strong"
                  ? "bg-success"
                  : deal.verdict === "thin"
                    ? "bg-warning"
                    : "bg-danger"
              }`}
              style={{ width: `${Math.min(100, gaugePct)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-navy"
              style={{ left: "66.66%" }}
              aria-label="Target"
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>0%</span>
            <span>Target</span>
            <span>{Math.round(targetMargin * 1.5)}%</span>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4 space-y-4">
        <DealInput
          label="After Repair Value (ARV)"
          value={d.arv}
          onChange={(v) => setDeal({ arv: v })}
        />
        <DealInput
          label="Purchase price (optional)"
          value={d.purchasePrice}
          onChange={(v) => setDeal({ purchasePrice: v })}
        />
        <div className="grid grid-cols-2 gap-3">
          <DealInput
            label="Target margin %"
            value={d.targetMargin}
            onChange={(v) => setDeal({ targetMargin: v })}
            small
          />
          <DealInput
            label="Holding+selling %"
            value={d.holdingPct}
            onChange={(v) => setDeal({ holdingPct: v })}
            small
          />
        </div>
      </section>

      {/* Visual equation */}
      {d.arv > 0 && (
        <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
          <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold mb-3">
            THE EQUATION
          </div>
          <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] gap-1.5 items-center text-center">
            <EqCell label="ARV" value={fmtMoney(d.arv)} tone="navy" />
            <EqOp>−</EqOp>
            <EqCell label="Repairs" value={fmtMoney(total)} tone="muted" />
            <EqOp>−</EqOp>
            <EqCell label="Holding" value={fmtMoney(deal.holdingCost)} tone="muted" />
          </div>
          <div className="my-2 grid grid-cols-[1fr_auto_1fr] gap-1.5 items-center text-center">
            <div />
            <EqOp>=</EqOp>
            <EqCell
              label={d.purchasePrice > 0 ? "Profit (after purchase)" : "MAO"}
              value={fmtMoney(
                d.purchasePrice > 0 ? deal.profit ?? 0 : Math.max(0, deal.mao),
              )}
              tone="amber"
              big
            />
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold mb-2">
          BREAKDOWN
        </div>
        <Row k="Repairs (from estimate)" v={fmtMoney(total)} />
        <Row k="Holding + selling costs" v={fmtMoney(deal.holdingCost)} />
        <Row k="MAO" v={fmtMoney(Math.max(0, deal.mao))} bold />
        {d.purchasePrice > 0 && (
          <>
            <Row k="Projected profit" v={fmtMoney(deal.profit ?? 0)} />
            <Row
              k="Margin on ARV"
              v={deal.marginOnArv !== null ? `${deal.marginOnArv.toFixed(1)}%` : "—"}
            />
          </>
        )}
      </section>
    </div>
  );
}

function EqCell({
  label, value, tone, big,
}: { label: string; value: string; tone: "navy" | "muted" | "amber"; big?: boolean }) {
  const cls =
    tone === "amber"
      ? "bg-amber/15 text-amber-foreground border-amber/40"
      : tone === "navy"
        ? "bg-navy text-navy-foreground border-navy"
        : "bg-secondary text-foreground border-border";
  return (
    <div className={`rounded-xl border px-2 py-2 ${cls}`}>
      <div className="text-[9px] tracking-wider opacity-70 font-semibold uppercase">{label}</div>
      <div className={`tabular-nums font-bold ${big ? "text-lg" : "text-sm"}`}>{value}</div>
    </div>
  );
}
function EqOp({ children }: { children: React.ReactNode }) {
  return <div className="text-xl font-bold text-muted-foreground px-0.5">{children}</div>;
}

function RuleChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-full font-medium border ${
        active
          ? "bg-white text-navy border-white"
          : "bg-transparent text-white/85 border-white/30"
      }`}
    >
      {label}
    </button>
  );
}

function DealInput({
  label,
  value,
  onChange,
  small,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  small?: boolean;
}) {
  const [v, setV] = useState(value.toString());
  useEffect(() => setV(value.toString()), [value]);
  return (
    <label className="block">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
        {label}
      </div>
      <input
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          const n = parseFloat(e.target.value);
          onChange(isNaN(n) ? 0 : n);
        }}
        inputMode="decimal"
        className={`w-full px-3 py-2.5 rounded-lg border bg-card tabular-nums font-medium text-navy ${
          small ? "text-base" : "text-xl"
        }`}
      />
    </label>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{k}</span>
      <span className={`tabular-nums ${bold ? "text-lg font-bold text-navy" : "text-sm text-foreground"}`}>
        {v}
      </span>
    </div>
  );
}

/* ----------------------------- Export tab ----------------------------- */
function ExportTab({ project }: { project: Project }) {
  const globals = useApp((s) => s.globalPrices);
  const { total, rollups, lineItemCount } = useMemo(
    () => rollupProject(project, globals),
    [project, globals],
  );
  const [phase, setPhase] = useState<"idle" | "preview" | "working" | "done">("idle");
  const [progress, setProgress] = useState(0);
  const [canShare] = useState(() =>
    typeof navigator !== "undefined" && "share" in navigator,
  );

  const runExport = async (share: boolean) => {
    setPhase("working");
    setProgress(8);
    const tick = setInterval(() => {
      setProgress((p) => (p < 88 ? p + Math.max(1, Math.round((90 - p) / 8)) : p));
    }, 120);
    try {
      const blob = await exportProjectZip(project, globals, { returnBlob: share });
      if (share && blob && "share" in navigator) {
        const file = new File([blob], `${project.name}.zip`, { type: "application/zip" });
        try {
          await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
            files: [file],
            title: project.name,
            text: `Repair estimate: ${fmtMoney(total)}`,
          });
        } catch {}
      }
      setProgress(100);
      setPhase("done");
    } catch {
      setPhase("preview");
    } finally {
      clearInterval(tick);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-black text-navy tracking-tight">Export</h2>
      <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold">
          SUMMARY
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2">
          <StatCard label="Total" value={fmtMoney(total)} />
          <StatCard label="Items" value={`${lineItemCount}`} sub="line items" />
        </div>
        <button
          onClick={() => setPhase("preview")}
          className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
        >
          <Download className="h-5 w-5" />
          Review &amp; export
        </button>
        <p className="text-[11px] text-muted-foreground mt-2">
          Includes a styled .xlsx breakdown, all photos, and a plain-text summary.
        </p>
      </section>
      <section className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
        <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold mb-2">
          ROOMS
        </div>
        {rollups
          .filter((r) => r.lines.length > 0)
          .map((r) => (
            <div key={r.roomId + r.groupId} className="py-2 border-b last:border-0">
              <div className="flex justify-between text-sm">
                <span className="text-navy font-medium">
                  {r.roomLabel} · {r.groupName}
                </span>
                <span className="tabular-nums">{fmtMoney(r.subtotal)}</span>
              </div>
              <div className="text-[11px] text-muted-foreground">{r.lines.length} items</div>
            </div>
          ))}
      </section>

      {phase !== "idle" && (
        <ExportSheet
          phase={phase}
          progress={progress}
          project={project}
          total={total}
          lineItemCount={lineItemCount}
          canShare={canShare}
          onClose={() => setPhase("idle")}
          onDownload={() => runExport(false)}
          onShare={() => runExport(true)}
        />
      )}
    </div>
  );
}

function ExportSheet({
  phase, progress, project, total, lineItemCount, canShare, onClose, onDownload, onShare,
}: {
  phase: "preview" | "working" | "done";
  progress: number;
  project: Project;
  total: number;
  lineItemCount: number;
  canShare: boolean;
  onClose: () => void;
  onDownload: () => void;
  onShare: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end animate-fade-in" onClick={onClose}>
      <div
        className="w-full bg-background rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "preview" && (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-black text-navy tracking-tight">Export preview</h3>
              <button onClick={onClose} className="p-1 text-muted-foreground"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Here's what will be in your ZIP:</p>
            <div className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4 space-y-2">
              <PreviewRow k="Property" v={project.address || project.name} />
              <PreviewRow k="Repair total" v={fmtMoney(total)} highlight />
              <PreviewRow k="Line items" v={`${lineItemCount}`} />
              <PreviewRow k="Photos" v={`${project.photos.length}`} />
              <PreviewRow k="Rooms" v={`${project.rooms.length}`} />
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <button
                onClick={onDownload}
                className="py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2"
              >
                <Download className="h-5 w-5" /> Download ZIP
              </button>
              {canShare && (
                <button
                  onClick={onShare}
                  className="py-3 rounded-xl border-2 border-primary text-primary font-semibold flex items-center justify-center gap-2"
                >
                  Share…
                </button>
              )}
            </div>
          </>
        )}
        {phase === "working" && (
          <div className="py-8 text-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto" />
            <div className="text-lg font-semibold text-navy mt-4">Packaging your export…</div>
            <div className="text-xs text-muted-foreground mt-1">Generating XLSX, bundling photos</div>
            <div className="mt-5 h-2 rounded-full bg-secondary overflow-hidden max-w-xs mx-auto">
              <div
                className="h-full grad-hero rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs tabular-nums text-muted-foreground mt-2">{progress}%</div>
          </div>
        )}
        {phase === "done" && (
          <div className="py-8 text-center animate-fade-in">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/15 grid place-items-center">
              <Check className="h-10 w-10 text-success animate-check-pop" strokeWidth={3.5} />
            </div>
            <div className="text-2xl font-bold text-navy mt-4">Export complete</div>
            <div className="text-sm text-muted-foreground mt-1">Your ZIP is ready.</div>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={`tabular-nums font-semibold ${highlight ? "text-xl text-navy" : "text-foreground"}`}>{v}</span>
    </div>
  );
}

/* ----------------------------- Photos tab ----------------------------- */
type UploadJob = {
  id: string;
  name: string;
  file: File;
  status: "queued" | "processing" | "done" | "error";
  attempts: number;
  error?: string;
  previewUrl: string;
};

async function processWithRetry(
  file: File,
  onAttempt: (n: number) => void,
  maxAttempts = 3,
): Promise<string> {
  let lastErr: unknown;
  for (let i = 1; i <= maxAttempts; i++) {
    onAttempt(i);
    try {
      const dataUrl = await compressImage(file);
      if (!dataUrl || !dataUrl.startsWith("data:image")) throw new Error("Invalid image data");
      return dataUrl;
    } catch (e) {
      lastErr = e;
      // exponential backoff: 400, 800, 1600 ms
      await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i - 1)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upload failed");
}

function PhotosTab({ project }: { project: Project }) {
  const addPhoto = useApp((s) => s.addPhoto);
  const removePhoto = useApp((s) => s.removePhoto);
  const reorderPhotos = useApp((s) => s.reorderPhotos);
  const updateCaption = useApp((s) => s.updatePhotoCaption);
  const inputRef = useRef<HTMLInputElement>(null);
  const [queue, setQueue] = useState<UploadJob[]>([]);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => project.photos.map((p) => p.id), [project.photos]);

  const runJob = async (jobId: string) => {
    const job = queue.find((j) => j.id === jobId);
    if (!job) return;
    setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, status: "processing", error: undefined } : j)));
    try {
      const dataUrl = await processWithRetry(job.file, (n) => {
        setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, attempts: n } : j)));
      });
      addPhoto({ dataUrl });
      setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, status: "done" } : j)));
      // auto-clear successful jobs after a moment
      setTimeout(() => {
        setQueue((q) => {
          const target = q.find((j) => j.id === jobId);
          if (target) URL.revokeObjectURL(target.previewUrl);
          return q.filter((j) => j.id !== jobId);
        });
      }, 1200);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, status: "error", error: msg } : j)));
    }
  };

  const enqueue = (files: File[]) => {
    const jobs: UploadJob[] = files.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name || "photo.jpg",
      file: f,
      status: "queued",
      attempts: 0,
      previewUrl: URL.createObjectURL(f),
    }));
    setQueue((q) => [...q, ...jobs]);
    // kick them off sequentially to avoid choking memory on mobile
    (async () => {
      for (const j of jobs) {
        // eslint-disable-next-line no-await-in-loop
        await runJob(j.id);
      }
    })();
  };

  const retry = (jobId: string) => {
    setQueue((q) => q.map((j) => (j.id === jobId ? { ...j, status: "queued", attempts: 0, error: undefined } : j)));
    void runJob(jobId);
  };

  const dismiss = (jobId: string) => {
    setQueue((q) => {
      const t = q.find((j) => j.id === jobId);
      if (t) URL.revokeObjectURL(t.previewUrl);
      return q.filter((j) => j.id !== jobId);
    });
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = ids.indexOf(String(active.id));
    const newIdx = ids.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    reorderPhotos(arrayMove(ids, oldIdx, newIdx));
  };

  const uploading = queue.some((j) => j.status === "queued" || j.status === "processing");

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-3xl font-black text-navy tracking-tight">Photos</h2>
        <span className="text-xs text-muted-foreground">
          {project.photos.length} photo{project.photos.length === 1 ? "" : "s"}
        </span>
      </div>

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
        {uploading ? "Saving…" : "Capture / upload"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) enqueue(files);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {queue.length > 0 && (
        <div className="space-y-2 rounded-2xl border border-border bg-card p-2">
          {queue.map((j) => (
            <div key={j.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/40">
              <img src={j.previewUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-muted" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{j.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  {j.status === "queued" && <>Queued…</>}
                  {j.status === "processing" && (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Compressing{j.attempts > 1 ? ` · retry ${j.attempts - 1}` : ""}
                    </>
                  )}
                  {j.status === "done" && <span className="text-green-600">Saved ✓</span>}
                  {j.status === "error" && (
                    <span className="text-destructive flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {j.error || "Failed"}
                    </span>
                  )}
                </div>
              </div>
              {j.status === "error" && (
                <>
                  <button
                    onClick={() => retry(j.id)}
                    className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Retry
                  </button>
                  <button
                    onClick={() => dismiss(j.id)}
                    className="h-8 w-8 grid place-items-center rounded-lg text-muted-foreground"
                    aria-label="Dismiss"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {project.photos.length === 0 ? (
        <div className="text-center py-14 px-6 border border-dashed border-border rounded-2xl card-surface">
          <div className="mx-auto h-20 w-20 rounded-2xl grad-hero shadow-lift flex items-center justify-center mb-4 relative">
            <Camera className="h-9 w-9 text-white" strokeWidth={1.8} />
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-[var(--amber)] text-white text-xs font-black flex items-center justify-center shadow-card">+</span>
          </div>
          <h3 className="text-base font-bold text-navy mb-1">No photos yet</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Tap any item to add photos during your walkthrough — they'll show up here in a per-property gallery.
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">Long-press a photo to drag and reorder.</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={ids} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-3 gap-2">
                {project.photos.map((p, idx) => (
                  <SortablePhoto
                    key={p.id}
                    id={p.id}
                    src={p.dataUrl}
                    onOpen={() => setLightboxIdx(idx)}
                    onRemove={() => removePhoto(p.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}

      {lightboxIdx !== null && project.photos[lightboxIdx] && (
        <Lightbox
          photos={project.photos}
          index={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onChange={setLightboxIdx}
          onCaption={(id, c) => updateCaption(id, c)}
          onRemove={(id) => {
            removePhoto(id);
            setLightboxIdx((i) => {
              if (i === null) return null;
              const nextLen = project.photos.length - 1;
              if (nextLen <= 0) return null;
              return Math.min(i, nextLen - 1);
            });
          }}
        />
      )}
    </div>
  );
}

function SortablePhoto({
  id,
  src,
  onOpen,
  onRemove,
}: {
  id: string;
  src: string;
  onOpen: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden bg-secondary touch-none select-none ${
        isDragging ? "ring-2 ring-primary shadow-lg" : ""
      }`}
    >
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 w-full h-full"
        aria-label="Open photo"
      >
        <img src={src} className="w-full h-full object-cover pointer-events-none" alt="" />
      </button>
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 h-7 w-7 grid place-items-center rounded-full bg-black/55 text-white cursor-grab active:cursor-grabbing"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 h-7 w-7 grid place-items-center rounded-full bg-black/55 text-white"
        aria-label="Remove photo"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onClose,
  onChange,
  onCaption,
  onRemove,
}: {
  photos: Project["photos"];
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
  onCaption: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}) {
  const photo = photos[index];
  if (!photo) return null;
  const prev = () => onChange(Math.max(0, index - 1));
  const next = () => onChange(Math.min(photos.length - 1, index + 1));
  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      <div className="flex items-center justify-between p-3 text-white" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-full bg-white/10">
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm">
          {index + 1} / {photos.length}
        </span>
        <button
          onClick={() => onRemove(photo.id)}
          className="h-9 w-9 grid place-items-center rounded-full bg-white/10"
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>
      <div
        className="flex-1 flex items-center justify-center px-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={prev}
          disabled={index === 0}
          className="h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <img
          src={photo.dataUrl}
          alt=""
          className="max-h-[70vh] max-w-full mx-2 object-contain rounded-lg"
        />
        <button
          onClick={next}
          disabled={index === photos.length - 1}
          className="h-10 w-10 grid place-items-center rounded-full bg-white/10 text-white disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="p-3" onClick={(e) => e.stopPropagation()}>
        <input
          type="text"
          defaultValue={photo.caption ?? ""}
          onBlur={(e) => onCaption(photo.id, e.target.value)}
          placeholder="Add a caption…"
          className="w-full px-3 py-2 rounded-lg bg-white/10 text-white placeholder:text-white/50 text-sm"
        />
      </div>
    </div>
  );
}

/* ----------------------------- Review tab ----------------------------- */
function ReviewTab({ project }: { project: Project }) {
  const globals = useApp((s) => s.globalPrices);
  const { rollups, total, reviewed, totalGroups, lineItemCount } = useMemo(
    () => rollupProject(project, globals),
    [project, globals],
  );
  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-black text-navy tracking-tight">Review</h2>
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Total" value={fmtMoney(total)} />
        <StatCard label="Groups" value={`${reviewed}/${totalGroups}`} />
        <StatCard label="Items" value={`${lineItemCount}`} />
      </div>
      {rollups
        .filter((r) => r.lines.length > 0 || r.noAction)
        .map((r) => (
          <div key={r.roomId + r.groupId} className="rounded-2xl border border-border/70 card-surface shadow-card hover-lift p-4">
            <div className="flex justify-between items-baseline mb-2">
              <div>
                <div className="text-[10px] tracking-[0.18em] text-muted-foreground font-semibold">
                  {r.roomLabel.toUpperCase()}
                </div>
                <div className="font-semibold text-navy">{r.groupName}</div>
              </div>
              <div className="tabular-nums font-bold text-navy">{fmtMoney(r.subtotal)}</div>
            </div>
            {r.noAction && r.lines.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No action needed</div>
            ) : (
              <ul className="space-y-1.5">
                {r.lines.map((ln) => (
                  <li key={ln.id} className="flex justify-between text-sm">
                    <span className="text-foreground truncate pr-2">
                      {ln.name}{" "}
                      <span className="text-muted-foreground tabular-nums text-xs">
                        × {ln.qty} {ln.unit}
                      </span>
                    </span>
                    <span className="tabular-nums text-muted-foreground">{fmtMoney(ln.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      {rollups.every((r) => r.lines.length === 0 && !r.noAction) && (
        <div className="text-center text-sm text-muted-foreground py-12 border border-dashed rounded-2xl">
          Nothing checked yet. Go to Estimate to start your walkthrough.
        </div>
      )}
      {(lineItemCount > 0 || total > 0) && (
        <section className="rounded-2xl hero-surface shadow-lift border border-border/60 p-6 relative overflow-hidden mt-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full blur-3xl opacity-40"
            style={{ background: "radial-gradient(circle, var(--amber), transparent 70%)" }}
          />
          <div className="text-[10px] tracking-[0.24em] font-semibold text-muted-foreground">
            GRAND TOTAL
          </div>
          <div className="grad-hero-number text-6xl sm:text-7xl font-black tracking-tighter tabular-nums mt-1 leading-none drop-shadow-sm">
            {fmtMoney(total)}
          </div>
          <div className="mt-3 text-xs text-muted-foreground tabular-nums">
            {lineItemCount} line item{lineItemCount === 1 ? "" : "s"} · {reviewed}/{totalGroups} groups reviewed
          </div>
        </section>
      )}
    </div>
  );
}

// ===========================================================
// SerialScanner — OCR a data-plate photo into a serial number
// ===========================================================
function SerialScanner({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<OcrCandidate[]>([]);

  const onPick = async (file: File | undefined | null) => {
    if (!file) return;
    setError(null);
    setCandidates([]);
    setBusy(true);
    try {
      const { candidates } = await ocrSerial(file);
      if (candidates.length === 0) {
        setError("No serial detected. Try a sharper, closer photo.");
      } else if (candidates.length === 1 || candidates[0].score >= candidates[1].score + 30) {
        onChange(candidates[0].value);
        setCandidates(candidates.slice(1));
      } else {
        setCandidates(candidates);
      }
    } catch (e) {
      setError("Scan failed. Type the serial manually.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1.5">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Serial #"
          className="flex-1 min-w-0 px-2 py-1 rounded border text-xs tabular-nums"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          aria-label="Scan serial number from photo"
          className="h-7 px-2 rounded border bg-background hover:bg-muted active:bg-muted/70 disabled:opacity-50 grid place-items-center"
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
          ) : (
            <Camera className="h-3.5 w-3.5 text-primary" />
          )}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => onPick(e.target.files?.[0])}
        />
      </div>
      {busy && (
        <div className="mt-1 text-[10px] text-muted-foreground">Reading data plate…</div>
      )}
      {error && (
        <div className="mt-1 text-[10px] text-danger">{error}</div>
      )}
      {candidates.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <span className="text-[10px] text-muted-foreground mr-0.5">
            {value ? "Other:" : "Pick:"}
          </span>
          {candidates.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => {
                onChange(c.value);
                setCandidates([]);
              }}
              className="px-1.5 py-0.5 rounded border bg-background text-[10px] tabular-nums hover:bg-muted"
            >
              {c.value}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCandidates([])}
            className="text-[10px] text-muted-foreground px-1"
            aria-label="Dismiss suggestions"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}