import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============================================================
   ✏️  EDIT ONLY THIS BLOCK
   ============================================================
   Images: use a URL ("https://....gif") or a file inside your
   /public folder ("/kid.png"). If empty / broken, an emoji shows.
   Tip: PNG with transparent background looks best on the question screens.
*/
const CONFIG = {
  name: "Betu",
  from: "Shalini",

  // 0) BIRTHDAY DATE + COUNTDOWN (first screen)
  birthday: { day: 28, month: 11, label: "28 November" }, // month: 1-12
  lockUntilBirthday: false, // true = "Start" button stays locked until the birthday arrives 🔒
  countdownTitle: "Counting down to the big day",

  // 0b) SONG (first screen + floating button on every screen)
  //     Put your mp3 inside the /public folder, e.g. /public/birthday-song.mp3
  song: {
    src: "/inna-pyar.mp3",
    title: "Happy Birthday 💖",
  },

  // 1) QUESTION SC REENS (curved text + image + buttons)
  asks: [
    {
      top: "I have made something for you", // curved text ABOVE the image
      bottom: "Do you wanna see it?", // curved text BELOW the image (optional)
      image: "https://i.pinimg.com/originals/91/8e/4a/918e4a9a2f47418cba2f16f4ef7282be.gif",
      fallback: "🥹",
      buttons: [{ label: "YES" }, { label: "NO", type: "run" }], // "run" = dodges 😜
    },
    {
      top: "Are you really excited?",
      bottom: "",
      image: "https://i.pinimg.com/originals/25/a5/3b/25a53b1178ab60fe1bdd61ea3d35c61b.gif",
      fallback: "🤩",
      buttons: [{ label: "YES" }, { label: "YES" }],
    },
  ],

  // 2) BIRTHDAY CARD SCREEN
  card: {
    text: "Happy birthday! Wishing you a little bit of happiness, love, laughter, and joy today always.",
    photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkR9Z_UPeWAnslEL64DuKzneV0qZl3n8tCkUbuDzA_4A&s=10", // polaroid photo
    roundPhoto: "https://media.tenor.com/UZtcPpyQrn4AAAAM/gifskawai.gif", // round photo (bottom right)
    photoFallback: "📸",
    roundFallback: "😎",
  },

  // 3) GIFT BOX SCREEN  (3 boxes → each opens a different screen)
  gifts: {
    title: "Each gift has something for you..",
    hint: "Click on any one 👆",
    image: "", // optional: small image peeking at the bottom-right corner
    fallback: "🧸",
  },

  // 3a) GIFT 1 → wish screen
  wishScreen: {
    text: "May all the good things you've been waiting for finally find you this year 💌",
    image: "", // 👈 add a cute image / GIF
    fallback: "🥰",
  },

  // 3b) GIFT 2 → memories screen (photos hanging on a string)
  memories: {
    title: "MEMORIES",
    photos: [
      { src: "/shalini-memeories/1.jpeg", fallback: "📸" },
      { src: "/shalini-memeories/2.jpeg", fallback: "👯" },
      { src: "/shalini-memeories/3.jpeg", fallback: "🥰" },
      { src: "/shalini-memeories/4.jpeg", fallback: "🎀" },
      { src: "/shalini-memeories/5.jpeg", fallback: "🌸" },
      { src: "/shalini-memeories/6.jpeg", fallback: "🌸" },
    ],
  },

  // 3c) GIFT 3 → cake screen
  cake: {
    top: "Make a wish & blow the candles!",
  },

  // 4) FINAL LETTER (opens after all 3 gifts are opened)
  message:
    "Today is all about YOU! Thank you for being the person who makes every day brighter. I hope this year brings you endless smiles, big wins and all the happiness you deserve. 💖",
  wishes: [
    { emoji: "😊", title: "Happiness", text: "May every day bring you a reason to smile." },
    { emoji: "🚀", title: "Success", text: "May all your dreams turn into reality." },
    { emoji: "💪", title: "Health", text: "Stay strong, stay healthy, stay awesome." },
    { emoji: "🌍", title: "Adventures", text: "May this year take you to amazing places." },
  ],
};
/* ============================================================ */

const CONFETTI_COLORS = ["#ef4444", "#fbbf24", "#60a5fa", "#34d399", "#a78bfa", "#f472b6"];
const BALLOON_COLORS = ["#ef4444", "#f472b6", "#fbbf24", "#60a5fa", "#34d399", "#a78bfa", "#fb923c"];
const GIFT_IDS = ["wish", "memories", "cake"]; // gift 1, 2, 3

/* ---------- Curved text (SVG textPath, scales to any screen) ---------- */

const CURVES = {
  arch: { d: "M 20 190 Q 300 -30 580 190", vb: "0 0 600 220" }, // ⌒ rises in the middle
  smile: { d: "M 20 50 Q 300 250 580 50", vb: "0 0 600 190" }, // ⌣ dips in the middle
  rise: { d: "M 20 140 Q 300 150 580 50", vb: "0 0 600 190" }, // ↗ gentle upward slope
};

const CurvedText = ({ text, curve = "arch", size = 44, color = "#b91c1c", rotate = 0, className = "" }) => {
  const id = useMemo(() => "ct-" + Math.random().toString(36).slice(2), []);
  const c = CURVES[curve];
  return (
    <svg
      viewBox={c.vb}
      className={`bw-font w-full overflow-visible ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
      role="img"
      aria-label={text}
    >
      <defs>
        <path id={id} d={c.d} fill="none" />
      </defs>
      <text fontSize={size} fill={color} fontWeight="700" textAnchor="middle">
        <textPath href={`#${id}`} startOffset="50%">
          {text}
        </textPath>
      </text>
    </svg>
  );
};

/* ---------- Image / GIF with emoji fallback ---------- */

const Media = ({ src, fallback, className = "" }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={`bw-float flex items-center justify-center text-7xl sm:text-8xl ${className}`}>
        {fallback}
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={className} />;
};

/* ---------- Gingham corners ---------- */

const Corners = () => {
  const base = "bw-gingham pointer-events-none fixed z-[5] h-24 w-24 shadow-lg sm:h-44 sm:w-44 lg:h-60 lg:w-60";
  return (
    <>
      <div className={`${base} left-0 top-0 rounded-br-[100%]`} />
      <div className={`${base} right-0 top-0 rounded-bl-[100%]`} />
      <div className={`${base} bottom-0 left-0 rounded-tr-[100%]`} />
      <div className={`${base} bottom-0 right-0 rounded-tl-[100%]`} />
    </>
  );
};

/* ---------- Balloons ---------- */

const BalloonShape = ({ color, size }) => (
  <div className="flex flex-col items-center" style={{ width: size }}>
    <div
      style={{
        width: size,
        height: size * 1.2,
        borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%",
        background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.75) 0, rgba(255,255,255,0) 22%), ${color}`,
        boxShadow: "inset -6px -8px 14px rgba(0,0,0,.18)",
      }}
    />
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: "5px solid transparent",
        borderRight: "5px solid transparent",
        borderBottom: `9px solid ${color}`,
        marginTop: -2,
      }}
    />
    <div className="bw-sway" style={{ width: 2, height: size * 1.1, background: "rgba(0,0,0,.25)" }} />
  </div>
);

const RisingBalloons = ({ count = 12 }) => {
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: 3 + ((i * 97) / count) % 94,
        size: 34 + Math.random() * 30,
        delay: Math.random() * 8,
        duration: 9 + Math.random() * 7,
        color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      })),
    [count]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {items.map((b) => (
        <div
          key={b.id}
          className="bw-rise absolute"
          style={{
            left: `${b.left}%`,
            bottom: "-30%",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        >
          <BalloonShape color={b.color} size={b.size} />
        </div>
      ))}
    </div>
  );
};

/* ---------- Confetti ---------- */

const Confetti = ({ count = 80 }) => {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 3 + Math.random() * 3,
        size: 6 + Math.random() * 8,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        round: Math.random() > 0.5,
      })),
    [count]
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="bw-fall absolute -top-4"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: p.round ? "9999px" : "2px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

const useTypewriter = (text, speed = 35) => {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const t = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (i >= text.length) clearInterval(t);
    }, speed);
    return () => clearInterval(t);
  }, [text, speed]);
  return out;
};

/* ---------- Countdown hook (to the next 28 November) ---------- */

const useCountdown = () => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { day, month } = CONFIG.birthday;
  const d = new Date(now);
  let start = new Date(d.getFullYear(), month - 1, day); // birthday 00:00 this year
  const end = new Date(d.getFullYear(), month - 1, day + 1); // end of birthday
  const isBirthday = d >= start && d < end;
  if (d >= end) start = new Date(d.getFullYear() + 1, month - 1, day); // already passed → next year

  const diff = isBirthday ? 0 : Math.max(0, start.getTime() - d.getTime());
  return {
    isBirthday,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    mins: Math.floor((diff / 60000) % 60),
    secs: Math.floor((diff / 1000) % 60),
  };
};

/* ---------- Red pill button ---------- */

const PillButton = ({ children, onClick, onPointerEnter, style, disabled }) => (
  <button
    onClick={onClick}
    onPointerEnter={onPointerEnter}
    style={style}
    disabled={disabled}
    className="bw-font relative min-w-[105px] rounded-full bg-red-600 px-6 py-2 text-xl font-bold tracking-wide text-white
      shadow-[0_5px_0_#991b1b] transition-transform duration-200 hover:scale-105 active:translate-y-1
      active:shadow-[0_2px_0_#991b1b] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100
      sm:min-w-[140px] sm:px-8 sm:py-2.5 sm:text-3xl"
  >
    <span className="pointer-events-none absolute left-3 top-1.5 h-2 w-4 rounded-full bg-white/40 sm:left-4 sm:top-2" />
    <span className="underline decoration-2 underline-offset-4">{children}</span>
  </button>
);

const BackButton = ({ onClick }) => (
  <button
    onClick={onClick}
    className="bw-font relative z-20 mt-2 rounded-full border-2 border-red-600 bg-white/80 px-5 py-1.5 text-lg font-bold text-red-700
      shadow transition hover:scale-105 hover:bg-red-600 hover:text-white active:scale-95 sm:text-2xl"
  >
    ← Back to gifts
  </button>
);

/* ---------- Song: floating button (all screens) ---------- */

const SongFloat = ({ playing, onToggle }) => (
  <button
    onClick={onToggle}
    aria-label={playing ? "Pause song" : "Play song"}
    title={CONFIG.song.title}
    className="fixed right-3 top-3 z-40 grid h-12 w-12 place-items-center rounded-full border-2 border-white bg-red-600 text-2xl
      text-white shadow-lg transition hover:scale-110 active:scale-95 sm:right-5 sm:top-5 sm:h-14 sm:w-14"
  >
    <span className={playing ? "bw-spin" : ""}>{playing ? "🎵" : "🔇"}</span>
  </button>
);

/* ---------- Step 0: countdown + song ---------- */

const CountTile = ({ value, label }) => (
  <div className="bw-gingham rounded-2xl p-1.5 shadow-xl">
    <div className="flex w-[3.9rem] flex-col items-center rounded-xl bg-red-600 py-2.5 sm:w-24 sm:py-4">
      <span key={value} className="bw-font bw-pop text-3xl font-bold leading-none text-white sm:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="bw-font mt-1 text-[11px] text-red-100 sm:text-base">{label}</span>
    </div>
  </div>
);

const CountdownStep = ({ onStart, song }) => {
  const { days, hours, mins, secs, isBirthday } = useCountdown();
  const locked = CONFIG.lockUntilBirthday && !isBirthday;

  return (
    <div className="bw-up flex w-full max-w-xl flex-col items-center gap-3 text-center">
      {isBirthday && <Confetti count={70} />}

      <CurvedText
        text={isBirthday ? "It's the big day!" : CONFIG.countdownTitle}
        curve="arch"
        size={isBirthday ? 56 : 42}
        rotate={-5}
      />

      <h1 className="bw-script -mt-4 text-5xl leading-tight text-red-700 sm:-mt-6 sm:text-7xl">
        {CONFIG.name}
      </h1>
      <p className="bw-font -mt-2 text-2xl font-bold text-gray-900 sm:text-4xl">
         {CONFIG.birthday.label} 🎂
      </p>

      <div className="mt-2 flex items-center justify-center gap-2 sm:gap-4">
        <CountTile value={days} label="Days" />
        <CountTile value={hours} label="Hours" />
        <CountTile value={mins} label="Mins" />
        <CountTile value={secs} label="Secs" />
      </div>

      {/* song option */}
      {song.available && (
        <button
          onClick={song.toggle}
          className="bw-font mt-3 flex items-center gap-2 rounded-full border-2 border-red-600 bg-white/85 px-5 py-1.5 text-lg
            font-bold text-red-700 shadow transition hover:scale-105 hover:bg-red-600 hover:text-white active:scale-95 sm:text-2xl"
        >
          <span className={song.playing ? "bw-spin" : ""}>{song.playing ? "⏸" : "🎵"}</span>
          {song.playing ? "Pause song" : "Play birthday song"}
          <span className="hidden text-base opacity-70 sm:inline">· {CONFIG.song.title}</span>
        </button>
      )}

      <div className="mt-2">
        <PillButton onClick={onStart} disabled={locked}>
          {locked ? "Wait for the day 🔒" : "Start 🎁"}
        </PillButton>
      </div>
    </div>
  );
};

/* ---------- Step 1: question screen ---------- */

const AskStep = ({ step, onYes }) => {
  const [attempts, setAttempts] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const dodge = () => {
    setAttempts((a) => a + 1);
    const range = typeof window !== "undefined" && window.innerWidth < 640 ? 55 : 130;
    setPos({ x: (Math.random() - 0.5) * range * 2, y: (Math.random() - 0.5) * 70 });
  };

  return (
    <div className="bw-up flex w-full max-w-md flex-col items-center sm:max-w-xl">
      {step.top && <CurvedText text={step.top} curve="arch" size={step.top.length > 24 ? 40 : 52} rotate={-6} />}

      <div
        className="-mt-4 flex h-44 w-44 items-center justify-center sm:-mt-6 sm:h-60 sm:w-60"
        style={{ filter: "drop-shadow(0 0 0 #fff) drop-shadow(0 0 6px #fff) drop-shadow(0 6px 10px rgba(0,0,0,.2))" }}
      >
        <Media src={step.image} fallback={step.fallback} className="h-full w-full object-contain" />
      </div>

      {step.bottom && <CurvedText text={step.bottom} curve="rise" size={40} rotate={-6} className="-mt-2" />}

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
        {step.buttons.map((b, i) => {
          const isRun = b.type === "run";
          const giveUp = isRun && attempts >= 3; // after 3 dodges it gives up 😅
          return (
            <PillButton
              key={i}
              onPointerEnter={isRun && !giveUp ? dodge : undefined}
              onClick={isRun && !giveUp ? dodge : onYes}
              style={
                isRun
                  ? { transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform .25s ease" }
                  : undefined
              }
            >
              {giveUp ? "OK, YES 😅" : b.label}
            </PillButton>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- Step 2: birthday card ---------- */

const Sparkle = ({ className = "" }) => (
  <span className={`absolute select-none text-red-600 ${className}`} aria-hidden>
    ✦
  </span>
);

const CardStep = ({ onNext }) => {
  const c = CONFIG.card;
  return (
    <div className="bw-up relative w-full max-w-4xl overflow-hidden rounded-3xl border-4 border-white bg-[#faf7f4] shadow-2xl">
      <Confetti count={60} />

      {/* red organic blobs */}
      <div className="absolute -left-16 -top-16 h-44 w-44 rounded-full bg-red-600 sm:h-72 sm:w-72" />
      <div className="absolute -bottom-16 left-6 h-32 w-56 rounded-full bg-red-600 sm:h-44 sm:w-80" />
      <div className="absolute -right-14 top-24 h-64 w-36 rounded-[50%] bg-red-600 sm:-right-20 sm:h-96 sm:w-56" />

      <div className="relative  grid items-center gap-8 p-6 pt-10 sm:p-10 md:grid-cols-2">
        {/* left: text */}
        <div className="relative pl-1 pt-6 sm:pl-6">
          <Sparkle className="-top-1 left-14 text-xl sm:text-3xl" />
          <Sparkle className="left-1 top-4 text-sm sm:text-base" />
          <p className="font-serif text-lg font-semibold tracking-[0.35em] text-gray-900 sm:text-2xl">HAPPY</p>
          <h1 className="bw-script -mt-2 text-6xl leading-none text-gray-900 sm:text-8xl">Birthday</h1>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-stone-700 sm:text-sm">{c.text}</p>
          <p className="bw-font mt-2 text-lg font-bold text-red-700 sm:text-2xl"> {CONFIG.birthday.label}</p>

          <div
            className="mt-4 inline-block -rotate-2 bg-red-700 px-9 py-2 text-lg font-bold text-white shadow-md sm:text-2xl"
            style={{ clipPath: "polygon(0 0, 100% 0, 93% 50%, 100% 100%, 0 100%, 7% 50%)" }}
          >
            <span className="bw-font">{CONFIG.name}</span>
          </div>
          <div className="-mt-12 z-10 ml-auto mr-1 h-28 w-28 overflow-hidden rounded-full border-4 border-white bg-white shadow-xl sm:-mt-16 sm:h-40 sm:w-40">
            <Media src={c.roundPhoto} fallback={c.roundFallback} className="h-full w-full object-cover" />
          </div>

          <Sparkle className="-bottom-4 left-0 text-3xl sm:text-5xl" />
          <Sparkle className="-bottom-8 left-8 text-lg sm:text-2xl" />
        </div>

        {/* right: polaroid */}
        <div className="relative mx-auto w-full max-w-[18rem] sm:max-w-sm">
          <div className="relative rotate-3 bg-red-600 p-3 pb-10 shadow-xl sm:p-4 sm:pb-12">
            <span className="absolute -top-4 right-4 text-3xl" aria-hidden>
              📎
            </span>
            <div className="aspect-[4/3] w-full overflow-hidden bg-white">
              <Media src={c.photo} fallback={c.photoFallback} className="h-full w-full object-cover" />
            </div>
          </div>

          {/* click-me bubble */}
          <button
            onClick={onNext}
            aria-label="Click me"
            className="bw-pulse absolute -top-5 right-0 z-20 grid h-16 w-16 place-items-center rounded-full bg-pink-200 text-center
              text-[10px] font-extrabold leading-tight text-pink-600 shadow-lg sm:-right-4 sm:h-20 sm:w-20 sm:text-xs"
          >
            💌
            <br />
            CLICK
            <br />
            ME
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- Step 3: gift boxes ---------- */

const GiftBox = ({ opened, onClick, index }) => (
  <button
    onClick={onClick}
    aria-label={`Open gift ${index + 1}`}
    className={`relative w-[27%] max-w-[10rem] transition-transform duration-200 hover:scale-110 active:scale-95 ${
      opened ? "" : "bw-wiggle"
    }`}
    style={{ animationDelay: `${index * 0.3}s` }}
  >
    <svg viewBox="0 0 120 130" className="w-full overflow-visible drop-shadow-xl">
      {/* box body */}
      <rect x="15" y="55" width="90" height="65" rx="6" fill="#e07f84" />
      <rect x="52" y="55" width="16" height="65" fill="#c24f58" />
      {opened && (
        <text x="60" y="98" fontSize="30" textAnchor="middle">
          ✨
        </text>
      )}
      {/* lid + bow (flies off when opened) */}
      <g
        style={{
          transform: opened ? "translate(-8px,-38px) rotate(-16deg)" : "none",
          transformOrigin: "60px 48px",
          transition: "transform .6s cubic-bezier(.3,1.6,.5,1)",
        }}
      >
        <rect x="8" y="38" width="104" height="22" rx="5" fill="#ea9094" />
        <rect x="52" y="38" width="16" height="22" fill="#c24f58" />
        <ellipse cx="44" cy="30" rx="18" ry="11" fill="#d1626b" transform="rotate(-25 44 30)" />
        <ellipse cx="76" cy="30" rx="18" ry="11" fill="#d1626b" transform="rotate(25 76 30)" />
        <circle cx="60" cy="34" r="8" fill="#b4444d" />
      </g>
    </svg>
    <span className="bw-font mt-1 block text-center text-base font-bold text-red-700 sm:text-2xl">
      {opened ? "opened ✓" : `Gift ${index + 1}`}
    </span>
  </button>
);

const GiftsStep = ({ opened, onOpen, onFinal }) => {
  const g = CONFIG.gifts;
  const allOpened = opened.length === GIFT_IDS.length;
  return (
    <div className="bw-up relative flex w-full max-w-3xl flex-col items-center">
      <CurvedText text={g.title} curve="arch" size={g.title.length > 26 ? 38 : 48} rotate={-5} className="max-w-xl" />

      <div className="mt-2 flex w-full items-end justify-center gap-3 sm:gap-8">
        {GIFT_IDS.map((id, i) => (
          <GiftBox key={id} index={i} opened={opened.includes(id)} onClick={() => onOpen(id)} />
        ))}
      </div>

      {!allOpened ? (
        <p className="bw-font mt-4 -rotate-2 text-2xl font-bold text-red-700 sm:text-4xl">{g.hint}</p>
      ) : (
        <div className="mt-5 flex flex-col items-center gap-2">
          <p className="bw-font text-xl font-bold text-red-700 sm:text-2xl">You opened them all! 🥳</p>
          <PillButton onClick={onFinal}>💌 Last surprise</PillButton>
        </div>
      )}

      {(g.image || g.fallback) && (
        <div className="pointer-events-none absolute -bottom-10 -right-2 h-20 w-20 sm:-right-24 sm:bottom-0 sm:h-32 sm:w-32">
          <Media src={g.image} fallback={g.fallback} className="h-full w-full object-contain" />
        </div>
      )}
    </div>
  );
};

/* ---------- Gift 1: wish screen ---------- */

const WishStep = ({ onBack }) => {
  const w = CONFIG.wishScreen;
  return (
    <>
      <div className="pointer-events-none fixed -left-24 top-[18%] z-[1] h-72 w-48 rounded-[50%] bg-orange-600 sm:h-[26rem] sm:w-64" />
      <div className="bw-up flex w-full max-w-4xl flex-col items-center gap-2">
        <div className="flex w-full flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between sm:gap-8">
          <p className="bw-font -rotate-6 px-2 text-center text-3xl font-bold leading-snug text-red-700 sm:text-left sm:text-5xl lg:text-6xl">
            {w.text}
          </p>
          <div
            className="h-40 w-40 shrink-0 sm:h-64 sm:w-64"
            style={{ filter: "drop-shadow(0 0 6px #fff) drop-shadow(0 6px 10px rgba(0,0,0,.2))" }}
          >
            <Media src={w.image} fallback={w.fallback} className="h-full w-full object-contain" />
          </div>
        </div>
        <BackButton onClick={onBack} />
      </div>
    </>
  );
};

/* ---------- Gift 2: memories screen ---------- */

const LETTER_STYLES = [
  { bg: "#dc2626", color: "#fff", rot: -6, font: "serif" },
  { bg: "#fff", color: "#b91c1c", rot: 4, font: "sans" },
  { bg: "#fecaca", color: "#7f1d1d", rot: -3, font: "script" },
  { bg: "#b91c1c", color: "#fde68a", rot: 5, font: "serif" },
  { bg: "#fff", color: "#dc2626", rot: -5, font: "sans" },
  { bg: "#fca5a5", color: "#fff", rot: 3, font: "serif" },
  { bg: "#dc2626", color: "#fff", rot: -4, font: "script" },
  { bg: "#fff", color: "#7f1d1d", rot: 6, font: "sans" },
];
const FONT_MAP = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Impact, 'Arial Black', sans-serif",
  script: "'Great Vibes', cursive",
};

const RansomTitle = ({ text }) => (
  <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
    {text.split("").map((ch, i) => {
      const s = LETTER_STYLES[i % LETTER_STYLES.length];
      return (
        <span
          key={i}
          className="inline-block px-1.5 py-0.5 text-3xl font-extrabold leading-none shadow-md sm:px-2.5 sm:py-1 sm:text-6xl"
          style={{ background: s.bg, color: s.color, transform: `rotate(${s.rot}deg)`, fontFamily: FONT_MAP[s.font] }}
        >
          {ch}
        </span>
      );
    })}
  </div>
);

const MemoriesStep = ({ onBack }) => {
  const m = CONFIG.memories;
  const rots = [-4, 3, -2, 4, -3, 2];
  const drops = [0, 14, 2, 12, 0, 10];
  return (
    <div className="bw-up relative flex w-full max-w-5xl flex-col items-center gap-5">
      <RansomTitle text={m.title} />

      <div className="relative w-full">
        {/* red string (large screens, where all photos sit in one row) */}
        <svg viewBox="0 0 1000 80" preserveAspectRatio="none" className="absolute left-0 top-2 hidden h-16 w-full lg:block">
          <path d="M0 10 Q 250 70 500 30 T 1000 20" stroke="#b91c1c" strokeWidth="3" fill="none" />
        </svg>

        {/* phone: 2 per row · tablet: 3 per row · desktop: all in one row */}
        <div className="flex flex-wrap justify-center gap-5 pt-6 sm:gap-6 lg:flex-nowrap lg:gap-3 lg:pt-8">
          {m.photos.map((p, i) => (
            <div
              key={i}
              className="relative w-[42%] sm:w-[28%] lg:w-[15%]"
              style={{ transform: `rotate(${rots[i % rots.length]}deg)`, marginTop: drops[i % drops.length] }}
            >
              {/* clothespin */}
              <span className="absolute -top-4 left-1/2 z-10 h-8 w-3 -translate-x-1/2 rounded bg-amber-200 shadow ring-1 ring-amber-300" />
              <div className="bw-gingham p-2 shadow-xl sm:p-2.5">
                <div className="aspect-[3/4] overflow-hidden bg-white">
                  <Media src={p.src} fallback={p.fallback} className="h-full w-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="bw-font text-2xl text-red-700 sm:text-3xl" aria-hidden>
        🎀 📷 ❤️ 🌺
      </p>
      <BackButton onClick={onBack} />
    </div>
  );
};

/* ---------- Gift 3: cake screen ---------- */

const CakeStep = ({ onBack }) => {
  const [blown, setBlown] = useState(false);
  return (
    <div className="bw-up flex w-full max-w-md flex-col items-center gap-3 sm:max-w-xl">
      {blown && <Confetti count={90} />}
      <CurvedText
        text={blown ? "Yayyy! Wish granted!" : CONFIG.cake.top}
        curve="arch"
        size={blown ? 52 : 40}
        rotate={-5}
      />

      <div className="relative -mt-2 flex flex-col items-center">
        <div className="flex gap-4 sm:gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <span
                className={`text-3xl transition-all duration-500 sm:text-4xl ${blown ? "scale-0 opacity-0" : "bw-flicker"}`}
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                🔥
              </span>
              <div className="h-8 w-2 rounded bg-yellow-200 sm:h-10 sm:w-2.5" />
            </div>
          ))}
        </div>
        <div className="h-8 w-44 rounded-t-2xl bg-pink-300 sm:h-10 sm:w-60" />
        <div className="h-10 w-52 bg-pink-400 sm:h-12 sm:w-72" />
        <div className="h-12 w-60 rounded-b-2xl bg-red-500 sm:h-14 sm:w-80" />
        <div className="h-2 w-72 rounded-full bg-white/80 shadow sm:w-96" />
      </div>

      {!blown ? (
        <PillButton onClick={() => setBlown(true)}>Blow 💨</PillButton>
      ) : (
        <p className="bw-font text-xl font-bold text-red-700 sm:text-3xl">Happy Birthday {CONFIG.name} 🎂💖</p>
      )}
      <BackButton onClick={onBack} />
    </div>
  );
};

/* ---------- Final: handwritten paper letter ---------- */

// zig-zag "torn paper" bottom edge
const TORN_EDGE = `polygon(0 0, 100% 0, ${Array.from({ length: 25 }, (_, i) => `${100 - i * 4}% ${i % 2 ? 98.2 : 100}%`).join(", ")}, 0 100%)`;

// real-paper look: ruled lines + red margin line + soft stains + paper grain
const PAPER_STYLE = {
  backgroundColor: "#fffdf5",
  backgroundImage: [
    "linear-gradient(to right, transparent 44px, rgba(220,38,38,.35) 44px, rgba(220,38,38,.35) 46px, transparent 46px)",
    "repeating-linear-gradient(to bottom, transparent 0, transparent 31px, rgba(96,165,250,.38) 31px, rgba(96,165,250,.38) 32px)",
    "radial-gradient(circle at 85% 12%, rgba(217,119,6,.10), transparent 38%)",
    "radial-gradient(circle at 10% 90%, rgba(217,119,6,.10), transparent 40%)",
    "repeating-linear-gradient(45deg, rgba(120,90,40,.025) 0, rgba(120,90,40,.025) 2px, transparent 2px, transparent 5px)",
  ].join(", "),
  backgroundPosition: "0 0, 0 0, 0 0, 0 0, 0 0",
  backgroundSize: "100% 100%, 100% 100%, 100% 100%, 100% 100%, auto",
  clipPath: TORN_EDGE,
};

const RevealStep = ({ restart }) => {
  const typed = useTypewriter(CONFIG.message, 40);
  const done = typed.length === CONFIG.message.length;
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!done || shown >= CONFIG.wishes.length) return;
    const t = setTimeout(() => setShown((s) => s + 1), 450);
    return () => clearTimeout(t);
  }, [done, shown]);

  const allShown = shown >= CONFIG.wishes.length;
  const chipRot = [-3, 2, -2, 3];

  return (
    <div className="bw-up flex w-full max-w-md flex-col items-center gap-5 sm:max-w-lg">
      <Confetti count={90} />

      {/* wrapper carries the drop shadow (clip-path would cut a box-shadow) */}
      <div className="relative w-full -rotate-1" style={{ filter: "drop-shadow(0 16px 16px rgba(0,0,0,.28))" }}>
        {/* tape */}
        <span className="absolute -top-3 left-6 z-20 h-6 w-20 -rotate-6 bg-amber-200/80 shadow-sm ring-1 ring-amber-300/60" />
        <span className="absolute -top-3 right-6 z-20 h-6 w-20 rotate-6 bg-amber-200/80 shadow-sm ring-1 ring-amber-300/60" />

        {/* paper */}
        <div className="relative pb-6 pl-[60px] pr-5 pt-4" style={PAPER_STYLE}>
          {/* postage stamp */}
          <div className="absolute right-4 top-4 flex h-16 w-14 rotate-6 flex-col items-center justify-center border-2 border-dashed border-red-500 bg-red-50 text-2xl sm:h-20 sm:w-16">
            🎂
            <span className="bw-font text-[10px] font-bold leading-none text-red-600">BDAY</span>
          </div>

          {/* date, written on the first ruled line */}
          <p className="bw-font text-xl text-red-400" style={{ lineHeight: "32px" }}>
            {CONFIG.birthday.label}
          </p>

          {/* "Dear ..." (2 ruled lines tall) */}
          <h2 className="bw-script pr-20 text-5xl leading-[64px] text-red-700 sm:text-6xl">Dear {CONFIG.name}</h2>

          {/* handwriting, locked to the ruled lines (32px) */}
          <p className="bw-font min-h-[128px] text-red-900" style={{ fontSize: 24, lineHeight: "32px" }}>
            {typed}
            {!done && <span className="animate-pulse">|</span>}
          </p>

          {/* short wish stickers (no long text) */}
          <div className="mt-4 flex flex-wrap gap-2.5">
            {CONFIG.wishes.map((w, i) => (
              <span
                key={w.title}
                className={`bw-font rounded-full border-2 border-dashed border-red-300 bg-white px-3 py-1 text-xl text-red-600 shadow-sm transition-all duration-500 ${
                  i < shown ? "scale-100 opacity-100" : "scale-50 opacity-0"
                }`}
                style={{ transform: i < shown ? `rotate(${chipRot[i % chipRot.length]}deg)` : undefined }}
              >
                {w.emoji} {w.title}
              </span>
            ))}
          </div>

          {/* signature */}
          <p
            className={`bw-script mt-3 text-right text-4xl leading-[64px] text-red-700 transition-opacity duration-700 sm:text-5xl ${
              allShown ? "opacity-100" : "opacity-0"
            }`}
          >
            Love, {CONFIG.from} 🤗
          </p>
        </div>
      </div>

      <button onClick={restart} className="text-sm text-stone-500 underline underline-offset-4 hover:text-red-500">
        🔁 Watch again
      </button>
    </div>
  );
};

/* ---------- Main ---------- */

const BirthdayWish = () => {
  const [step, setStep] = useState(0); // 0 = countdown
  const [sub, setSub] = useState(null); // "wish" | "memories" | "cake" | null (inside the gift screen)
  const [opened, setOpened] = useState([]);

  // ----- song -----
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [songOk, setSongOk] = useState(Boolean(CONFIG.song && CONFIG.song.src));

  const playSong = () => {
    const a = audioRef.current;
    if (!a) return;
    const p = a.play();
    if (p && p.catch) p.catch(() => {});
  };
  const pauseSong = () => audioRef.current && audioRef.current.pause();
  const toggleSong = () => (playing ? pauseSong() : playSong());

  // ----- steps -----
  const asks = CONFIG.asks;
  const cardIdx = asks.length + 1; // 0 = countdown, 1..n = questions
  const giftsIdx = asks.length + 2;
  const total = asks.length + 4; // countdown + asks + card + gifts + final

  const next = () => setStep((s) => Math.min(s + 1, total - 1));
  const start = () => {
    if (songOk && !playing) playSong(); // user tapped → browser allows sound
    next();
  };
  const openGift = (id) => {
    setSub(id);
    setOpened((o) => (o.includes(id) ? o : [...o, id]));
  };
  const restart = () => {
    setStep(0);
    setSub(null);
    setOpened([]);
  };

  let content;
  if (step === 0) content = <CountdownStep onStart={start} song={{ available: songOk, playing, toggle: toggleSong }} />;
  else if (step <= asks.length) content = <AskStep step={asks[step - 1]} onYes={next} />;
  else if (step === cardIdx) content = <CardStep onNext={next} />;
  else if (step === giftsIdx) {
    if (sub === "wish") content = <WishStep onBack={() => setSub(null)} />;
    else if (sub === "memories") content = <MemoriesStep onBack={() => setSub(null)} />;
    else if (sub === "cake") content = <CakeStep onBack={() => setSub(null)} />;
    else content = <GiftsStep opened={opened} onOpen={openGift} onFinal={next} />;
  } else content = <RevealStep restart={restart} />;

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#f4f1ee] px-4 py-16"
      style={{ minHeight: "100dvh" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gochi+Hand&family=Great+Vibes&display=swap');
        .bw-font { font-family: 'Gochi Hand', 'Comic Sans MS', cursive; }
        .bw-script { font-family: 'Great Vibes', 'Brush Script MT', cursive; }
        .bw-gingham {
          background-color: #fff;
          background-image:
            linear-gradient(90deg, rgba(220,38,38,.6) 50%, transparent 50%),
            linear-gradient(rgba(220,38,38,.6) 50%, transparent 50%);
          background-size: 26px 26px;
        }
        @keyframes bw-up { from { opacity:0; transform: translateY(24px);} to { opacity:1; transform:none;} }
        @keyframes bw-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-10px);} }
        @keyframes bw-fall { to { transform: translateY(110vh) rotate(720deg); } }
        @keyframes bw-rise { 0% { transform: translateY(0);} 100% { transform: translateY(-170vh);} }
        @keyframes bw-sway { 0%,100% { transform: rotate(-4deg);} 50% { transform: rotate(4deg);} }
        @keyframes bw-pulse { 0%,100% { transform: scale(1);} 50% { transform: scale(1.12);} }
        @keyframes bw-wiggle { 0%,100% { transform: rotate(-4deg);} 50% { transform: rotate(4deg) translateY(-6px);} }
        @keyframes bw-flicker { 0%,100% { transform: scale(1) rotate(-3deg);} 50% { transform: scale(1.2) rotate(3deg);} }
        @keyframes bw-pop { 0% { transform: scale(1.35); opacity:.4;} 100% { transform: scale(1); opacity:1;} }
        @keyframes bw-spin { to { transform: rotate(360deg); } }
        .bw-up { animation: bw-up .6s ease both; }
        .bw-float { animation: bw-float 3s ease-in-out infinite; }
        .bw-pulse { animation: bw-pulse 1.4s ease-in-out infinite; }
        .bw-wiggle { animation: bw-wiggle 1.6s ease-in-out infinite; }
        .bw-flicker { animation: bw-flicker .6s ease-in-out infinite; }
        .bw-pop { display: inline-block; animation: bw-pop .35s ease both; }
        .bw-spin { display: inline-block; animation: bw-spin 3s linear infinite; }
        .bw-fall { animation-name: bw-fall; animation-timing-function: linear; animation-iteration-count: infinite; }
        .bw-rise { animation-name: bw-rise; animation-timing-function: linear; animation-iteration-count: infinite; }
        .bw-sway { transform-origin: top center; animation: bw-sway 3s ease-in-out infinite; }
      `}</style>

      {/* birthday song (add your mp3 to /public and set CONFIG.song.src) */}
      {CONFIG.song && CONFIG.song.src && (
        <audio
          ref={audioRef}
          src={CONFIG.song.src}
          loop
          preload="auto"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setSongOk(false)}
        />
      )}

      <RisingBalloons />
      <Corners />

      {/* floating song button on every screen after the countdown */}
      {songOk && step > 0 && <SongFloat playing={playing} onToggle={toggleSong} />}

      <div key={`${step}-${sub}`} className="relative z-10 flex w-full justify-center">
        {content}
      </div>
    </div>
  );
};

export default BirthdayWish