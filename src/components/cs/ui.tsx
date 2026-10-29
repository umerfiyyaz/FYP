import type { ReactNode, CSSProperties } from "react";
import { IMG } from "@/lib/imgs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type Screen =
  | "welcome" | "signup" | "onboard" | "empty" | "home" | "analyze" | "processing"
  | "results" | "behavior" | "health" | "sound" | "history" | "alerts" | "profile";
export type Go = (s: Screen) => void;

export function Icon({ n, className, fill }: { n: string; className?: string; fill?: boolean }) {
  return (
    <span className={cn("msym", className)} style={fill ? { fontVariationSettings: "'FILL' 1" } : undefined}>
      {n}
    </span>
  );
}

export function Card({ children, className, d = 0, onClick }: { children: ReactNode; className?: string; d?: number; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn("theme-card float-in rounded-2xl bg-card p-4 shadow-sm", onClick && "press cursor-pointer", className)}
      style={{ animationDelay: `${d * 80}ms` }}
    >
      {children}
    </div>
  );
}

export function Btn({ children, onClick, variant = "lime", className }: { children: ReactNode; onClick?: () => void; variant?: "lime" | "ink" | "ghost"; className?: string }) {
  const v = {
    lime: "theme-action bg-primary text-primary-foreground",
    ink: "theme-action bg-primary text-primary-foreground",
    ghost: "theme-glass bg-card text-foreground border border-border",
  }[variant];
  return (
    <Button variant="ghost" onClick={onClick} className={cn("press flex h-auto w-full items-center justify-center gap-2 whitespace-normal rounded-xl px-5 py-3.5 text-sm font-bold shadow-sm", v, className)}>
      {children}
    </Button>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold tracking-wide", className)}>{children}</span>;
}

export function Avatar({ size = 32, src = IMG.milo }: { size?: number; src?: string }) {
  return <img src={src} alt="Milo" className="rounded-full object-cover ring-2 ring-card" style={{ width: size, height: size }} />;
}

export function TopBar({ title, go, back }: { title?: string; go: Go; back?: Screen }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur">
      {back ? (
        <>
          <button onClick={() => go(back)} className="press grid size-10 place-items-center rounded-full bg-card shadow-sm"><Icon n="arrow_back" /></button>
          <span className="text-sm font-bold">{title}</span>
          <button className="press grid size-10 place-items-center rounded-full bg-card shadow-sm"><Icon n="tune" /></button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-full bg-lime"><Icon n="pets" className="!text-lg" /></span>
            <span className="font-extrabold">CatSense</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => go("alerts")} className="press relative">
              <Icon n="notifications" />
              <span className="absolute right-0 top-0 size-2 rounded-full bg-warn" />
            </button>
            <button onClick={() => go("profile")} className="press"><Avatar /></button>
          </div>
        </>
      )}
    </header>
  );
}

const tabs: { s: Screen; n: string; l: string }[] = [
  { s: "home", n: "home", l: "Home" },
  { s: "analyze", n: "auto_videocam", l: "Analyze" },
  { s: "history", n: "bar_chart", l: "History" },
  { s: "profile", n: "pets", l: "Profile" },
];
export function BottomNav({ cur, go }: { cur: Screen; go: Go }) {
  return (
    <nav className="theme-nav sticky bottom-3 z-40 mx-4 mt-6 flex justify-around rounded-2xl bg-ink px-2 py-2.5 shadow-xl">
      {tabs.map((t) => {
        const a = cur === t.s || (t.s === "home" && cur === "empty");
        return (
          <Button variant="ghost" key={t.s} onClick={() => go(t.s)} className={cn("press flex h-auto flex-col items-center gap-0.5 rounded-xl px-4 py-1 text-[10px] font-bold", a ? "theme-action bg-primary text-primary-foreground" : "text-muted-foreground")}>
            <Icon n={t.n} fill={a} />
            {t.l}
          </Button>
        );
      })}
    </nav>
  );
}

export function Bars({ data, hi, max, h = 120, labels }: { data: number[]; hi?: number; max: number; h?: number; labels?: string[] }) {
  return (
    <div>
      <div className="flex items-end justify-between gap-2" style={{ height: h }}>
        {data.map((v, i) => (
          <div key={i} className={cn("theme-bar grow-y w-full rounded-full", i === hi ? "bg-lime" : "bg-muted")} style={{ height: `${(v / max) * 100}%`, animationDelay: `${200 + i * 70}ms` } as CSSProperties} />
        ))}
      </div>
      {labels && (
        <div className="mt-2 flex justify-between gap-2 text-[11px] font-semibold text-muted-foreground">
          {labels.map((l, i) => <span key={i} className="w-full text-center">{l}</span>)}
        </div>
      )}
    </div>
  );
}

export function Meter({ pct, className, d = 0 }: { pct: number; className?: string; d?: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("grow-x h-full rounded-full", className ?? "bg-lime-deep")} style={{ width: `${pct}%`, animationDelay: `${d}ms` }} />
    </div>
  );
}

export function Wave({ n = 7, className }: { n?: number; className?: string }) {
  return (
    <div className={cn("flex h-6 items-center gap-0.5", className)}>
      {Array.from({ length: n }).map((_, i) => (
        <span key={i} className="wave h-full w-1 rounded-full bg-current" style={{ animationDelay: `${i * 0.12}s` }} />
      ))}
    </div>
  );
}

export function Serif({ children }: { children: ReactNode }) {
  return <em className="font-sans font-bold not-italic text-primary">{children}</em>;
}
