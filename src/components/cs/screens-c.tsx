import { useState } from "react";
import { IMG } from "@/lib/imgs";
import { cn } from "@/lib/utils";
import { Bars, BottomNav, Btn, Card, Icon, Meter, Pill, Serif, TopBar, type Go } from "./ui";

const ranges = {
  Week: { d: [2.8, 3.4, 3.9, 4.1, 3.2, 3.8], l: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], avg: 3.6 },
  Month: { d: [3.1, 3.5, 3.3, 3.9], l: ["W1", "W2", "W3", "W4"], avg: 3.5 },
  Quarter: { d: [3.0, 3.4, 3.7], l: ["Aug", "Sep", "Oct"], avg: 3.4 },
};
export function History({ go }: { go: Go }) {
  const [r, setR] = useState<keyof typeof ranges>("Week");
  const cur = ranges[r];
  return (
    <div>
      <TopBar go={go} />
      <div className="px-4">
        <p className="text-[11px] font-bold text-muted-foreground">ACOUSTIC & MOTION LOG</p>
        <h1 className="text-[26px] font-extrabold">Behavioral <Serif>History</Serif></h1>
        <div className="mt-3 flex rounded-full bg-muted p-1 text-sm font-semibold">
          {(Object.keys(ranges) as (keyof typeof ranges)[]).map((k) => <button key={k} onClick={() => setR(k)} className={cn("press flex-1 rounded-full py-2", r === k && "bg-ink text-ink-foreground")}>{k}</button>)}
        </div>
        <Card key={r} className="mt-3">
          <p className="flex justify-between text-sm font-bold"><span><Icon n="directions_run" /> Activity & Rest Balance</span><Pill className="bg-lime">+14% Energy</Pill></p>
          <p className="text-xs text-muted-foreground">Daily active bursts vs baseline target (3.5h)</p>
          <p className="mt-3 text-3xl font-extrabold">{cur.avg}<span className="text-sm">h</span> <span className="text-xs font-normal text-muted-foreground">Daily Average</span></p>
          <div className="mt-3"><Bars data={cur.d} max={4.5} hi={cur.d.indexOf(Math.max(...cur.d))} labels={cur.l} h={130} /></div>
        </Card>
        <Card className="mt-3" d={1}>
          <p className="flex justify-between text-sm font-bold"><span><Icon n="graphic_eq" /> Vocal Mood Spectrum</span><span className="text-xs text-muted-foreground">Last 7 Days</span></p>
          <div className="mt-3 flex h-3 gap-1">{[[78, "bg-lime-deep"], [15, "bg-lilac-deep"], [5, "bg-warn"], [2, "bg-muted-foreground"]].map(([w, c], i) => <div key={i} className={cn("grow-x rounded-full", c as string)} style={{ width: `${w}%`, animationDelay: `${i * 200}ms` }} />)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">{[["Happy / Purr", 78], ["Inquisitive", 15], ["Alert / Chirp", 5], ["Neutral", 2]].map(([a, b]) => <p key={a} className="flex justify-between rounded-xl bg-muted px-3 py-2"><span>{a}</span><b>{b}%</b></p>)}</div>
        </Card>
        <div className="mt-5 flex justify-between"><b>Analyzed Clips <Pill>3 Today</Pill></b><button className="text-xs font-bold">View All <Icon n="chevron_right" className="!text-sm" /></button></div>
        {[[IMG.clip1, "0:32s", "98% Happy", "Tuesday Morning Pounce", "Risk: Normal • Play Purr"], [IMG.clip2, "0:18s", "94% Hunting", "Chirping at Finches", "Ekek-Chatter • High Focus"], [IMG.clip3, "0:45s", "99% Resting", "Afternoon Sun Nap", "Deep Slow Purr • Relaxed"]].map(([img, d, m, t, s], i) => (
          <Card key={t} className="mt-3 flex items-center gap-3" d={2 + i} onClick={() => go("results")}>
            <div className="relative"><img src={img} alt="" className="size-16 rounded-2xl object-cover" /><span className="absolute inset-0 grid place-items-center"><Icon n="play_arrow" fill className="text-ink-foreground" /></span><span className="absolute bottom-1 left-1 rounded bg-ink px-1 text-[10px] text-ink-foreground">{d}</span></div>
            <div className="flex-1"><Pill className="bg-lime">Acoustic Match {m}</Pill><p className="mt-1 text-sm font-bold">{t}</p><p className="text-xs text-muted-foreground">{s}</p></div>
          </Card>
        ))}
        <Card className="mt-3 bg-sky" d={5}><p className="text-sm font-bold"><Icon n="tips_and_updates" /> Weekly Veterinarian Tip</p><p className="text-xs text-muted-foreground">Milo's purr frequencies show consistent emotional stability throughout active morning routines. Keep up the 15-minute feather play sessions!</p></Card>
      </div>
      <BottomNav cur="history" go={go} />
    </div>
  );
}

type A = { id: number; st: "att" | "res"; tag: string; icon: string; title: string; time: string; body: string; c: string };
const initial: A[] = [
  { id: 1, st: "att", tag: "High Priority", icon: "warning", title: "Decreased Activity Window", time: "Yesterday, 3:15 PM", body: "Milo was 35% less active during normal afternoon play cycle (14:00 - 16:30).", c: "bg-peach" },
  { id: 2, st: "att", tag: "Acoustic AI", icon: "graphic_eq", title: "Acoustic Shift: Higher Vocal Pitch", time: "3 days ago • 11:42 AM", body: "Short 580 Hz chirps observed near kitchen pantry. Pattern consistent with curious solicitation or seeking snack access.", c: "bg-lilac" },
  { id: 3, st: "res", tag: "Normal Baseline", icon: "water_drop", title: "Hydration Intake Resumed", time: "5 days ago • 8:20 PM", body: "Smart bowl logged 4 distinct drinking sessions (approx. 140ml). Milo's 48-hour hydration balance is within optimal veterinary guidelines.", c: "bg-mint" },
];
export function Alerts({ go }: { go: Go }) {
  const [list, setList] = useState(initial);
  const [f, setF] = useState<"all" | "att" | "res">("all");
  const shown = list.filter((a) => f === "all" || a.st === f);
  return (
    <div className="pb-6">
      <TopBar go={go} back="home" title="Alerts" />
      <div className="px-4">
        <h1 className="text-[26px] font-extrabold">Feline <Serif>Alerts</Serif></h1>
        <Pill className="mt-1 bg-lime">● AI Live Monitored</Pill>
        <p className="mt-2 text-xs text-muted-foreground">Behavioral deviations flagged from acoustic sensors & motion telemetry.</p>
        <div className="mt-3 flex gap-2">
          {([["all", "All", list.length], ["att", "Attention", list.filter((a) => a.st === "att").length], ["res", "Resolved", list.filter((a) => a.st === "res").length]] as const).map(([k, l, n]) => (
            <button key={k} onClick={() => setF(k)} className={cn("press rounded-full px-4 py-2 text-xs font-bold", f === k ? "bg-ink text-ink-foreground" : "bg-card shadow-sm")}>{l} {n}</button>
          ))}
        </div>
        {shown.map((a, i) => (
          <Card key={a.id + f} className={cn("mt-3", a.c, a.st === "res" && "opacity-90")} d={i}>
            <p className="flex justify-between text-xs font-bold"><span><Icon n={a.icon} className="!text-sm" /> {a.tag}</span>{a.st === "res" && <Icon n="check_circle" fill className="!text-base text-lime-deep" />}</p>
            <p className="mt-1 font-extrabold">{a.title}</p>
            <p className="text-[11px] text-muted-foreground"><Icon n="schedule" className="!text-xs" /> {a.time}</p>
            <p className="mt-2 text-xs">{a.body}</p>
            {a.id === 1 && <div className="mt-2"><Meter pct={65} className="bg-warn" /><p className="mt-1 text-[10px]">65% vs typical • Sensor: Collar Node #1</p></div>}
            {a.st === "att" ? (
              <div className="mt-3 flex gap-2">
                <button onClick={() => setList(list.map((x) => (x.id === a.id ? { ...x, st: "res" } : x)))} className="press flex-1 rounded-full bg-card py-2 text-xs font-bold"><Icon n="done" className="!text-sm" /> Mark as Read</button>
                <button onClick={() => go(a.id === 2 ? "sound" : "health")} className="press flex-1 rounded-full bg-ink py-2 text-xs font-bold text-ink-foreground"><Icon n={a.id === 2 ? "volume_up" : "query_stats"} className="!text-sm" /> {a.id === 2 ? "Analyze Clip" : "Compare"}</button>
              </div>
            ) : <p className="mt-2 text-[10px] text-muted-foreground"><Icon n="task_alt" className="!text-xs" /> Marked resolved</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Profile({ go }: { go: Go }) {
  const [t, setT] = useState({ a: true, b: true, c: true, d: true, e: false });
  const Tog = ({ k }: { k: keyof typeof t }) => (
    <button onClick={() => setT({ ...t, [k]: !t[k] })} className={cn("press relative h-6 w-11 shrink-0 rounded-full transition-colors", t[k] ? "bg-lime-deep" : "bg-muted")}><span className={cn("absolute top-0.5 size-5 rounded-full bg-card shadow transition-all", t[k] ? "left-5" : "left-0.5")} /></button>
  );
  const Row = ({ title, sub, k }: { title: string; sub: string; k: keyof typeof t }) => (
    <div className="mt-3 flex items-center gap-3"><div className="flex-1"><p className="text-sm font-bold">{title}</p><p className="text-xs text-muted-foreground">{sub}</p></div><Tog k={k} /></div>
  );
  return (
    <div>
      <TopBar go={go} />
      <div className="px-4">
        <h1 className="text-[26px] font-extrabold">Milo's <Serif>Profile</Serif></h1>
        <Card className="mt-3 bg-lilac text-center">
          <Pill className="bg-card"><Icon n="verified" className="!text-sm" /> Bio-Track Active</Pill>
          <img src={IMG.profile} alt="Milo" className="bob mx-auto mt-3 size-24 rounded-full object-cover ring-4 ring-card" />
          <p className="mt-2 text-xl font-extrabold">Milo <span className="text-sm">♂ Male</span></p>
          <p className="text-xs text-lilac-deep">British Shorthair • 2y 4m</p>
          <div className="mt-3 flex flex-wrap justify-center gap-2"><Pill className="bg-card"><Icon n="monitor_weight" className="!text-sm" /> 4.8 kg</Pill><Pill className="bg-card"><Icon n="roofing" className="!text-sm" /> Indoor Only</Pill><Pill className="bg-card"><Icon n="graphic_eq" className="!text-sm" /> #BS-449</Pill></div>
          <Btn variant="ink" className="mt-4" onClick={() => go("onboard")}><Icon n="edit" /> Edit Companion Details</Btn>
        </Card>
        <Card className="mt-3" d={1}>
          <p className="flex justify-between font-bold"><span><Icon n="psychology" /> AI Model & Precision</span><Pill className="bg-lime">Pro Neural</Pill></p>
          <Row title="Real-time Acoustic Isolation" sub="Filters ambient TV, human voices, and echoes" k="a" />
          <Row title="Frame-by-frame Gait Symmetry" sub="Computer vision limping and jump landing checks" k="b" />
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-muted p-3"><div><p className="text-sm font-bold">Sensitivity Tuning</p><p className="text-xs text-muted-foreground">Normal (Recommended for shorthairs)</p></div><Icon n="chevron_right" /></div>
        </Card>
        <Card className="mt-3" d={2}>
          <p className="font-bold"><Icon n="notifications_active" /> Notifications & Alerts</p>
          <Row title="Sudden Lethargy Warning" sub="Instant push if inactivity exceeds normal delta" k="c" />
          <Row title="Vocal Pitch Anomaly Alert" sub="Triggers on high-stress frequency bands > 2.8kHz" k="d" />
          <Row title="Weekly Behavioral Digest" sub="Comprehensive acoustic & mood review" k="e" />
        </Card>
        <Card className="mt-3" d={3}>
          <p className="font-bold"><Icon n="straighten" /> Device & Data Units</p>
          <div className="mt-3 flex justify-between text-sm"><span>Units & Time Format</span><b>kg / 24h</b></div>
          <div className="mt-3 flex justify-between text-sm"><span>Local Video Privacy</span><Pill className="bg-mint"><Icon n="lock" className="!text-sm" /> Encrypted</Pill></div>
          <div className="mt-3"><p className="text-xs text-muted-foreground">Storage used 1.2 / 5 GB</p><Meter pct={24} /></div>
        </Card>
        <Card className="mt-3 bg-sky" d={4}>
          <p className="font-bold"><Icon n="local_hospital" /> Connected Care & Account</p>
          <div className="mt-3 flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-card"><Icon n="stethoscope" /></span><div className="flex-1"><p className="text-sm font-bold">Dr. Sarah Lin, DVM</p><p className="text-xs text-muted-foreground">Whisker Valley Clinic</p></div><Icon n="chevron_right" /></div>
          <Btn variant="ghost" className="mt-4" onClick={() => go("welcome")}><Icon n="logout" /> Sign Out</Btn>
        </Card>
      </div>
      <BottomNav cur="profile" go={go} />
    </div>
  );
}
