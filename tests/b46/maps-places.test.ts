// MAPS.PY — GOOGLE MAPS PLACES, READ FROM GOOGLE'S OWN RESULTS DATA, NEVER INVENTED.
//
// WHY. On 2026-10-15 `hidden.py read https://www.google.com/maps/search/...` stopped at Google's consent
// wall ("Google'a devam etmeden önce") and `--expand 'Tümünü reddet'` did not pass it, while a plain HTTPS
// request to the Maps search endpoint (`/search?tbm=map&...&pb=...`) returned the live results as `)]}'`
// followed by JSON. scripts/maps.py reads that data into places: name, rating, review count, category,
// address, phone, website and a Maps URL.
//
// The fixture search-dis-klinigi-kadikoy.json.txt is that real response for "diş kliniği Kadıköy" (370 KB),
// trimmed: every top-level slot but the query and the results list is null, and each place keeps only the
// slots the parser reads. consent-wall-real.txt is the wall itself, as a read of the Maps page returned it on
// 2026-10-15 (text form); consent-wall.html is a small HTML stand-in built from the same words.

import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { SKILL } from "./engine-copy.js";

const FIX = join(dirname(resolve(import.meta.filename)), "fixtures", "maps");
const MAPS = join(SKILL, "scripts", "maps.py");

function maps(args: string[]): { out: string; err: string; code: number } {
  try {
    const out = execFileSync("python3", [MAPS, ...args], {
      encoding: "utf8", env: { ...process.env, PYTHONDONTWRITEBYTECODE: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
    return { out, err: "", code: 0 };
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; status?: number };
    return { out: String(err.stdout ?? ""), err: String(err.stderr ?? ""), code: err.status ?? 1 };
  }
}

interface Place {
  name: string; rating: number | null; reviews: number | null; category: string | null;
  address: string | null; phone: string | null; website: string | null;
  place_id: string | null; cid: string | null; url: string;
}

describe("maps.py — places from Google Maps' own data", () => {
  const SEARCH = join(FIX, "search-dis-klinigi-kadikoy.json.txt");

  it("reads the twenty places in Google's order, with their exact ratings and review counts", () => {
    const r = maps(["diş kliniği Kadıköy", "--from-file", SEARCH, "--json"]);
    expect(r.code, r.err).toBe(0);
    const places = JSON.parse(r.out) as Place[];
    expect(places).toHaveLength(20);
    expect(places[0].name).toBe("Kadıköy Dayıoğlu Diş Polikliniği / Tandarts Reis Turkije");

    const dentince = places[3];
    expect(dentince.name).toBe("Dentince - Kadıköy Gülüş Tasarımı - İmplant");
    expect(dentince.rating).toBe(4.9);
    expect(dentince.reviews).toBe(677);
    expect(dentince.category).toBe("Diş Kliniği");
    expect(dentince.place_id).toBe("ChIJldfap4_HyhQRWb8qEcw8Xt4");
    expect(dentince.cid).toBe(BigInt("0xde5e3ccc112abf59").toString());
    expect(dentince.url).toContain("query_place_id=ChIJldfap4_HyhQRWb8qEcw8Xt4");

    const erdem = places[4];
    expect(erdem.name).toBe("Kadıköy - Diş Kliniği | Dt. Erdem Can & Kanal Tedavisi Uzmanı Ezgi Orhan | Moda & Caferağa");
    expect(erdem.rating).toBe(5);
    expect(erdem.reviews).toBe(164);

    const dentway = places[14];
    expect(dentway.name).toBe("Dentway İstanbul Kadıköy Suadiye Diş Kliniği");
    expect(dentway.rating).toBe(4.9);
    expect(dentway.reviews).toBe(519);

    // the first place carries a phone, a website and a street address in the data — they are read, not made
    expect(places[0].phone).toBe("+90 216 330 09 99");
    expect(places[0].website).toBe("http://www.kadikoydis.com/");
    expect(places[0].address).toBe("Mühürdar Cad No:20 Fırat Pasajı kat:2 Kadıköy, 34700 Kadıköy/İstanbul, Türkiye");
  });

  it("--limit cuts the list, and the plain output is one line per place", () => {
    const r = maps(["diş kliniği Kadıköy", "--from-file", SEARCH, "--limit", "5"]);
    expect(r.code, r.err).toBe(0);
    const lines = r.out.trim().split("\n");
    expect(lines).toHaveLength(5);
    expect(lines[3]).toContain("Dentince - Kadıköy Gülüş Tasarımı - İmplant");
    expect(lines[3]).toContain("4.9");
    expect(lines[3]).toContain("677");
    expect(lines[4]).toContain("164");
  });

  it.each(["consent-wall.html", "consent-wall-real.txt"])(
    "a consent page (%s) is no result: exit 3, one line saying why, nothing on stdout",
    (fixture) => {
      const r = maps(["diş kliniği Kadıköy", "--from-file", join(FIX, fixture)]);
      expect(r.code).toBe(3);
      expect(r.out).toBe("");
      expect(r.err.trim().split("\n")).toHaveLength(1);
      expect(r.err.toLowerCase()).toContain("consent");
    },
  );

  it("data with no places is no result either — never an empty success", () => {
    const r = maps(["x", "--from-file", join(FIX, "empty.json.txt")]);
    expect(r.code).not.toBe(0);
    expect(r.out).toBe("");
  });
});
