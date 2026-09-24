#!/usr/bin/env bash
# THE HIDDEN RESEARCH CHROME'S PROFILE — a copy of the CEO's Chrome "Profile 5", made here and only here.
#
# Why a copy. Measured 2026-09-24: an empty-profile Chrome on this house's addresses got HTTP 429 and
# Google's /sorry/ reCAPTCHA on its first search, even on Xvfb, even forced to IPv4, and solving it
# automatically is forbidden; his own signed-in Chrome is not challenged. So the hidden Chrome
# (dxb-research-chrome.service, Xvfb :99, CDP 127.0.0.1:9333) runs on a copy of his profile: the same
# cookies and sign-ins, in its own folder, /home/dxb/.local/share/dxb-research-chrome/Default.
# GOOGLE IS THE EXCEPTION. Measured 16:44:26 and 16:54:05, right after and ten minutes after the
# cookies-only copy below: the copy's Google web session was signed out within seconds — cookies alone
# do not carry it (the first copy lived on his Chrome account's refresh token, which is now kept out).
# So Google is read signed out and google-deep falls back by name; X, Facebook, Instagram, Reddit and
# Perplexity stay signed in with their cookies.
#
# His Chrome is only READ — never stopped, never signalled, nothing under ~/.config/google-chrome is
# written. Every SQLite database is read with `immutable=1`, so no lock is ever taken on his files and
# his Chrome can never be made to wait or lose a write; a copy is kept only when it is provably whole:
# no transaction in flight before or after, the file unchanged while it was read, and
# `PRAGMA quick_check` = ok on the result. Cookies must pass; any other database that cannot is left
# out and Chrome starts that one empty.
#
# THE COPY CARRIES SITE COOKIES, NOT HIS GOOGLE ACCOUNT. Measured 2026-09-24 16:13-16:21, when the
# copy still carried `Web Data` (token_service: the OAuth refresh token of his Chrome account, plus
# a card, two addresses and 254 autofill rows) and his account keys in Preferences: the copy behaved
# as a Chrome signed into his account, and when its Google web session dropped it minted a brand-new
# SID in his account by itself, no password typed — an identity step outside the approved plan. So
# the Chrome-level sign-in, the account-scoped stores, payments, addresses, autofill and passwords
# stay out, his account keys are stripped from the copy's Preferences and Local State, and the unit
# runs with --allow-browser-signin=false. A site whose web session dies in the copy stays dead
# until the next copy; it is never signed back in by the machine.
# NOR HIS PASSWORDS' TRACES. Measured 2026-09-24 (refuter, round 2): profile.password_hash_data_list
# — Chrome's salted hash of his password plus his encrypted username, kept for password-reuse
# warnings — sat in the copy's Preferences, identical to Profile 5's, and came back with every copy.
# It is stripped with the rest of that family (below). If the strip fails or leaves a single key,
# the hidden Chrome is NOT started: the copy's Preferences, Secure Preferences and Local State are
# deleted, the copy is locked (go-rwx), one line goes to stderr, exit 1 — and so on every failure
# exit once the copy has begun (fail_closed, below).
#
#   profile-sync.sh            stop the hidden Chrome, copy, start it again
#   profile-sync.sh --strip    stop the hidden Chrome, strip the copy as it stands (no new copy), start it
#   profile-sync.sh --check    the session guard, per site: the login cookie in Profile 5 (read-only),
#                              the same cookie in the copy, and whether the copy is REALLY signed in —
#                              asked of the site itself through the hidden Chrome (hidden.py
#                              signed-in). Google is an INFO row: signed out in the copy by design
#                              (above), printed with a note, never counted. Exit 1 naming every other
#                              site that fails any of the three — and so when the copy cannot be asked.

set -uo pipefail
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SRC="/home/dxb/.config/google-chrome/Profile 5"
# DXB_SYNC_ROOT is for tests only: `--strip` against a scratch copy (the unit stays the real one)
ROOT="${DXB_SYNC_ROOT:-/home/dxb/.local/share/dxb-research-chrome}"
DST="$ROOT/Default"
UNIT=dxb-research-chrome

# THE LOGINS THIS DOOR READS THROUGH, and the one cookie that proves each (names read from his cookie
# store on 2026-09-24, never guessed): site|host_key|cookie.
LOGINS='google|.google.com|SID
x|.x.com|auth_token
facebook|.facebook.com|c_user
instagram|.instagram.com|sessionid
reddit|.reddit.com|reddit_session
perplexity|www.perplexity.ai|__Secure-next-auth.session-token'

if [ "${1:-}" = "--check" ]; then
  LOGINS="$LOGINS" HIDDEN="$HERE/hidden.py" python3 - "$SRC/Cookies" <<'PYEOF'
# A cookie that exists is not a session: the LIVE column is asked of each site (hidden.py signed-in).
import json, os, sqlite3, subprocess, sys, time, urllib.parse
now = time.time()
chrome_now = int((now + 11644473600) * 1_000_000)          # Chrome counts microseconds from 1601
logins = [l.split("|") for l in os.environ["LOGINS"].splitlines() if l.strip()]
src = {}
try:
    con = sqlite3.connect("file:" + urllib.parse.quote(sys.argv[1]) + "?immutable=1", uri=True)
    for host, name, has_exp, exp in con.execute("SELECT host_key, name, has_expires, expires_utc FROM cookies"):
        if not has_exp or exp > chrome_now:
            src[(host, name)] = True
    con.close()
    src_err = ""
except Exception as e:
    src_err = f"okunamadi: {e}"
# the copy is asked through DevTools (names and expiry only, never a value); ~1 600 cookies do not
# fit in one environment string (128 KiB), so they come through a pipe
copy, copy_err = {}, ""
p = subprocess.run([sys.executable, os.environ["HIDDEN"], "cookie-names"], capture_output=True, text=True)
if p.returncode != 0:
    copy_err = ((p.stderr or p.stdout).strip().splitlines() or ["?"])[-1][:160]
else:
    for line in p.stdout.splitlines():
        try:
            c = json.loads(line)
        except ValueError:
            continue
        if c.get("session") or (c.get("expires") or -1) < 0 or c["expires"] > now:
            copy[(c.get("domain"), c.get("name"))] = True
live, live_err = {}, ""
if not copy_err:
    q = subprocess.run([sys.executable, os.environ["HIDDEN"], "signed-in", "--json"],
                       capture_output=True, text=True)
    for line in q.stdout.splitlines():
        try:
            d = json.loads(line)
            live[d["site"]] = (bool(d["live"]), str(d["why"]))
        except (ValueError, KeyError):
            continue
    if q.returncode not in (0, 1) or not live:
        live_err = ((q.stderr or q.stdout).strip().splitlines() or ["?"])[-1][:160]
# GOOGLE IS AN INFO ROW, NOT A HOLE: cookies alone do not carry a Google session into a second
# browser and the Chrome-level sign-in stays out on purpose (the header), so the copy's Google is
# signed out by design and google-deep reads Google's results through Startpage/Brave. Its row is
# printed; it is never counted, so it can neither fail the guard nor pass it.
INFO = {"google": "imzasiz okunur (cerezle oturum tasinmaz; Chrome girisi kapali, bilerek) "
                  "-> google-deep Startpage/Brave"}
print(f"{'site':<11} {'cookie':<34} {'Profile 5':<10} {'kopya':<8} canli oturum (kopyada)")
bad, info_out = [], []
for site, host, name in logins:
    a = "var" if src.get((host, name)) else ("HATA" if src_err else "YOK")
    b = "var" if copy.get((host, name)) else ("HATA" if copy_err else "YOK")
    ok, why = live.get(site, (False, live_err or copy_err or "sorulamadi"))
    c = ("evet · " if ok else "HAYIR · ") + why
    print(f"{site:<11} {name:<34} {a:<10} {b:<8} {c}")
    if site in INFO:
        if not ok:
            info_out.append(site)
        continue
    why_bad = [w for w, cond in (("Profile 5'te cerez yok", a != "var"), ("kopyada cerez yok", b != "var"),
                                 ("kopyada canli oturum yok", not ok)) if cond]
    if why_bad:
        bad.append(f"{site} ({'; '.join(why_bad)})")
for site in info_out:
    print(f"{site}: {INFO[site]}")
if src_err:
    print("Profile 5: " + src_err)
if copy_err:
    print("kopya: " + copy_err)
if bad:
    verdict = "EKSIK — " + ", ".join(bad) + " — bu siteler gizli Chrome'da oturumsuz okunur"
else:
    verdict = ("tamam — " + (", ".join(info_out) + " disinda " if info_out else "")
               + "her sitede cerez iki tarafta var ve kopya canli olarak giris yapmis")
print("OTURUM KORUMASI: " + verdict)
sys.exit(1 if bad else 0)
PYEOF
  exit $?
fi

STRIP_ONLY=0; [ "${1:-}" = "--strip" ] && STRIP_ONLY=1
if [ "$STRIP_ONLY" -eq 0 ]; then
  [ -d "$SRC" ] || { echo "!! kaynak profil yok: $SRC" >&2; exit 2; }
  command -v rsync >/dev/null || { echo "!! rsync yok" >&2; exit 2; }
fi

echo "gizli Chrome durduruluyor ($UNIT) — CEO'nun kendi Chrome'una dokunulmaz"
systemctl --user stop "$UNIT" 2>/dev/null || true
for _ in $(seq 1 40); do
  pgrep -f -- "--user-data-dir=$ROOT( |$)" >/dev/null || break
  sleep 0.25
done
if pgrep -f -- "--user-data-dir=$ROOT( |$)" >/dev/null; then
  echo "!! gizli Chrome durmadi; kopyaya dokunulmadi" >&2
  exit 1
fi

# A FAILED COPY KEEPS NONE OF HIS ACCOUNT. From here on the copy's settings may be his, unstripped:
# rsync lays his Preferences and Secure Preferences down as they are, and only the strip below
# takes his account out of them and out of Local State. The unit is enabled, Restart=always, and
# starts at login, so a failure exit that only locked the copy handed those files to the next
# start — measured 2026-09-24 on a scratch copy: after an rsync, a sqlite and a strip failure all
# three files were still there, Local State's info_cache still carrying user_name and gaia_*.
# So every failure exit below deletes the three (Chrome writes fresh ones without his account; a
# copy that then reads sites signed out is acceptable, one that carries his account is not),
# locks the copy and says so in its ONE stderr line. His own profile is never touched.
fail_closed() {   # $1 = why, one line
  rm -f -- "$DST/Preferences" "$DST/Secure Preferences" "$ROOT/Local State"
  local gone="Preferences, Secure Preferences ve Local State silindi (Chrome hesapsiz yenilerini yazar)"
  if [ -e "$DST/Preferences" ] || [ -e "$DST/Secure Preferences" ] || [ -e "$ROOT/Local State" ]; then
    gone="Preferences / Secure Preferences / Local State SILINEMEDI"
  fi
  chmod -R go-rwx "$ROOT" 2>/dev/null
  echo "!! $1 — $gone; gizli Chrome BASLATILMADI, kopya kilitlendi (go-rwx): $ROOT" >&2
  exit 1
}
# The Python steps' stdout goes straight out (fd 3); their stderr is caught, and on a failure its
# last line is the reason in fail_closed's one line — a traceback is not a line.
exec 3>&1
why() {   # $1 = what a Python step said on stderr, $2 = the reason when it said nothing
  local last="${1##*$'\n'}"
  printf '%s' "${last:-$2}"
}

# --strip skips the copy: it cleans the copy as it stands
if [ "$STRIP_ONLY" -eq 0 ]; then
  install -d -m 700 "$ROOT" "$DST"
  # WHAT IS NOT COPIED, AND WHY — each group is a reason, not a size:
  EXCLUDES=(
    # caches: Chrome rebuilds them, and Service Worker alone is 1.1 GB of the 1.5 GB
    --exclude=/Cache --exclude="/Code Cache" --exclude=/GPUCache --exclude=/GrShaderCache
    --exclude=/ShaderCache --exclude=/DawnGraphiteCache --exclude=/DawnWebGPUCache
    --exclude="/Service Worker" --exclude="/Shared Dictionary" --exclude="/optimization_guide_*"
    --exclude="/Segmentation Platform" --exclude=/VideoDecodeStats --exclude="/Search Logos"
    --exclude="/Download Service" --exclude=/blob_storage --exclude=/BudgetDatabase
    --exclude="/Feature Engagement Tracker" --exclude=/AutofillAiModelCache
    # extensions: the hidden Chrome runs --disable-extensions; a second OpenCLI bridge carrying his
    # contextId would confuse the bridge daemon
    --exclude=/Extensions --exclude="/Extension *" --exclude="/Local Extension Settings"
    --exclude="/Managed Extension Settings" --exclude="/Sync Extension Settings" --exclude=/Storage
    # his open tabs: they would all reopen, invisibly, in the hidden Chrome
    --exclude=/Sessions --exclude=/Sessions_Encrypted --exclude="/Session Storage"
    # device identity: a copy must never become a second device on his Chrome Sync or push channel,
    # nor install his web apps' launcher entries a second time
    --exclude="/Sync Data" --exclude="/Sync App Settings" --exclude="/GCM Store" --exclude=/trusted_vault.pb
    --exclude=/passkey_enclave_state --exclude=/Accounts --exclude="/Web Applications"
    --exclude=/PreferredApps --exclude="/Platform Notifications"
    # his Google account inside Chrome, payments, addresses, autofill and passwords: the copy reads
    # sites with their cookies and is never a Chrome signed into his account (see the header)
    --exclude="/Web Data" --exclude="/Account Web Data" --exclude="/Login Data*"
    --exclude="/Affiliation Database" --exclude="/Google Profile Picture.png"
    # SQLite side files: every database is copied whole below; a stale journal beside it would corrupt it
    --exclude="*-journal" --exclude="*-wal" --exclude="*-shm"
    # his stray backups and Chrome's own lock and log files
    --exclude="/.com.google.Chrome.*" --exclude="/Preferences.*-backup-*" --exclude=/LOCK
    --exclude=/LOG --exclude=/LOG.old
  )
  echo "kopyalaniyor: $SRC -> $DST"
  rsync -a --delete --delete-excluded "${EXCLUDES[@]}" "$SRC/" "$DST/"
  rs_rc=$?
  # a file his Chrome deleted while it was being copied (rsync 24) is not a failure of the copy
  if [ "$rs_rc" -ne 0 ] && [ "$rs_rc" -ne 24 ]; then fail_closed "rsync basarisiz (kod $rs_rc)"; fi

  db_err=$(SRC="$SRC" DST="$DST" python3 - 2>&1 >&3 3>&- <<'PYEOF'
import os, shutil, sqlite3, sys, tempfile, time, urllib.parse
from pathlib import Path
src_root, dst_root = Path(os.environ["SRC"]), Path(os.environ["DST"])
MAGIC = b"SQLite format 3\x00"
JOURNAL_MAGIC = bytes.fromhex("d9d505f920a163d7")


def is_db(p):
    try:
        with open(p, "rb") as f:
            return f.read(16) == MAGIC
    except OSError:
        return False


def hot(db):
    """A rollback journal with its header still set: a transaction is in flight."""
    j = Path(str(db) + "-journal")
    try:
        with open(j, "rb") as f:
            return f.read(8) == JOURNAL_MAGIC
    except OSError:
        return False


def state(db):
    out = []
    for p in (db, Path(str(db) + "-journal"), Path(str(db) + "-wal")):
        try:
            st = p.stat()
            out.append((st.st_size, st.st_mtime_ns))
        except OSError:
            out.append(None)
    return out


def copy_db(src, dst, tries):
    for _ in range(tries):
        tmp = dst.with_name(dst.name + ".dxb-tmp")
        tmp.unlink(missing_ok=True)
        before = state(src)
        wal = Path(str(src) + "-wal")
        try:
            if wal.exists() and wal.stat().st_size > 0:
                # WAL mode with frames not yet folded in: read a private copy of the pair, whose
                # own recovery replays the log (immutable would silently skip it)
                with tempfile.TemporaryDirectory(dir=dst_root.parent) as td:
                    t = Path(td) / "db"
                    shutil.copyfile(src, t)
                    shutil.copyfile(wal, str(t) + "-wal")
                    s = sqlite3.connect(str(t))
                    d = sqlite3.connect(str(tmp))
                    s.backup(d)
                    d.close()
                    s.close()
            else:
                if hot(src):
                    time.sleep(0.5)
                    continue
                s = sqlite3.connect("file:" + urllib.parse.quote(str(src)) + "?immutable=1", uri=True)
                d = sqlite3.connect(str(tmp))
                s.backup(d)
                d.close()
                s.close()
            if state(src) != before or hot(src):
                time.sleep(0.5)
                continue
            c = sqlite3.connect(str(tmp))
            ok = c.execute("PRAGMA quick_check").fetchone()[0] == "ok"
            c.close()
            if not ok:
                time.sleep(0.5)
                continue
            os.replace(tmp, dst)
            return True
        except sqlite3.Error:
            time.sleep(0.5)
        finally:
            tmp.unlink(missing_ok=True)
    return False


copied, dropped = 0, []
for dst in sorted(p for p in dst_root.rglob("*") if p.is_file() and is_db(p)):
    src = src_root / dst.relative_to(dst_root)
    critical = dst.relative_to(dst_root).as_posix() == "Cookies"
    if src.exists() and copy_db(src, dst, 40 if critical else 6):
        copied += 1
        continue
    if critical:
        print("Cookies tutarli kopyalanamadi — kopya kullanilamaz", file=sys.stderr)
        sys.exit(1)
    dst.unlink(missing_ok=True)       # a torn database is worse than an empty one
    dropped.append(dst.relative_to(dst_root).as_posix())
print(f"sqlite: {copied} veritabani tutarli kopyalandi"
      + (f" · {len(dropped)} bos baslayacak: {', '.join(dropped[:6])}" if dropped else ""))
PYEOF
)
  db_rc=$?
  [ "$db_rc" -eq 0 ] || fail_closed "$(why "$db_err" "sqlite kopyasi durdu (python kodu $db_rc)")"
  [ -z "$db_err" ] || printf '%s\n' "$db_err" >&2
fi

# HIS ACCOUNT IS TAKEN OUT OF THE COPY'S SETTINGS, not only out of its databases: account_info,
# google.services (account id, username, signin_scoped_device_id), sync (gaia id, the per-account
# transport data a second device would reuse), gaia_cookie (the reconciler's cache of his account),
# gcm, invalidation and sharing (this device's push and FCM identities), and the per-account pref
# store. Chrome sign-in is switched off in the copy itself as well as by the unit's flag.
# HIS PASSWORDS' TRACES GO WITH IT (PASSWORDS below), from Preferences and Secure Preferences alike,
# their MACs included. The result is read back from disk: an error or a single key left is fatal —
# fail_closed: the three settings files are deleted, the hidden Chrome is not started, the copy is
# locked, exit 1.
pf_err=$(ROOT="$ROOT" python3 - 2>&1 >&3 3>&- <<'PYEOF'
import json, os, sys
from pathlib import Path
root = Path(os.environ["ROOT"])
PREFS, SECURE = root / "Default" / "Preferences", root / "Default" / "Secure Preferences"
DROP = ["account_info", "account_tracker_service_last_update", "account_values", "gaia_cookie",
        "google", "sync", "gcm", "invalidation", "sharing", "dual_layer_user_pref_store"]
# dotted paths; a MAC under protection.macs follows the same path (and path + "_encrypted_hash")
PASSWORDS = [
    # the password-reuse hash (salted hash + encrypted username) and its two older forms
    "profile.password_hash_data_list", "profile.sync_password_hash",
    "profile.sync_password_length_and_hash_salt",
    # what was recorded against it: reuse events, the capture-event clock, Safe Browsing's verdicts
    "safebrowsing.unhandled_sync_password_reuses", "safebrowsing.next_password_capture_event_log_time",
    "profile.content_settings.exceptions.password_protection",
    # the password manager's state and counts, for stores the copy does not carry (Login Data*)
    "password_manager", "total_passwords_available_for_account", "total_passwords_available_for_profile",
    "profile.background_password_check", "profile.last_time_password_store_metrics_reported",
    "profile.safety_hub_menu_notifications.passwords",
]


def has(d, path):
    for k in path.split("."):
        if not isinstance(d, dict) or k not in d:
            return False
        d = d[k]
    return True


def pop(d, path):
    *up, last = path.split(".")
    for k in up:
        d = d.get(k) if isinstance(d, dict) else None
    if isinstance(d, dict):
        d.pop(last, None)


def macs_of(d):
    return (d.get("protection") or {}).get("macs") or {}


def rewrite(path, change):
    if not path.exists():
        return
    d = json.loads(path.read_text(encoding="utf-8"))
    change(d)
    tmp = path.with_name(path.name + ".dxb-tmp")
    try:
        tmp.write_text(json.dumps(d, separators=(",", ":")), encoding="utf-8")
        os.replace(tmp, path)
    finally:
        tmp.unlink(missing_ok=True)


def strip(d):
    """Preferences and Secure Preferences alike: his account and his passwords' traces, MACs too."""
    for k in DROP:
        d.pop(k, None)
    macs = macs_of(d)
    for k in ("google", "account_values"):
        macs.pop(k, None)
    for p in PASSWORDS:
        for tree, path in ((d, p), (macs, p), (macs, p + "_encrypted_hash")):
            pop(tree, path)


def prefs(d):
    strip(d)
    d["signin"] = {"allowed": False, "allowed_on_next_startup": False}


def left(path, signin):
    """What is still in the file as it now lies on disk (key names only, never a value)."""
    d = json.loads(path.read_text(encoding="utf-8"))
    macs = macs_of(d)
    out = [k for k in DROP if k in d] + [p for p in PASSWORDS if has(d, p)]
    out += ["protection.macs." + k for k in ("google", "account_values") if k in macs]
    out += ["protection.macs." + m for p in PASSWORDS for m in (p, p + "_encrypted_hash") if has(macs, m)]
    if signin and (d.get("signin") or {}).get("allowed") is not False:
        out.append("signin.allowed")
    return out


def fail(why):
    print(f"kopyanin ayarlarindan hesap/parola izleri cikarilamadi ({why})", file=sys.stderr)
    sys.exit(1)


def local_state(d):
    d.pop("signin", None)
    for info in ((d.get("profile") or {}).get("info_cache") or {}).values():
        for k in [k for k in info if k.startswith("gaia_") or k in (
                "user_name", "is_consented_primary_account", "signin.with_credential_provider",
                "last_downloaded_gaia_picture_url_with_size")]:
            info.pop(k)


try:
    rewrite(PREFS, prefs)
    rewrite(SECURE, strip)
    rewrite(root / "Local State", local_state)
    kalan = left(PREFS, True) + ([f"Secure Preferences: {k}" for k in left(SECURE, False)]
                                 if SECURE.exists() else [])
except Exception as e:           # no space left, a torn or non-JSON file, a missing Preferences ...
    fail(f"{type(e).__name__}: {e}"[:200])
if kalan:
    fail("KALAN: " + ", ".join(kalan))
print("hesap anahtarlari ve parola izleri kopyadan cikarildi")
PYEOF
)
pf_rc=$?
# the strip's own reason is its last stderr line; with none, it died before it could say it
[ "$pf_rc" -eq 0 ] || fail_closed "$(why "$pf_err" "kopyanin ayarlari temizlenemedi (python kodu $pf_rc)")"
[ -z "$pf_err" ] || printf '%s\n' "$pf_err" >&2
chmod -R go-rwx "$ROOT"
du -sh "$DST" | awk '{print "kopya: " $1}'

echo "gizli Chrome baslatiliyor ($UNIT)"
systemctl --user start "$UNIT"
for _ in $(seq 1 60); do
  curl -s -m 1 "http://127.0.0.1:9333/json/version" >/dev/null 2>&1 && { echo "hazir: 127.0.0.1:9333"; exit 0; }
  sleep 0.5
done
echo "!! gizli Chrome 30 sn icinde 9333'te cevap vermedi: journalctl --user -u $UNIT" >&2
exit 1
