import { useState } from "react";
import { IMG } from "@/lib/imgs";
import { cn } from "@/lib/utils";
import { Avatar, Bars, BottomNav, Btn, Card, Icon, Meter, Pill, Serif, TopBar, Wave, type Go } from "./ui";

export function Welcome({ go }: { go: Go }) {
  return (
    <div className="flex min-h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5"><span className="h-1.5 w-8 rounded-full bg-lime" /><span className="size-1.5 rounded-full bg-muted" /><span className="size-1.5 rounded-full bg-muted" /></div>
        <button onClick={() => go("signup")} className="press rounded-full bg-muted px-3 py-1 text-xs font-bold">Skip</button>
      </div>
      <div className="float-in relative mt-4">
        <img src={IMG.hero} alt="Cat" className="h-80 w-full rounded-[2rem] object-cover" />
        <Pill className="absolute left-3 top-3 bg-card"><Icon n="graphic_eq" className="!text-sm" /> AI LIVE DECODE</Pill>
        <div className="bob absolute -right-1 top-6 flex items-center gap-1 rounded-full bg-lime px-3 py-1.5 text-xs font-bold shadow-lg"><Icon n="volume_up" className="!text-base" /> 420Hz • Alert Meow</div>
        <div className="bob absolute -bottom-4 left-3 flex items-center gap-2 rounded-2xl bg-lilac px-3 py-2 shadow-lg" style={{ animationDelay: "1s" }}>
          <Wave n={4} className="h-4 text-lilac-deep" />
          <div><p className="text-[10px] font-bold text-lilac-deep">AUDIO MOOD</p><p className="text-xs font-bold">Hunting Mind 94% 🎯</p></div>
        </div>
      </div>
      <Pill className="float-in mt-8 w-fit" ><Icon n="auto_awesome" className="!text-sm" /> ACOUSTIC NEURAL ENGINE</Pill>
      <h1 className="float-in mt-3 text-[32px] font-extrabold leading-[38px] tracking-tight" style={{ animationDelay: "100ms" }}>Understand what your cat <Serif>feels</Serif> every single day</h1>
      <p className="mt-3 text-sm text-muted-foreground">Record a quick 30-second clip. Our pet behavioral AI breaks down posture, micro-pitch vocal patterns, and daily habits.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-3 text-xs">
        <div className="flex items-center gap-2"><Icon n="verified" className="text-lime-deep" /><div><b>98.2% Accurate</b><p className="text-muted-foreground">Ethologist vetted</p></div></div>
        <div className="flex items-center gap-2"><Icon n="pets" className="text-lilac-deep" /><div><b>40+ Vocals</b><p className="text-muted-foreground">Cataloged sounds</p></div></div>
      </div>
      <div className="mt-auto pt-6"><Btn onClick={() => go("signup")}>Get Started <Icon n="arrow_forward" /></Btn></div>
      <p className="mt-3 text-center text-xs text-muted-foreground">Already a parent? <button onClick={() => go("signup")} className="font-bold text-foreground underline">Skip to Sign In</button></p>
    </div>
  );
}

export function Signup({ go }: { go: Go }) {
  const [tab, setTab] = useState<"c" | "l">("c");
  const [show, setShow] = useState(false);
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <button onClick={() => go("welcome")} className="press grid size-10 place-items-center rounded-full bg-card shadow-sm"><Icon n="arrow_back_ios_new" className="!text-base" /></button>
        <div className="flex items-center gap-2"><img src={IMG.logo} alt="" className="size-7 rounded-full" /><b>CatSense AI</b></div>
        <span className="size-2 rounded-full bg-lime" />
      </div>
      <Pill className="float-in mt-5 bg-lilac text-lilac-deep">🐾 AI Feline Acoustics</Pill>
      <h1 className="float-in mt-3 text-[32px] font-extrabold leading-[38px]">Join the <Serif>family</Serif> <Avatar size={36} /> of happy cats</h1>
      <p className="mt-2 text-sm text-muted-foreground">Track wellness, understand behaviors, and catch early symptoms.</p>
      <div className="mt-5 flex rounded-full bg-muted p-1 text-sm font-semibold">
        {(["c", "l"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("press flex-1 rounded-full py-2.5 transition-colors", tab === t && "bg-card shadow-sm")}>{t === "c" ? "Create Account" : "Log In"}</button>
        ))}
      </div>
      <Btn variant="ghost" className="mt-4" onClick={() => go("onboard")}><span className="font-extrabold text-lilac-deep">G</span> Continue with Google</Btn>
      <p className="my-3 text-center text-xs text-muted-foreground">or with email</p>
      <label className="text-xs font-bold">Email address</label>
      <div className="mt-1 flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-sm"><Icon n="alternate_email" className="text-muted-foreground" /><input className="w-full bg-transparent text-sm outline-none" placeholder="purrfect_owner@domain.com" /></div>
      <div className="mt-4 flex justify-between text-xs"><b>Password</b><span className="text-muted-foreground">Min. 8 characters</span></div>
      <div className="mt-1 flex items-center gap-2 rounded-2xl bg-card px-4 py-3.5 shadow-sm"><Icon n="lock_outline" className="text-muted-foreground" /><input type={show ? "text" : "password"} defaultValue="meowmeow123" className="w-full bg-transparent text-sm outline-none" /><button onClick={() => setShow(!show)}><Icon n={show ? "visibility_off" : "visibility"} /></button></div>
      <p className="mt-4 text-xs text-muted-foreground">By continuing, you agree to our <u>Terms</u> and consent to cat audio telemetry processing.</p>
      <Btn className="mt-5" onClick={() => go("onboard")}>{tab === "c" ? "Create Account" : "Log In"} <Icon n="pets" /></Btn>
      <p className="mt-4 text-center text-xs text-muted-foreground">Already have an account? <button onClick={() => setTab("l")} className="font-bold text-foreground underline">Log In</button></p>
      <div className="mt-4 flex justify-center"><Pill className="bg-sky"><Icon n="verified_user" className="!text-sm" /> 100% Private & Vet-Reviewed Baseline</Pill></div>
    </div>
  );
}

export function Onboard({ go }: { go: Go }) {
  const [age, setAge] = useState(28);
  const [w, setW] = useState(4.8);
  const [hab, setHab] = useState("Indoor only");
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <button onClick={() => go("signup")} className="press grid size-10 place-items-center rounded-full bg-card shadow-sm"><Icon n="arrow_back" /></button>
        <div className="flex-1 px-3"><p className="text-[10px] font-bold text-muted-foreground">ONBOARDING</p><p className="text-xs font-bold">Step 2 of 2: Companion</p></div>
        <button onClick={() => go("empty")} className="press rounded-full bg-muted px-3 py-1.5 text-xs font-bold">Skip for now</button>
      </div>
      <div className="mt-3 flex gap-2"><span className="h-1.5 flex-1 rounded-full bg-lime" /><span className="grow-x h-1.5 flex-1 rounded-full bg-lime" /></div>
      <h1 className="float-in mt-5 text-[26px] font-extrabold leading-8">Tell us about your <Serif>cat</Serif> 🐾</h1>
      <p className="mt-2 text-sm text-muted-foreground">We tune behavioral sound waves and motion algorithms to their unique profile.</p>
      <div className="float-in mt-5 flex flex-col items-center">
        <div className="relative"><img src={IMG.onbCat} alt="Milo" className="size-28 rounded-full object-cover ring-4 ring-lime" /><span className="absolute -top-1 right-0 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold shadow">Bio-Ready</span><span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-ink text-ink-foreground"><Icon n="photo_camera" className="!text-base" /></span></div>
        <p className="mt-2 text-xs text-muted-foreground">Tap to replace Milo's photo</p>
      </div>
      <Card className="mt-5" d={1}>
        <div className="flex justify-between text-xs font-bold"><span><Icon n="badge" className="!text-sm" /> Cat's Name</span><span className="text-lime-deep">REQUIRED</span></div>
        <div className="mt-2 flex items-center rounded-2xl bg-muted px-4 py-3"><input defaultValue="Milo" className="w-full bg-transparent font-semibold outline-none" /><Icon n="check_circle" className="text-lime-deep" /></div>
      </Card>
      <Card className="mt-3" d={2}>
        <p className="text-xs font-bold"><Icon n="category" className="!text-sm" /> Breed Identification</p>
        <div className="mt-2 flex items-center justify-between rounded-2xl bg-muted px-4 py-3 font-semibold">British Shorthair <Pill className="bg-lilac text-lilac-deep">Acoustic A+</Pill><Icon n="expand_more" /></div>
      </Card>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Card d={3}>
          <p className="text-xs font-bold"><Icon n="cake" className="!text-sm" /> Age</p>
          <p className="mt-2 text-2xl font-extrabold">{Math.floor(age / 12)}y {age % 12}m</p>
          <p className="text-xs text-muted-foreground">Nov 2022</p>
          <div className="mt-3 flex items-center justify-between"><button onClick={() => setAge(Math.max(1, age - 1))} className="press grid size-8 place-items-center rounded-full bg-muted"><Icon n="remove" /></button><span className="text-xs">Adjust</span><button onClick={() => setAge(age + 1)} className="press grid size-8 place-items-center rounded-full bg-muted"><Icon n="add" /></button></div>
        </Card>
        <Card d={4}>
          <p className="flex justify-between text-xs font-bold"><span><Icon n="scale" className="!text-sm" /> Weight</span><span>KG</span></p>
          <p className="mt-2 text-2xl font-extrabold">{w.toFixed(1)}<span className="text-sm"> kg</span></p>
          <p className="text-xs text-muted-foreground">Healthy Range</p>
          <div className="mt-3 flex items-center justify-between"><button onClick={() => setW(Math.max(1, w - 0.1))} className="press grid size-8 place-items-center rounded-full bg-muted"><Icon n="remove" /></button><span className="text-xs">Scale</span><button onClick={() => setW(w + 0.1)} className="press grid size-8 place-items-center rounded-full bg-muted"><Icon n="add" /></button></div>
        </Card>
      </div>
      <Card className="mt-3" d={5}>
        <p className="flex justify-between text-xs font-bold"><span><Icon n="home_pin" className="!text-sm" /> Living Habitat</span><span className="text-lime-deep">Affects Vocal Range</span></p>
        <div className="mt-2 flex gap-1 rounded-full bg-muted p-1 text-xs font-semibold">
          {["Indoor only", "Hybrid mix", "Outdoor"].map((h) => <button key={h} onClick={() => setHab(h)} className={cn("press flex-1 rounded-full py-2", hab === h && "bg-lime")}>{h}</button>)}
        </div>
      </Card>
      <Card className="mt-3 bg-lilac" d={6}>
        <p className="text-sm font-bold"><Icon n="lightbulb" className="!text-base" /> Acoustic Calibration</p>
        <p className="mt-1 text-xs">CatSense AI calibrates activity benchmarks tailored specifically to <b>British Shorthair</b> habits and vocal harmonics.</p>
      </Card>
      <Btn variant="ink" className="mt-5" onClick={() => go("empty")}><span className="text-lime">Save & Enter Dashboard</span> <Icon n="arrow_forward" className="text-lime" /></Btn>
      <p className="mt-3 text-center text-[11px] text-muted-foreground"><Icon n="verified_user" className="!text-sm" /> Data encrypted and kept local to Milo's collar device</p>
    </div>
  );
}

export function Empty({ go }: { go: Go }) {
  return (
    <div>
      <TopBar go={go} />
      <div className="px-4">
        <div className="flex justify-between"><Pill className="bg-sky">NEW PET PROFILE</Pill><Pill>● Model Ready</Pill></div>
        <h1 className="mt-2 text-[26px] font-extrabold">Welcome, <Serif>Milo</Serif> <Avatar size={30} /></h1>
        <p className="text-sm text-muted-foreground">Let's build Milo's behavioral fingerprint together.</p>
        <Card className="relative mt-4 bg-lilac py-8 text-center">
          <Pill className="absolute right-4 top-4 rotate-6 bg-card">✨ 0 / 1 Sessions</Pill>
          <img src={IMG.milo} alt="" className="bob mx-auto mt-4 size-24 rounded-full object-cover" />
          <h2 className="mt-5 text-xl font-extrabold">No video analysis yet!</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-lilac-deep">Take a quick 20–30s video of Milo playing, napping, or meowing to unlock behavior insights and health baselines.</p>
          <Btn className="mx-auto mt-5 w-fit" onClick={() => go("analyze")}><Icon n="videocam" /> Record First Video 📹</Btn>
          <button onClick={() => go("analyze")} className="mt-3 text-xs text-lilac-deep"><Icon n="upload_file" className="!text-sm" /> Or choose existing clip from gallery</button>
        </Card>
        <Card className="mt-3 bg-sky" d={2}>
          <p className="flex items-center gap-2 text-sm font-bold"><Icon n="wb_sunny" /> Scientist's Capture Tip <Pill className="bg-card">99.4% Accuracy</Pill></p>
          <p className="mt-1 text-xs text-muted-foreground">Good natural daylight and capturing Milo's full spine and ear posture allows our acoustic neural net to calibrate instantly.</p>
        </Card>
        <div className="mt-5 flex justify-between"><b><Icon n="insights" /> Unlocks After 1st Scan</b><Pill>3 LOCKED FEATURES</Pill></div>
        <Card className="mt-3 opacity-80" d={3}>
          <p className="flex justify-between text-sm font-bold"><span><Icon n="schedule" /> Daily Mood Timeline</span><Pill>Awaiting Data</Pill></p>
          <div className="mt-3"><Bars data={[3, 5, 2, 6, 4, 5]} max={6} h={50} /></div>
          <p className="mt-2 text-xs text-muted-foreground">Hourly contentment, playful bursts, and nap cycles logged automatically.</p>
        </Card>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Card d={4}><p className="flex justify-between"><Icon n="graphic_eq" /><Icon n="lock" className="!text-base" /></p><p className="mt-2 text-sm font-bold">Vocalization Tracker</p><p className="text-xs text-muted-foreground">Acoustic pitch spectrum & meow translation.</p></Card>
          <Card d={5}><p className="flex justify-between"><Icon n="vital_signs" /><Icon n="lock" className="!text-base" /></p><p className="mt-2 text-sm font-bold">Health Baseline Gauge</p><p className="text-xs text-muted-foreground">Stress biomarkers, mobility, & coat alerts.</p><div className="mt-2"><Meter pct={4} /></div></Card>
        </div>
      </div>
      <BottomNav cur="empty" go={go} />
    </div>
  );
}

export function Home({ go }: { go: Go }) {
  return (
    <div>
      <TopBar go={go} />
      <div className="px-4">
        <p className="text-[11px] font-bold text-muted-foreground">BEHAVIORAL MONITOR ACTIVE</p>
        <div className="flex items-center justify-between"><h1 className="text-[26px] font-extrabold">Good morning, <Serif>Milo</Serif> <Avatar size={30} /></h1><button className="press grid size-10 place-items-center rounded-full bg-card shadow-sm"><Icon n="tune" /></button></div>
        <Card className="relative mt-4 bg-mint">
          <div className="bob absolute -top-3 right-4 rounded-full bg-lime px-3 py-1 text-[11px] font-bold shadow"><Icon n="music_note" className="!text-sm" /> Sound: Happy Purr (96%)</div>
          <div className="flex justify-between"><Pill className="bg-card">🟢 RISK: NORMAL</Pill><Pill className="bg-card">Updated 14m ago</Pill></div>
          <p className="mt-3 text-[11px] font-bold">CURRENT VIBE</p>
          <p className="text-lg font-extrabold">Playful & Content 🐾</p>
          <p className="text-xs text-muted-foreground">High acoustic harmony, gentle low-frequency purr patterns detected throughout the morning.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-card p-3"><p className="flex justify-between text-[10px] font-bold"><span>ACTIVITY LEVEL</span>82%</p><div className="my-2"><Meter pct={82} className="bg-lime" d={300} /></div><p className="text-[10px] text-muted-foreground">Optimal vitality window</p></div>
            <div className="rounded-2xl bg-card p-3"><p className="flex justify-between text-[10px] font-bold"><span>SLEEP & REST</span><Icon n="bedtime" className="!text-sm" /></p><p className="text-xl font-extrabold">14.2 <span className="text-xs">hrs</span></p><p className="text-[10px] text-muted-foreground">Target: 13-16 hrs/day</p></div>
          </div>
          <div className="mt-2 flex items-center justify-between rounded-2xl bg-card p-3"><div className="flex items-center gap-2"><Icon n="graphic_eq" className="text-lime-deep" /><div><p className="text-xs font-bold">Acoustic Balance</p><p className="text-[10px] text-muted-foreground">28 Hz stable resonance</p></div></div><Wave className="text-lime-deep" /></div>
          <Pill className="mt-3 bg-lilac"><Icon n="clean_hands" className="!text-sm" /> Grooming: 35 min • Ideal</Pill>
        </Card>
        <Btn className="mt-4" onClick={() => go("analyze")}><Icon n="auto_videocam" /> ✦ Analyze a New Video</Btn>
        <Card className="mt-4" d={2}>
          <div className="flex justify-between"><div><p className="font-bold">Weekly Engagement</p><p className="text-xs text-muted-foreground">Daily active play & roaming hours</p></div><Pill className="h-fit bg-peach"><Icon n="calendar_today" className="!text-sm" /> This Week</Pill></div>
          <div className="mt-4"><Bars data={[2.4, 3.2, 1.8, 4.1, 3.0, 4.6, 0.9]} hi={5} max={5} labels={["M", "T", "W", "T", "F", "S", "S"]} /></div>
          <div className="mt-3 flex justify-between text-xs"><span className="text-muted-foreground">Consistency Index</span><b className="text-lime-deep">+18% vs last week</b></div>
        </Card>
        <div className="mt-5 flex justify-between"><b>Recent Observations</b><button onClick={() => go("history")} className="text-xs font-bold">View Log</button></div>
        <Card className="mt-3 bg-peach" d={3}><p className="flex justify-between text-[10px] font-bold"><span><Icon n="restaurant" className="!text-sm" /> NUTRITION & WATER</span><span className="text-muted-foreground">2 days ago</span></p><p className="mt-1 font-bold">Appetite steady (+5%)</p><p className="text-xs text-muted-foreground">Bowl visits recorded 4 times per 24 hours. Hydration pacing remains optimal for Milo's weight bracket.</p></Card>
        <Card className="mt-3 bg-sky" d={4} onClick={() => go("behavior")}><p className="flex justify-between text-[10px] font-bold"><span>VIDEO BREAKDOWN</span><span className="text-muted-foreground">Yesterday 4:15 PM</span></p><p className="mt-1 font-bold">Milo spent 45% resting, 30% grooming, 25% playful.</p>
          <div className="mt-2 flex h-2 gap-1"><div className="grow-x rounded-full bg-lilac-deep" style={{ width: "45%" }} /><div className="grow-x rounded-full bg-lilac" style={{ width: "30%", animationDelay: "200ms" }} /><div className="grow-x rounded-full bg-lime" style={{ width: "25%", animationDelay: "400ms" }} /></div></Card>
        <Card className="mt-3" d={5}><p className="text-sm font-bold"><Icon n="lightbulb" className="text-lime-deep" /> CatSense Tip of the Day</p><p className="text-xs text-muted-foreground">Milo responds best to feather wand sessions at twilight.</p></Card>
      </div>
      <BottomNav cur="home" go={go} />
    </div>
  );
}
