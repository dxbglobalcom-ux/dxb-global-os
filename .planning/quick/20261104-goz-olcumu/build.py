#!/usr/bin/env python3
"""Eye measurement (B84 decision 13): builds the walled packets and scores what comes back.

Design, fixed before any prediction was read:
- 20 pages, three jobs. One job is predicted blind, the other two teach (his class, his words, his
  pairs, his taste lines). Each job takes the blind seat once, so every pair is measured once and the
  question is the real one: does his taste carry to a job the eye has not seen.
- Control: the same blind job with no teaching at all.
- The number: of his 22 within-job "X is better than Y" statements, how many the eye's ranking repeats.
  Chance is 50 %. A permutation of random rankings gives how often chance reaches that number.

  build.py packets            -> ~/.cache/dxb-goz-olcumu/packets/<run>/  + key in ~/.cache/.../key.json
  build.py score              -> reads ~/.cache/dxb-goz-olcumu/out/<run>.json, prints the table
"""
import json, os, random, re, shutil, sys

CACHE = os.path.expanduser("~/.cache/dxb-goz-olcumu")
RAW, PK, OUT = CACHE + "/raw", CACHE + "/packets", CACHE + "/out"

JOBS = {
    "G1": ["p02", "p03", "p04", "p05", "p06", "p07", "p08", "p09"],
    "G2": ["p19", "p20", "p14", "p17", "p18", "p16"],
    "G3": ["p23", "p22", "p24", "p25", "p26", "p27"],
}
# Only his own statements (verdict table, section B). 02-vs-04 and 03-vs-04 are out: he retracted them.
PAIRS = {
    "G1": [("p02", "p06"), ("p03", "p06"), ("p04", "p06"), ("p05", "p06"), ("p02", "p05"), ("p03", "p05"),
           ("p04", "p07"), ("p09", "p07"), ("p08", "p07")],
    "G2": [("p19", "p14"), ("p20", "p14"), ("p17", "p14"), ("p18", "p14"), ("p18", "p17")],
    "G3": [("p22", "p25"), ("p23", "p25"), ("p22", "p23"), ("p26", "p22"), ("p26", "p27"), ("p26", "p23"),
           ("p26", "p24"), ("p26", "p25")],
}
CLASS = {"p02": "LIKED", "p03": "LIKED", "p04": "LIKED", "p05": "DISLIKED", "p06": "DISLIKED", "p07": "DISLIKED",
         "p08": "MIXED", "p09": "MIXED", "p19": "LIKED", "p20": "MIXED", "p14": "MIXED", "p17": "MIXED", "p18": "LIKED",
         "p16": "LIKED", "p23": "MIXED", "p22": "MIXED", "p24": "MIXED", "p25": "DISLIKED", "p26": "LIKED", "p27": "DISLIKED"}
# His words, with every name of a builder, a method or a letter taken out: a quote may only speak of the page.
WORDS = {
    "p02": "diğerlerine göre sanki daha iyi",
    "p03": "diğerlerine göre sanki daha iyi",
    "p04": "normal, fena değildi, işte iyiydi",
    "p05": "böyle bok gibi çıktı",
    "p06": "bu ne yaaaa · en boktan ürün bu mu çıktı bizde?",
    "p07": "görsel olarak böyle iğrenç, iğrenç ötesi yani… 100 yıl önce sanki yapılmış bir web siteydi",
    "p08": "çok daha iyi ama cidden ben çok daha iyi bekliyordum",
    "p09": "premium değil yani, böyle çocukça olmuş… genel anlamıyla fena değil… çocuk sitesi gibi",
    "p19": "çok daha güzel akışkan vs özellikleri yani websitesi landing page özellikleriyle geldi · akışkan hani böyle bir his var",
    "p20": "güzel taraflar var, özellikler var, alınabilir",
    "p14": "neden böyle boktan bir site oldu · diğerlerine nazaran kötü olmuş yani. Fena değil.",
    "p17": "artıları eksileri var",
    "p18": "bir tık daha güzel",
    "p16": "Mükemmel değil hala. Hani 7.5 falan 8 arası bir şey. Ama çok güzel oldu. Hani görsel anlamda.",
    "p23": "gül lalemi güzel yapılmış",
    "p22": "açık ara önde · sonra: tasarım falan çok da wow değil",
    "p24": "ufak tefek hatalar · çok estetik bir şekilde dönüyor",
    "p25": "hayal kırıklığı oldu biraz benim için · çok beğenmedim… belki normal düzeydeydi · koleksiyon güzel yapılmış",
    "p26": "Hero tam ekran. Yani ana sayfa çok güzel olmuş · flaw: o alakasız şey (the scrolling strip)",
    "p27": "Ben bunu beğenmedim · berbat yapmıştı",
}
# Taste lines; a line born in a job is left out when that job is the blind one.
TASTE = [
    (None, "Aksine gösterişli olmalı. Lüks olmalı. Açan wow demeli. (plainness, 'sade', 'minimalist' are banned words for his sites)"),
    (None, "En böyle bilinen markaların atıyorum Gucci, Louis Vuitton… Apple… Nike… en manyak web sitelerinin aslında özelliklerinin referanslarının alınması"),
    ("G1", "müşteri her zaman görsele bakıyor. En ilk etap."),
    ("G1", "premium değil yani, böyle çocukça — a defect in its own right"),
    ("G1", "Dünkü sayfaların krem bunlar güzel değildi ki zaten. Ben o yapısı itibariyle şeydi yani, böyle ikonlar falan filan."),
    ("G1", "Ben zaten resimsiz güzel olmasın, resim herkes güzel yapar."),
    ("G2", "altta slide kayan şeyler, işte akışkanlık, sayfalarda akışkanlık, böyle landing page'in tam özellikleri"),
    ("G3", "kaydırdıkça değişmiyor… Bir şey böyle bölünüp birleşmiyor (a fault) · Perde gibi açılıyor… Kaydırdıkça böyle smoothly bu beğendim (a merit)"),
    ("G2", "video herolu, hoverla, animasyonlu, 3d'li bir landing page"),
    ("G2", "Bir de akan banner koymamışlar… O da mesela beğendiğimiz şeylerden bir tanesiydi."),
    ("G2", "Böyle kare kare, piksel piksel duruyor. Yani bizim şeyde en kaliteli, en yüksek çözünürlükte üretme şansımız var"),
    ("G3", "Çiniciliği belli eden böyle sofistike güzel…"),
    ("G2", "yazı tipi birazcık böyle sanki büyük geldi bana"),
    ("G3", "resim boyutları böyle biri küçük biri ufak… saçma · dikdörtgen resimler taşıyor"),
]
IMAGES = ["hero.png", "sheet-desktop-1.jpg", "sheet-desktop-2.jpg", "sheet-phone-1.jpg"]
REFS = ["r1", "r2"]  # outletcity, Apple; Nike was behind its cookie wall, Gucci and Louis Vuitton refused the headless browser

HOW = """Each page folder holds what a visitor sees: hero.png (the first desktop screen), sheet-desktop-1.jpg and
sheet-desktop-2.jpg (a recorded desktop visit: frames in time order; 4 s untouched at the top, then a steady
scroll to the bottom; each frame is labelled with its time and phase), sheet-phone-1.jpg (the same on a phone),
numbers.json (motion measured with ffmpeg: frame-to-frame change at rest and while scrolling, scene cuts; the
pages were drawn by a software renderer, so the stutter figures are noisy and say nothing about smoothness on a
real machine). Read a page's four images in one step (several Read calls at once)."""

ANSWER = """Answer with one JSON object and nothing after it, no code fence:
{"rank": ["<id best>", ..., "<id worst>"], "class": {"<id>": "LIKED|MIXED|DISLIKED"}, "why": {"<id>": "one short line"}}
"rank" holds every page under blind/, best to worst as HE would order them, no ties."""


def brief(teach):
    head = ("You are predicting one person's taste in web pages. He is the CEO of a holding and judges pages by eye.\n"
            "The pages under blind/ are answers to one brief by different hands. He has judged them; you must "
            "predict how.\n\n" if teach else
            "A CEO judged the web pages under blind/. They are answers to one brief by different hands. "
            "Predict how he ordered them.\n\n")
    t = ""
    if teach:
        t = ("Under teach/ are pages from his other jobs. Each folder has verdict.txt with his class for that page and "
             "his words (Turkish, dictated; rough language is his). teach/PAIRS.txt lists what he said was better than "
             "what, within a job. His standards shift between jobs, so learn what he sees, not a score. taste.txt holds "
             "his general remarks. refs/ holds sites he names as the bar. Read all of these first.\n\n")
    return head + t + HOW + "\n\n" + ANSWER + "\n"


def copy_page(slug, dst):
    os.makedirs(dst)
    for f in IMAGES + ["numbers.json"]:
        src = f"{RAW}/{slug}/{f}"
        if os.path.exists(src):
            shutil.copy(src, dst)


def packets():
    shutil.rmtree(PK, ignore_errors=True)
    key = {}
    runs = [(g, True, r) for g in JOBS for r in (1, 2)] + [(g, False, 1) for g in JOBS]
    for g, teach, rep in runs:
        run = f"{g}-{'taught' if teach else 'control'}-{rep}"
        rng = random.Random(run + "-goz-2026-11-04")
        d = f"{PK}/{run}"
        os.makedirs(d)
        ids = rng.sample(range(100, 1000), 30)
        amap = {}
        pages = JOBS[g][:]
        rng.shuffle(pages)
        for s in pages:
            a = f"x{ids.pop()}"
            amap[a] = s
            copy_page(s, f"{d}/blind/{a}")
        if teach:
            names = {}
            pairs = []
            for og in JOBS:
                if og == g:
                    continue
                for s in JOBS[og]:
                    a = f"t{ids.pop()}"
                    names[s] = a
                    copy_page(s, f"{d}/teach/{a}")
                    with open(f"{d}/teach/{a}/verdict.txt", "w") as h:
                        h.write(f"class: {CLASS[s]}\nhis words: {WORDS[s]}\n")
                pairs += [f"{names[x]} better than {names[y]}" for x, y in PAIRS[og]]
            with open(f"{d}/teach/PAIRS.txt", "w") as h:
                h.write("\n".join(pairs) + "\n")
            with open(f"{d}/taste.txt", "w") as h:
                h.write("\n".join(f"- {t}" for j, t in TASTE if j != g) + "\n")
            for r in REFS:
                os.makedirs(f"{d}/refs/{r}")
                for f in ("hero.png", "sheet-desktop-1.jpg"):
                    shutil.copy(f"{RAW}/{r}/{f}", f"{d}/refs/{r}")
        with open(f"{d}/BRIEF.md", "w") as h:
            h.write(brief(teach))
        key[run] = amap
    json.dump(key, open(CACHE + "/key.json", "w"), indent=1)
    print("packets:", sorted(key))


def parse(path):
    txt = open(path).read()
    m = re.search(r'\{\s*"rank".*\}', txt, re.S)
    return json.loads(m.group(0))


def agree(order, pairs):
    pos = {s: i for i, s in enumerate(order)}
    return sum(1 for x, y in pairs if pos[x] < pos[y])


def score():
    key = json.load(open(CACHE + "/key.json"))
    res = {}
    for run, amap in key.items():
        p = f"{OUT}/{run}.json"
        if not os.path.exists(p) or not os.path.getsize(p):
            print("MISSING", run)
            continue
        a = parse(p)
        order = [amap[x] for x in a["rank"]]
        assert sorted(order) == sorted(amap.values()), run
        g = run[:2]
        hit = agree(order, PAIRS[g])
        cl = sum(1 for x, c in a["class"].items() if CLASS[amap[x]] == c)
        res[run] = dict(order=order, hit=hit, n=len(PAIRS[g]), cls=cl, ncls=len(amap))
        print(run, f"pairs {hit}/{len(PAIRS[g])}", f"class {cl}/{len(amap)}", " ".join(order))
    rng = random.Random(7)

    def chance(obs):
        c, N = 0, 100000
        for _ in range(N):
            t = 0
            for g in JOBS:
                o = JOBS[g][:]
                rng.shuffle(o)
                t += agree(o, PAIRS[g])
            c += t >= obs
        return c / N

    n = sum(len(v) for v in PAIRS.values())
    for name, runs in (("taught-1", [f"{g}-taught-1" for g in JOBS]), ("taught-2", [f"{g}-taught-2" for g in JOBS]),
                       ("control", [f"{g}-control-1" for g in JOBS])):
        if all(r in res for r in runs):
            t = sum(res[r]["hit"] for r in runs)
            c = sum(res[r]["cls"] for r in runs)
            print(f"{name}: pairs {t}/{n} = {100 * t / n:.0f} %  chance reaches this {100 * chance(t):.2f} % of the time;"
                  f" class {c}/20 = {100 * c / 20:.0f} %")
    json.dump(res, open(OUT + "/scored.json", "w"), indent=1)


if __name__ == "__main__":
    {"packets": packets, "score": score}[sys.argv[1]]()
