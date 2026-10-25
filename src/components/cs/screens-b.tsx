import { useEffect, useState } from "react";
import { IMG } from "@/lib/imgs";
import { cn } from "@/lib/utils";
import { Avatar, Bars, BottomNav, Btn, Card, Icon, Meter, Pill, Serif, TopBar, Wave, type Go } from "./ui";

export function Analyze({ go }: { go: Go }) {
  const [batch, setBatch] = useState(false);
  return (
    <div>
      <TopBar go={go} />
      <div className="px-4">
        <p className="text-[11px] font-bold text-muted-foreground">ACOUSTIC & MOTION AI</p>
        <h1 className="text-[26px] font-extrabold">Analyze <Serif>Video</Serif></h1>
        <Card className="mt-3 flex items-center gap-3"><Avatar size={44} /><div className="flex-1"><b>Milo</b><p className="text-xs text-muted-foreground">British Shorthair</p></div><Pill className="bg-lilac"><Icon n="graphic_eq" className="!text-sm" /> 32-Bit Dual Mic</Pill></Card>
        <Card className="mt-3 flex items-center gap-3" d={1} onClick={() => setBatch(!batch)}><Icon n="layers" /><div className="flex-1"><p className="text-sm font-bold">Batch Analysis Mode</p><p className="text-xs text-muted-foreground">Combine up to 3 clips for day tracking</p></div><span className={cn("relative h-6 w-11 rounded-full transition-colors", batch ? "bg-lime-deep" : "bg-muted")}><span className={cn("absolute top-0.5 size-5 rounded-full bg-card shadow transition-all", batch ? "left-5" : "left-0.5")} /></span></Card>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card className="bg-lime" d={2}><Icon n="videocam" className="!text-3xl" /><p className="mt-2 font-bold">Record Live</p><p className="text-xs">Capture 15–30s of Milo in action or rest.</p><Pill className="mt-2 bg-card"><Icon n="timer" className="!text-sm" /> 15s to 30s</Pill><Btn variant="ink" className="mt-3 py-2.5 text-xs" onClick={() => go("processing")}><Icon n="play_circle" /> Start Camera</Btn></Card>
          <Card className="bg-lilac" d={3}><Icon n="drive_folder_upload" className="!text-3xl" /><p className="mt-2 font-bold">Upload Clip</p><p className="text-xs">Pick 1 or multiple clips from your camera roll.</p><Pill className="mt-2 bg-card"><Icon n="photo_library" className="!text-sm" /> MP4, MOV</Pill><Btn variant="ghost" className="mt-3 py-2.5 text-xs" onClick={() => go("processing")}><Icon n="add_photo_alternate" /> Choose Files</Btn></Card>
        </div>
        <Card className="mt-3 flex items-center gap-3" d={4} onClick={() => go("processing")}>
          <div className="relative"><img src={IMG.clip2} alt="" className="size-16 rounded-2xl object-cover" /><span className="absolute bottom-1 left-1 rounded bg-ink px-1 text-[10px] text-ink-foreground">0:28s</span></div>
          <div className="flex-1"><p className="text-[10px] font-bold text-warn">Unsaved Draft • 12 mins ago</p><p className="text-sm font-bold">Afternoon Window Chitter</p><p className="text-xs text-muted-foreground">Spectrogram synced • Ready to scan</p></div><Icon n="arrow_forward" />
        </Card>
        <Card className="mt-3 bg-sky" d={5}>
          <p className="flex justify-between font-bold"><span><Icon n="verified" /> Pro Tips for 99.8% AI Accuracy</span><span className="text-xs">Guide</span></p>
          {[["☀️", "Natural Lighting", "Avoid intense backlighting or deep room shadows so micro-pupil dilation is readable."], ["🐾", "Full Cat Visible", "Frame ears, whiskers, spine line, and tail flicking angle within the view."], ["🔇", "Quiet Room", "Mute TV and music so vocal harmonics are isolated cleanly."]].map(([e, t, d]) => (
            <div key={t} className="mt-3 flex gap-3"><span className="text-xl">{e}</span><div><p className="text-sm font-bold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div></div>
          ))}
        </Card>
      </div>
      <BottomNav cur="analyze" go={go} />
    </div>
  );
}

const steps = [
  ["Finding Milo in video", "Face and spatial landmarks locked"],
  ["Isolating acoustic soundwaves", "Spectrogram normalized (-18dB)"],
  ["Classifying posture & movement", "Analyzing frames..."],
  ["Generating veterinary baseline report", "Calibrated against 14,000+ felid profiles"],
];
export function Processing({ go }: { go: Go }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setP((v) => Math.min(100, v + 2)), 70);
    return () => clearInterval(t);
  }, []);
  useEffect(() => { if (p >= 100) { const t = setTimeout(() => go("results"), 500); return () => clearTimeout(t); } }, [p, go]);
  const done = Math.floor(p / 25);
  return (
    <div className="pb-6">
      <TopBar go={go} back="analyze" title="Processing" />
      <div className="px-4 text-center">
        <div className="relative mx-auto mt-4 grid size-52 place-items-center">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-dashed border-lime" style={{ animationDuration: "8s" }} />
          <div className="absolute inset-4 animate-ping rounded-full bg-lime/30" style={{ animationDuration: "2s" }} />
          <img src={IMG.milo} alt="" className="relative size-36 rounded-full object-cover" />
          <Pill className="bob absolute -right-2 top-6 bg-lilac">412 Hz</Pill>
          <Pill className="bob absolute -left-2 bottom-8 bg-lime" ><Icon n="graphic_eq" className="!text-sm" /> Bio-Track</Pill>
        </div>
        <h1 className="mt-6 text-[26px] font-extrabold">Decoding Milo's <Serif>moment</Serif>...</h1>
        <p className="text-sm text-muted-foreground">Our neural biomechanics engine is assembling behavioral markers</p>
      </div>
      <Card className="mx-4 mt-5">
        <div className="flex justify-between text-sm font-bold"><span><Icon n="sync" className="animate-spin" /> Analysis Pipeline</span><span>{p}% Complete</span></div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-lime-deep transition-all" style={{ width: `${p}%` }} /></div>
        {steps.map(([t, d], i) => {
          const st = i < done ? "done" : i === done ? "active" : "q";
          return (
            <div key={t} className="mt-4 flex items-center gap-3 text-left">
              <span className={cn("grid size-8 place-items-center rounded-full", st === "done" ? "bg-lime" : st === "active" ? "bg-lilac" : "bg-muted")}><Icon n={st === "done" ? "check" : st === "active" ? "bolt" : "radio_button_unchecked"} className="!text-base" /></span>
              <div className="flex-1"><p className="text-sm font-bold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div>
              <span className="text-[10px] font-bold text-muted-foreground">{st === "done" ? "✓" : st === "active" ? "Active" : "Queued"}</span>
            </div>
          );
        })}
      </Card>
      <Card className="mx-4 mt-3 bg-sky" d={2}><p className="text-sm font-bold"><Icon n="lightbulb" /> Feline Acoustic Fact</p><p className="text-xs">Did you know? Cats have over <b>20 distinct vocalizations</b>, ranging from soothing 25 Hz purrs to urgent 1,000 Hz distress chirps.</p></Card>
      <div className="mx-4 mt-4"><Btn variant="ghost" onClick={() => go("analyze")}><Icon n="close" /> Cancel Analysis</Btn></div>
    </div>
  );
}

export function Results({ go }: { go: Go }) {
  return (
    <div className="pb-6">
      <TopBar go={go} back="home" title="Results Overview" />
      <div className="px-4">
        <h1 className="text-[26px] font-extrabold">Analysis <Serif>Complete</Serif></h1>
        <div className="float-in relative mt-3">
          <img src={IMG.hero} alt="" className="h-48 w-full rounded-3xl object-cover" />
          <span className="press absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-card/90"><Icon n="play_arrow" fill className="!text-3xl" /></span>
          <Pill className="absolute bottom-3 left-3 bg-card"><Icon n="videocam" className="!text-sm" /> Today 10:42 AM • 0:34s</Pill>
          <Pill className="absolute right-3 top-3 bg-lime">AI Tracked</Pill>
        </div>
        <Card className="mt-3 bg-lime" d={1} onClick={() => go("behavior")}><p className="flex justify-between text-sm font-bold"><span><Icon n="pets" /> Physical Behavior</span><Pill className="bg-card">98.2% Match</Pill></p><p className="mt-1 text-lg font-extrabold">Primary: Playful Roaming (54%)</p><p className="text-xs">High vitality, tail upright with slight curve indicating joy & inquisitive focus.</p></Card>
        <Card className="mt-3 bg-lilac" d={2} onClick={() => go("sound")}><p className="text-sm font-bold"><Icon n="graphic_eq" /> Acoustic Mood</p><div className="flex items-center justify-between"><p className="text-lg font-extrabold">Content Purr 😻</p><Wave className="text-lilac-deep" /></div><p className="text-xs">Harmonic • Frequency: 28 Hz • 96% Audio Confidence</p></Card>
        <Card className="mt-3 bg-mint" d={3} onClick={() => go("health")}><p className="flex justify-between text-sm font-bold"><span><Icon n="favorite" /> Vitals & Posture Index</span><Pill className="bg-card">Optimal</Pill></p><p className="mt-1 font-extrabold">Risk Level: Normal (12/100)</p><div className="my-2"><Meter pct={12} /></div><p className="text-xs">Everything looks healthy, relaxed, and balanced. No subtle discomfort cues detected.</p></Card>
        <div className="mt-5 flex justify-between"><b>Detailed Diagnostics</b><Pill>3 Models Verified</Pill></div>
        {([["bar_chart", "Deep Behavior & Posture", "Skeletal tracking, gait symmetry & ear tilt", "behavior"], ["graphic_eq", "Vocalization & Waveform", "Spectrogram peaks, purr rate & pitch contour", "sound"], ["medical_services", "Health & Risk Comparison", "Historical baseline vs. breed standard averages", "health"]] as const).map(([i, t, d, s], k) => (
          <Card key={t} className="mt-3 flex items-center gap-3" d={4 + k} onClick={() => go(s)}><span className="grid size-10 place-items-center rounded-2xl bg-muted"><Icon n={i} /></span><div className="flex-1"><p className="text-sm font-bold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div><Icon n="chevron_right" /></Card>
        ))}
        <Btn variant="ink" className="mt-5" onClick={() => go("history")}><Icon n="bookmark_heart" /> Save to Milo's Diary</Btn>
      </div>
    </div>
  );
}

const segs = [
  { l: "Moving", c: "bg-lime", w: 35.3, t: "00:00–00:12", icon: "directions_walk", name: "Moving / Roaming", dur: "12.0s", conf: 97, pct: 38, d: "Casual perimeter patrol with steady cadenced gait and low-angle head orientation." },
  { l: "Grooming", c: "bg-lilac-deep", w: 20.6, t: "00:12–00:19", icon: "brush", name: "Grooming", dur: "7.0s", conf: 94, pct: 24, d: "Left shoulder & paw cleaning, calm repetitive rhythm. Minimal sensory startle response detected." },
  { l: "Resting", c: "bg-lilac", w: 20.6, t: "00:19–00:26", icon: "bedtime", name: "Resting", dur: "7.0s", conf: 91, pct: 20, d: "Semi-loaf posture, paws tucked, eyelids drooped at 60% relaxation threshold." },
  { l: "Alert", c: "bg-warn", w: 14.7, t: "00:26–00:31", icon: "notifications_active", name: "Standing / Alert", dur: "5.0s", conf: 88, pct: 12, d: "Sudden ear rotation toward window; upright stance with tail held still." },
  { l: "?", c: "bg-muted-foreground", w: 8.8, t: "00:31–00:34", icon: "help", name: "Unclassified", dur: "3.0s", conf: 62, pct: 6, d: "Partially out of frame; insufficient keypoints." },
];
export function Behavior({ go }: { go: Go }) {
  const [sel, setSel] = useState(1);
  const s = segs[sel];
  return (
    <div className="pb-6">
      <TopBar go={go} back="results" title="Behavior Detail" />
      <div className="px-4">
        <h1 className="text-[26px] font-extrabold">Behavior <Serif>Breakdown</Serif></h1>
        <p className="text-xs text-muted-foreground"><Icon n="videocam" className="!text-sm" /> Video duration: 0:34s • 5 distinct postures logged</p>
        <div className="float-in relative mt-3"><img src={IMG.clip3} alt="" className="h-44 w-full rounded-3xl object-cover" /><Pill className="absolute left-3 top-3 bg-card">Keyframe Snapshot: 00:15s</Pill><Pill className="absolute bottom-3 right-3 bg-lime">{s.conf}% {s.l}</Pill></div>
        <Card className="mt-3" d={1}>
          <p className="flex justify-between text-sm font-bold"><span>Temporal Acoustic & Motion Map</span><Pill className="bg-lime">Live Segment</Pill></p>
          <p className="mt-1 text-xs text-muted-foreground">{s.t} • {s.l} ({s.conf}%)</p>
          <div className="mt-3 flex h-10 gap-1">
            {segs.map((g, i) => (
              <button key={g.l} onClick={() => setSel(i)} className={cn("grow-x press rounded-xl text-[10px] font-bold", g.c, sel === i ? "ring-2 ring-ink ring-offset-2" : "opacity-80")} style={{ width: `${g.w}%`, animationDelay: `${i * 220}ms`, animationDuration: ".5s" }}>{g.l.slice(0, 4)}</button>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">{["00:00s", "00:12s", "00:19s", "00:26s", "00:34s"].map((t) => <span key={t}>{t}</span>)}</div>
        </Card>
        <Card className="mt-3" d={2}>
          <p className="text-sm font-bold">Proportional Density</p>
          {segs.slice(0, 4).map((g, i) => (
            <div key={g.l} className="mt-3"><div className="flex justify-between text-xs font-semibold"><span>{g.l}</span><span>{g.pct}%</span></div><div className="mt-1"><Meter pct={g.pct * 2.2} className={g.c} d={300 + i * 150} /></div></div>
          ))}
        </Card>
        <div className="mt-5 flex justify-between"><b>Logged State Breakdown</b><span className="text-xs text-muted-foreground">Tap to inspect</span></div>
        {segs.slice(0, 4).map((g, i) => (
          <Card key={g.l} className={cn("mt-3", sel === i && "ring-2 ring-lime")} d={3 + i} onClick={() => setSel(i)}>
            <div className="flex items-center gap-3"><span className={cn("grid size-10 place-items-center rounded-2xl", g.c)}><Icon n={g.icon} /></span><div className="flex-1"><p className="text-sm font-bold">{g.name} <span className="text-xs font-normal text-muted-foreground">{g.t}</span></p><p className="text-xs text-muted-foreground">{g.dur} duration • Confidence: {g.conf}%</p></div><b>{g.pct}%</b></div>
            {sel === i && <p className="float-in mt-2 text-xs text-muted-foreground">{g.d}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Health({ go }: { go: Go }) {
  const rows = [["water_drop", "Eating & Hydration", "On track (100% of average)", "check_circle"], ["directions_run", "Daily Activity", "3.4 hrs vs 3.2 hrs baseline (+6%)", "trending_up"], ["bedtime", "Resting & Sleep", "14.2 hrs vs 14.0 hrs baseline", "check_circle"], ["graphic_eq", "Vocal Pitch Stability", "Normal 26–32 Hz purr resonance", "check_circle"]];
  return (
    <div className="pb-6">
      <TopBar go={go} back="results" title="Health & Risk" />
      <div className="px-4">
        <p className="text-[11px] font-bold text-muted-foreground">BEHAVIORAL BIOMETRICS</p>
        <h1 className="text-[26px] font-extrabold">Health & <Serif>Vitality</Serif></h1>
        <Card className="mt-3 bg-mint text-center">
          <p className="flex justify-between text-xs font-bold"><span><Icon n="ecg_heart" className="!text-sm" /> Feline Risk Index</span><Pill className="bg-card"><Icon n="auto_awesome" className="!text-sm" /> Live AI Metric</Pill></p>
          <div className="relative mx-auto mt-4 size-40">
            <svg viewBox="0 0 100 100" className="size-full -rotate-90"><circle cx="50" cy="50" r="42" className="fill-none stroke-card" strokeWidth="10" /><circle cx="50" cy="50" r="42" className="fill-none stroke-lime-deep transition-all" strokeWidth="10" strokeLinecap="round" strokeDasharray="264" style={{ strokeDashoffset: 264, animation: "dash 1.2s .3s forwards" }} /></svg>
            <style>{"@keyframes dash{to{stroke-dashoffset:227}}"}</style>
            <div className="absolute inset-0 grid place-items-center"><p className="text-4xl font-extrabold">14<span className="text-sm">/100</span></p></div>
          </div>
          <p className="mt-2 font-bold">Status: Optimal Normal 🟢</p>
          <p className="text-xs text-muted-foreground">A low risk score indicates relaxed heart-rate surrogates and stable resting cadences.</p>
        </Card>
        <Card className="mt-3" d={1}>
          <p className="flex justify-between text-sm font-bold"><span><Icon n="compare_arrows" /> Milo's Baseline Drift</span><Pill className="bg-lime">99.2% Match</Pill></p>
          <p className="text-xs text-muted-foreground">Calculated over the last 30 days</p>
          {rows.map(([i, t, d, s], k) => (
            <div key={t} className="float-in mt-3 flex items-center gap-3" style={{ animationDelay: `${200 + k * 100}ms` }}><span className="grid size-9 place-items-center rounded-xl bg-muted"><Icon n={i} /></span><div className="flex-1"><p className="text-sm font-bold">{t}</p><p className="text-xs text-muted-foreground">{d}</p></div><Icon n={s} className="text-lime-deep" fill /></div>
          ))}
        </Card>
        <Card className="mt-3 bg-lilac" d={2}>
          <p className="text-sm font-bold"><Icon n="psychology" /> AI Behavioral Observations</p>
          {["Regular grooming cadence without over-licking", "Symmetry in four-paw gait during room crossing", "Zero distress vocal spikes detected"].map((o) => <p key={o} className="mt-2 text-xs">✓ {o}</p>)}
        </Card>
        <Card className="mt-3 bg-peach" d={3}><p className="text-xs">⚠️ <b>Not a veterinary diagnosis:</b> If you are worried or notice behavioral shifts, contact your veterinarian immediately.</p></Card>
        <Btn variant="ink" className="mt-4"><Icon n="picture_as_pdf" /> Export Vet Report</Btn>
      </div>
    </div>
  );
}

const classes = [["😸", "Happy", "Detected", 98], ["💤", "Resting", "Latent state", 1.2], ["🎯", "Hunting Mind", "Focus mode", 0.1], ["🍼", "Mother Call", "Kitten chirp", 0], ["🐾", "Mating", "Caterwaul", 0], ["⚠️", "Warning", "Low growl", 0.2], ["😾", "Angry", "Sharp hiss", 0], ["🛡️", "Defence", "Threat stance", 0], ["💥", "Fighting", "Screech/Yowl", 0], ["🩹", "Paining / Distress", "Negative", 0]] as const;
export function Sound({ go }: { go: Go }) {
  const [play, setPlay] = useState(true);
  return (
    <div className="pb-6">
      <TopBar go={go} back="results" title="Sound Analysis" />
      <div className="px-4">
        <p className="text-[11px] font-bold text-muted-foreground">ACOUSTIC AI ENGINE</p>
        <h1 className="text-[26px] font-extrabold">Acoustic <Serif>Decode</Serif></h1>
        <Card className="mt-3 bg-ink text-ink-foreground">
          <p className="text-sm font-bold"><Icon n="graphic_eq" className="text-lime" /> Vocal_Sample_042.wav</p>
          <p className="text-xs opacity-70">Recorded 4 mins ago • Living Room</p>
          <div className="mt-4 flex h-20 items-center gap-[3px]">
            {Array.from({ length: 40 }).map((_, i) => (
              <span key={i} className={cn("w-full rounded-full", i < 16 ? "bg-lime" : "bg-ink-foreground/30", play && "wave")} style={{ height: `${25 + Math.abs(Math.sin(i * 0.7)) * 75}%`, animationDelay: `${i * 0.05}s` }} />
            ))}
          </div>
          <p className="mt-2 flex justify-between text-[10px] opacity-70"><span>Peak: 480 Hz • Purr: 28 Hz</span><span>00:14 / 00:34</span></p>
          <div className="mt-3 flex items-center justify-center gap-6"><Icon n="replay_5" /><button onClick={() => setPlay(!play)} className="press grid size-12 place-items-center rounded-full bg-lime text-ink"><Icon n={play ? "pause" : "play_arrow"} fill /></button><Icon n="forward_5" /></div>
        </Card>
        <Card className="mt-3 bg-lime" d={1}>
          <p className="flex justify-between text-xs font-bold"><span>😺 Primary State • High certainty</span><span>98.2% Confidence</span></p>
          <p className="mt-1 text-xl font-extrabold">Happy & Affectionate</p>
          <p className="text-xs italic">“Milo is expressing deep comfort and positive social bonding with you.”</p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">{[["Rhythm", "Stable"], ["Cadence", "Low Soft"], ["Vocal Stress", "0.4%"]].map(([a, b]) => <div key={a} className="rounded-xl bg-card p-2"><p className="text-muted-foreground">{a}</p><b>{b}</b></div>)}</div>
        </Card>
        <div className="mt-5 flex justify-between"><b>Behavioral Spectrum <span className="text-xs text-muted-foreground">(10 Classes)</span></b><Pill>Real-time model</Pill></div>
        <Card className="mt-3" d={2}>
          {classes.map(([e, n, d, v], i) => (
            <div key={n} className={cn("flex items-center gap-3 py-2", i === 0 && "rounded-2xl bg-mint px-2")}>
              <span className="text-xl">{e}</span>
              <div className="flex-1"><p className="text-sm font-bold">{n}</p><p className="text-[11px] text-muted-foreground">{d}</p><div className="mt-1"><Meter pct={Math.max(v, 1)} d={i * 60} className={i === 0 ? "bg-lime-deep" : "bg-muted-foreground"} /></div></div>
              <span className="w-10 text-right text-xs font-bold">{v}%</span>
            </div>
          ))}
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-3"><Btn variant="ghost"><Icon n="ios_share" /> Share</Btn><Btn variant="ink"><Icon n="download" /> Export</Btn></div>
      </div>
    </div>
  );
}
